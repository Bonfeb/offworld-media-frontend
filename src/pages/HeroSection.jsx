import { useState, useEffect } from "react";
import {
  ArrowRight,
  Tag,
  Music,
  Calendar,
  Megaphone,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useScrollVisibility } from "../hooks/useScrollVisibility";
import { CounterCard } from "../components/CounterCard";
import API from "../api";

// Dynamic type configuration - matches Announcements.jsx
const getTypeConfig = (type) => {
  const typeConfigs = {
    promotion: {
      icon: Tag,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      gradient: "from-blue-500 to-cyan-500",
      label: "Promotion",
      badgeColor: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    release: {
      icon: Music,
      color: "bg-purple-100 text-purple-800 border-purple-200",
      gradient: "from-purple-500 to-pink-500",
      label: "New Release",
      badgeColor: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    event: {
      icon: Calendar,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      gradient: "from-orange-500 to-red-500",
      label: "Event",
      badgeColor: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
    news: {
      icon: Megaphone,
      color: "bg-green-100 text-green-800 border-green-200",
      gradient: "from-green-500 to-emerald-500",
      label: "News",
      badgeColor: "bg-green-500",
      bgColor: "bg-green-50",
    },
    // Default fallback for any unexpected types
    default: {
      icon: Megaphone,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      gradient: "from-gray-500 to-gray-600",
      label: "Announcement",
      badgeColor: "bg-gray-500",
      bgColor: "bg-gray-50",
    },
  };

  return typeConfigs[type] || typeConfigs.default;
};

export default function HeroSection({ setActiveNav }) {
  const handleCtaClick = () => {
    setActiveNav("Contact");
    document.getElementById("Contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleServicesClick = () => {
    setActiveNav("Services");
    document.getElementById("Services")?.scrollIntoView({ behavior: "smooth" });
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [slides, setSlides] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for full screen image viewer
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  const { ref, isVisible } = useScrollVisibility({ threshold: 0.3 });

  // Fetch images from API endpoint
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await API.get("/images/");

        // Transform API data to slides format
        const formattedSlides = response.data.map((image, index) => ({
          src: image.image, // CloudinaryField URL
          alt: `Studio image ${index + 1}`,
          id: image.id || index,
        }));

        setSlides(formattedSlides);
      } catch (err) {
        setError(err.message);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Fetch announcements from backend API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        const response = await API.get("/announcements/");

        // Transform backend data to match frontend format
        const backendAnnouncements = response.data.announcements || [];

        // Filter only active announcements and transform data
        const activeAnnouncements = backendAnnouncements
          .filter((announcement) => {
            const status = getAnnouncementStatus(announcement);
            return status === "active" || status === "upcoming";
          })
          .map((announcement) => {
            const config = getTypeConfig(announcement.type);
            return {
              id: announcement.id,
              title: announcement.title,
              type: announcement.type,
              description: announcement.description,
              // Handle different date fields based on type
              date:
                announcement.type === "promotion"
                  ? announcement.startDate
                  : announcement.date,
              startDate: announcement.startDate,
              endDate: announcement.endDate,
              ctaText: getDefaultCtaText(announcement.type),
              ...config, // Include all type config properties
            };
          });

        setAnnouncements(activeAnnouncements);
      } catch (err) {
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Get default CTA text based on type
  const getDefaultCtaText = (type) => {
    const ctaTexts = {
      promotion: "Learn More",
      release: "Listen Now",
      event: "RSVP Now",
      news: "Read More",
    };
    return ctaTexts[type] || "Learn More";
  };

  // Check if announcement is active/expired - matches Announcements.jsx logic
  const getAnnouncementStatus = (announcement) => {
    const today = new Date().toISOString().split("T")[0];

    if (announcement.type === "promotion") {
      if (!announcement.endDate) return "active";
      return announcement.endDate >= today ? "active" : "expired";
    } else {
      if (!announcement.date) return "active";
      return announcement.date >= today ? "upcoming" : "past";
    }
  };

  // Image carousel functions
  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Full screen image functions
  const openFullScreen = (index) => {
    setFullScreenIndex(index);
    setIsFullScreen(true);
    // Disable body scroll when full screen is open
    document.body.style.overflow = "hidden";
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    // Re-enable body scroll
    document.body.style.overflow = "unset";
  };

  const nextFullScreenSlide = () => {
    setFullScreenIndex((prev) => (prev + 1) % slides.length);
  };

  const prevFullScreenSlide = () => {
    setFullScreenIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Handle keyboard navigation in full screen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullScreen) return;

      switch (e.key) {
        case "Escape":
          closeFullScreen();
          break;
        case "ArrowLeft":
          prevFullScreenSlide();
          break;
        case "ArrowRight":
          nextFullScreenSlide();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, slides.length]);

  // Announcements functions
  const nextAnnouncement = () => {
    if (announcements.length > 0) {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }
  };

  const prevAnnouncement = () => {
    if (announcements.length > 0) {
      setCurrentAnnouncement(
        (prev) => (prev - 1 + announcements.length) % announcements.length
      );
    }
  };

  // Auto-slide for images
  useEffect(() => {
    if (slides.length === 0 || isFullScreen) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isFullScreen]);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(nextAnnouncement, 6000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDateDisplay = (announcement) => {
    if (announcement.type === "promotion") {
      return `${formatDate(announcement.startDate)} - ${formatDate(
        announcement.endDate
      )}`;
    } else {
      return formatDate(announcement.date);
    }
  };

  return (
    <div className="relative pb-1 bg-[#2F364D] overflow-hidden">
      {/* ✅ Background Blobs - Responsive Sizing */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-1/4 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#5A6DFF]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-4 left-1/4 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#00B8C8]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#FF6B4A]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* ✅ Full Screen Image Viewer */}
      {isFullScreen && slides.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeFullScreen}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all backdrop-blur-md border border-white/20"
            aria-label="Close full screen"
          >
            <X size={24} className="sm:w-6 sm:h-6" />
          </button>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevFullScreenSlide}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 sm:p-4 transition-all backdrop-blur-md border border-white/20 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
              </button>

              <button
                onClick={nextFullScreenSlide}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 sm:p-4 transition-all backdrop-blur-md border border-white/20 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight size={28} className="sm:w-8 sm:h-8" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 text-sm sm:text-base">
            {fullScreenIndex + 1} / {slides.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 sm:mx-8 flex items-center justify-center">
            <img
              src={slides[fullScreenIndex].src}
              alt={slides[fullScreenIndex].alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Thumbnail Strip */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 max-w-full overflow-x-auto px-4 py-2 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setFullScreenIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === fullScreenIndex
                      ? "border-blue-400 scale-110"
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ GLASS HERO CONTAINER - Responsive Layout */}
      <div
        className="relative pt-20 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 
                      grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl
                      mx-3 sm:mx-4 lg:mx-auto"
      >
        {/* ✅ Left Section — Image Carousel */}
        <div
          className="relative h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[500px] min-h-64 
                        bg-white/80 backdrop-blur-xl border border-[#D5D8E0] shadow-xl rounded-2xl lg:rounded-3xl overflow-hidden
                        order-1 lg:order-1 mb-4 lg:mb-0"
        >
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
              <div className="text-[#2F364D]">Loading images...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100/50">
              <div className="text-red-600 text-center p-4">
                Error loading images
              </div>
            </div>
          )}

          {/* Slides - Only show when we have images */}
          {!loading &&
            slides.length > 0 &&
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 cursor-pointer ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                onClick={() => openFullScreen(index)}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover rounded-2xl lg:rounded-3xl hover:opacity-95 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />

                {/* Click to zoom hint on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <div className="bg-black/50 text-white rounded-full p-3 backdrop-blur-sm">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m0 0l3-3m-3 3l-3-3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}

          {/* No Images State */}
          {!loading && slides.length === 0 && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
              <div className="text-[#2F364D] text-center p-4">
                No images available
              </div>
            </div>
          )}

          {/* Navigation Arrows - Only show when we have multiple slides */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 bg-[#1A1C23]/40 backdrop-blur-md 
                           hover:bg-[#1A1C23]/60 text-white rounded-full p-1.5 sm:p-2 transition-all z-10"
                aria-label="Previous slide"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 bg-[#1A1C23]/40 backdrop-blur-md 
                           hover:bg-[#1A1C23]/60 text-white rounded-full p-1.5 sm:p-2 transition-all z-10"
                aria-label="Next slide"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ✅ Right Section — Announcements */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 order-2 lg:order-2">
          {/* ✅ Title - Responsive Text Sizing */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#b2b9d3] leading-tight sm:leading-tight">
            Your go to
            <span className="block bg-gradient-to-r from-[#5A6DFF] to-[#00B8C8] bg-clip-text text-transparent mt-1 sm:mt-2">
              media company
            </span>
          </h1>

          {/* ✅ CTA Buttons - Responsive Stacking */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
            <button
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#5A6DFF] to-[#00B8C8] 
                         text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 group
                         text-sm sm:text-base"
            >
              Contact Us
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={handleServicesClick}
              className="px-6 py-2.5 sm:px-8 sm:py-3 border-2 bg-[#7292c2] border-[#2F364D]/20 text-[#2F364D] rounded-lg font-medium 
                         hover:border-[#2F364D]/40 hover:text-[#1A1C23] transition-colors duration-200
                         text-sm sm:text-base"
            >
              Our Services
            </button>
          </div>

          {/* ✅ Announcements Section */}
          <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl lg:rounded-2xl overflow-hidden mt-6">
            {/* Loading State */}
            {announcementsLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
                <div className="text-slate-200 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Loading announcements...</span>
                </div>
              </div>
            )}

            {/* Announcements */}
            {!announcementsLoading && announcements.length > 0 && (
              <>
                {announcements.map((announcement, index) => {
                  const config = getTypeConfig(announcement.type);
                  const IconComponent = config.icon;
                  const status = getAnnouncementStatus(announcement);

                  return (
                    <div
                      key={announcement.id}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-500 p-4 sm:p-5 md:p-6 flex flex-col justify-between ${
                        index === currentAnnouncement
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      {/* Header with badge and icon */}
                      <div className="flex items-start justify-between">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-200`}
                        >
                          {config.label}
                        </span>
                        <div
                          className={`p-2 rounded-lg bg-slate-800/60 backdrop-blur-sm border border-slate-700/30`}
                        >
                          <IconComponent size={20} className="text-blue-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                          {announcement.title}
                        </h3>

                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-2">
                          {announcement.description}
                        </p>
                      </div>

                      {/* Footer with date and CTA */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4">
                        <div className="flex items-center text-xs sm:text-sm text-slate-400">
                          <Calendar size={14} className="mr-2" />
                          {getDateDisplay(announcement)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Navigation Arrows for Announcements */}
                {announcements.length > 1 && (
                  <>
                    <button
                      onClick={prevAnnouncement}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-slate-800/70 backdrop-blur-md 
                       hover:bg-slate-700/80 border border-slate-600/50 text-white rounded-full p-2 sm:p-2.5 transition-all z-10 hover:scale-110"
                      aria-label="Previous announcement"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={nextAnnouncement}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-slate-800/70 backdrop-blur-md 
                       hover:bg-slate-700/80 border border-slate-600/50 text-white rounded-full p-2 sm:p-2.5 transition-all z-10 hover:scale-110"
                      aria-label="Next announcement"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {announcements.length > 1 && (
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {announcements.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAnnouncement(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentAnnouncement
                            ? "bg-blue-400 w-6 shadow-lg shadow-blue-400/50"
                            : "bg-slate-600 hover:bg-slate-500 w-2"
                        }`}
                        aria-label={`Go to announcement ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* No Announcements State */}
            {!announcementsLoading && announcements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
                <div className="text-slate-300 text-center p-4 sm:p-6">
                  <div className="text-slate-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-medium">
                    No active announcements
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Check back later for updates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Blob Animations */}
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
