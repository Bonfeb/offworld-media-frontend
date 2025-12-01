import { useState, useEffect } from "react";
import {
  Tag,
  Music,
  Calendar,
  Megaphone,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { useScrollVisibility } from "../hooks/useScrollVisibility";
import { CounterCard } from "../components/CounterCard";
import API from "../api";

// Use Vite environment variables
const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
const YOUTUBE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Dynamic type configuration
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [slides, setSlides] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelVideos, setChannelVideos] = useState([]);
  const [apiConfigStatus, setApiConfigStatus] = useState("checking");

  // New state for full screen image viewer
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  // Video control state - now stored per video
  const [videoStates, setVideoStates] = useState({});

  const { ref, isVisible } = useScrollVisibility({ threshold: 0.3 });

  // Initialize video state for a slide
  const initializeVideoState = (slideId) => {
    if (!videoStates[slideId]) {
      setVideoStates((prev) => ({
        ...prev,
        [slideId]: {
          playing: false,
          muted: true,
          progress: 0,
        },
      }));
    }
  };

  // Get video state for a specific slide
  const getVideoState = (slideId) => {
    return (
      videoStates[slideId] || {
        playing: false,
        muted: true,
        progress: 0,
      }
    );
  };

  // Get current video state
  const getCurrentVideoState = () => {
    const currentSlideId = slides[currentSlide]?.id;
    return getVideoState(currentSlideId);
  };

  // Get full screen video state
  const getFullScreenVideoState = () => {
    const fullScreenSlideId = slides[fullScreenIndex]?.id;
    return getVideoState(fullScreenSlideId);
  };

  // Update video state
  const updateVideoState = (slideId, updates) => {
    setVideoStates((prev) => ({
      ...prev,
      [slideId]: {
        ...getVideoState(slideId),
        ...updates,
      },
    }));
  };

  // Handle video play/pause for specific slide
  const toggleVideoPlay = (slideId) => {
    if (slideId) {
      const currentState = getVideoState(slideId);
      updateVideoState(slideId, { playing: !currentState.playing });
    }
  };

  // Handle video mute/unmute for specific slide
  const toggleVideoMute = (slideId) => {
    if (slideId) {
      const currentState = getVideoState(slideId);
      updateVideoState(slideId, { muted: !currentState.muted });
    }
  };

  // Check API configuration on component mount
  useEffect(() => {
    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
      setApiConfigStatus("missing");
    } else {
      setApiConfigStatus("configured");
    }
  }, []);

  // Fetch videos from your YouTube channel
  useEffect(() => {
    const fetchChannelVideos = async () => {
      if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
        return;
      }

      try {
        setApiConfigStatus("fetching");

        // First, get the uploads playlist ID from the channel
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
        );

        if (!channelResponse.ok) {
          throw new Error(`YouTube API error: ${channelResponse.status}`);
        }

        const channelData = await channelResponse.json();

        if (channelData.items && channelData.items.length > 0) {
          const uploadsPlaylistId =
            channelData.items[0].contentDetails.relatedPlaylists.uploads;

          // Then, get videos from the uploads playlist
          const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
          );

          if (!videosResponse.ok) {
            throw new Error(`YouTube API error: ${videosResponse.status}`);
          }

          const videosData = await videosResponse.json();

          const videos = videosData.items.map((item, index) => ({
            src: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            alt: item.snippet.title,
            id: `youtube-${item.snippet.resourceId.videoId}`,
            type: "video",
            videoId: item.snippet.resourceId.videoId,
            thumbnail:
              item.snippet.thumbnails.high?.url ||
              item.snippet.thumbnails.default.url,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            fromChannel: true,
          }));

          setChannelVideos(videos);
          setApiConfigStatus("success");
        } else {
          setApiConfigStatus("no-channel");
        }
      } catch (err) {
        setApiConfigStatus("error");
      }
    };

    if (YOUTUBE_API_KEY && YOUTUBE_CHANNEL_ID) {
      fetchChannelVideos();
    }
  }, [YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID]);

  // Fetch images from API endpoint and combine with channel videos
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const response = await API.get("/images/");

        // Transform API data to slides format with type detection
        const formattedImages = response.data.map((item, index) => {
          // Check if it's a YouTube video
          const isYouTube =
            item.image?.includes("youtube.com") ||
            item.image?.includes("youtu.be");

          if (isYouTube) {
            const videoId = extractYouTubeId(item.image);
            return {
              src: item.image,
              alt: `Video ${index + 1}`,
              id: item.id || index,
              type: "video",
              videoId: videoId,
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              fromAPI: true,
            };
          } else {
            // Regular image
            return {
              src: item.image,
              alt: `Studio image ${index + 1}`,
              id: item.id || index,
              type: "image",
              fromAPI: true,
            };
          }
        });

        // Combine API images with channel videos (remove duplicates)
        const allSlides = [...formattedImages];

        // Only add channel videos if they're not already in the API images
        channelVideos.forEach((channelVideo) => {
          const exists = formattedImages.some(
            (apiItem) =>
              apiItem.type === "video" &&
              apiItem.videoId === channelVideo.videoId
          );
          if (!exists) {
            allSlides.push(channelVideo);
          }
        });

        setSlides(allSlides);
      } catch (err) {
        setError(err.message);
        // Fallback to just channel videos if API fails
        setSlides(channelVideos);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [channelVideos]);

  // Initialize video states when slides change
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.type === "video") {
        initializeVideoState(slide.id);
      }
    });
  }, [slides]);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  // Fetch announcements from backend API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        const response = await API.get("/announcements/");

        const backendAnnouncements = response.data.announcements || [];

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
              date:
                announcement.type === "promotion"
                  ? announcement.startDate
                  : announcement.date,
              startDate: announcement.startDate,
              endDate: announcement.endDate,
              ctaText: getDefaultCtaText(announcement.type),
              ...config,
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

  // Check if announcement is active/expired
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
      // Stop current video
      const currentSlideId = slides[currentSlide]?.id;
      if (currentSlideId && slides[currentSlide]?.type === "video") {
        updateVideoState(currentSlideId, { playing: false, progress: 0 });
      }
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      // Stop current video
      const currentSlideId = slides[currentSlide]?.id;
      if (currentSlideId && slides[currentSlide]?.type === "video") {
        updateVideoState(currentSlideId, { playing: false, progress: 0 });
      }
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Full screen media functions
  const openFullScreen = (index) => {
    setFullScreenIndex(index);
    setIsFullScreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    document.body.style.overflow = "unset";
    // Stop video when closing full screen
    const fullScreenSlideId = slides[fullScreenIndex]?.id;
    if (fullScreenSlideId && slides[fullScreenIndex]?.type === "video") {
      updateVideoState(fullScreenSlideId, { playing: false });
    }
  };

  const nextFullScreenSlide = () => {
    // Stop current video
    const currentSlideId = slides[fullScreenIndex]?.id;
    if (currentSlideId && slides[fullScreenIndex]?.type === "video") {
      updateVideoState(currentSlideId, { playing: false, progress: 0 });
    }
    setFullScreenIndex((prev) => (prev + 1) % slides.length);
  };

  const prevFullScreenSlide = () => {
    // Stop current video
    const currentSlideId = slides[fullScreenIndex]?.id;
    if (currentSlideId && slides[fullScreenIndex]?.type === "video") {
      updateVideoState(currentSlideId, { playing: false, progress: 0 });
    }
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
        case " ":
          if (slides[fullScreenIndex]?.type === "video") {
            const slideId = slides[fullScreenIndex]?.id;
            toggleVideoPlay(slideId);
            e.preventDefault();
          }
          break;
        case "m":
        case "M":
          if (slides[fullScreenIndex]?.type === "video") {
            const slideId = slides[fullScreenIndex]?.id;
            toggleVideoMute(slideId);
            e.preventDefault();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, slides.length, fullScreenIndex, videoStates]);

  // Auto-slide for images and videos
  useEffect(() => {
    if (slides.length === 0 || isFullScreen) return;

    const interval = setInterval(() => {
      const currentSlideData = slides[currentSlide];
      if (currentSlideData?.type === "video") {
        const currentState = getCurrentVideoState();
        if (currentState.playing && currentState.progress >= 30) {
          nextSlide();
        }
        return;
      }
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isFullScreen, currentSlide, videoStates]);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Auto-play video when it becomes active and track progress
  useEffect(() => {
    if (slides[currentSlide]?.type === "video" && !isFullScreen) {
      const currentSlideId = slides[currentSlide]?.id;
      if (currentSlideId) {
        // Auto-play after delay
        const timer = setTimeout(() => {
          updateVideoState(currentSlideId, { playing: true });
        }, 500);

        // Track video progress
        const progressInterval = setInterval(() => {
          const currentState = getCurrentVideoState();
          if (currentState.playing) {
            const newProgress = currentState.progress + 1;
            updateVideoState(currentSlideId, { progress: newProgress });

            // Auto-stop after 30 seconds and move to next slide
            if (newProgress >= 30) {
              updateVideoState(currentSlideId, { playing: false, progress: 0 });
              setTimeout(() => nextSlide(), 1000);
            }
          }
        }, 1000);

        return () => {
          clearTimeout(timer);
          clearInterval(progressInterval);
        };
      }
    }
  }, [currentSlide, slides, isFullScreen, videoStates]);

  // Track video progress in full screen mode
  useEffect(() => {
    if (isFullScreen && slides[fullScreenIndex]?.type === "video") {
      const fullScreenSlideId = slides[fullScreenIndex]?.id;
      if (fullScreenSlideId) {
        const currentState = getFullScreenVideoState();
        if (currentState.playing) {
          const progressInterval = setInterval(() => {
            const newProgress = currentState.progress + 1;
            updateVideoState(fullScreenSlideId, { progress: newProgress });
          }, 1000);

          return () => clearInterval(progressInterval);
        }
      }
    }
  }, [isFullScreen, fullScreenIndex, slides, videoStates]);

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

  // Render YouTube video player
  const renderYouTubePlayer = (slide, isFullScreenMode = false) => {
    const videoState = getVideoState(slide.id);
    const videoUrl = `https://www.youtube.com/embed/${slide.videoId}?autoplay=${
      videoState.playing ? 1 : 0
    }&mute=${
      videoState.muted ? 1 : 0
    }&controls=0&modestbranding=1&rel=0&playsinline=1${
      isFullScreenMode ? "&enablejsapi=1" : ""
    }`;

    return (
      <div className="relative w-full h-full">
        <iframe
          src={videoUrl}
          title={slide.alt}
          className="w-full h-full rounded-2xl lg:rounded-3xl"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Video Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
          {/* Progress Bar */}
          <div className="flex-1 bg-black/50 backdrop-blur-md rounded-full h-2 mr-4 overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${(videoState.progress / 30) * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            {/* Mute/Unmute Button */}
            <button
              onClick={() => toggleVideoMute(slide.id)}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md border border-white/20 transition-all hover:scale-110"
              aria-label={videoState.muted ? "Unmute video" : "Mute video"}
            >
              {videoState.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() =>
                openFullScreen(slides.findIndex((s) => s.id === slide.id))
              }
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md border border-white/20 transition-all hover:scale-110"
              aria-label="Open full screen"
            >
              <Maximize2 size={20} />
            </button>

            {/* Play/Pause Button - Only show in full screen */}
            {isFullScreenMode && (
              <button
                onClick={() => toggleVideoPlay(slide.id)}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                aria-label={videoState.playing ? "Pause video" : "Play video"}
              >
                {videoState.playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Progress Text */}
        {!isFullScreenMode && (
          <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
            {videoState.progress}s / 30s
          </div>
        )}
      </div>
    );
  };

  // Render image with click to open functionality and fullscreen button
  const renderImage = (slide, index) => (
    <div className="relative w-full h-full">
      <img
        src={slide.src}
        alt={slide.alt}
        className="w-full h-full object-cover rounded-2xl lg:rounded-3xl cursor-pointer"
        onClick={() => openFullScreen(index)}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />

      {/* Fullscreen Button Overlay */}
      <button
        onClick={() => openFullScreen(index)}
        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md border border-white/20 transition-all hover:scale-110 z-10"
        aria-label="Open full screen"
      >
        <Maximize2 size={20} />
      </button>

      {/* Click to open overlay - shows on hover */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 cursor-pointer"
        onClick={() => openFullScreen(index)}
      >
        <div className="bg-black/50 text-white rounded-full p-3 backdrop-blur-sm flex items-center space-x-2">
          <Maximize2 size={20} />
          <span className="text-sm font-medium">Click to view full screen</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative pb-1 bg-[#2F364D] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-1/4 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#5A6DFF]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-4 left-1/4 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#00B8C8]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#FF6B4A]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Full Screen Media Viewer */}
      {isFullScreen && slides.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center">
          <button
            onClick={closeFullScreen}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all backdrop-blur-md border border-white/20"
            aria-label="Close full screen"
          >
            <X size={24} className="sm:w-6 sm:h-6" />
          </button>

          {slides.length > 1 && (
            <>
              <button
                onClick={prevFullScreenSlide}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 sm:p-4 transition-all backdrop-blur-md border border-white/20 hover:scale-110"
                aria-label="Previous"
              >
                <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
              </button>

              <button
                onClick={nextFullScreenSlide}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 sm:p-4 transition-all backdrop-blur-md border border-white/20 hover:scale-110"
                aria-label="Next"
              >
                <ChevronRight size={28} className="sm:w-8 sm:h-8" />
              </button>
            </>
          )}

          <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 text-sm sm:text-base">
            {fullScreenIndex + 1} / {slides.length}
            {slides[fullScreenIndex]?.type === "video" &&
              ` • ${getFullScreenVideoState().progress}s`}
          </div>

          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 sm:mx-8 flex items-center justify-center">
            {slides[fullScreenIndex]?.type === "video" ? (
              renderYouTubePlayer(slides[fullScreenIndex], true)
            ) : (
              <img
                src={slides[fullScreenIndex].src}
                alt={slides[fullScreenIndex].alt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 max-w-full overflow-x-auto px-4 py-2 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setFullScreenIndex(index);
                    const slideId = slides[index]?.id;
                    if (slideId && slides[index]?.type === "video") {
                      updateVideoState(slideId, {
                        playing: false,
                        progress: 0,
                      });
                    }
                  }}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === fullScreenIndex
                      ? "border-blue-400 scale-110"
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  {slide.type === "video" ? (
                    <div className="relative w-full h-full">
                      <img
                        src={slide.thumbnail}
                        alt={slide.alt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play size={16} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GLASS HERO CONTAINER */}
      <div
        className="relative pt-20 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 
                      grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl
                      mx-3 sm:mx-4 lg:mx-auto"
      >
        {/* Media Carousel */}
        <div
          className="relative h-80 xs:h-96 sm:h-[420px] md:h-80 lg:h-96 xl:h-[500px] min-h-80
                        bg-white/80 backdrop-blur-xl border border-[#D5D8E0] shadow-xl rounded-2xl lg:rounded-3xl overflow-hidden
                        order-1 lg:order-1"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
              <div className="text-[#2F364D]">Loading media...</div>
              {apiConfigStatus === "fetching" && (
                <div className="text-sm text-[#2F364D]/70 mt-2">
                  Fetching YouTube videos...
                </div>
              )}
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100/50">
              <div className="text-red-600 text-center p-4">
                Error loading media
              </div>
            </div>
          )}

          {!loading &&
            slides.length > 0 &&
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                {slide.type === "video"
                  ? renderYouTubePlayer(slide)
                  : renderImage(slide, index)}
              </div>
            ))}

          {!loading && slides.length === 0 && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
              <div className="text-[#2F364D] text-center p-4">
                No media available
                {apiConfigStatus === "missing" && (
                  <div className="text-sm mt-2">YouTube API not configured</div>
                )}
              </div>
            </div>
          )}

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

          {slides[currentSlide]?.type === "video" &&
            getCurrentVideoState().playing && (
              <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                Playing {getCurrentVideoState().progress}s
              </div>
            )}
        </div>

        {/* Announcements Section */}
        <div className="order-2 lg:order-2">
          <div className="relative h-80 xs:h-96 sm:h-[420px] md:h-80 lg:h-96 xl:h-[500px] bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl lg:rounded-2xl overflow-hidden">
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
                      onClick={() =>
                        setCurrentAnnouncement(
                          (prev) =>
                            (prev - 1 + announcements.length) %
                            announcements.length
                        )
                      }
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
                      onClick={() =>
                        setCurrentAnnouncement(
                          (prev) => (prev + 1) % announcements.length
                        )
                      }
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
