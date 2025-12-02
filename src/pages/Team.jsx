import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  BriefcaseBusiness,
  Clapperboard,
  Megaphone,
  Scissors,
  Camera,
  Video,
} from "lucide-react";
import { Facebook, Instagram } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import API from "../api";

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideRef = useRef(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (teamMembers.length <= 1 || isPaused) return;

    const startAutoSlide = () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }

      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, teamMembers.length - cardsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 4000); // Change slide every 4 seconds
    };

    startAutoSlide();

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [teamMembers.length, cardsPerView, isPaused]);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get("/team/");
      setTeamMembers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      ceo: <BriefcaseBusiness size={16} className="text-white" />,
      producer: <Clapperboard size={16} className="text-white" />,
      director: <Megaphone size={16} className="text-white" />,
      editor: <Scissors size={16} className="text-white" />,
      photographer: <Camera size={16} className="text-white" />,
      videographer: <Video size={16} className="text-white" />,
    };
    return (
      icons[role?.toLowerCase()] || <Users size={16} className="text-white" />
    );
  };

  const getRoleColor = (role) => {
    const colors = {
      ceo: "bg-gradient-to-r from-[#1e3a8a] to-[#3730a3]",
      producer: "bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]",
      director: "bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8]",
      editor: "bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]",
      photographer: "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]",
      videographer: "bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa]",
    };
    return (
      colors[role?.toLowerCase()] ||
      "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]"
    );
  };

  const handleSocialLinkClick = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const maxIndex = Math.max(0, teamMembers.length - cardsPerView);

  const nextSlide = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Pause auto-slide for 8 seconds after manual interaction
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Mouse events to pause auto-slide on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (isLoading) {
    return (
      <div className="relative py-8 sm:py-12 lg:py-16 bg-[#2F364D] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl rounded-2xl lg:rounded-3xl">
            <div className="text-center mb-12">
              <div className="h-10 bg-gray-600/50 rounded-lg w-72 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-600/50 rounded-lg w-96 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="bg-gray-600/30 rounded-2xl p-6 animate-pulse"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-32 h-32 bg-gray-500/50 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 w-full">
                      <div className="h-6 bg-gray-500/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-500/50 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-500/50 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-500/50 rounded w-5/6"></div>
                    </div>
                  </div>
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
      <div className="relative py-8 sm:py-12 lg:py-16 bg-[#2F364D] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl rounded-2xl lg:rounded-3xl text-center">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h3 className="text-red-400 font-semibold text-xl">
                Error Loading Team
              </h3>
            </div>
            <p className="text-[#a2aac7] text-base mb-6">{error}</p>
            <button
              onClick={fetchTeamMembers}
              className="bg-[#5A6DFF] text-white px-8 py-3 rounded-lg hover:bg-[#4a5bef] transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-1 sm:py-12 lg:py-16 bg-[#2F364D] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-[#5A6DFF]/15 rounded-full mix-blend-screen filter blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-[#00B8C8]/15 rounded-full mix-blend-screen filter blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-[#FF6B4A]/15 rounded-full mix-blend-screen filter blur-xl lg:blur-2xl xl:blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5A6DFF]/5 via-transparent to-[#00B8C8]/5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl rounded-2xl lg:rounded-3xl">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 lg:mb-6 drop-shadow-[0_2px_8px_rgba(90,109,255,0.3)]">
              Our Team
            </h2>
          </div>

          {/* Carousel */}
          <div
            className="relative mb-8 lg:mb-12"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {teamMembers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-20 h-20 text-[#a2aac7] mx-auto mb-6" />
                <div className="text-[#a2aac7] text-xl mb-6">
                  No team members found
                </div>
              </div>
            ) : (
              <>
                {/* Navigation Arrows - Desktop & Mobile */}
                {cardsPerView < teamMembers.length &&
                  teamMembers.length > 0 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full sm:p-4 transition-all backdrop-blur-md border border-white/20 hover:scale-110"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="sm:w-4 sm:h-4" />
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full sm:p-4 transition-all backdrop-blur-md border border-white/20 hover:scale-110"
                        aria-label="Next"
                      >
                        <ChevronRight className="sm:w-4 sm:h-4" />
                      </button>
                    </>
                  )}

                {/* Carousel Container */}
                <div className="overflow-hidden px-2 sm:px-4 lg:px-6">
                  <div
                    className="flex transition-transform duration-500 ease-out gap-4 sm:gap-6 lg:gap-8"
                    style={{
                      transform: `translateX(-${
                        currentIndex * (100 / cardsPerView)
                      }%)`,
                    }}
                  >
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex-shrink-0"
                        style={{
                          width: `calc(${100 / cardsPerView}% - ${
                            ((cardsPerView - 1) * 16) / cardsPerView
                          }px)`,
                        }}
                      >
                        <TeamMemberCard
                          member={member}
                          onSocialLinkClick={handleSocialLinkClick}
                          getRoleIcon={getRoleIcon}
                          getRoleColor={getRoleColor}
                        />
                      </div>
                    ))}
                  </div>
                </div>
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

