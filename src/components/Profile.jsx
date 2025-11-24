import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Lock,
  Edit3,
  Settings,
  Phone,
  CheckCircle,
  MessageSquare,
  Star,
  Image,
  BookOpen,
  Key,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import ProfileUpdate from "../modals/UpdateProfile";
import ForgotPassword from "./auth/ForgotPassword";
import ChangePassword from "./auth/ChangePassword";

const Profile = ({ data, loading, error, user, onTabChange }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-electric-blue border-t-transparent mb-2"></div>
          <p className="text-muted-600 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
          <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Settings className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const userData = user || data?.user;
  const userInitial = userData?.username?.charAt(0)?.toUpperCase() || "U";

  // Handle subcard clicks to navigate to other tabs
  const handleSubcardClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleAccountSettingsClick = () => {
    setShowAccountSettings(!showAccountSettings);
  };

  const handleChangePasswordClick = () => {
    setShowAccountSettings(false);
    setShowChangePassword(true);
  };

  const handleForgotPasswordClick = () => {
    setShowAccountSettings(false);
    setShowForgotPassword(true);
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 grid max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          My Account
        </h1>
        <div className="text-sm text-red-600">
          Logout, {userData?.username || "User"}!
        </div>
      </div>

      {/* First Row: Profile Overview + Account Information */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Profile Overview Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-muted-700 px-3 py-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-3 h-3" />
              Profile Overview
            </h3>
          </div>

          <div className="p-3">
            {/* User Info Section - More Compact */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-shrink-0">
                {userData?.profile_pic ? (
                  <img
                    src={userData.profile_pic}
                    alt={userData.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-electric-blue"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-cool-teal rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {userInitial}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card flex items-center justify-center">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">
                  {userData?.username || "User"}
                </h2>
                <p className="text-muted-600 text-xs truncate">
                  {userData?.email || "No email provided"}
                </p>
              </div>
            </div>

            {/* Account Status - More Compact */}
            <div className="bg-muted-50 rounded-md p-2 border border-border mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-600 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-electric-blue" />
                  Email Verified
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-success/10 text-success text-xs font-semibold rounded-full border border-success/30">
                  <CheckCircle className="w-2 h-2" />
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-600">Profile Complete</span>
                <span className="text-xs font-semibold text-electric-blue">
                  75%
                </span>
              </div>
              <div className="w-full bg-muted-100 rounded-full h-1.5">
                <div
                  className="bg-gradient-modern h-1.5 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            {/* Subcards - Always in Row, Clickable */}
            <div className="grid grid-cols-3 gap-2">
              {/* Bookings Subcard */}
              <button
                onClick={() => handleSubcardClick("bookings")}
                className="bg-gradient-to-br from-electric-blue/10 to-cool-teal/10 rounded-md p-2 border border-electric-blue/20 text-center hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="w-6 h-6 bg-electric-blue/20 rounded-md flex items-center justify-center mx-auto mb-1">
                  <BookOpen className="w-3 h-3 text-electric-blue" />
                </div>
                <div className="text-sm font-bold text-electric-blue">0</div>
                <div className="text-xs text-muted-600">Bookings</div>
              </button>

              {/* Reviews Subcard */}
              <button
                onClick={() => handleSubcardClick("reviews")}
                className="bg-gradient-to-br from-premium-gold/10 to-warning/10 rounded-md p-2 border border-premium-gold/20 text-center hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="w-6 h-6 bg-premium-gold/20 rounded-md flex items-center justify-center mx-auto mb-1">
                  <Star className="w-3 h-3 text-premium-gold" />
                </div>
                <div className="text-sm font-bold text-premium-gold">0</div>
                <div className="text-xs text-muted-600">Reviews</div>
              </button>

              {/* Messages Subcard */}
              <button
                onClick={() => handleSubcardClick("messages")}
                className="bg-gradient-to-br from-cool-teal/10 to-electric-blue/10 rounded-md p-2 border border-cool-teal/20 text-center hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="w-6 h-6 bg-cool-teal/20 rounded-md flex items-center justify-center mx-auto mb-1">
                  <MessageSquare className="w-3 h-3 text-cool-teal" />
                </div>
                <div className="text-sm font-bold text-cool-teal">0</div>
                <div className="text-xs text-muted-600">Messages</div>
              </button>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-muted-700 px-3 py-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-3 h-3" />
              Account Information
            </h3>
          </div>
          <div className="p-3">
            {/* Profile Picture & Username - Same Row */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* Profile Picture */}
              <div className="bg-muted-50 rounded-md p-2 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 flex-shrink-0">
                    {userData?.profile_pic ? (
                      <img
                        src={userData.profile_pic}
                        alt={userData.username}
                        className="w-full h-full rounded-md object-cover border border-warm-coral/30"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-electric-blue to-cool-teal rounded-md flex items-center justify-center text-white text-sm font-bold">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <Image className="w-3 h-3 text-warm-coral" />
                      <label className="text-xs font-semibold text-muted-600 uppercase tracking-wide">
                        Profile
                      </label>
                    </div>
                    <p className="text-foreground font-semibold text-xs">
                      {userData?.profile_pic ? (
                        <span className="text-success text-xs">Uploaded</span>
                      ) : (
                        <span className="text-muted-500 text-xs">Default</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="bg-muted-50 rounded-md p-2 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-electric-blue/10 rounded-md flex items-center justify-center">
                    <User className="w-3 h-3 text-electric-blue" />
                  </div>
                  <label className="text-xs font-semibold text-muted-600 uppercase tracking-wide">
                    Username
                  </label>
                </div>
                <p className="text-foreground font-semibold text-sm truncate">
                  {userData?.username || "Not set"}
                </p>
              </div>
            </div>

            {/* Email & Phone - Same Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Email */}
              <div className="bg-muted-50 rounded-md p-2 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-cool-teal/10 rounded-md flex items-center justify-center">
                    <Mail className="w-3 h-3 text-cool-teal" />
                  </div>
                  <label className="text-xs font-semibold text-muted-600 uppercase tracking-wide">
                    Email
                  </label>
                </div>
                <p className="text-foreground font-semibold text-xs truncate">
                  {userData?.email || "Not set"}
                </p>
              </div>

              {/* Phone */}
              <div className="bg-muted-50 rounded-md p-2 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-premium-gold/10 rounded-md flex items-center justify-center">
                    <Phone className="w-3 h-3 text-premium-gold" />
                  </div>
                  <label className="text-xs font-semibold text-muted-600 uppercase tracking-wide">
                    Phone
                  </label>
                </div>
                <p className="text-foreground font-semibold text-sm">
                  {userData?.phone || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Quick Actions and Recent Activity */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Quick Actions Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-muted-700 px-3 py-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings className="w-3 h-3" />
              Quick Actions
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 gap-2">
              {/* Edit Profile Button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="group relative overflow-hidden bg-gradient-to-br from-electric-blue to-cool-teal text-white py-2 px-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                    <Edit3 className="w-3 h-3" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-xs">Edit Profile</div>
                    <div className="text-xs opacity-90">
                      Update your information
                    </div>
                  </div>
                </div>
              </button>

              {/* Account Settings Button - Now with dropdown functionality */}
              <div className="relative">
                <button
                  onClick={handleAccountSettingsClick}
                  className="group relative overflow-hidden bg-gradient-to-br from-primary to-muted-700 text-white py-2 px-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 w-full"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                      <Shield className="w-3 h-3" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-xs">
                        Account Settings
                      </div>
                      <div className="text-xs opacity-90">
                        Privacy & security
                      </div>
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        showAccountSettings ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Account Settings Dropdown */}
                {showAccountSettings && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 overflow-hidden">
                    {/* Change Password Option */}
                    <button
                      onClick={handleChangePasswordClick}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted-50 transition-colors duration-200 border-b border-border"
                    >
                      <div className="w-5 h-5 bg-electric-blue/10 rounded-md flex items-center justify-center">
                        <Key className="w-3 h-3 text-electric-blue" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-xs">
                          Change Password
                        </div>
                        <div className="text-muted-600 text-xs">
                          Update your current password
                        </div>
                      </div>
                    </button>

                    {/* Reset Password Option */}
                    <button
                      onClick={handleForgotPasswordClick}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted-50 transition-colors duration-200"
                    >
                      <div className="w-5 h-5 bg-cool-teal/10 rounded-md flex items-center justify-center">
                        <RefreshCw className="w-3 h-3 text-cool-teal" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-xs">
                          Reset Password
                        </div>
                        <div className="text-muted-600 text-xs">
                          Get reset link via email
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Settings Button */}
              <button className="group relative overflow-hidden bg-gradient-to-br from-premium-gold to-warning text-white py-2 px-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                    <Bell className="w-3 h-3" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-xs">Notifications</div>
                    <div className="text-xs opacity-90">Manage preferences</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-muted-700 px-3 py-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Recent Activity
            </h3>
          </div>
          <div className="p-3">
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-muted-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-4 h-4 text-muted-400" />
              </div>
              <p className="text-muted-600 text-xs">No recent activity</p>
              <p className="text-xs text-muted-500 mt-1">
                Your activity will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      <ProfileUpdate
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        user={userData}
        onUpdate={() => {
          // Refresh data or handle update
         
        }}
      />

      {/* Change Password Modal */}
      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onOpenSignIn={() => {
          setShowForgotPassword(false);
        }}
      />
    </div>
  );
};

export default Profile;
