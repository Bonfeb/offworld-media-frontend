import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import API from "../../api";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";

const SignIn = ({
  isOpen,
  onClose,
  onSignInSuccess,
  onOpenSignUp,
  onOpenForgotPassword,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await API.post("/login/", {
        username: formData.username,
        password: formData.password,
      });

      console.log("Login successful:", response.data);

      // Store access token in sessionStorage
      sessionStorage.setItem("accessToken", response.data.access_token);

      // Store user data
      sessionStorage.setItem(
        "userData",
        JSON.stringify({
          username: response.data.username,
          profile_pic: response.data.profile_pic,
          groups: response.data.groups,
        })
      );

      // If remember me is checked, store in localStorage
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("lastUsedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("lastUsedUsername");
      }

      // Show success message
      console.log("Login successful! Welcome back.");

      // Call the success callback
      if (onSignInSuccess) {
        onSignInSuccess({
          ...response.data,
          _rawPassword: formData.password, // ✅ Needed for AuthContext login()
        });
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data) {
        const backendErrors = error.response.data;

        if (typeof backendErrors === "object") {
          // Handle field-specific errors from backend
          if (backendErrors.non_field_errors) {
            setErrors({ general: backendErrors.non_field_errors[0] });
          } else {
            setErrors(backendErrors);
          }
        } else if (typeof backendErrors === "string") {
          setErrors({ general: backendErrors });
        } else if (backendErrors.detail) {
          setErrors({ general: backendErrors.detail });
        } else {
          setErrors({ general: "Login failed. Please try again." });
        }
      } else if (error.code === "NETWORK_ERROR") {
        setErrors({ general: "Network error. Please check your connection." });
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    onClose();
    if (onOpenSignUp) {
      onOpenSignUp();
    }
  };

  const handleForgotPasswordClick = () => {
    if (onOpenForgotPassword) {
      onOpenForgotPassword();
    }
  };

  const handleSocialLogin = (provider) => {
    // Placeholder for social login functionality
    console.log(`Social login with ${provider}`);
    alert(`${provider} login will be implemented soon!`);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2F364D] via-[#1A1C23] to-[#2F364D] p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 w-full max-w-md relative shadow-[0_8px_32px_0_rgba(90,109,255,0.2)]">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 text-2xl font-light"
            onClick={() => onClose()}
            disabled={isLoading}
          >
            ×
          </button>

          <div className="text-white">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-white/70 text-sm mb-4">Sign in to continue</p>
              <button
                onClick={handleSignUpClick}
                className="text-[#5A6DFF] hover:text-[#00B8C8] text-sm font-medium transition-colors duration-200"
              >
                Don't have an account? Register now
              </button>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-[#FF6B4A]/20 backdrop-blur-sm border border-[#FF6B4A]/40 rounded-xl text-white text-sm">
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 bg-white/5 border ${
                    errors.username ? "border-[#FF6B4A]/60" : "border-white/20"
                  } rounded-xl text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#5A6DFF] focus:bg-white/10 transition-all duration-300`}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="mt-2 text-[#FF6B4A] text-sm">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-white/90 text-xs font-semibold uppercase tracking-wider mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 bg-white/5 border ${
                    errors.password ? "border-[#FF6B4A]/60" : "border-white/20"
                  } rounded-xl text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-[#5A6DFF] focus:bg-white/10 transition-all duration-300`}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-2 text-[#FF6B4A] text-sm">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center">
                <label className="flex items-center text-white/90 text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <span
                    className={`w-5 h-5 border-2 rounded-md mr-2 flex items-center justify-center transition-all duration-200 ${
                      rememberMe
                        ? "bg-[#5A6DFF] border-[#5A6DFF]"
                        : "border-white/50 group-hover:border-white/70"
                    } ${isLoading ? "opacity-50" : ""}`}
                  >
                    {rememberMe && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </span>
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-[#5A6DFF] hover:text-[#00B8C8] text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#5A6DFF] to-[#00B8C8] rounded-xl text-white font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(90,109,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/5 backdrop-blur-xl rounded-full text-white/60">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleSocialLogin("Facebook")}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1877F2]/20 backdrop-blur-xl border border-[#1877F2]/30 rounded-xl text-white font-medium hover:bg-[#1877F2]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M20 10C20 4.48 15.52 0 10 0C4.48 0 0 4.48 0 10C0 14.84 3.44 18.87 8 19.8V12.8H6V10H8V7.5C8 5.67 9.57 4.2 11.5 4.2C12.38 4.2 13.3 4.36 13.3 4.36V6.8H12.28C11.27 6.8 11 7.33 11 7.9V10H13.2L12.84 12.8H11V19.8C15.56 18.87 19 14.84 19 10H20Z"
                      fill="white"
                    />
                  </svg>
                  Facebook
                </button>
                <button
                  onClick={() => handleSocialLogin("Google")}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
    </div>
  );
};

export default SignIn;
