import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  Code,
  Smartphone,
  Zap,
  Users,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Phone,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Service from "../modals/Service";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { CartConstants } from "../utils/constants";

export default function Services({ setActiveNav }) {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const { userId, isAuthenticated } = useContext(AuthContext);

  const navigate = useNavigate();

  // Payment information
  const TILL_NUMBER = "4323716";
  const PAYBILL_NUMBER = "400200";
  const ACCOUNT_NUMBER = "1077483";

  // Initialize cart and set up callback
  useEffect(() => {
    if (isAuthenticated && userId) {
      // Set up callback for cart updates
      CartConstants.setCartCallback(userId, (items) => {
        setCartCount(items.length);
      });
    } else {
      setCartCount(0);
    }

    // Cleanup function
    return () => {
      if (userId) {
        CartConstants.removeCartCallback(userId);
      }
    };
  }, [isAuthenticated, userId]);

  // Category configurations
  const categoryIcons = {
    "photo-video": Code,
    audio: Zap,
    graphic: Smartphone,
    broadcasting: Palette,
    beat_making: TrendingUp,
    sound_recording: Users,
    mixing: Zap,
    mastering: Zap,
    music_video: Code,
    default: Palette,
  };

  const categoryConfig = {
    "photo-video": { label: "Photo & Video" },
    audio: { label: "Music Production" },
    graphic: { label: "Graphic Design" },
    broadcasting: { label: "Digital Broadcasting" },
  };

  const audioSubcategories = {
    beat_making: "Beat Making",
    sound_recording: "Sound Recording",
    mixing: "Mixing",
    mastering: "Mastering",
    music_video: "Music Video Production",
  };

  // ✅ Show alert function
  const showAlert = (title, message, severity = "success") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // ✅ Handle alert close
  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await API.get("/services/");
        setServices(response.data.services || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleViewDetails = (service) => {
    navigate(`/service/${service.id}`);
  };

  const handleAddToCart = async (serviceData) => {
    if (!isAuthenticated || !userId) {
      showAlert(
        "Authentication required.",
        "Please log in to add items to cart",
        "warning"
      );
      return;
    }
    const result = addToCart(userId, serviceData);
    if (result.success) {
      // Show success message
      showAlert(
        "Success! 🎉",
        `${serviceData.title || "Service"} has been added to your cart`,
        "success"
      );
    } else {
      // Show error message
      showAlert(
        "Error",
        result.error || "Failed to add service to cart",
        "error"
      );
    }
  };

  // Toggle description expansion
  const toggleDescription = (serviceId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Check if description is long enough to need truncation
  const isLongDescription = (description) => {
    return description && description.length > 150;
  };

  // Get truncated description
  const getTruncatedDescription = (description) => {
    if (!description) return "";
    return description.length > 150 ? description.substring(0, 150) + "..." : description;
  };

  if (loading) {
    return (
      <div className="relative py-4 sm:py-6 lg:py-8 bg-[#2F364D] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-8 bg-gray-700/50 rounded-lg w-64 mx-auto mb-3"></div>
            <div className="h-4 bg-gray-700/50 rounded-lg w-96 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-gray-800/50 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="relative">
                  <div className="w-full h-64 bg-gray-700/50"></div>
                  <div className="absolute top-3 left-3 bg-gray-600/50 rounded-full h-8 w-32"></div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-700/50 rounded-full w-28"></div>
                  <div className="h-10 bg-gray-700/50 rounded-lg w-40"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-4/6"></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 h-10 bg-gray-700/50 rounded-lg"></div>
                    <div className="flex-1 h-10 bg-gray-700/50 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative py-4 sm:py-6 lg:py-8 bg-[#2F364D] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-4 sm:py-6 lg:py-8 bg-[#2F364D] overflow-hidden">
      {/* ✅ MUI Alert Snackbar - Appears at the top */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiSnackbar-root": {
            top: "80px !important", // Position below header
          },
        }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "1rem",
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <AlertTitle sx={{ fontWeight: "bold", fontSize: "1.1rem", mb: 1 }}>
            {alertTitle}
          </AlertTitle>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 xl:w-96 xl:h-96 bg-[#5A6DFF]/15 rounded-full mix-blend-screen filter blur-lg sm:blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 xl:w-96 xl:h-96 bg-[#00B8C8]/15 rounded-full mix-blend-screen filter blur-lg sm:blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 xl:w-96 xl:h-96 bg-[#FF6B4A]/15 rounded-full mix-blend-screen filter blur-lg sm:blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5A6DFF]/5 via-transparent to-[#00B8C8]/5"></div>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div
          className="relative mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 py-4 sm:py-6 lg:py-8 xl:py-10 
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-lg sm:shadow-xl lg:shadow-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl
                      mx-2 sm:mx-3 lg:mx-4 xl:mx-auto"
        >
          {/* Header Section */}
          <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4 xl:space-y-6 mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-[0_2px_8px_rgba(90,109,255,0.3)]">
              Services we offer
            </h2>
          </div>

          {/* Services Grid */}
          <div className="flex justify-center">
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[#D5D8E0] text-lg">
                  No services available
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 w-full max-w-6xl">
                {services.map((service) => {
                  const getServiceIcon = (service) => {
                    if (
                      service.category === "audio" &&
                      service.audio_category
                    ) {
                      return (
                        categoryIcons[service.audio_category] ||
                        categoryIcons.default
                      );
                    }
                    return (
                      categoryIcons[service.category] || categoryIcons.default
                    );
                  };

                  const FallbackIcon = getServiceIcon(service);
                  const isInCart =
                    isAuthenticated &&
                    CartConstants.isServiceInCart(userId, service.id);
                  const isExpanded = expandedDescriptions[service.id];
                  const shouldTruncate = isLongDescription(service.description);
                  const displayDescription = isExpanded 
                    ? service.description 
                    : (shouldTruncate ? getTruncatedDescription(service.description) : service.description);

                  return (
                    <div
                      key={service.id}
                      className={`group relative bg-gradient-to-br from-[#5A6DFF]/15 to-[#00B8C8]/10
                                 backdrop-blur-xl border rounded-lg sm:rounded-xl lg:rounded-2xl
                                 hover:shadow-[0_8px_32px_0_rgba(90,109,255,0.3),inset_0_1px_0_0_rgba(255,255,255,0.1)]
                                 transition-all duration-300 hover:-translate-y-1 lg:hover:-translate-y-2 cursor-pointer
                                 before:absolute before:inset-0 before:rounded-lg sm:before:rounded-xl lg:before:rounded-2xl
                                 before:bg-gradient-to-br before:from-white/10 before:to-transparent
                                 before:opacity-50 before:pointer-events-none
                                 flex flex-col h-full overflow-hidden
                                 ${
                                   isInCart
                                     ? "border-green-500"
                                     : "border-[#5A6DFF]/25"
                                 }`}
                    >
                      {/* In Cart Badge */}
                      {isInCart && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                          In Cart
                        </div>
                      )}

                      {/* Image Container */}
                      <div className="relative h-48 sm:h-56 lg:h-64 xl:h-72 overflow-hidden">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.get_category_display || service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#5A6DFF]/20 to-[#00B8C8]/20">
                            <FallbackIcon
                              size={48}
                              className="text-[#D5D8E0] group-hover:text-white transition-colors duration-300"
                            />
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#5A6DFF] to-[#00B8C8] text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                          {service.category === "audio" &&
                          service.audio_category
                            ? audioSubcategories[service.audio_category]
                            : categoryConfig[service.category]?.label ||
                              service.category}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-5 lg:p-6">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 drop-shadow-sm leading-tight">
                          {service.title || service.get_category_display}
                        </h3>

                        <div className="flex-1 mb-4">
                          <p className="text-sm sm:text-base text-[#D5D8E0] leading-relaxed sm:leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                            {displayDescription}
                          </p>
                          
                          {/* Read More/Less Button */}
                          {shouldTruncate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDescription(service.id);
                              }}
                              className="mt-2 flex items-center gap-1 text-[#52c297] hover:text-[#00B8C8] text-sm font-medium transition-colors duration-200 group/readmore"
                            >
                              <span>
                                {isExpanded ? "Read Less" : "Read More"}
                              </span>
                              {isExpanded ? (
                                <ChevronUp size={16} className="group-hover/readmore:translate-y-[-1px] transition-transform" />
                              ) : (
                                <ChevronDown size={16} className="group-hover/readmore:translate-y-[1px] transition-transform" />
                              )}
                            </button>
                          )}
                        </div>

                        
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Information Section - Simplified */}
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-xl">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-6 flex items-center justify-center gap-3">
                <CreditCard className="text-blue-400" size={24} />
                Payment Information
              </h3>

              {/* Simple Payment Numbers - Always same row */}
              <div className="flex flex-row justify-center items-center gap-4 sm:gap-8 mb-6">
                {/* Till Number */}
                <div className="text-center flex-1 max-w-[140px] sm:max-w-none">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Phone size={16} className="text-green-400" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-300">
                      Till Number
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-mono">
                    {TILL_NUMBER}
                  </p>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-8 sm:h-12 bg-slate-600"></div>

                {/* Paybill Number */}
                <div className="text-center flex-1 max-w-[160px] sm:max-w-none">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard size={16} className="text-green-400" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-300">
                      Paybill
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-mono">
                      {PAYBILL_NUMBER}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-slate-400">Account:</span>
                      <span className="text-xs sm:text-sm font-bold text-white font-mono">
                        {ACCOUNT_NUMBER}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple Disclaimer */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="text-amber-400 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm text-amber-100 font-medium mb-1">
                      Important Payment Notice
                    </p>
                    <p className="text-xs text-amber-200">
                      Payments must only be made to the official Till Number or
                      Paybill Number shown above. Always preserve your
                      transaction details as proof of payment. Do not make
                      payments to any other numbers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal (if still needed for other functionality) */}
      <Service
        open={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        onAddToCart={handleAddToCart}
      />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}