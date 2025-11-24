import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Pagination,
  Modal,
  Form,
} from "react-bootstrap";
import {
  Avatar,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import emailjs from "@emailjs/browser";
import API from "../../api";
import { Message } from "@mui/icons-material";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(5);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin-dashboard/?action=messages");
      setMessages(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch messages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await API.put(`/contactus/${messageId}`);
      setMessages(
        messages.map((message) =>
          message.id === messageId ? { ...message, read: true } : message
        )
      );
      showNotification("Message marked as read", "success");
    } catch (err) {
      showNotification("Failed to mark message as read", "error");
    }
  };

  const handleReplyClick = (message) => {
    setSelectedMessage(message);
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedMessage(null);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      showNotification("Reply cannot be empty", "error");
      return;
    }

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_REPLY_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_REPLY_TEMPLATE_ID,
        {
          to_name: selectedMessage.name,
          to_email: selectedMessage.email,
          reply_message: replyText,
          subject: `Re: ${selectedMessage.subject}`,
        },
        import.meta.env.VITE_EMAILJS_REPLY_USER_ID
      );

      if (!selectedMessage.read) {
        await handleMarkAsRead(selectedMessage.id);
      }

      showNotification("Reply sent successfully", "success");
      handleCloseReplyModal();
    } catch (err) {
      showNotification("Failed to send reply", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({
      open: true,
      message,
      type,
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-64">
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className="mt-6 mb-8 px-4">
      {/* Header Section */}
      <Paper className="p-6 mb-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm">
        <Row className="items-center justify-between flex-wrap">
          {/* Title: Messages Management */}

          <div className="flex items-center justify-center gap-3">
            <Message sx={{ fontSize: 32, color: "#667eea" }} />
            <Typography
              variant="h4"
              component="h1"
              className="font-bold text-gray-800 mb-0"
            >
              Messages Management
            </Typography>
          </div>
        </Row>
      </Paper>

      {error || messages.length === 0 ? (
        <Card className="mb-6 p-6 text-center rounded-2xl shadow-md border-0">
          <Card.Body className="p-4">
            {error ? (
              <Alert severity="error" className="rounded-lg">
                {error}
              </Alert>
            ) : (
              <Alert severity="info" className="rounded-lg">
                No messages found.
              </Alert>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Messages List */}
          <div className="space-y-4">
            {currentMessages.map((message) => (
              <Card
                key={message.id}
                className="rounded-2xl shadow-md border-0 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Card.Body className="p-6">
                  <Row className="items-start">
                    {/* Avatar Column */}
                    <Col xs={12} md={1} className="text-center mb-4 md:mb-0">
                      <Avatar
                        src={message.user?.profile_pic || "/default-avatar.png"}
                        alt={message.name}
                        className="w-16 h-16 border-2 border-gray-200 mx-auto"
                      />
                    </Col>

                    {/* Message Content Column */}
                    <Col xs={12} md={11}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div className="flex-1">
                          <h5 className="font-semibold text-lg mb-1 text-gray-800">
                            {message.name}
                          </h5>
                          <div className="text-gray-600 text-sm">
                            {message.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-sm font-medium ${
                              message.read
                                ? "text-gray-500"
                                : "text-blue-600 font-bold"
                            }`}
                          >
                            {message.read ? "Read" : "Unread"}
                          </span>
                          <small className="text-gray-500 text-sm">
                            {formatDate(message.sent_at)}
                          </small>
                        </div>
                      </div>

                      <Card.Title className="text-xl font-bold text-gray-800 mb-3">
                        {message.subject}
                      </Card.Title>

                      <Card.Text className="text-gray-700 leading-relaxed mb-4">
                        {message.message}
                      </Card.Text>

                      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                        {!message.read && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-lg px-4 py-2 border-2 hover:bg-blue-50 transition-colors"
                            onClick={() => handleMarkAsRead(message.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                          onClick={() => handleReplyClick(message)}
                        >
                          Reply
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination className="flex-wrap justify-center">
                <Pagination.First
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className="mx-1"
                />
                <Pagination.Prev
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="mx-1"
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                    className="mx-1"
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="mx-1"
                />
                <Pagination.Last
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className="mx-1"
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Reply Modal */}
      <Modal
        show={replyModalOpen}
        onHide={handleCloseReplyModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-b border-gray-200">
          <Modal.Title className="text-xl font-semibold">
            Reply to {selectedMessage?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-6">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="font-semibold text-gray-700">
                Recipient
              </Form.Label>
              <Form.Control
                type="text"
                value={selectedMessage?.email || ""}
                disabled
                className="bg-gray-50 rounded-lg border-gray-300"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-semibold text-gray-700">
                Subject
              </Form.Label>
              <Form.Control
                type="text"
                value={`Re: ${selectedMessage?.subject || ""}`}
                disabled
                className="bg-gray-50 rounded-lg border-gray-300"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-semibold text-gray-700">
                Original Message
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedMessage?.message || ""}
                disabled
                className="bg-gray-50 rounded-lg border-gray-300 resize-none"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-semibold text-gray-700">
                Your Reply
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 px-6 py-4">
          <Button
            variant="secondary"
            onClick={handleCloseReplyModal}
            className="rounded-lg px-4 py-2 border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSendReply}
            className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Send Reply
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          className="rounded-lg shadow-lg"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminMessages;
