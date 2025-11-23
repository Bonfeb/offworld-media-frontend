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

  const navItems = [
    "Home",
    "Services",
    "About",
    "Testimonials",
    "Team",
    "Contact",
  ];

  // Debug AuthContext changes
  useEffect(() => {
    console.log("=== AuthContext Debug ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("userGroups:", userGroups);
    console.log("userName:", userName);
    console.log("userId:", userId);
  }, [isAuthenticated, userGroups, userName, userId]);

  // Initialize cart and set up callback for cart updates
  useEffect(() => {
    if (isAuthenticated && userId) {
      CartConstants.setCartCallback(userId, (items) => {
        console.log("Cart Updated in Header:", items.length, "items");
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

    console.log("=== Dashboard Click Debug ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("userGroups:", userGroups);
    console.log("userId:", userId);
    console.log("isAdmin():", isAdmin());
    console.log("isCustomer():", isCustomer());

    // Check authentication first
    if (!isAuthenticated) {
      console.log("User not authenticated, showing sign in");
      setShowSignIn(true);
      return;
    }

    // Check if user groups are available
    if (!userGroups || !Array.isArray(userGroups)) {
      console.error("User groups not available or not an array");
      // Fallback to client dashboard if groups aren't available but user is authenticated
      navigate("/client-dashboard");
      return;
    }

    // Determine target dashboard based on user groups
    let targetDashboard = "";

    if (userGroups.includes("admin")) {
      targetDashboard = "/admin-dashboard";
      console.log("User is admin, navigating to admin dashboard");
    } else if (userGroups.includes("customer")) {
      targetDashboard = "/client-dashboard";
      console.log("User is customer, navigating to client dashboard");
    } else {
      console.warn(
        "User has no recognized groups, defaulting to client dashboard. Groups:",
        userGroups
      );
      // Default fallback to client dashboard
      targetDashboard = "/client-dashboard";
    }

    console.log("Final target dashboard:", targetDashboard);

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
    } catch (error) {
      console.error("Logout error:", error);
    }
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
          {/* Left: User Avatar with Dropdown Menu */}
          <div
            className="flex items-center gap-3 relative"
            ref={profileMenuRef}
          >
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 group relative"
            >
              <div className="relative">
                {userProfilePic ? (
                  <img
                    src={userProfilePic}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-lg object-cover border-2 border-blue-500/50 group-hover:border-blue-500 transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-blue-500/50 group-hover:border-blue-500 transition-colors">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitial()}
                    </span>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 border-2 border-gray-900 rounded-full w-2.5 h-2.5"></div>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white font-semibold text-xs leading-tight">
                  {isAuthenticated ? getUserRole() : "Guest"}
                </p>
                <p className="text-gray-400 text-[10px] leading-tight">
                  {isAuthenticated ? getUserName() : "Sign in"}
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && isAuthenticated && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* Menu Items */}
                <div className="p-1">
                  <button
                    onClick={handleDashboardClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
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

          {/* Right: Cart + Menu */}
          <div className="flex items-center gap-3">
            {/* Cart Button - Always Visible */}
            <button
              onClick={handleCartClick}
              className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition-all duration-200 relative flex-shrink-0"
              title="Cart"
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isAuthenticated && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu - Only on Mobile */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex md:hidden w-10 h-10 items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-white" />
            </button>
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

      {/* MUI Drawer for Mobile Menu */}
      <Drawer
        anchor="right"
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
            <h2 className="text-white text-center font-bold text-lg">
              Offworld Media
            </h2>
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
            {/* User Profile Section */}
            <div className="p-4">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    handleDashboardClick();
                  } else {
                    setShowSignIn(true);
                    setIsOpen(false);
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {userProfilePic ? (
                  <img
                    src={userProfilePic}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-lg object-cover border-2 border-blue-500/50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-blue-500/50 flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {getUserInitial()}
                    </span>
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {isAuthenticated ? getUserName() : "Guest"}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {isAuthenticated ? `${getUserRole()} Dashboard` : "Sign In"}
                  </p>
                </div>
                {isAuthenticated && (
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                )}
              </button>

              {/* Logout Button in Drawer - Only show when authenticated */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 mt-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />

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

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />

            {/* Cart Button in Drawer */}
            <div className="p-4">
              <button
                onClick={() => {
                  handleCartClick();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>View Cart</span>
                </div>
                {isAuthenticated && cartItemCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-2.5 py-1 min-w-[28px] text-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-gray-300 text-xs text-center">
              © 2025 Offworld Media
            </p>
          </div>
        </div>
      </Drawer>

      {/* SignIn Modal */}
      <SignIn
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onOpenSignUp={() => {
          setShowSignUp(true);
          setShowSignIn(false);
        }}
        onOpenForgotPassword={() => {
          setShowSignIn(false);
          setShowForgotPassword(true);
        }}
        onSignInSuccess={handleSignInSuccess}
      />
      <SignUp
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onOpenSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onOpenSignIn={() => {
          setShowForgotPassword(false);
          setShowSignIn(true);
        }}
      />
    </>
  );
}

export default Header;
