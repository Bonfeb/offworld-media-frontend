import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  Check,
  Phone,
  CreditCard,
  AlertCircle,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok } from "@fortawesome/free-brands-svg-icons";
import API from "../api";

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Social media links from environment variables
  const socialLinks = {
    twitter: import.meta.env.VITE_TWITTER,
    facebook: import.meta.env.VITE_FACEBOOK,
    instagram: import.meta.env.VITE_INSTAGRAM,
    tiktok: import.meta.env.VITE_TIKTOK,
  };

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const isAudioService = service?.category === "audio";

  // Payment information
  const TILL_NUMBER = "4323716";
  const PAYBILL_NUMBER = "400200 ";
  const ACCOUNT_NUMBER = "1077483";
  const CONTACT_PHONE = "+254 716 132 273";
  const CONTACT_EMAIL = "offworldmediaafrica@gmail.com";

  const audioSubcategories = {
    beat_making: "Beat Making",
    sound_recording: "Sound Recording",
    mixing: "Mixing",
    mastering: "Mastering",
    music_video: "Music Video Production",
  };

  const categoryConfig = {
    "photo-video": { label: "Photo & Video" },
    audio: { label: "Music Production" },
    graphic: { label: "Graphic Design" },
    broadcasting: { label: "Digital Broadcasting" },
  };

  // Social media icons with Lucide icons
  const SocialIcon = ({ icon: Icon, href, label, color = "text-white" }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-slate-600 group`}
      aria-label={label}
    >
      <Icon size={18} className={`${color} group-hover:text-white`} />
    </a>
  );

  // Special TikTok icon component since it uses FontAwesome
  const TikTokIcon = ({ color = "text-white" }) => (
    <FontAwesomeIcon
      icon={faTiktok}
      className={`${color} group-hover:text-white text-sm`}
    />
  );

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/service/${serviceId}/`);
        setService(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const handleBack = () => {
    navigate("/services");
  };

  const handleContactNow = () => {
    window.location.href = `tel:${CONTACT_PHONE}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-video bg-slate-700 rounded-2xl"></div>
                <div className="h-32 bg-slate-700 rounded-2xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-slate-700 rounded-2xl"></div>
                <div className="h-48 bg-slate-700 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Services
          </button>
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">
              {error || "Service not found"}
            </div>
            <button
              onClick={handleBack}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Return to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Services
        </button>

        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-slate-700/50 shadow-xl">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4">
            {service.title || capitalize(service.category)}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
              {service.category === "audio" && service.audio_category
                ? audioSubcategories[service.audio_category]
                : categoryConfig[service.category]?.label ||
                  capitalize(service.category)}
            </span>
            {service.audio_category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {capitalize(service.category)}
              </span>
            )}
          </div>
        </div>

        {/* Service Image & Description - Stack on xs/sm, side by side on md and up */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Service Image - Always on top when stacked */}
          <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden rounded-xl sm:rounded-2xl border-2 border-slate-700/50 shadow-xl group">
            {service.image ? (
              <img
                src={service.image}
                alt={service.title || service.category}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/50 via-slate-800 to-purple-900/50 flex items-center justify-center">
                <div className="text-center p-4 sm:p-6">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-3">
                    🎵
                  </div>
                  <p className="text-blue-300 font-semibold text-base sm:text-lg">
                    {capitalize(service.category)}
                  </p>
                  <p className="text-blue-400 text-xs sm:text-sm mt-1 sm:mt-2">
                    Professional Service
                  </p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Service Description */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Info size={20} className="text-blue-400" />
              About This Service
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              {service.description ||
                "A professional service tailored to meet your needs with expertise and quality assurance."}
            </p>
          </div>
        </div>

        {/* Features & Booking Instructions - Stack on xs/sm, side by side on md and up */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Features */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-xl">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Check size={18} className="text-blue-400" />
              What's Included
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-3 text-sm sm:text-base">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-slate-300 leading-relaxed">
                  Professional equipment and setup
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-slate-300 leading-relaxed">
                  Expert technical support
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-slate-300 leading-relaxed">
                  Quality assurance guarantee
                </span>
              </li>
              {isAudioService && (
                <li className="flex items-start gap-3 text-sm sm:text-base">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-slate-300 leading-relaxed">
                    Professional studio facilities
                  </span>
                </li>
              )}
              <li className="flex items-start gap-3 text-sm sm:text-base">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-slate-300 leading-relaxed">
                  Timely delivery and support
                </span>
              </li>
            </ul>
          </div>

          {/* Booking Instructions */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-500/20 shadow-xl">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">
                  Booking Instructions
                </h4>
                <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>Make payment using Till or Paybill</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>Contact us with payment confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>We'll schedule and confirm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>Include service name in description</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Contact - Stack on xs/sm, side by side on md and up */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Payment Information */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-xl">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-green-400" />
              Mpesa Payment Information
            </h4>
            <div className="space-y-4">
              {/* Till Number */}
              <div className="bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Till Number
                  </span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Phone size={16} className="text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide text-center font-mono">
                  {TILL_NUMBER}
                </p>
                <p className="text-center text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
                  Buy Goods & Services
                </p>
              </div>

              {/* Paybill Number */}
              <div className="bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Paybill Number
                  </span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <CreditCard size={16} className="text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide text-center font-mono mb-2 sm:mb-3">
                  {PAYBILL_NUMBER}
                </p>
                <div className="bg-green-900/20 rounded-lg p-2 sm:p-3 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-slate-300">
                      Account Number:
                    </span>
                    <span className="font-mono font-bold text-white text-base sm:text-lg">
                      {ACCOUNT_NUMBER}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information - Simplified without subcards */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-500/20 shadow-xl">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <MessageCircle size={20} className="text-indigo-400" />
              Contact Us
            </h4>

            {/* Contact Details */}
            <div className="space-y-4 mb-4 sm:mb-6">
              {/* Phone */}
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-indigo-500/20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-300">
                    Phone & WhatsApp
                  </p>
                  <p className="text-base sm:text-lg font-bold text-white break-all">
                    {CONTACT_PHONE}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-indigo-500/20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-300">
                    Email
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-white break-all">
                    {CONTACT_EMAIL}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="border-t border-slate-700/50 pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-2 sm:mb-3">
                Follow Us
              </p>
              <div className="flex gap-2 sm:gap-3">
                {socialLinks.twitter && (
                  <SocialIcon
                    icon={Twitter}
                    href={socialLinks.twitter}
                    label="Twitter"
                    color="text-blue-400"
                  />
                )}
                {socialLinks.facebook && (
                  <SocialIcon
                    icon={Facebook}
                    href={socialLinks.facebook}
                    label="Facebook"
                    color="text-blue-500"
                  />
                )}
                {socialLinks.instagram && (
                  <SocialIcon
                    icon={Instagram}
                    href={socialLinks.instagram}
                    label="Instagram"
                    color="text-pink-500"
                  />
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-slate-600 group"
                    aria-label="TikTok"
                  >
                    <TikTokIcon color="text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-6 py-3 rounded sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 text-base sm:text-lg"
          >
            Go Back to Services
          </button>
        </div>
      </div>
    </div>
  );
}
