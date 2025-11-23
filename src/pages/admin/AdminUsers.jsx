import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import {
  IconButton,
  Tooltip,
  Snackbar,
  Alert as MuiAlert,
  Paper,
  Box,
  Chip,
  Avatar,
  Typography,
  CircularProgress,
  Grid,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import API from "../../api";
import User from "../../modals/User";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({
    username: "",
    email: "",
  });
  const [tempFilters, setTempFilters] = useState({
    username: "",
    email: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    rowsPerPage: 10,
  });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    address: "",
    email: "",
    profile_pic: null,
    profile_pic_preview: null,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const queryParams = new URLSearchParams({ action: "users" });
      if (filters.username) queryParams.append("username", filters.username);
      if (filters.email) queryParams.append("email", filters.email);
      queryParams.append("page", pagination.page);
      queryParams.append("page_size", pagination.rowsPerPage);

      console.log("Fetching users with params:", queryParams.toString());
      const response = await API.get(
        `/admin-dashboard/?${queryParams.toString()}`
      );

      let usersData;
      if (Array.isArray(response.data.results)) {
        usersData = response.data.results;
      } else if (response.data.user) {
        usersData = [response.data.user];
      } else {
        usersData = [];
      }
      console.log("API response for users:", response.data);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
      setUsers([]);
      console.error("Error fetching users:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current filters:", filters);
    console.log("Current pagination:", pagination);
    setLoading(true);
    fetchUsers().then(() => setLoading(false));
  }, [filters, pagination]);

  const handleChangePage = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
    console.log("Page changed to:", newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  const handleTempFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setFilters(tempFilters);
    setPagination({ page: 1, rowsPerPage: 10 });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleEditClick = (user, e) => {
    e?.stopPropagation();
    setCurrentUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      phone: user.phone || "",
      address: user.address,
      email: user.email || "",
      profile_pic: null,
      profile_pic_preview: user.profile_pic || null,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (user, e) => {
    e?.stopPropagation();
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  const handleRowClick = async (user) => {
    setCurrentUser(user);
    setDetailsLoading(true);
    setShowDetailsModal(true);

    try {
      console.log("Fetching details for user:", user.id);
      const details = await API.get(
        `/admin-dashboard/?action=users&user_id=${user.id}`
      );
      console.log("Fetched user details:", details.data);

      const responseData = details.data;
      setUserDetails({
        user: responseData.user || {},
        bookings: responseData.bookings || [],
        total_bookings: responseData.total_bookings || 0,
        reviews: responseData.reviews || [],
        total_reviews: responseData.total_reviews || 0,
        messages: responseData.messages || [],
        total_messages: responseData.total_messages || 0,
      });
    } catch (err) {
      console.error("Error fetching user details:", err);
      setUserDetails({
        bookings: [],
        total_bookings: 0,
        reviews: [],
        total_reviews: 0,
        messages: [],
        total_messages: 0,
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    setFormData((prev) => ({
      ...prev,
      [name]: file || null,
    }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [`${name}_preview`]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "profile_pic_preview") return;

        const newVal = formData[key];
        const oldVal = currentUser[key];

        if (key === "profile_pic") {
          if (newVal instanceof File) {
            formDataToSend.append("profile_pic", newVal);
          }
          return;
        }

        const newValString = newVal == null ? "" : String(newVal);
        const oldValString = oldVal == null ? "" : String(oldVal);

        if (newValString !== oldValString) {
          formDataToSend.append(key, newVal);
        }
      });

      await API.put(`/admin-user/${currentUser.id}/`, formDataToSend, {
        withCredentials: true,
      });
      fetchUsers();
      setShowEditModal(false);
      setSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating user:", err);
      const apiError = err.response?.data;
      if (apiError?.err && apiError?.details) {
        alert(
          `${apiError?.err}\n${JSON.stringify(apiError?.details, null, 2)}`
        );
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update user. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await API.delete(`/admin-user/${currentUser.id}/`);
      fetchUsers();
      setShowDeleteModal(false);
      setSnackbar({
        open: true,
        message: "User deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      setSnackbar({
        open: true,
        message: "Failed to delete user. Please try again.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const queryParams = new URLSearchParams({ action: "users" });
      if (filters.username) queryParams.append("username", filters.username);
      if (filters.email) queryParams.append("email", filters.email);
      queryParams.append("page", pagination.page);
      queryParams.append("page_size", pagination.rowsPerPage);
      queryParams.append("pdf", "true");

      const response = await API.get(
        `/admin-dashboard/?${queryParams.toString()}`,
        { responseType: "blob" }
      );

      let filename = "users.pdf";
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "PDF downloaded successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setSnackbar({
        open: true,
        message: "Failed to download PDF. Please try again.",
        severity: "error",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const clearFilters = () => {
    setTempFilters({ username: "", email: "" });
    setFilters({ username: "", email: "" });
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-96">
        <Box className="text-center">
          <CircularProgress size={60} className="text-blue-600" />
          <Typography variant="h6" className="mt-4 text-gray-600">
            Loading users...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4">
      <Container maxWidth="xl" className="px-2 sm:px-4">
        {/* Search Section - All in one row */}
        <Paper
          elevation={2}
          className="p-4 sm:p-6 mb-6 rounded-2xl bg-white shadow-md"
        >
          <Box className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Inputs Row */}
            <Box className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
              <TextField
                fullWidth
                label="Search by Username"
                name="username"
                value={tempFilters.username}
                onChange={handleTempFilterChange}
                placeholder="Enter username..."
                InputProps={{
                  startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                }}
                className="bg-gray-50 rounded-lg min-w-[200px]"
                size="small"
              />
              <TextField
                fullWidth
                label="Search by Email"
                name="email"
                value={tempFilters.email}
                onChange={handleTempFilterChange}
                placeholder="Enter email..."
                InputProps={{
                  startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                }}
                className="bg-gray-50 rounded-lg min-w-[200px]"
                size="small"
              />
            </Box>

            {/* Action Buttons Row */}
            <Box className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Box className="flex gap-3">
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  className="rounded-lg py-2 bg-blue-600 hover:bg-blue-700 transition-colors min-w-[100px]"
                  startIcon={<SearchIcon />}
                  size="small"
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  className="rounded-lg py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors min-w-[100px]"
                  startIcon={<ClearIcon />}
                  size="small"
                >
                  Clear
                </Button>
              </Box>

              <Button
                variant="contained"
                startIcon={
                  pdfLoading ? (
                    <CircularProgress size={20} className="text-white" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                onClick={handleDownloadPdf}
                disabled={pdfLoading || users.length === 0}
                className="rounded-xl px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md min-w-[180px]"
                size="small"
              >
                {pdfLoading ? "Generating..." : "Download PDF"}
              </Button>
            </Box>
          </Box>

          <Typography
            variant="body2"
            className="mt-3 text-gray-500 flex items-center gap-1"
          >
            <span className="text-blue-500">💡</span>
            Search is case-insensitive and matches partial text
          </Typography>
        </Paper>

        {/* Users Table Section */}
        <Paper
          elevation={3}
          className="rounded-2xl overflow-hidden bg-white shadow-lg"
        >
          {/* Loading State */}
          {tableLoading ? (
            <Box className="p-8 text-center">
              <CircularProgress size={50} className="text-blue-600" />
              <Typography variant="h6" className="mt-4 text-gray-600">
                Loading users...
              </Typography>
            </Box>
          ) : error ? (
            <Box className="p-8 text-center">
              <Typography
                variant="h6"
                className="text-red-600 flex items-center justify-center gap-2"
              >
                <span>⚠️</span>
                {error}
              </Typography>
            </Box>
          ) : users.length === 0 ? (
            <Box className="p-8 text-center">
              {filters.username || filters.email ? (
                <>
                  <Typography variant="h6" className="text-gray-600 mb-2">
                    🔍 No users matched your search criteria
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    Try adjusting your search or clear the filters to see all
                    users
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" className="text-gray-600">
                  👥 No users found in the system
                </Typography>
              )}
            </Box>
          ) : (
            <Box className="overflow-hidden">
              {/* Table Container with Fixed Height and Scroll */}
              <Box className="max-h-[600px] overflow-auto">
                <Table hover responsive className="mb-0 min-w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-purple-600 sticky top-0 z-10">
                    <tr>
                      <th className="text-center text-white font-bold py-4 px-2 sm:px-4 w-16">
                        #
                      </th>
                      <th className="text-white font-bold py-4 px-2 sm:px-4 min-w-[200px]">
                        User Information
                      </th>
                      <th className="text-white font-bold py-4 px-2 sm:px-4 min-w-[180px]">
                        Contact Details
                      </th>
                      <th className="text-center text-white font-bold py-4 px-2 sm:px-4 w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.id || user.username}
                        className="border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(user)}
                      >
                        <td className="text-center align-middle py-4 px-2 sm:px-4">
                          <Chip
                            label={index + 1}
                            size="small"
                            className="bg-blue-600 text-white font-bold"
                          />
                        </td>
                        <td className="align-middle py-4 px-2 sm:px-4">
                          <Box className="flex items-center gap-3">
                            <Avatar
                              src={user.profile_pic}
                              className="w-12 h-12 border-2 border-blue-500 shadow-sm"
                            >
                              {user.first_name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle1"
                                className="font-semibold text-gray-800 mb-0"
                              >
                                {user.first_name} {user.last_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                className="text-gray-500"
                              >
                                @{user.username}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-gray-400"
                              >
                                {user.address || "No address provided"}
                              </Typography>
                            </Box>
                          </Box>
                        </td>
                        <td className="align-middle py-4 px-2 sm:px-4">
                          <Box>
                            <Typography
                              variant="body2"
                              className="font-medium text-gray-700 flex items-center gap-1 mb-1"
                            >
                              <EmailIcon className="text-gray-400 text-sm" />
                              {user.email || "N/A"}
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-gray-500 flex items-center gap-1"
                            >
                              <PhoneIcon className="text-gray-400 text-sm" />
                              {user.phone || "N/A"}
                            </Typography>
                          </Box>
                        </td>
                        <td
                          className="text-center align-middle py-4 px-2 sm:px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Box className="flex justify-center gap-1">
                            <Tooltip title="Edit User">
                              <IconButton
                                onClick={(e) => handleEditClick(user, e)}
                                size="small"
                                className="bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                onClick={(e) => handleDeleteClick(user, e)}
                                size="small"
                                className="bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Box>
            </Box>
          )}
        </Paper>

        {/* User Details Modal */}
        <User
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          user={currentUser}
          userDetails={userDetails}
          loading={detailsLoading}
        />

        {/* Edit User Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size="lg"
          centered
          className="rounded-2xl"
        >
          <Modal.Header
            closeButton
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl"
          >
            <Modal.Title className="flex items-center gap-2 font-bold">
              <EditIcon />
              Edit User
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-gray-50 p-4 sm:p-6">
            <Form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold text-gray-700">
                      First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold text-gray-700">
                      Last Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold text-gray-700">
                      Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold text-gray-700">
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold text-gray-700">
                      Phone
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold text-gray-700">
                      Address
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="font-semibold text-gray-700">
                      Profile Picture
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="profile_pic"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                    {formData.profile_pic_preview && (
                      <Box className="mt-4 text-center">
                        <Avatar
                          src={formData.profile_pic_preview}
                          className="w-24 h-24 mx-auto border-4 border-blue-500 shadow-lg"
                        />
                      </Box>
                    )}
                  </Form.Group>
                </Grid>
              </Grid>
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <Button
              variant="outline-secondary"
              onClick={() => setShowEditModal(false)}
              className="rounded-xl px-6 py-2 border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="rounded-xl px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white transition-all shadow-md"
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
          className="rounded-2xl"
        >
          <Modal.Header
            closeButton
            className="bg-red-600 text-white rounded-t-2xl"
          >
            <Modal.Title className="flex items-center gap-2 font-bold">
              <DeleteIcon />
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-6">
            <Box className="mb-4">
              <DeleteIcon className="text-red-500 text-6xl" />
            </Box>
            <Typography
              variant="h6"
              className="mb-4 font-semibold text-gray-800"
            >
              Are you sure you want to delete this user?
            </Typography>
            <Paper
              elevation={1}
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4"
            >
              <Typography
                variant="body1"
                className="font-semibold text-gray-800"
              >
                {currentUser?.first_name} {currentUser?.last_name}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                @{currentUser?.username}
              </Typography>
            </Paper>
            <Typography variant="body2" className="text-red-600 font-medium">
              ⚠️ This action cannot be undone and will permanently remove all
              user data.
            </Typography>
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-200">
            <Button
              variant="outline-secondary"
              onClick={() => setShowDeleteModal(false)}
              className="rounded-xl px-6 py-2 border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 text-white transition-all shadow-md"
            >
              {isDeleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <MuiAlert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            className="rounded-2xl shadow-lg font-semibold"
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminUsers;
