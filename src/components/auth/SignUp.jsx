import React, { useState } from "react";
import { Loader2, Eye, EyeOff, Upload, X } from "lucide-react";
import SignIn from "./SignIn";
import {
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import API from "../../api";

export default function SignUp({ isOpen, onClose, onOpenSignIn }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    phone: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSignIn, setShowSignIn] = useState(false);

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success"); // 'success', 'error', 'warning', 'info'

  // Confirmation dialog state (for social signups)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState("");

  if (!isOpen && !showSignIn) return null;

  const handleCloseAll = () => {
    onClose();
    setShowSignIn(false);
  };

  const handleOpenSignIn = () => {
    onClose();
    setShowSignIn(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePic: "Image must be less than 5MB",
        }));
        return;
      }
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profilePic: "" }));
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
    setErrors((prev) => ({ ...prev, profilePic: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Please confirm your password";
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      // IMPORTANT: Check what field name your Django serializer expects
      // Could be "password_confirmation" or "password2" based on your serializer
      formDataToSend.append(
        "password_confirmation",
        formData.passwordConfirmation
      );

      if (formData.phone) formDataToSend.append("phone", formData.phone);
      if (profilePic) formDataToSend.append("profile_pic", profilePic);

      // Log FormData contents for debugging
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Using API.post() - axios returns response.data directly
      const response = await API.post("/register/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Important for cookies
      });

      // Axios response structure
      const data = response.data;

      // Success
      setAlertMessage("Registration successful! You can now sign in.");
      setAlertSeverity("success");
      setAlertOpen(true);

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        phone: "",
      });
      setProfilePic(null);
      setProfilePicPreview(null);
      setAcceptTerms(false);

      // Store tokens
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // Automatically switch to sign-in after 2 seconds
      setTimeout(() => {
        handleOpenSignIn();
      }, 2000);
    } catch (error) {
      console.error("Registration error details:", error);

      let errorMessage = "Registration failed. Please try again.";

      if (error.response) {
        // Server responded with error status
        const { data, status } = error.response;

        if (status === 400) {
          // Bad Request - validation errors
          if (data.detail) {
            errorMessage = data.detail;
          } else if (typeof data === "object") {
            // Handle Django serializer errors
            const errorMessages = Object.entries(data)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(", ")}`;
                }
                return `${field}: ${messages}`;
              })
              .join(". ");
            errorMessage = `Validation errors: ${errorMessages}`;
          }
        } else if (status === 401) {
          errorMessage = "Authentication failed.";
        } else if (status === 409) {
          errorMessage = "User already exists.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        // Request was made but no response
        if (error.code === "ERR_NETWORK") {
          errorMessage =
            "Network error. Please check your connection and CORS settings.";
        } else {
          errorMessage = "No response from server.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlertMessage(errorMessage);
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSocialSignUp = (provider) => {
    setSocialProvider(provider);
    setConfirmationDialogOpen(true);
  };

  const confirmSocialSignUp = () => {
    setConfirmationDialogOpen(false);
    setAlertMessage(
      `${socialProvider} sign up functionality would be implemented here`
    );
    setAlertSeverity("info");
    setAlertOpen(true);
  };

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-3 sm:p-4 overflow-y-auto"
        onClick={handleOverlayClick}
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-4xl my-4 sm:my-8 relative shadow-[0_8px_32px_0_rgba(90,109,255,0.2)] max-h-[95vh] overflow-y-auto">
        
          {/* Close Button */}
          <button
            className="sticky top-0 float-right ml-auto mb-2 text-white/80 hover:text-white hover:bg-white/10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 text-2xl font-light z-20 bg-gray-900/50 backdrop-blur-sm"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div className="text-white">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-white/70 text-sm mb-2 sm:mb-3">
                Join Offworld Media today
              </p>
              <button
                onClick={handleOpenSignIn}
                className="text-[#5A6DFF] hover:text-[#00B8C8] text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Already have an account? Sign in here
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3 sm:space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2">
                  Profile Picture (Optional)
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  {profilePicPreview ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20"
                      />
                      <button
                        onClick={removeProfilePic}
                        disabled={isLoading}
                        className="absolute -top-1 -right-1 bg-[#FF6B4A] hover:bg-[#FF6B4A]/80 text-white rounded-full p-1 transition-colors duration-200"
                        aria-label="Remove profile picture"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full bg-white/5 border-2 border-dashed border-white/30 flex items-center justify-center">
                      <Upload size={20} className="text-white/40" />
                    </div>
                  )}
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <div className="px-3 sm:px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white/80 text-xs sm:text-sm text-center cursor-pointer hover:bg-white/10 transition-all duration-300">
                      Choose Image
                    </div>
                  </label>
                </div>
                {errors.profilePic && (
                  <p className="mt-2 text-[#FF6B4A] text-xs sm:text-sm">
                    {errors.profilePic}
                  </p>
                )}
              </div>

              {/* Username and Email Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2"
                  >
                    Username <span className="text-[#FF6B4A]">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border ${
                      errors.username
                        ? "border-[#FF6B4A]/60"
                        : "border-white/20"
                    } rounded-xl text-white text-sm placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#5A6DFF] focus:bg-white/10 transition-all duration-300`}
                    placeholder="Choose a username"
                    required
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="mt-1.5 text-[#FF6B4A] text-xs sm:text-sm">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2"
                  >
                    Email Address <span className="text-[#FF6B4A]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border ${
                      errors.email ? "border-[#FF6B4A]/60" : "border-white/20"
                    } rounded-xl text-white text-sm placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#5A6DFF] focus:bg-white/10 transition-all duration-300`}
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-[#FF6B4A] text-xs sm:text-sm">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2"
                >
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#5A6DFF] focus:bg-white/10 transition-all duration-300"
                  placeholder="+1 (555) 000-0000"
                  disabled={isLoading}
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2"
                  >
                    Password <span className="text-[#FF6B4A]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-white/5 border ${
                        errors.password
                          ? "border-[#FF6B4A]/60"
                          : "border-white/20"
                      } rounded-xl text-white text-sm placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#5A6DFF] focus:bg-white/10 transition-all duration-300`}
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      disabled={isLoading}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-[#FF6B4A] text-xs sm:text-sm">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="passwordConfirmation"
                    className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2"
                  >
                    Confirm Password <span className="text-[#FF6B4A]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirmation ? "text" : "password"}
                      id="passwordConfirmation"
                      name="passwordConfirmation"
                      value={formData.passwordConfirmation}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-white/5 border ${
                        errors.passwordConfirmation
                          ? "border-[#FF6B4A]/60"
                          : "border-white/20"
                      } rounded-xl text-white text-sm placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#5A6DFF] focus:bg-white/10 transition-all duration-300`}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirmation(!showPasswordConfirmation)
                      }
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      disabled={isLoading}
                      aria-label="Toggle password confirmation visibility"
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.passwordConfirmation && (
                    <p className="mt-1.5 text-[#FF6B4A] text-xs sm:text-sm">
                      {errors.passwordConfirmation}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start text-white/90 text-xs sm:text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors((prev) => ({ ...prev, terms: "" }));
                      }
                    }}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <span
                    className={`w-5 h-5 min-w-5 border-2 rounded-md mr-2 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                      acceptTerms
                        ? "bg-[#5A6DFF] border-[#5A6DFF]"
                        : "border-white/50 group-hover:border-white/70"
                    } ${isLoading ? "opacity-50" : ""}`}
                  >
                    {acceptTerms && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </span>
                  <span className="leading-relaxed">
                    I accept the{" "}
                    <a
                      href="/terms"
                      className="text-[#5A6DFF] hover:text-[#00B8C8] underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-[#5A6DFF] hover:text-[#00B8C8] underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      privacy policy
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1.5 text-[#FF6B4A] text-xs sm:text-sm">
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#5A6DFF] to-[#00B8C8] rounded-xl text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(90,109,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="mt-4 sm:mt-6">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-3 sm:px-4 bg-white/5 backdrop-blur-xl rounded-full text-white/60">
                    or sign up with
                  </span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => handleSocialSignUp("Facebook")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-[#1877F2]/20 backdrop-blur-xl border border-[#1877F2]/30 rounded-xl text-white text-xs sm:text-sm font-medium hover:bg-[#1877F2]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M20 10C20 4.48 15.52 0 10 0C4.48 0 0 4.48 0 10C0 14.84 3.44 18.87 8 19.8V12.8H6V10H8V7.5C8 5.67 9.57 4.2 11.5 4.2C12.38 4.2 13.3 4.36 13.3 4.36V6.8H12.28C11.27 6.8 11 7.33 11 7.9V10H13.2L12.84 12.8H11V19.8C15.56 18.87 19 14.84 19 10H20Z"
                      fill="white"
                    />
                  </svg>
                  Facebook
                </button>
                <button
                  onClick={() => handleSocialSignUp("Google")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white text-xs sm:text-sm font-medium hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7742 8.14966H10.1992V11.848H15.8195C15.7062 12.7671 15.0943 14.1512 13.7346 15.0813L13.7155 15.2051L16.7429 17.4969L16.9527 17.5174C18.879 15.7789 19.9895 13.221 19.9895 10.1871Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.1992 20.0001C12.9529 20.0001 15.2643 19.1151 16.9527 17.5175L13.7346 15.0813C12.8734 15.6682 11.7176 16.0779 10.1992 16.0779C7.50243 16.0779 5.21352 14.3395 4.39759 11.9365L4.27799 11.9465L1.13003 14.3273L1.08887 14.4391C2.76547 17.6946 6.21061 20.0001 10.1992 20.0001Z"
                      fill="#34A853"
                    />
                    <path
                      d="M4.39748 11.9366C4.18219 11.3166 4.05759 10.6521 4.05759 9.96562C4.05759 9.27905 4.18219 8.6147 4.38615 7.99463L4.38045 7.86257L1.1933 5.44366L1.08875 5.49214C0.397744 6.84305 0 8.36008 0 9.96562C0 11.5712 0.397744 13.0881 1.08875 14.4391L4.39748 11.9366Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M10.1992 3.86606C12.1142 3.86606 13.406 4.67786 14.1425 5.35514L17.0207 2.59996C15.253 0.99025 12.9529 0 10.1992 0C6.21061 0 2.76547 2.30548 1.08887 5.561L4.38626 7.99466C5.21352 5.59166 7.50243 3.86606 10.1992 3.86606Z"
                      fill="#EB4335"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SignIn Component */}
      <SignIn
        isOpen={showSignIn}
        onClose={handleCloseAll}
        onSignInSuccess={() => {}}
        onOpenForgotPassword={() => {}}
      />

      {/* MUI Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiAlert-root": {
            backgroundColor:
              alertSeverity === "success"
                ? "#10b981"
                : alertSeverity === "error"
                ? "#ef4444"
                : alertSeverity === "warning"
                ? "#f59e0b"
                : "#3b82f6",
            color: "white",
            fontWeight: 500,
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "0.95rem",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog for Social Sign Up */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            color: "white",
          },
        }}
      >
        <DialogTitle sx={{ color: "white", fontWeight: 600 }}>
          Coming Soon
        </DialogTitle>
        <DialogContent sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
          {socialProvider} sign up functionality is coming soon. In the
          meantime, please use the regular sign up form.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmationDialogOpen(false)}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": { color: "white" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmSocialSignUp}
            sx={{
              background: "linear-gradient(to right, #5A6DFF, #00B8C8)",
              color: "white",
              fontWeight: 600,
              borderRadius: "10px",
              "&:hover": {
                background: "linear-gradient(to right, #4a5bef, #00a6b4)",
              },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
