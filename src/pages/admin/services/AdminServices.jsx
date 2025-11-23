import React, { useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";
import {
  Search,
  Edit3,
  Trash2,
  Music,
  Camera,
  Palette,
  Radio,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../../api";

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    image: null,
    audio_category: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const categoryConfig = {
    "photo-video": {
      icon: Camera,
      color: "blue",
      label: "Photo & Video",
    },
    audio: {
      icon: Music,
      color: "green",
      label: "Music Production",
    },
    graphic: {
      icon: Palette,
      color: "purple",
      label: "Graphic Design",
    },
    broadcasting: {
      icon: Radio,
      color: "teal",
      label: "Digital Broadcasting",
    },
  };

  const audioSubcategories = {
    beat_making: "Beat Making",
    sound_recording: "Sound Recording",
    mixing: "Mixing",
    mastering: "Mastering",
    music_video: "Music Video Production",
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      setFilteredServices(services);
    }
  }, [services]);

  // Calculate slides per view based on screen size
  const getSlidesPerView = () => {
    if (typeof window === "undefined") return 4;

    const width = window.innerWidth;
    if (width >= 1280) return 4; // xl screens
    if (width >= 1024) return 3; // lg screens
    if (width >= 768) return 2; // md screens
    return 1; // sm and xs screens
  };

  const fetchServices = async () => {
    try {
      const response = await API.get("/services/", {
        withCredentials: true,
      });

      const servicesData = Array.isArray(response.data?.services)
        ? response.data.services
        : [];
      setServices(servicesData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError("Failed to load services. Please try again later.");
      setServices([]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const showAlert = (message, severity) => {
    setAlertConfig({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseAlert = () => {
    setAlertConfig({ ...alertConfig, open: false });
  };

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setFormData({
      description: service.description || "",
      price: service.price || "",
      image: service.image || null,
      audio_category: service.audio_category || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setIsUpdating(false);
  };

  const handleOpenDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedService(null);
    setIsDeleting(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);

      if (selectedService.category === "audio" && formData.audio_category) {
        formDataToSend.append("audio_category", formData.audio_category);
      }

      if (formData.image && formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      await API.put(`/service/${selectedService.id}/`, formDataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert("Service updated successfully!", "success");
      handleCloseModal();
      fetchServices();
    } catch (err) {
      showAlert("Failed to update service. Please try again.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (selectedService) {
      setIsDeleting(true);
      try {
        await API.delete(`/service/${selectedService.id}/`, {
          withCredentials: true,
        });

        showAlert("Service deleted successfully!", "success");
        handleCloseDeleteModal();
        fetchServices();
      } catch (err) {
        showAlert("Failed to delete service. Please try again.", "error");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Carousel navigation
  const nextSlide = () => {
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.max(
      0,
      Math.ceil(filteredServices.length / slidesPerView) - 1
    );
    setCurrentSlide((prev) => (prev < maxSlide ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4">
            <h5 className="text-gray-600">Loading services...</h5>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-red-800 font-semibold mb-2">
              Something went wrong
            </h4>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchServices}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const slidesPerView = getSlidesPerView();
  const totalSlides = Math.ceil(filteredServices.length / slidesPerView);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center">
            <p className="text-gray-600">
              Manage all your creative services in one place
            </p>
          </div>
        </div>

        {/* Global Alert */}
        <Snackbar
          open={alertConfig.open}
          autoHideDuration={5000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseAlert} severity={alertConfig.severity}>
            {alertConfig.message}
          </Alert>
        </Snackbar>

        {/* Services Carousel */}
        {!Array.isArray(filteredServices) || filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Search size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-600 text-xl font-semibold mb-2">
              No services found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No services have been added yet"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {filteredServices.map((service) => {
                  const config =
                    categoryConfig[service.category] ||
                    categoryConfig["photo-video"];
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={service.id}
                      className="flex-shrink-0 w-full sm:w-1/1 md:w-1/2 lg:w-1/3 xl:w-1/4 p-2"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full">
                        <div className="p-6 h-full flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div
                                className={`p-2 rounded-lg bg-${config.color}-50`}
                              >
                                <IconComponent
                                  size={24}
                                  className={`text-${config.color}-600`}
                                />
                              </div>
                              <div className="ml-3">
                                <h3 className="font-semibold text-gray-900">
                                  {config.label}
                                </h3>
                                {service.category === "audio" &&
                                  service.audio_category && (
                                    <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                      {
                                        audioSubcategories[
                                          service.audio_category
                                        ]
                                      }
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Image */}
                          {service.image && (
                            <div className="mb-4 flex-grow-0">
                              <img
                                src={service.image}
                                alt={service.category}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* Price */}
                          <div className="mb-4 flex-grow-0">
                            <p className="text-2xl font-bold text-gray-900">
                              KSH{" "}
                              {service.price
                                ? parseFloat(service.price).toLocaleString()
                                : "0"}
                            </p>
                          </div>

                          {/* Description */}
                          <div className="mb-6 flex-grow">
                            <p className="text-gray-600 line-clamp-3">
                              {service.description ||
                                "No description available"}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => handleOpenModal(service)}
                              className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                            >
                              <Edit3 size={16} className="mr-2" />
                              Update
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(service)}
                              className="flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide >= totalSlides - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-blue-600"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Update Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Edit3 size={24} className="mr-2" />
                    Update Service
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  {selectedService?.category === "audio" && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audio Subcategory
                      </label>
                      <select
                        name="audio_category"
                        value={formData.audio_category}
                        onChange={handleInputChange}
                        required
                        disabled={isUpdating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Subcategory</option>
                        {Object.entries(audioSubcategories).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      disabled={isUpdating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (KSH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      disabled={isUpdating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty to keep current image
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isUpdating}
                      className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit3 size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Trash2 size={24} className="mr-2" />
                    Confirm Deletion
                  </h2>
                  <button
                    onClick={handleCloseDeleteModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 text-center">
                <Trash2 size={48} className="text-red-600 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-gray-900 mb-4">
                  Are you sure you want to delete this service?
                </h5>
                {selectedService && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <strong className="text-gray-900">
                      {categoryConfig[selectedService.category]?.label}
                    </strong>
                    {selectedService.category === "audio" &&
                      selectedService.audio_category && (
                        <div className="text-gray-600 text-sm mt-1">
                          Subcategory:{" "}
                          {audioSubcategories[selectedService.audio_category]}
                        </div>
                      )}
                    <div className="text-gray-600 text-sm mt-1">
                      KSH{" "}
                      {selectedService.price
                        ? parseFloat(selectedService.price).toLocaleString()
                        : "0"}
                    </div>
                  </div>
                )}
                <p className="text-red-600 font-medium text-sm">
                  This action cannot be undone!
                </p>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete Service
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
