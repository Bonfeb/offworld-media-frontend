import React, { useState } from "react";
import { Loader2, X, Mail } from "lucide-react";
import API from "../../api";

const ForgotPassword = ({ isOpen, onClose, onOpenSignIn }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await API.post("/forgot-password/", {
        email: email,
        frontend_url: window.location.origin,
      });

      setMessage("Password reset link has been sent to your email!");
      setEmail("");

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      
      setError(
        error.response?.data?.error ||
          "Failed to send reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleSignInClick = () => {
    onClose();
    if (onOpenSignIn) {
      onOpenSignIn();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
        onClick={handleOverlayClick}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="text-white">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
            <p className="text-gray-400 text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/40 rounded-xl text-green-300 text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-white/90 text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSignInClick}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
            >
              Remember your password? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
