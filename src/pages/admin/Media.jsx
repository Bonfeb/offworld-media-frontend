import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Spinner,
  Modal,
  Button,
  Dropdown,
  Container,
  Form,
  Row,
  Col,
  Image as BootstrapImage,
} from "react-bootstrap";
import Slider from "react-slick";
import {
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Paper,
  Typography,
  Box,
  Grid,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { PermMedia, Dashboard as DashboardIcon } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const Media = () => {
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showUpdateImageModal, setShowUpdateImageModal] = useState(false);
  const [showUpdateVideoModal, setShowUpdateVideoModal] = useState(false);

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [addImageLoading, setAddImageLoading] = useState(false);
  const [addVideoLoading, setAddVideoLoading] = useState(false);
  const [updateImageLoading, setUpdateImageLoading] = useState(false);
  const [updateVideoLoading, setUpdateVideoLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  // Responsive carousel settings for images
  const imageCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4, // Default for xl screens
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1536, // xl
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1280, // lg
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024, // md
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // sm
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 640, // xs
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  // Responsive carousel settings for videos
  const videoCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4, // Default for xl screens
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1536, // xl
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1280, // lg
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024, // md
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // sm
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 640, // xs
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchVideos = async () => {
    setVideoLoading(true);
    setVideoError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await API.get("/videos/", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format from videos API");
      }
      setVideos(response.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        setVideoError("Request timed out. Please try again.");
      } else if (error.response) {
        setVideoError(
          `Server error (${error.response.status}): ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        setVideoError(
          "Network error. Please check your connection and try again."
        );
      } else {
        setVideoError(`Error fetching videos: ${error.message}`);
      }
    } finally {
      setVideoLoading(false);
    }
  };

  const fetchImages = async () => {
    setImageLoading(true);
    setImageError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await API.get("/images/", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format from images API");
      }
      setImages(response.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        setImageError("Request timed out. Please try again.");
      } else if (error.response) {
        setImageError(
          `Server error (${error.response.status}): ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        setImageError(
          "Network error. Please check your connection and try again."
        );
      } else {
        setImageError(`Error fetching images: ${error.message}`);
      }
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchImages();
  }, [retryCount]);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const handleAddImageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImageFile) return;

    setAddImageLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImageFile);

    try {
      await API.post("/images/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchImages();
      setShowAddImageModal(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      showSnackbar("Image uploaded successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to upload image. Please try again.", "error");
    } finally {
      setAddImageLoading(false);
    }
  };

  const handleAddVideoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVideoFile) return;

    setAddVideoLoading(true);
    const formData = new FormData();
    formData.append("video", selectedVideoFile);

    try {
      await API.post("/videos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchVideos();
      setShowAddVideoModal(false);
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      showSnackbar("Video uploaded successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to upload video. Please try again.", "error");
    } finally {
      setAddVideoLoading(false);
    }
  };

  const handleUpdateImageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImageFile || !selectedImage) return;

    setUpdateImageLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImageFile);

    try {
      await API.put(`/image/${selectedImage.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchImages();
      setShowUpdateImageModal(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setSelectedImage(null);
      showSnackbar("Image updated successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to update image. Please try again.", "error");
    } finally {
      setUpdateImageLoading(false);
    }
  };

  const handleUpdateVideoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVideoFile || !selectedVideo) return;

    setUpdateVideoLoading(true);
    const formData = new FormData();
    formData.append("video", selectedVideoFile);

    try {
      await API.put(`/video/${selectedVideo.id}/`, formData);
      await fetchVideos();
      setShowUpdateVideoModal(false);
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      setSelectedVideo(null);
      showSnackbar("Video updated successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to update video. Please try again.", "error");
    } finally {
      setUpdateVideoLoading(false);
    }
  };

  const handleEditImageClick = (image) => {
    setSelectedImage(image);
    setShowUpdateImageModal(true);
  };

  const handleEditVideoClick = (video) => {
    setSelectedVideo(video);
    setShowUpdateVideoModal(true);
  };

  const handleImageFullscreen = (image) => {
    setFullscreenImage(image);
  };

  const handleVideoFullscreen = (video) => {
    setFullscreenVideo(video);
  };

  const handleCloseAllModals = () => {
    setShowAddImageModal(false);
    setShowAddVideoModal(false);
    setShowUpdateImageModal(false);
    setShowUpdateVideoModal(false);
    setSelectedImageFile(null);
    setSelectedVideoFile(null);
    setImagePreviewUrl(null);
    setVideoPreviewUrl(null);
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
    setFullscreenVideo(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRetry = () => {
    setRetryCount((prevCount) => prevCount + 1);
  };

  const renderVideoSection = () => {
    if (videoLoading) {
      return (
        <Box className="text-center my-8 py-8">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            className="w-12 h-12"
          >
            <span className="visually-hidden">Loading videos...</span>
          </Spinner>
          <Typography className="mt-4 text-gray-600">
            Loading videos...
          </Typography>
        </Box>
      );
    }

    if (videoError) {
      return (
        <Alert variant="danger" className="my-4 rounded-2xl">
          <Alert.Heading>Video Loading Error</Alert.Heading>
          <p>{videoError}</p>
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="outline-danger"
              onClick={handleRetry}
              className="rounded-xl"
            >
              Retry Loading Videos
            </Button>
          </div>
        </Alert>
      );
    }

    if (videos.length === 0) {
      return (
        <Alert variant="info" className="my-4 rounded-2xl">
          <p className="mb-0">No videos found in the gallery.</p>
        </Alert>
      );
    }

    return (
      <Box className="space-y-4">
        <Slider {...videoCarouselSettings}>
          {videos.map((video) => (
            <Box key={video.id} className="video-slide-container px-2">
              <Card className="shadow-lg border-0 overflow-hidden">
                <Box className="position-relative">
                  <video
                    src={video.video}
                    className="w-100"
                    controls
                    style={{
                      maxHeight: "400px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <Box className="position-absolute top-0 end-0 p-2">
                    <IconButton
                      onClick={() => handleEditVideoClick(video)}
                      size="small"
                      className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg me-1 hover:bg-white transition-colors"
                    >
                      <EditIcon fontSize="small" className="text-blue-600" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleVideoFullscreen(video)}
                      size="small"
                      className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white transition-colors"
                    >
                      <FullscreenIcon
                        fontSize="small"
                        className="text-blue-600"
                      />
                    </IconButton>
                  </Box>
                </Box>
                <CardContent className="text-center bg-gray-50">
                  <Typography variant="body2" className="text-gray-600 mb-0">
                    Uploaded: {new Date(video.uploaded_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
      </Box>
    );
  };

  const renderImageSection = () => {
    if (imageLoading) {
      return (
        <Box className="text-center my-8 py-8">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            className="w-12 h-12"
          >
            <span className="visually-hidden">Loading images...</span>
          </Spinner>
          <Typography className="mt-4 text-gray-600">
            Loading images...
          </Typography>
        </Box>
      );
    }

    if (imageError) {
      return (
        <Alert variant="danger" className="my-4 rounded-2xl">
          <Alert.Heading>Image Loading Error</Alert.Heading>
          <p>{imageError}</p>
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="outline-danger"
              onClick={handleRetry}
              className="rounded-xl"
            >
              Retry Loading Images
            </Button>
          </div>
        </Alert>
      );
    }

    if (images.length === 0) {
      return (
        <Alert variant="info" className="my-4 rounded-2xl">
          <p className="mb-0">No images found in the gallery.</p>
        </Alert>
      );
    }

    return (
      <Box className="space-y-4">
        <Slider {...imageCarouselSettings}>
          {images.map((image) => (
            <Box key={image.id} className="image-slide-container px-2">
              <Card className="shadow-lg border-0 overflow-hidden h-full">
                <Box className="position-relative">
                  <BootstrapImage
                    src={image.image}
                    alt={`Gallery image ${image.id}`}
                    fluid
                    rounded
                    style={{
                      height: "300px",
                      width: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => handleImageFullscreen(image)}
                    className="hover:shadow-md transition-shadow"
                  />
                  <Box className="position-absolute top-0 end-0 p-2">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditImageClick(image);
                      }}
                      size="small"
                      className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white transition-colors"
                    >
                      <EditIcon fontSize="small" className="text-blue-600" />
                    </IconButton>
                  </Box>
                </Box>
                <CardContent className="text-center bg-gray-50">
                  <Typography variant="body2" className="text-gray-600 mb-0">
                    Uploaded: {new Date(image.uploaded_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
      </Box>
    );
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4">
      <Container className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header Section */}
        <Paper
          elevation={0}
          className="p-4 sm:p-6 mb-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100"
        >
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Grid item xs={12} sm="auto" className="text-center">
              <Box className="flex items-center justify-center gap-3">
                <PermMedia className="text-3xl text-blue-600" />
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  className="font-bold text-gray-800"
                >
                  Media Management
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm="auto" className="text-center sm:text-right">
              <Dropdown>
                <Dropdown.Toggle
                  variant="success"
                  id="dropdown-add"
                  className="rounded-xl px-4 py-2 bg-green-600 hover:bg-green-700 border-0 shadow-md"
                >
                  <AddIcon className="me-1" />
                  Add Media
                </Dropdown.Toggle>
                <Dropdown.Menu className="rounded-xl shadow-lg border-0 mt-2">
                  <Dropdown.Item
                    onClick={() => setShowAddImageModal(true)}
                    className="rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    Add Image
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setShowAddVideoModal(true)}
                    className="rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    Add Video
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Grid>
          </Grid>
        </Paper>

        <Container fluid container spacing={3}>
          {/* Images Section */}
          <Grid item xs={12} className="mb-8">
            <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <Box className="image-carousel-container">
                  {renderImageSection()}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Container>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            className="rounded-2xl shadow-lg font-semibold"
            variant="filled"
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>

        {/* Add Image Modal */}
        <Modal
          show={showAddImageModal}
          onHide={handleCloseAllModals}
          centered
          className="rounded-2xl"
        >
          <Modal.Header
            closeButton
            className="rounded-t-2xl border-b border-gray-200"
          >
            <Modal.Title className="font-bold text-gray-800">
              Add New Image
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 sm:p-6">
            <Form onSubmit={handleAddImageSubmit}>
              <Form.Group controlId="formImageFile" className="mb-4">
                <Form.Label className="font-semibold text-gray-700">
                  Upload Image
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </Form.Group>
              {imagePreviewUrl && (
                <Box className="mb-4 text-center">
                  <BootstrapImage
                    src={imagePreviewUrl}
                    alt="Preview"
                    fluid
                    className="rounded-xl shadow-md max-h-80 mx-auto"
                  />
                </Box>
              )}
              <Box className="d-grid">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!selectedImageFile || addImageLoading}
                  size="lg"
                  className="rounded-xl py-3 bg-blue-600 hover:bg-blue-700 border-0 shadow-md transition-all font-semibold"
                >
                  {addImageLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </Button>
              </Box>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Add Video Modal */}
        <Modal
          show={showAddVideoModal}
          onHide={handleCloseAllModals}
          centered
          className="rounded-2xl"
        >
          <Modal.Header
            closeButton
            className="rounded-t-2xl border-b border-gray-200"
          >
            <Modal.Title className="font-bold text-gray-800">
              Add New Video
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 sm:p-6">
            <Form onSubmit={handleAddVideoSubmit}>
              <Form.Group controlId="formVideoFile" className="mb-4">
                <Form.Label className="font-semibold text-gray-700">
                  Upload Video
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </Form.Group>
              {videoPreviewUrl && (
                <Box className="mb-4">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-100 rounded-xl shadow-md max-h-80"
                  />
                </Box>
              )}
              <Box className="d-grid">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!selectedVideoFile || addVideoLoading}
                  size="lg"
                  className="rounded-xl py-3 bg-blue-600 hover:bg-blue-700 border-0 shadow-md transition-all font-semibold"
                >
                  {addVideoLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Video"
                  )}
                </Button>
              </Box>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Update Image Modal */}
        <Modal
          show={showUpdateImageModal}
          onHide={handleCloseAllModals}
          centered
          className="rounded-2xl"
        >
          <Modal.Header
            closeButton
            className="rounded-t-2xl border-b border-gray-200"
          >
            <Modal.Title className="font-bold text-gray-800">
              Update Image
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 sm:p-6">
            <Form onSubmit={handleUpdateImageSubmit}>
              <Form.Group controlId="formUpdateImageFile" className="mb-4">
                {selectedImage && (
                  <Box className="mb-4 text-center">
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      Current Image:
                    </Typography>
                    <BootstrapImage
                      src={selectedImage.image}
                      alt="Current"
                      fluid
                      className="rounded-xl shadow-md max-h-80 mx-auto"
                    />
                  </Box>
                )}
                <Form.Label className="font-semibold text-gray-700">
                  Upload New Image
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </Form.Group>
              {imagePreviewUrl && (
                <Box className="mb-4 text-center">
                  <Typography variant="body2" className="text-gray-600 mb-2">
                    Preview New Image:
                  </Typography>
                  <BootstrapImage
                    src={imagePreviewUrl}
                    alt="Preview"
                    fluid
                    className="rounded-xl shadow-md max-h-80 mx-auto"
                  />
                </Box>
              )}
              <Box className="d-grid">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!selectedImageFile || updateImageLoading}
                  size="lg"
                  className="rounded-xl py-3 bg-blue-600 hover:bg-blue-700 border-0 shadow-md transition-all font-semibold"
                >
                  {updateImageLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Image"
                  )}
                </Button>
              </Box>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Update Video Modal */}
        <Modal
          show={showUpdateVideoModal}
          onHide={handleCloseAllModals}
          centered
          className="rounded-2xl"
        >
          <Modal.Header
            closeButton
            className="rounded-t-2xl border-b border-gray-200"
          >
            <Modal.Title className="font-bold text-gray-800">
              Update Video
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 sm:p-6">
            <Form onSubmit={handleUpdateVideoSubmit}>
              <Form.Group controlId="formUpdateVideoFile" className="mb-4">
                {selectedVideo && (
                  <Box className="mb-4">
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      Current Video:
                    </Typography>
                    <video
                      src={selectedVideo.video}
                      controls
                      className="w-100 rounded-xl shadow-md max-h-80"
                    />
                  </Box>
                )}
                <Form.Label className="font-semibold text-gray-700">
                  Upload New Video
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </Form.Group>
              {videoPreviewUrl && (
                <Box className="mb-4">
                  <Typography variant="body2" className="text-gray-600 mb-2">
                    Preview New Video:
                  </Typography>
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-100 rounded-xl shadow-md max-h-80"
                  />
                </Box>
              )}
              <Box className="d-grid">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!selectedVideoFile || updateVideoLoading}
                  size="lg"
                  className="rounded-xl py-3 bg-blue-600 hover:bg-blue-700 border-0 shadow-md transition-all font-semibold"
                >
                  {updateVideoLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Video"
                  )}
                </Button>
              </Box>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Fullscreen Image Viewer */}
        <Dialog
          open={!!fullscreenImage}
          onClose={handleCloseFullscreen}
          maxWidth="lg"
          fullScreen={isFullscreen}
          fullWidth
          className="rounded-2xl"
        >
          <DialogContent className="p-0">
            {fullscreenImage && (
              <Box className="text-center bg-black">
                <BootstrapImage
                  src={fullscreenImage.image}
                  alt="Fullscreen view"
                  fluid
                  style={{
                    maxHeight: "80vh",
                    width: "auto",
                    maxWidth: "100%",
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions className="bg-black/80">
            <IconButton
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 me-2"
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton
              onClick={handleCloseFullscreen}
              className="text-white hover:bg-white/20"
            >
              <CloseIcon />
            </IconButton>
          </DialogActions>
        </Dialog>

        {/* Fullscreen Video Viewer 
        <Dialog
          open={!!fullscreenVideo}
          onClose={handleCloseFullscreen}
          maxWidth="lg"
          fullScreen={isFullscreen}
          fullWidth
          className="rounded-2xl"
        >
          <DialogContent className="p-0 bg-black">
            {fullscreenVideo && (
              <Box className="text-center">
                <video
                  src={fullscreenVideo.video}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh]"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions className="bg-black/80">
            <IconButton
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 me-2"
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton
              onClick={handleCloseFullscreen}
              className="text-white hover:bg-white/20"
            >
              <CloseIcon />
            </IconButton>
          </DialogActions>
        </Dialog> */}

        {videoError && imageError && (
          <Box className="text-center my-6">
            <Button
              variant="primary"
              onClick={handleRetry}
              className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700 border-0 shadow-md transition-all font-semibold"
            >
              Retry Loading All Content
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Media;