// Horizontal Team Member Card Component (remains the same)
const TeamMemberCard = ({
  member,
  onSocialLinkClick,
  getRoleIcon,
  getRoleColor,
}) => {
  const [imageError, setImageError] = useState(false);

  const formatRole = (role) => {
    if (!role) return "Team Member";
    return role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ");
  };

  const socialIcons = [
    {
      key: "facebook",
      icon: Facebook,
      component: "mui",
      link: member.facebook_link,
      color:
        "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white",
      title: "Facebook",
    },
    {
      key: "tiktok",
      icon: faTiktok,
      component: "fontawesome",
      link: member.tiktok_link,
      color:
        "text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-white",
      title: "TikTok",
    },
    {
      key: "twitter",
      icon: faXTwitter,
      component: "fontawesome",
      link: member.twitter_link,
      color:
        "text-gray-500 hover:text-sky-500 dark:text-gray-400 dark:hover:text-white",
      title: "X",
    },
    {
      key: "instagram",
      icon: Instagram,
      component: "mui",
      link: member.instagram_link,
      color:
        "text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-white",
      title: "Instagram",
    },
  ];

  const isValidUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    const cleanUrl = url.trim();
    if (!cleanUrl) return false;
    const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    return urlPattern.test(cleanUrl);
  };

  const getUserInitial = () => {
    return member.name ? member.name.charAt(0).toUpperCase() : "T";
  };

  const renderSocialIcon = (social) => {
    const hasLink = Boolean(social.link && isValidUrl(social.link));

    if (social.component === "fontawesome") {
      return <FontAwesomeIcon icon={social.icon} className="w-5 h-5" />;
    } else if (social.component === "mui") {
      const IconComponent = social.icon;
      return <IconComponent className="w-5 h-5" />;
    }

    return null;
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      {/* Profile Image */}
      <div className="w-full sm:w-48 lg:w-56 flex-shrink-0">
        {member.profile_pic && !imageError ? (
          <img
            className="w-full h-48 sm:h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
            src={member.profile_pic}
            alt={member.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 sm:h-full bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-t-lg sm:rounded-l-lg sm:rounded-t-none flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {getUserInitial()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Name and Role */}
        <div className="mb-4">
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            {member.name}
          </h3>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor(
              member.role
            )}`}
          >
            {getRoleIcon(member.role)}
            <span>{formatRole(member.role)}</span>
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <p className="mb-4 font-light text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {member.bio}
          </p>
        )}

        {/* Social Links */}
        <ul className="flex space-x-3">
          {socialIcons.map((social) => {
            const hasLink = Boolean(social.link && isValidUrl(social.link));

            return (
              <li key={social.key}>
                <button
                  onClick={() => hasLink && onSocialLinkClick(social.link)}
                  className={`transition-colors duration-200 ${
                    hasLink
                      ? `${social.color} cursor-pointer hover:scale-110`
                      : "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                  }`}
                  title={
                    hasLink ? social.title : `${social.title} - Not Available`
                  }
                  disabled={!hasLink}
                >
                  {renderSocialIcon(social)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
