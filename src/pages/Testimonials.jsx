import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";
import { useScrollVisibility } from "../hooks/useScrollVisibility";
import { CounterCard } from "../components/CounterCard";
import API from "../api";

const TestimonialCard = ({ testimonial }) => {
  const [error, setError] = useState(false);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 flex flex-col h-full">
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex-shrink-0">
          {error || !testimonial.user?.profile_picture ? (
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-200">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          ) : (
            <img
              src={testimonial.user.profile_picture}
              alt="User"
              onError={() => setError(true)}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover"
            />
          )}
        </div>
        <div className="bg-[#2F364D] text-white rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 flex-1">
          <h3 className="font-bold text-sm sm:text-base md:text-lg">
            {testimonial.user?.username || "Anonymous User"}
          </h3>
          <p className="text-xs sm:text-sm opacity-90">
            {testimonial.service?.category || "Service User"}
          </p>
        </div>
      </div>

      <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={
              index < testimonial.rating
                ? "fill-[#D6A75D] text-[#D6A75D]"
                : "fill-[#D5D8E0] text-[#D5D8E0]"
            }
          />
        ))}
      </div>

      <p className="text-[#2F364D] text-xs sm:text-sm leading-relaxed flex-1">
        {testimonial.comment || "No comment provided"}
      </p>
    </div>
  );
};

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    projectsDelivered: 100,
    happyClients: 80,
    teamMembers: 10,
  });
  const [shouldStartCounters, setShouldStartCounters] = useState(false);

  const { ref, hasBeenVisible, isVisible } = useScrollVisibility({
    threshold: 0.3,
    triggerOnce: true,
  });

  // Fetch testimonials from backend
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await API.get("/reviews/");

        // Transform the backend data to match our component structure
        const reviewsData = response.data.map((review) => ({
          id: review.id,
          user: {
            username: review.user?.username || "Anonymous",
            profile_picture: review.user?.profile_picture,
          },
          service: {
            category: review.service?.category || "General Service",
          },
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
        }));

        setTestimonials(reviewsData);

        // Calculate stats based on actual data
        calculateStats(reviewsData);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const calculateStats = (reviews) => {
      // Calculate unique users who left reviews
      const uniqueUsers = new Set(
        reviews.map((review) => review.user?.username)
      ).size;

      setStats({
        projectsDelivered: reviews.length,
        happyClients: uniqueUsers,
        teamMembers: 10,
      });

      setShouldStartCounters(false);
      setTimeout(() => setShouldStartCounters(true), 50);
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 1024) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 768) {
        setCardsPerView(2);
      } else if (window.innerWidth >= 640) {
        setCardsPerView(1.5);
      } else {
        setCardsPerView(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - Math.floor(cardsPerView));

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative py-4 sm:py-6 lg:py-8 bg-[#2F364D] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div
            className="relative mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 py-4 sm:py-6 lg:py-8 xl:py-10 
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-lg sm:shadow-xl lg:shadow-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl
                      mx-2 sm:mx-3 lg:mx-4 xl:mx-auto"
          >
            <div className="text-center mb-8">
              <div className="h-8 bg-gray-600/50 rounded-lg w-64 mx-auto mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-600/50 rounded-lg w-96 mx-auto animate-pulse"></div>
            </div>

            {/* Loading skeleton for testimonials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-gray-600/30 rounded-2xl p-6 animate-pulse"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-500/50 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-500/50 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-500/50 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-500/50 rounded"></div>
                    <div className="h-4 bg-gray-500/50 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading skeleton for stats - Always in same row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-gray-600/30 rounded-xl p-4 animate-pulse text-center"
                >
                  <div className="h-8 bg-gray-500/50 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-500/50 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative py-4 sm:py-6 lg:py-8 bg-[#2F364D] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div
            className="relative mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 py-4 sm:py-6 lg:py-8 xl:py-10 
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-lg sm:shadow-xl lg:shadow-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl
                      mx-2 sm:mx-3 lg:mx-4 xl:mx-auto text-center"
          >
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#5A6DFF] text-white px-6 py-2 rounded-lg hover:bg-[#4a5bef] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-4 sm:py-6 lg:py-8 bg-[#2F364D] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 xl:w-96 xl:h-96 bg-[#5A6DFF]/15 rounded-full mix-blend-screen filter blur-lg sm:blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 xl:w-96 xl:h-96 bg-[#00B8C8]/15 rounded-full mix-blend-screen filter blur-lg sm:blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 xl:w-96 xl:h-96 bg-[#FF6B4A]/15 rounded-full mix-blend-screen filter blur-lg sm:blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5A6DFF]/5 via-transparent to-[#00B8C8]/5"></div>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Outer Cover Div */}
        <div
          className="relative mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 py-4 sm:py-6 lg:py-8 xl:py-10 
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-lg sm:shadow-xl lg:shadow-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl
                      mx-2 sm:mx-3 lg:mx-4 xl:mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 drop-shadow-[0_2px_8px_rgba(90,109,255,0.3)]">
              What Our Clients Say
            </h2>
            <p className="text-[#a2aac7] text-xs sm:text-sm lg:text-base xl:text-lg max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-2 sm:px-4">
              Discover the experiences and feedback from our valued customers
            </p>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
            {testimonials.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[#a2aac7] text-lg mb-4">
                  No testimonials available yet
                </div>
                <p className="text-[#a2aac7] text-sm">
                  Be the first to share your experience!
                </p>
              </div>
            ) : (
              <>
                {/* Navigation Arrows - Responsive Positioning */}
                {cardsPerView < testimonials.length && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-1 sm:left-2 lg:left-3 xl:left-4 top-1/2 -translate-y-1/2 z-10 
                               bg-[#2F364D] text-white p-2 sm:p-3 rounded-full shadow-lg 
                               hover:bg-[#1A1C23] transition-colors
                               hidden sm:block"
                      aria-label="Previous testimonials"
                    >
                      <ChevronLeft
                        size={18}
                        className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                      />
                    </button>

                    <button
                      onClick={nextSlide}
                      className="absolute right-1 sm:right-2 lg:right-3 xl:right-4 top-1/2 -translate-y-1/2 z-10 
                               bg-[#2F364D] text-white p-2 sm:p-3 rounded-full shadow-lg 
                               hover:bg-[#1A1C23] transition-colors
                               hidden sm:block"
                      aria-label="Next testimonials"
                    >
                      <ChevronRight
                        size={18}
                        className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                      />
                    </button>
                  </>
                )}

                {/* Carousel Container */}
                <div className="overflow-hidden px-2 sm:px-3 lg:px-4">
                  <div
                    className="flex transition-transform duration-500 ease-out gap-3 sm:gap-4 lg:gap-5 xl:gap-6"
                    style={{
                      transform: `translateX(-${
                        currentIndex * (100 / cardsPerView)
                      }%)`,
                    }}
                  >
                    {testimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="flex-shrink-0"
                        style={{
                          width: `calc(${100 / cardsPerView}% - ${
                            24 / cardsPerView
                          }px)`,
                          minWidth: `calc(${100 / cardsPerView}% - ${
                            24 / cardsPerView
                          }px)`,
                        }}
                      >
                        <TestimonialCard testimonial={testimonial} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dots Indicator - Responsive */}
                {cardsPerView < testimonials.length && (
                  <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 lg:mt-8">
                    {[...Array(maxIndex + 1)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`rounded-full transition-all ${
                          index === currentIndex
                            ? "bg-[#5A6DFF] w-4 sm:w-6 lg:w-8 h-2"
                            : "bg-[#D5D8E0] hover:bg-[#2F364D]/50 w-2 h-2"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Mobile Navigation Buttons */}
                {cardsPerView < testimonials.length && (
                  <div className="flex justify-center gap-4 mt-4 sm:mt-6 lg:hidden">
                    <button
                      onClick={prevSlide}
                      className="bg-[#2F364D] text-white p-3 rounded-full shadow-lg 
                               hover:bg-[#1A1C23] transition-colors"
                      aria-label="Previous testimonials"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="bg-[#2F364D] text-white p-3 rounded-full shadow-lg 
                               hover:bg-[#1A1C23] transition-colors"
                      aria-label="Next testimonials"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
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
