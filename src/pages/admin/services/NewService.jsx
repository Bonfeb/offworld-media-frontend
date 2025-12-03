import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { Badge } from "@mui/material";
import { Plus } from "lucide-react";
import API from "../../../api";

const NewService = ({ show, handleClose, refreshServices, showAlert }) => {
  const [formData, setFormData] = useState({
    category: "photo-video",
    description: "",
    price: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updated categories to match Django CATEGORY_CHOICES
  const categoryOptions = [
    { value: "photo-video", label: "Photo & Video Shooting" },
    { value: "graphic", label: "Graphic Designing" },
    { value: "broadcasting", label: "Digital Broadcasting" },
    { value: "beat_making", label: "Beat Making" },
    { value: "sound_recording", label: "Sound Recording" },
    { value: "audio_mixing", label: "Audio Mixing" },
    { value: "audio_mastering", label: "Audio Mastering" },
    { value: "music_video", label: "Music Video Production" },
  ];

  // Create a mapping object for display purposes (optional)
  const categoryDisplayNames = {
    "photo-video": "Photo & Video Shooting",
    "graphic": "Graphic Designing",
    "broadcasting": "Digital Broadcasting",
    "beat_making": "Beat Making",
    "sound_recording": "Sound Recording",
    "audio_mixing": "Audio Mixing",
    "audio_mastering": "Audio Mastering",
    "music_video": "Music Video Production",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear any existing errors when user starts typing
    if (error) setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Clear any existing errors when user selects a file
    if (error) setError("");

    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        e.target.value = ""; // Clear the input
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        e.target.value = ""; // Clear the input
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
    } else {
      setFormData((prev) => ({ ...prev, image: null }));
    }
  };

  const resetForm = () => {
    setFormData({
      category: "photo-video",
      description: "",
      price: "",
      image: null,
    });
    setError("");

    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      resetForm();
      handleClose();
    }
  };

  const validateForm = () => {
    if (!formData.category) {
      setError("Please select a category");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description");
      return false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Please enter a valid price greater than 0");
      return false;
    }

    if (!formData.image) {
      setError("Please select an image");
      return false;
    }

    // Validate that the category value is valid
    const validCategories = categoryOptions.map(opt => opt.value);
    if (!validCategories.includes(formData.category)) {
      setError("Please select a valid category");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all form data - using the correct category values
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", formData.price);
      formDataToSend.append("image", formData.image);

      // Log what's being sent for debugging
      console.log("Sending form data:");
      console.log("Category:", formData.category);
      console.log("Category Display:", categoryDisplayNames[formData.category]);
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ":", value);
      }

      const response = await API.post("/service/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Show success snackbar if showAlert function is provided
      if (showAlert) {
        const displayName = categoryDisplayNames[formData.category] || formData.category;
        showAlert(
          `Service "${displayName}" added successfully! 🎉`,
          "success"
        );
      }

      // Refresh services list
      if (refreshServices) {
        refreshServices();
      }

      // Reset form and close modal
      resetForm();
      handleClose();
    } catch (err) {
      console.error("Error details:", err);
      console.error("Error response:", err.response);

      // Handle different types of errors
      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle Django serializer validation errors
        if (typeof errorData === "object") {
          // Check for field-specific errors
          const fieldErrors = [];

          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              fieldErrors.push(`${field}: ${messages.join(", ")}`);
            } else if (typeof messages === "string") {
              fieldErrors.push(`${field}: ${messages}`);
            }
          });

          if (fieldErrors.length > 0) {
            setError(fieldErrors.join(". "));
          } else {
            setError("Please check your input fields.");
          }
        } else if (typeof errorData === "string") {
          setError(errorData);
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError("Invalid data. Please check your inputs.");
        }
      } else if (err.response?.status === 401) {
        setError("You need to be logged in to add services.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized. Admin access required.");
      } else if (err.response?.status === 413) {
        setError("Image file is too large. Please select a smaller image.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Failed to add service. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      centered
      size="lg"
      backdrop={isSubmitting ? "static" : true}
      keyboard={!isSubmitting}
    >
      <Modal.Header
        closeButton={!isSubmitting}
        style={{
          background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
          color: "white",
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <Plus size={24} className="me-2" />
          Add New Service
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-4">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Category *</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              size="lg"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select the category that best describes your service.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Description *</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              rows={4}
              size="lg"
              placeholder="Enter a detailed description of your service..."
              style={{ resize: "vertical" }}
            />
            <Form.Text className="text-muted">
              Provide a clear and engaging description of what your service
              offers.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Price (KSH) *</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              step="0.01"
              min="0.01"
              onChange={handleChange}
              disabled={isSubmitting}
              required
              size="lg"
              placeholder="0.00"
            />
            <Form.Text className="text-muted">
              Enter the price in Kenyan Shillings (KSH). Minimum: 0.01
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Service Image *</Form.Label>
            <Form.Control
              type="file"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={isSubmitting}
              required
              size="lg"
            />
            <Form.Text className="text-muted">
              Upload a high-quality image to showcase your service. Supported
              formats: JPEG, PNG, GIF, WebP. Maximum size: 5MB.
            </Form.Text>

            {/* Image preview */}
            {formData.image && (
              <div className="mt-3">
                <small className="text-muted">Selected file:</small>
                <div className="d-flex align-items-center mt-1">
                  <Badge bg="success" className="me-2">
                    {formData.image.name}
                  </Badge>
                  <small className="text-muted">
                    ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                </div>
              </div>
            )}
          </Form.Group>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button
              variant="outline-secondary"
              onClick={handleModalClose}
              disabled={isSubmitting}
              size="lg"
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="px-4"
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Adding Service...
                </>
              ) : (
                <>
                  <Plus size={16} className="me-2" />
                  Add Service
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NewService;