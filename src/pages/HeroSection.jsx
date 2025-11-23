import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useScrollVisibility } from "../hooks/useScrollVisibility";
import { CounterCard } from "../components/CounterCard";
import API from "../api";

export default function HeroSection({ setActiveNav }) {
  const handleCtaClick = () => {
    setActiveNav("Contact");
    setActiveNav("Services");
    document.getElementById("Contact")?.scrollIntoView({ behavior: "smooth" });
    document.getElementById("Services")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          alt: `Studio image ${index + 1}`, // You can add alt_text field to your model if needed
          id: image.id || index,
        }));

        setSlides(formattedSlides);
      } catch (err) {
        console.error("Error fetching images:", err);
        setError(err.message);
        // Fallback to empty array if API fails
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

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

  const goToSlide = (index) => {
    if (slides.length > 0) {
      setCurrentSlide(index);
    }
  };

  // Auto-slide only when we have slides
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative pb-1 bg-[#2F364D] overflow-hidden">
      {/* ✅ Background Blobs - Responsive Sizing */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-1/4 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#5A6DFF]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-4 left-1/4 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#00B8C8]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-[#FF6B4A]/20 rounded-full mix-blend-multiply filter blur-xl md:blur-2xl lg:blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* ✅ GLASS HERO CONTAINER - Responsive Layout */}
      <div
        className="relative pt-20 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 
                      grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl
                      mx-3 sm:mx-4 lg:mx-auto"
      >
        {/* ✅ Left Section */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6 order-2 lg:order-1">
          {/* ✅ Glass Welcome Tag */}
          <div className="inline-block px-3 py-2 sm:px-4 sm:py-3 bg-[#6c76c5] backdrop-blur-md border border-[#2F364D]/10 rounded-full shadow-sm">
            <p className="text-[#f2f4fa] text-center font-medium text-xs sm:text-sm">
              Welcome to Offworld Media
            </p>
          </div>

          {/* ✅ Title - Responsive Text Sizing */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#b2b9d3] leading-tight sm:leading-tight">
            Your go to
            <span className="block bg-gradient-to-r from-[#5A6DFF] to-[#00B8C8] bg-clip-text text-transparent mt-1 sm:mt-2">
              media company
            </span>
          </h1>

          {/* ✅ Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[#b2b9d3] leading-relaxed max-w-md">
            Our premium services are designed to meet all your creative needs,
            from photography to video production, ensuring high-quality results
            for your memory/art.
          </p>

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
              onClick={handleCtaClick}
              className="px-6 py-2.5 sm:px-8 sm:py-3 border-2 bg-[#7292c2] border-[#2F364D]/20 text-[#2F364D] rounded-lg font-medium 
                         hover:border-[#2F364D]/40 hover:text-[#1A1C23] transition-colors duration-200
                         text-sm sm:text-base"
            >
              Our Services
            </button>
          </div>

          {/* ✅ Stats - ALWAYS 3 IN A ROW */}
          <div
            ref={ref}
            className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-6 sm:pt-8 border-t border-[#D5D8E0]"
          >
            <CounterCard
              targetValue={90}
              suffix="+"
              description="Clients"
              shouldStart={isVisible}
              className="text-center"
              descriptionClassName="text-[#b2b9d3] text-xs sm:text-sm"
              counterClassName="text-lg sm:text-xl lg:text-2xl font-bold text-white"
            />
            <CounterCard
              targetValue={98}
              suffix="%"
              description="Client Satisfaction"
              shouldStart={isVisible}
              className="text-center"
              descriptionClassName="text-[#b2b9d3] text-xs sm:text-sm"
              counterClassName="text-lg sm:text-xl lg:text-2xl font-bold text-white"
            />
            <CounterCard
              targetValue={3}
              suffix="+"
              description="Years Experience"
              shouldStart={isVisible}
              className="text-center"
              descriptionClassName="text-[#b2b9d3] text-xs sm:text-sm"
              counterClassName="text-lg sm:text-xl lg:text-2xl font-bold text-white"
            />
          </div>
        </div>

        {/* ✅ Right Section — Glass Carousel - Responsive Height */}
        <div
          className="relative h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[500px] min-h-64 
                        bg-white/80 backdrop-blur-xl border border-[#D5D8E0] shadow-xl rounded-2xl lg:rounded-3xl overflow-hidden
                        order-1 lg:order-2 mb-4 lg:mb-0"
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
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover rounded-2xl lg:rounded-3xl"
                  onError={(e) => {
                    console.error(`Failed to load image: ${slide.src}`);
                    e.target.style.display = "none";
                  }}
                />
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
