import React, { useState, useContext } from "react";
import { Loader2, X, Eye, EyeOff, Lock } from "lucide-react";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";

const ChangePassword = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { logout } = useContext(AuthContext);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError("New password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.put("/change-password/", {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });

      setMessage("Password changed successfully! Please sign in again.");

      // Clear form
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      // Logout user and redirect to login after success
      setTimeout(async () => {
        await logout();
        onClose();
      }, 2000);
    } catch (error) {
     
      setError(
        error.response?.data?.error ||
          "Failed to change password. Please try again."
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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Change Password</h2>
            <p className="text-gray-400 text-sm">
              Update your account password
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
                htmlFor="old_password"
                className="block text-white/90 text-sm font-medium mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="old_password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                  placeholder="Enter current password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="new_password"
                className="block text-white/90 text-sm font-medium mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                  placeholder="Enter new password"
                  required
                  minLength="8"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-white/90 text-sm font-medium mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                  placeholder="Confirm new password"
                  required
                  minLength="8"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
