import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert, Image } from "react-bootstrap";
import API from "../api"; // Adjust the import path as needed

const ProfileUpdate = ({ show, onHide, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    profile_pic: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize form with user data when modal opens or user changes
  useEffect(() => {
    if (user && show) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        profile_pic: null,
      });
      setPreviewImage(user.profile_pic || "");
      setError("");
      setSuccess("");
    }
  }, [user, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profile_pic: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const submitData = new FormData();

      // Append form data
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      if (formData.phone) {
        submitData.append("phone", formData.phone);
      }
      if (formData.profile_pic) {
        submitData.append("profile_pic", formData.profile_pic);
      }

      const response = await API.patch("/user/profile/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setSuccess("Profile updated successfully!");

      // Call the onUpdate callback with updated user data
      if (onUpdate) {
        onUpdate(response.data);
      }

      // Close modal after successful update
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to update profile. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setFormData({
      username: "",
      email: "",
      phone: "",
      profile_pic: null,
    });
    setPreviewImage("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update Profile</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="row">
            {/* Profile Picture Section */}
            <div className="col-md-4 text-center mb-4">
              <div className="position-relative d-inline-block">
                <Image
                  src={previewImage || "/default-avatar.png"}
                  roundedCircle
                  width={150}
                  height={150}
                  className="border border-3 border-primary object-fit-cover"
                  alt="Profile preview"
                />
                <div className="position-absolute bottom-0 end-0">
                  <Form.Label
                    htmlFor="profile-pic-upload"
                    className="btn btn-primary btn-sm rounded-circle cursor-pointer mb-0"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-camera"></i>
                  </Form.Label>
                  <Form.Control
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="d-none"
                  />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  Click the camera icon to change profile picture
                </small>
              </div>
            </div>

            {/* Form Fields */}
            <div className="col-md-8">
              <Form.Group className="mb-3">
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your username"
                />
                <Form.Text className="text-muted">
                  Username must be unique and 3-20 characters long.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
                <Form.Text className="text-muted">
                  Optional: Include country code (e.g., +254712345678)
                </Form.Text>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProfileUpdate;
