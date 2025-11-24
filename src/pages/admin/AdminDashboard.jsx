import { useState, useEffect, useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Image, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendarAlt,
  faGear,
  faAngleDown,
  faBars,
  faTimes,
  faChevronDown,
  faChevronRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Build";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CollectionsIcon from "@mui/icons-material/Collections";
import BookingsIcon from "@mui/icons-material/EventNote";
import AnnouncementIcon from "@mui/icons-material/Announcement";

import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import NewService from "./services/NewService";
import BookingModals from "./bookings/BookingModals";
import BookingNotification from "./bookings/BookingNotification";

const AdminDashboard = () => {
  const { userProfilePic, username, last_name, user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [bookingsExpanded, setBookingsExpanded] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Handle resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Booking submenu items
  const bookingSubItems = [
    {
      id: "unpaid-bookings",
      label: "Unpaid Bookings",
      icon: AccessTimeIcon,
      path: "unpaid-bookings",
    },
    {
      id: "paid-bookings",
      label: "Paid Bookings",
      icon: MonetizationOnIcon,
      path: "paid-bookings",
    },
    {
      id: "completed-bookings",
      label: "Completed",
      icon: CheckCircleIcon,
      path: "completed-bookings",
    },
    {
      id: "cancelled-bookings",
      label: "Cancelled",
      icon: CancelIcon,
      path: "cancelled-bookings",
    },
    {
      id: "all-bookings",
      label: "All Bookings",
      icon: AssignmentIcon,
      path: "all-bookings",
    },
  ];

  // Main navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon, path: "" },
    { id: "services", label: "Services", icon: BuildIcon, path: "services" },
    {
      id: "bookings",
      label: "Bookings",
      icon: BookingsIcon,
      path: null,
      hasSubmenu: true,
    },
    { id: "team", label: "Team", icon: GroupIcon, path: "team" },
    { id: "users", label: "Users", icon: GroupIcon, path: "users" },
    {
      id: "messages",
      label: "Messages",
      icon: ChatBubbleIcon,
      path: "messages",
    },
    { id: "media", label: "Media", icon: CollectionsIcon, path: "media" },
    {id: "announcement", label: "Announcements", icon: AnnouncementIcon, path: "announcements"}
  ];

  // Get current active tab from URL
  const getActiveTab = () => {
    const path = location.pathname.split("/").pop() || "";
    const mainItem = navItems.find((item) => item.path === path);
    if (mainItem) return mainItem.id;
    const bookingItem = bookingSubItems.find((item) => item.path === path);
    if (bookingItem) return bookingItem.id;
    return "dashboard";
  };

  const activeTab = getActiveTab();
  const isBookingPage = bookingSubItems.some((item) => item.id === activeTab);

  // Auto-expand bookings menu if on a booking page
  useEffect(() => {
    if (isBookingPage) {
      setBookingsExpanded(true);
    }
  }, [isBookingPage]);

  // Handle tab click
  const handleTabClick = (item) => {
    if (item.hasSubmenu) {
      setBookingsExpanded(!bookingsExpanded);
    } else {
      navigate(`/admin-dashboard/${item.path}`);
      if (isMobile) setSidebarOpen(false);
    }
  };

  // Handle submenu item click
  const handleSubItemClick = (path) => {
    navigate(`/admin-dashboard/${path}`);
    if (isMobile) setSidebarOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNewDropdown && !e.target.closest(".new-dropdown-container")) {
        setShowNewDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showNewDropdown]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen, isMobile]);

  const getPageTitle = () => {
    const mainItem = navItems.find((item) => item.id === activeTab);
    if (mainItem) return mainItem.label;
    const bookingItem = bookingSubItems.find((item) => item.id === activeTab);
    if (bookingItem) return bookingItem.label;
    return "Dashboard";
  };

  const handleNewServiceClick = () => {
    setShowServiceModal(true);
    setShowNewDropdown(false);
  };

  const handleNewBookingClick = () => {
    setShowBookingModal(true);
    setShowNewDropdown(false);
  };

  // Styles object for inline styles
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    },
    mobileHeader: {
      display: isMobile ? "flex" : "none",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      backgroundColor: "#1e293b",
      color: "white",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    hamburgerBtn: {
      padding: "8px 12px",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      color: "white",
      fontSize: "20px",
    },
    overlay: {
      display: isMobile && sidebarOpen ? "block" : "none",
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 40,
    },
    sidebar: {
      position: isMobile ? "fixed" : "sticky",
      top: 0,
      left: 0,
      height: isMobile ? "100%" : "100vh",
      width: "280px",
      backgroundColor: "#1e293b",
      zIndex: isMobile ? 50 : "auto",
      transform: isMobile
        ? sidebarOpen
          ? "translateX(0)"
          : "translateX(-100%)"
        : "translateX(0)",
      transition: "transform 0.3s ease-in-out",
      display: "flex",
      flexDirection: "column",
      boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
      overflowY: "auto",
    },
    sidebarHeader: {
      padding: "20px",
      borderBottom: "1px solid #475569",
      flexShrink: 0,
    },
    headerTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    closeBtn: {
      display: isMobile ? "block" : "none",
      padding: "8px",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      color: "#94a3b8",
      fontSize: "18px",
    },
    mainContent: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      flex: 1,
      minHeight: 0,
    },
    contentArea: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    },
    desktopHeader: {
      display: isMobile ? "none" : "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 32px",
      backgroundColor: "white",
      borderBottom: "1px solid #e2e8f0",
    },
    pageContent: {
      flex: 1,
      padding: isMobile ? "16px" : "32px",
      overflowY: "auto",
    },
    navItem: (isActive, hasSubmenu, isBookingParent) => ({
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      backgroundColor: isActive
        ? "#3b82f6"
        : hasSubmenu && isBookingParent
        ? "rgba(59, 130, 246, 0.2)"
        : "transparent",
      color: isActive || (hasSubmenu && isBookingParent) ? "white" : "#94a3b8",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.2s",
      marginBottom: "4px",
    }),
    subItem: (isActive) => ({
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 16px",
      backgroundColor: isActive ? "#3b82f6" : "transparent",
      color: isActive ? "white" : "#94a3b8",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.2s",
      marginBottom: "2px",
      fontSize: "14px",
    }),
    newBtn: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px 16px",
      backgroundColor: "rgb(6, 119, 21)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 500,
      marginTop: "16px",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      marginTop: "8px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      border: "1px solid #e2e8f0",
      zIndex: 50,
      overflow: "hidden",
    },
    dropdownItem: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      backgroundColor: "white",
      color: "#374151",
      border: "none",
      borderTop: "1px solid #f3f4f6",
      cursor: "pointer",
      textAlign: "left",
    },
  };

  return (
    <div style={styles.container}>
      {/* Mobile Header with Hamburger */}
      <header style={styles.mobileHeader}>
        <button
          onClick={() => setSidebarOpen(true)}
          style={styles.hamburgerBtn}
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
          {getPageTitle()}
        </h1>
        <div style={{ width: "44px" }} />
      </header>

      {/* Mobile Overlay */}
      <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />

      <div style={styles.mainContent}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {/* Sidebar Header */}
          <div style={styles.sidebarHeader}>
            <div style={styles.headerTop}>
              <div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "white",
                    margin: 0,
                  }}
                >
                  Admin
                </h2>
                <p
                  style={{
                    color: "#94a3b8",
                    marginTop: "4px",
                    fontSize: "14px",
                  }}
                >
                  Welcome back,{" "}
                  <b style={{ color: "white" }}>{username || "Admin"}</b>!
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                style={styles.closeBtn}
                aria-label="Close menu"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Divider */}
            <div
              style={{ borderBottom: "1px solid #475569", margin: "16px 0" }}
            />

            {/* New Button with Dropdown */}
            <div
              style={{ position: "relative" }}
              className="new-dropdown-container"
            >
              <button
                onClick={() => setShowNewDropdown(!showNewDropdown)}
                style={styles.newBtn}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>New</span>
              </button>

              {showNewDropdown && (
                <div style={styles.dropdown}>
                  <button
                    onClick={handleNewServiceClick}
                    style={{ ...styles.dropdownItem, borderTop: "none" }}
                  >
                    <FontAwesomeIcon
                      icon={faGear}
                      style={{ color: "#6b7280" }}
                    />
                    <span style={{ fontWeight: 500 }}>New Service</span>
                  </button>
                  <button
                    onClick={handleNewBookingClick}
                    style={styles.dropdownItem}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: "#6b7280" }}
                    />
                    <span style={{ fontWeight: 500 }}>New Booking</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
            {navItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleTabClick(item)}
                  style={styles.navItem(
                    activeTab === item.id,
                    item.hasSubmenu,
                    item.hasSubmenu && isBookingPage
                  )}
                  onMouseEnter={(e) => {
                    if (
                      activeTab !== item.id &&
                      !(item.hasSubmenu && isBookingPage)
                    ) {
                      e.currentTarget.style.backgroundColor = "#334155";
                      e.currentTarget.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      activeTab !== item.id &&
                      !(item.hasSubmenu && isBookingPage)
                    ) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <item.icon style={{ fontSize: "20px" }} />
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <FontAwesomeIcon
                      icon={bookingsExpanded ? faChevronDown : faChevronRight}
                      style={{ fontSize: "12px" }}
                    />
                  )}
                </button>

                {/* Submenu for Bookings */}
                {item.hasSubmenu && (
                  <div
                    style={{
                      overflow: "hidden",
                      maxHeight: bookingsExpanded ? "400px" : "0",
                      opacity: bookingsExpanded ? 1 : 0,
                      transition: "all 0.3s ease-in-out",
                      paddingLeft: "12px",
                    }}
                  >
                    {bookingSubItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(subItem.path)}
                        style={styles.subItem(activeTab === subItem.id)}
                        onMouseEnter={(e) => {
                          if (activeTab !== subItem.id) {
                            e.currentTarget.style.backgroundColor = "#334155";
                            e.currentTarget.style.color = "white";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeTab !== subItem.id) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#94a3b8";
                          }
                        }}
                      >
                        <subItem.icon style={{ fontSize: "18px" }} />
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.contentArea}>
          {/* Page Content */}
          <div style={styles.pageContent}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewService
        show={showServiceModal}
        handleClose={() => setShowServiceModal(false)}
        refreshServices={() => {}}
      />
      <BookingModals
        createOpen={showBookingModal}
        onCreateClose={() => setShowBookingModal(false)}
        onCreateConfirm={(booking) => {
          setShowBookingModal(false);
        }}
        isLoading={false}
        users={[]}
        services={[]}
      />
    </div>
  );
};

export default AdminDashboard;
