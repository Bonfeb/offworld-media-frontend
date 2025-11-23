import React from "react";
import { Modal, Button, Card, Table } from "react-bootstrap";
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import {
  Paper,
  Box,
  Chip,
  Avatar,
  Typography,
  Divider,
  CircularProgress,
  Grid,
} from "@mui/material";

const User = ({ show, onHide, user, userDetails, loading }) => {
  if (!user) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="rounded-2xl"
    >
      <Modal.Header
        closeButton
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl"
      >
        <Modal.Title className="flex items-center gap-2 font-bold">
          <PersonIcon />
          User Details - {user.first_name} {user.last_name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-gray-50 p-0">
        {loading ? (
          <Box className="p-8 text-center">
            <CircularProgress size={50} className="text-blue-600" />
            <Typography variant="h6" className="mt-4 text-gray-600">
              Loading user details...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} className="p-4 sm:p-6">
            {/* User Profile Card */}
            <Grid item xs={12} md={4}>
              <Card className="h-full shadow-lg border-0 bg-white">
                <Card.Header className="bg-blue-600 text-white font-bold py-3">
                  <Box className="flex items-center gap-2">
                    <PersonIcon />
                    User Profile
                  </Box>
                </Card.Header>
                <Card.Body className="text-center p-4">
                  <Avatar
                    src={userDetails?.user?.profile_pic || user.profile_pic}
                    className="w-24 h-24 mx-auto border-4 border-blue-500 mb-4 shadow-lg"
                  >
                    {(userDetails?.user?.first_name || user.first_name)
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </Avatar>

                  <Box className="text-left space-y-3">
                    {[
                      {
                        icon: <BadgeIcon className="text-blue-400" />,
                        label: "Full Name",
                        value: `${
                          userDetails?.user?.first_name || user.first_name
                        } ${userDetails?.user?.last_name || user.last_name}`,
                      },
                      {
                        icon: <BadgeIcon className="text-blue-400" />,
                        label: "Username",
                        value: `@${
                          userDetails?.user?.username || user.username
                        }`,
                      },
                      {
                        icon: <LocationIcon className="text-blue-400" />,
                        label: "Address",
                        value:
                          userDetails?.user?.address ||
                          user.address ||
                          "Not provided",
                      },
                      {
                        icon: <EmailIcon className="text-blue-400" />,
                        label: "Email",
                        value:
                          userDetails?.user?.email ||
                          user.email ||
                          "Not provided",
                      },
                      {
                        icon: <PhoneIcon className="text-blue-400" />,
                        label: "Phone",
                        value:
                          userDetails?.user?.phone ||
                          user.phone ||
                          "Not provided",
                      },
                    ].map((item, idx) => (
                      <Box key={idx}>
                        <Box className="flex items-center gap-2 mb-2">
                          {item.icon}
                          <Typography
                            variant="caption"
                            className="text-gray-600 font-semibold"
                          >
                            {item.label}
                          </Typography>
                        </Box>
                        <Typography
                          variant={
                            item.label === "Full Name" ||
                            item.label === "Username"
                              ? "h6"
                              : "body1"
                          }
                          className="text-gray-800 font-medium"
                        >
                          {item.value}
                        </Typography>
                        {idx < 4 && <Divider className="my-3 bg-gray-300" />}
                      </Box>
                    ))}
                  </Box>
                </Card.Body>
              </Card>
            </Grid>

            {/* User Activity Cards */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2} className="h-full">
                {/* Bookings Card */}
                <Grid item xs={12}>
                  <Card className="shadow-lg border-0 bg-white">
                    <Card.Header className="bg-green-600 text-white font-bold py-3">
                      <Typography
                        variant="h6"
                        className="mb-0 flex items-center gap-2"
                      >
                        📅 Bookings ({userDetails?.total_bookings || 0})
                      </Typography>
                    </Card.Header>
                    <Card.Body className="p-3 max-h-60 overflow-auto">
                      {userDetails?.bookings?.length > 0 ? (
                        <Table size="sm" className="mb-0">
                          <thead>
                            <tr>
                              <th className="text-gray-700 border-b border-gray-300 font-semibold">
                                S/No
                              </th>
                              <th className="text-gray-700 border-b border-gray-300 font-semibold">
                                Service
                              </th>
                              <th className="text-gray-700 border-b border-gray-300 font-semibold">
                                Event Location
                              </th>
                              <th className="text-gray-700 border-b border-gray-300 font-semibold">
                                Event Date
                              </th>
                              <th className="text-gray-700 border-b border-gray-300 font-semibold">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails?.bookings?.map((booking, idx) => (
                              <tr key={booking.id}>
                                <td className="border-b border-gray-200 py-2 text-gray-700">
                                  {idx + 1}
                                </td>
                                <td className="border-b border-gray-200 py-2 text-gray-700">
                                  {booking.service?.category}
                                </td>
                                <td className="border-b border-gray-200 py-2 text-gray-700">
                                  {booking.event_location}
                                </td>
                                <td className="border-b border-gray-200 py-2 text-gray-700">
                                  {booking.event_date}
                                </td>
                                <td className="border-b border-gray-200 py-2">
                                  <Chip
                                    label={booking.status}
                                    size="small"
                                    color={
                                      booking.status === "confirmed"
                                        ? "success"
                                        : booking.status === "pending"
                                        ? "warning"
                                        : "default"
                                    }
                                    className="text-xs"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Typography
                          variant="body2"
                          className="text-center py-4 text-gray-500"
                        >
                          No bookings found
                        </Typography>
                      )}
                    </Card.Body>
                  </Card>
                </Grid>

                {/* Reviews and Messages Cards */}
                <Grid item xs={12} sm={6}>
                  <Card className="shadow-lg border-0 bg-white h-full">
                    <Card.Header className="bg-orange-600 text-white font-bold py-3">
                      ⭐ Reviews ({userDetails?.total_reviews || 0})
                    </Card.Header>
                    <Card.Body className="p-3 max-h-60 overflow-auto">
                      {userDetails?.reviews?.length > 0 ? (
                        userDetails?.reviews?.map((review) => (
                          <Box
                            key={review.id}
                            className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <Box className="flex justify-between items-center mb-2">
                              <Chip
                                label={`${review.rating}/5 ⭐`}
                                size="small"
                                className="bg-orange-500 text-white"
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              className="text-gray-700"
                            >
                              {review.comment}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          className="text-center py-4 text-gray-500"
                        >
                          No reviews found
                        </Typography>
                      )}
                    </Card.Body>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card className="shadow-lg border-0 bg-white h-full">
                    <Card.Header className="bg-purple-600 text-white font-bold py-3">
                      💬 Messages ({userDetails?.total_messages || 0})
                    </Card.Header>
                    <Card.Body className="p-3 max-h-60 overflow-auto">
                      {userDetails?.messages?.length > 0 ? (
                        userDetails?.messages?.map((message) => (
                          <Box
                            key={message.id}
                            className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
                          >
                            <Typography
                              variant="caption"
                              className="text-gray-600 block mb-1"
                            >
                              {message.date || message.created_at}
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-gray-700"
                            >
                              {message.content || message.message}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          className="text-center py-4 text-gray-500"
                        >
                          No messages found
                        </Typography>
                      )}
                    </Card.Body>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-gray-50 rounded-b-2xl border-t border-gray-200">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          className="rounded-xl px-6 py-2 border-2 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default User;
