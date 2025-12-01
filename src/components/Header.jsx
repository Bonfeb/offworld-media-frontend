import { useState, useEffect, useContext, useRef } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  ChevronRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Drawer, IconButton, Divider } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import SignIn from "./auth/SignIn";
import { useNavigate, useLocation } from "react-router-dom";
import SignUp from "./auth/SignUp";
import { CartConstants } from "../utils/constants";
import ForgotPassword from "./auth/ForgotPassword";
import ChangePassword from "./auth/ChangePassword";

function Header({ activeNav, setActiveNav, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const profileMenuRef = useRef(null);

  const {
    isAuthenticated,
    userProfilePic,
    userName,
    userGroups,
    userId,
    logout,
    login,
  } = useContext(AuthContext);

  const navItems = ["Home", "Services", "About Us", "Team", "Contact Us"];

  // Debug AuthContext changes
  useEffect(() => {}, [isAuthenticated, userGroups, userName, userId]);

  // Initialize cart and set up callback for cart updates
  useEffect(() => {
    if (isAuthenticated && userId) {
      CartConstants.setCartCallback(userId, (items) => {
        setCartItemCount(items.length);
      });
    } else {
      // Reset cart count if user is not authenticated
      setCartItemCount(0);
    }

    return () => {
      if (userId) {
        CartConstants.removeCartCallback(userId);
      }
    };
  }, [isAuthenticated, userId]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUserRole = () => {
    if (!userGroups || !Array.isArray(userGroups)) return "Guest";
    if (userGroups.includes("admin")) return "Admin";
    if (userGroups.includes("customer")) return "Customer";
    return "Guest";
  };

  const getUserName = () => {
    if (!userName) return "Guest";
    return userName;
  };

  const hasGroup = (groupName) => {
    return (
      userGroups && Array.isArray(userGroups) && userGroups.includes(groupName)
    );
  };

  const isAdmin = () => {
    return hasGroup("admin");
  };

  const isCustomer = () => {
    return hasGroup("customer");
  };

  const handleNavClick = (item) => {
    setActiveNav(item);
    setIsOpen(false);

    const isOnHomePage = location.pathname === "/";

    if (isOnHomePage) {
      const element = document.getElementById(item);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      if (item === "Home") {
        navigate("/");
      } else {
        navigate(`/${item.toLowerCase()}`);
      }
    }
  };

  const handleCartClick = () => {
    setIsOpen(false);
    setShowProfileMenu(false);

    if (!isAuthenticated) {
      setShowSignIn(true);
    } else {
      navigate("/cart");
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setShowSignIn(true);
      return;
    }
    // Toggle profile menu
    setShowProfileMenu(!showProfileMenu);
  };

  const handleDashboardClick = () => {
    setShowProfileMenu(false);
    setIsOpen(false);
    // Check authentication first
    if (!isAuthenticated) {
      setShowSignIn(true);
      return;
    }

    // Check if user groups are available
    if (!userGroups || !Array.isArray(userGroups)) {
      // Fallback to client dashboard if groups aren't available but user is authenticated
      navigate("/client-dashboard");
      return;
    }

    // Determine target dashboard based on user groups
    let targetDashboard = "";

    if (userGroups.includes("admin")) {
      targetDashboard = "/admin-dashboard";
    } else if (userGroups.includes("customer")) {
      targetDashboard = "/client-dashboard";
    } else {
      // Default fallback to client dashboard
      targetDashboard = "/client-dashboard";
    }

    // Navigate to the target dashboard
    navigate(targetDashboard);
  };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      // Redirect to home page after logout
      navigate("/");
    } catch (error) {}
  };

  const handleSignInSuccess = async (userData) => {
    setShowSignIn(false);

    const groups = await login({
      username: userData.username,
      password: userData._rawPassword,
    });

    if (groups.includes("admin")) {
      navigate("/admin-dashboard");
    } else if (groups.includes("customer")) {
      navigate("/client-dashboard");
    }
  };

  const getUserInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : "U";
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 backdrop-blur-2xl bg-gray-900/95 border-b border-white/10">
        {/* Futuristic animated lines background */}
        <div
          className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,50 Q360,20 720,50 T1440,50"
              fill="none"
              stroke="rgba(90, 109, 255, 0.4)"
              strokeWidth="2"
            />
          </svg>
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,30 Q360,60 720,30 T1440,30"
              fill="none"
              stroke="rgba(0, 184, 200, 0.3)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Header content */}
        <div className="max-w-7xl mx-auto h-full px-4 lg:px-8 flex justify-between items-center relative z-10">
          {/* Left: Logo on ALL screens */}
          <div className="flex items-center md:w-0">
            <img src="/favicon.ico" alt="Offworld Media" className="h-8 w-8" />
          </div>

          {/* Center: Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-6 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`text-sm font-medium capitalize transition-all duration-200 ${
                  activeNav === item
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right: Action buttons and Hamburger Menu */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - Only on Mobile */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-white" />
            </button>

            {/* Optional: Add other action buttons that should be visible on desktop */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={handleCartClick}
                  className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleProfileClick}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="User profile"
                >
                  <User size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-16"></div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Confirm Logout
                </h3>
                <p className="text-gray-400 text-sm">
                  Are you sure you want to logout?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MUI Drawer for Mobile Menu - Now slides from LEFT */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            maxWidth: "85vw",
            backgroundColor: "#111827",
            backgroundImage: "none",
            color: "white",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          },
        }}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: false,
          style: {
            zIndex: 9999,
          },
        }}
      >
        <div
          className="flex flex-col h-full bg-gray-900"
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center">
              <h2 className="text-white font-bold text-lg">Offworld Media</h2>
            </div>
            <IconButton
              onClick={toggleDrawer(false)}
              size="small"
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                "&:focus": {
                  outline: "2px solid rgba(59, 130, 246, 0.5)",
                  outlineOffset: "2px",
                },
              }}
              aria-label="Close menu"
            >
              <X size={20} />
            </IconButton>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation Items */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    handleNavClick(item);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all duration-200 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                    activeNav === item
                      ? "text-white bg-blue-600"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{item}</span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform group-hover:translate-x-1 ${
                      activeNav === item ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              ))}
            </nav>

            {/* Optional: Add user profile section in drawer */}
            {isAuthenticated && (
              <>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />
                <div className="p-4 space-y-2">
                  <button
                    onClick={handleDashboardClick}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-gray-300 text-xs text-center">
              © 2025 Offworld Media
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default Header;
