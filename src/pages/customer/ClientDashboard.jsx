import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailjs from "@emailjs/browser";

// MUI Components
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LayoutDashboard,
  User,
  Calendar,
  Star,
  MessageSquare,
  X,
  Menu,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react";

import API from "../../api";
import Overview from "./Overview";
import Profile from "../../components/Profile";
import Bookings from "./Bookings";
import Reviews from "./Reviews";
import Messages from "./Messages";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // UserDashboard state
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState({
    unpaid: [],
    paid: [],
    completed: [],
    cancelled: [],
  });
  const [cart, setCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateBookingId, setUpdateBookingId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeServiceId, setRemoveServiceId] = useState(null);

  const token = sessionStorage.getItem("accessToken");

  const [paymentData, setPaymentData] = useState({
    bookingId: null,
    phoneNumber: "",
    amount: "",
  });

  const [modalData, setModalData] = useState({});
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // MUI Theme and Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({
      show: true,
      message,
      type,
    });
    setTimeout(
      () => {
        setSnackbar((prev) => ({ ...prev, show: false }));
      },
      type === "success" ? 60000 : 5000
    );
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, show: false }));
  };

  // Fetch dashboard data
  useEffect(() => {
    fetchUserDashboard();
  }, []);

  const fetchUserDashboard = async () => {
    try {
      const response = await API.get("/userdashboard/", {
        withCredentials: true,
      });

      const updatedCart = response.data.cart.map((item) => ({
        ...item,
        event_date: item.event_date || null,
        event_time: item.event_time || null,
        event_location: item.event_location || null,
      }));

      setUser(response.data.user);
      setBookings(response.data.bookings);
      setCart([...updatedCart]);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // UserDashboard functions
  const handleShowRemoveModal = (service) => {
    if (!service || !service.service) {
      console.error("❌ Error: Service ID is missing or invalid!", service);
      return;
    }
    setModalData({ service });
    setShowRemoveModal(true);
  };

  const handleShowCancelModal = (booking) => {
    setModalData({ booking });
    setShowCancelModal(true);
  };

  const handleShowPaymentModal = (booking) => {
    setPaymentData({
      bookingId: booking.id,
      phoneNumber: "",
      amount: booking.service.price || "",
    });
    setShowPaymentModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!modalData?.service?.id) {
      console.error("Error: service id is undefined");
      return;
    }

    setRemoveLoading(true);
    setRemoveServiceId(modalData.service.id);

    try {
      const serviceId = modalData.service.id;
      const response = await API.delete(`/userdashboard/${serviceId}/`);
      setCart(response.data.cart);
      fetchUserDashboard();
      setShowRemoveModal(false);
      toast.success("Item removed from cart successfully!");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart. Please try again.");
    } finally {
      setRemoveLoading(false);
      setRemoveServiceId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!modalData?.booking?.id) {
      console.error("Error: booking id is undefined");
      toast.error("Unable to cancel booking. Please try again.");
      return;
    }

    setCancelLoading(true);
    setCancelBookingId(modalData.booking.id);

    try {
      const bookingId = modalData.booking.id;
      await API.delete(`/booking/${bookingId}/`, {
        withCredentials: true,
      });

      toast.success("Booking cancelled successfully!");
      setShowCancelModal(false);
      await fetchUserDashboard();
    } catch (error) {
      console.error("Error canceling booking:", error);

      if (error.response && error.response.status === 403) {
        setShowPermissionError(true);
      } else if (error.response && error.response.status === 404) {
        toast.error("Booking not found. It may have already been cancelled.");
      } else {
        toast.error("Failed to cancel booking. Please try again.");
      }
    } finally {
      setCancelLoading(false);
      setCancelBookingId(null);
    }
  };

  const handleBookService = async (serviceId) => {
    const cartItem = cart.find((item) => item.service === serviceId);

    if (!serviceId) {
      console.error("Invalid serviceId:", serviceId);
      setShowFailureModal(true);
      return;
    }

    setBookingLoading(true);
    setBookingServiceId(serviceId);

    try {
      if (!cartItem) {
        console.error("Service not found in cart:", serviceId);
        throw new Error("SERVICE_NOT_IN_CART");
      }

      const { event_date, event_location, event_time } = cartItem;

      if (!event_date || !event_time || !event_location) {
        console.error("Missing event details in cart item:", cartItem);
        throw new Error("MISSING_EVENT_DETAILS");
      }

      const response = await API.post(
        `/booking/${serviceId}/`,
        {
          status: "unpaid",
          event_date,
          event_time,
          event_location,
        },
        { withCredentials: true }
      );

      if (response.status !== 201) {
        throw new Error("UNEXPECTED_RESPONSE");
      }

      await fetchUserDashboard();

      const emailData = {
        service_category: cartItem.service_category || "Service",
        customer_name: user.name || "Customer",
        customer_email: user.email,
        booking_id: response.data.booking_id || "N/A",
        event_date: formatDate(event_date),
        event_time: event_time,
        event_location: event_location,
        booking_date: formatDate(new Date()),
        to_email: user.email,
        admin_email: response.data.admin_emails || ["bonfebdevs@gmail.com"],
      };

      const toastId = toast.loading("Notifying admins...");
      showSnackbar("Booking successful! Notifying admins...", "success");

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          emailData,
          import.meta.env.VITE_EMAILJS_USER_ID
        );

        toast.update(toastId, {
          render: "Admins have been notified!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });

        setSuccessMessage(
          "Service booked successfully! A confirmation has been sent to your email."
        );
        setShowSuccessModal(true);
        fetchUserDashboard();
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        showSnackbar(
          "Booking successful but admin notification failed",
          "danger"
        );
        setSuccessMessage(
          "Service booked successfully, but email confirmation failed to send."
        );
        setShowSuccessModal(true);
        fetchUserDashboard();
      }
    } catch (error) {
      console.error("Booking error:", error.message, error.response?.data);

      const errorMessage =
        {
          SERVICE_NOT_IN_CART: "Service not found in your cart",
          MISSING_EVENT_DETAILS: "Incomplete event details",
          UNEXPECTED_RESPONSE: "Unexpected server response",
        }[error.message] || "Booking failed - please try again";

      showSnackbar(errorMessage, "danger");
      setShowFailureModal(true);
    } finally {
      setBookingLoading(false);
      setBookingServiceId(null);
    }
  };

  const handleToUpdateBooking = (booking, serviceId) => {
    setUpdateLoading(true);
    setUpdateBookingId(booking.id);
    navigate(`/event-details/${serviceId}/${booking.id}`);
  };

  const handlePayBooking = async () => {
    const { bookingId, phoneNumber, amount } = paymentData;

    if (!phoneNumber || !amount) {
      toast.error("Please fill in all payment details");
      return;
    }

    const phoneRegex = /^2547[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      showSnackbar(
        "Please enter a valid phone number (e.g., 254712345678)",
        "danger"
      );
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setPaymentLoading(true);

    try {
      const res = await API.post(
        "/stk-push/",
        {
          booking_id: bookingId,
          phone_number: phoneNumber,
          amount: parseFloat(amount),
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar(
        "STK Push Sent! Please check your phone to complete the payment."
      );
      setShowPaymentModal(false);
      setPaymentData({ bookingId: null, phoneNumber: "", amount: "" });
      await fetchUserDashboard();
    } catch (error) {
      console.error("Error initiating payment:", error);
      showSnackbar("Failed to initiate payment. Please try again.", "danger");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentInputChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ClientDashboard functions
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Close mobile sidebar after selection
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  // Custom Snackbar Component
  const CustomSnackbar = ({ show, message, type, onClose }) => {
    if (!show) return null;

    const bgColor = type === "success" ? "bg-success" : "bg-destructive";
    const Icon = type === "success" ? CheckCircle : XCircle;

    return (
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-[9999] min-w-[300px] max-w-[500px] animate-slide-down`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Modal Component
  const Modal = ({ show, onClose, title, children, footer }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          ></div>
          <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="text-muted-600 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted-50">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Glassmorphic Sidebar Component
  const Sidebar = () => (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        background: `
          linear-gradient(135deg, 
            rgba(47, 54, 77, 0.95) 0%,
            rgba(31, 41, 55, 0.95) 50%,
            rgba(47, 54, 77, 0.95) 100%
          )
        `,
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        height: "100vh",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        position: "sticky",
        top: 0,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Fixed Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          flexShrink: 0,
          background: "rgba(47, 54, 77, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontFamily: "var(--font-sans)",
            fontSize: "1.25rem",
            mb: 1,
          }}
        >
          Client Dashboard
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
          }}
        >
          Welcome,{" "}
          <span style={{ fontWeight: 600, color: "white" }}>
            {user?.username || "User"}
          </span>
        </Typography>
      </Box>

      {/* Scrollable Navigation */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <List sx={{ p: 2 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleTabClick(item.id)}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 2.5,
                      background: isActive
                        ? "linear-gradient(135deg, var(--color-electric-blue) 0%, var(--color-cool-teal) 100%)"
                        : "transparent",
                      color: isActive ? "white" : "rgba(255, 255, 255, 0.8)",
                      border: isActive
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid transparent",
                      "&:hover": {
                        background: isActive
                          ? "linear-gradient(135deg, var(--color-electric-blue) 0%, var(--color-cool-teal) 100%)"
                          : "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        transform: "translateX(4px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": isActive
                        ? {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "2px",
                            background:
                              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                            animation: "shimmer 2s infinite",
                          }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: "inherit",
                      }}
                    >
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </Box>
  );

  // Mobile Sidebar Drawer with Glassmorphism
  const MobileSidebar = () => (
    <Drawer
      variant="temporary"
      open={mobileSidebarOpen}
      onClose={() => setMobileSidebarOpen(false)}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: 280,
          background: `
            linear-gradient(135deg, 
              rgba(47, 54, 77, 0.98) 0%,
              rgba(31, 41, 55, 0.98) 50%,
              rgba(47, 54, 77, 0.98) 100%
            )
          `,
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      {/* Mobile Sidebar Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(47, 54, 77, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "var(--font-sans)",
                fontSize: "1.25rem",
                mb: 1,
              }}
            >
              Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
              }}
            >
              Welcome,{" "}
              <span style={{ fontWeight: 600, color: "white" }}>
                {user?.username || "User"}
              </span>
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMobileSidebarOpen(false)}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                color: "white",
                background: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Scrollable Mobile Navigation */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <List sx={{ p: 2 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleTabClick(item.id)}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 2.5,
                      background: isActive
                        ? "linear-gradient(135deg, var(--color-electric-blue) 0%, var(--color-cool-teal) 100%)"
                        : "transparent",
                      color: isActive ? "white" : "rgba(255, 255, 255, 0.8)",
                      border: isActive
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid transparent",
                      "&:hover": {
                        background: isActive
                          ? "linear-gradient(135deg, var(--color-electric-blue) 0%, var(--color-cool-teal) 100%)"
                          : "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        transform: "translateX(4px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: "inherit",
                      }}
                    >
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </Drawer>
  );

  // Enhanced Mobile Header
  const MobileHeader = () => (
    <AppBar
      position="sticky"
      sx={{
        display: { xs: "block", md: "none" },
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        color: "var(--color-foreground)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={() => setMobileSidebarOpen(true)}
          sx={{
            color: "var(--color-muted-600)",
            "&:hover": {
              color: "var(--color-foreground)",
              background: "var(--color-muted-50)",
            },
          }}
        >
          <Menu size={24} />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            ml: 2,
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          {navItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
        </Typography>
      </Toolbar>
    </AppBar>
  );

  // Render active component
  const renderActiveComponent = () => {
    const props = {
      data: dashboardData,
      loading,
      error,
      cart,
      bookings,
      user,
      onRemoveFromCart: handleShowRemoveModal,
      onCancelBooking: handleShowCancelModal,
      onPayBooking: handleShowPaymentModal,
      onBookService: handleBookService,
      onUpdateBooking: handleToUpdateBooking,
      bookingLoading,
      bookingServiceId,
      cancelLoading,
      cancelBookingId,
      updateLoading,
      updateBookingId,
      removeLoading,
      removeServiceId,
      onTabChange: handleTabClick,
    };

    switch (activeTab) {
      case "overview":
        return <Overview {...props} />;
      case "profile":
        return <Profile {...props} onTabChange={handleTabClick} />;
      case "bookings":
        return <Bookings {...props} />;
      case "reviews":
        return <Reviews {...props} />;
      case "messages":
        return <Messages {...props} />;
      default:
        return <Overview {...props} />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "var(--color-background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-block",
              animation: "spin 1s linear infinite",
              borderRadius: "50%",
              height: 48,
              width: 48,
              border: "4px solid var(--color-electric-blue)",
              borderTopColor: "transparent",
              mb: 2,
            }}
          />
          <Typography
            sx={{
              color: "var(--color-foreground)",
              fontSize: "1.125rem",
            }}
          >
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "var(--color-background)",
      }}
    >
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar />

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4, lg: 6 },
            overflowY: "auto",
            background: "var(--color-background)",
          }}
        >
          {successMessage && (
            <Box
              sx={{
                mb: { xs: 3, md: 4 },
                bgcolor: "var(--color-success)/0.1",
                border: "1px solid var(--color-success)/0.3",
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <CheckCircle
                size={20}
                style={{
                  color: "var(--color-success)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <Typography
                sx={{
                  color: "var(--color-success)",
                  fontSize: "0.875rem",
                }}
              >
                {successMessage}
              </Typography>
            </Box>
          )}
          {renderActiveComponent()}
        </Box>
      </Box>

      {/* Snackbar */}
      <CustomSnackbar
        show={snackbar.show}
        message={snackbar.message}
        type={snackbar.type}
        onClose={closeSnackbar}
      />

      {/* Remove Modal */}
      <Modal
        show={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Confirm Remove"
        footer={
          <>
            <button
              onClick={() => setShowRemoveModal(false)}
              className="px-4 py-2 text-sm font-medium text-muted-600 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              disabled={removeLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removeLoading ? "Removing..." : "Confirm"}
            </button>
          </>
        }
      >
        <p className="text-muted-600">
          Are you sure you want to remove this item from your cart?
        </p>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirm Cancel"
        footer={
          <>
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 text-sm font-medium text-muted-600 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLoading ? "Cancelling..." : "Confirm"}
            </button>
          </>
        }
      >
        <p className="text-muted-600">
          Are you sure you want to cancel this booking?
        </p>
      </Modal>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Details"
        footer={
          <>
            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={paymentLoading}
              className="px-4 py-2 text-sm font-medium text-muted-600 hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayBooking}
              disabled={paymentLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-success hover:bg-success/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading ? "Processing..." : "Pay Now"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="254712345678"
              value={paymentData.phoneNumber}
              onChange={(e) =>
                handlePaymentInputChange("phoneNumber", e.target.value)
              }
              disabled={paymentLoading}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-500 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
            />
            <p className="text-xs text-muted-600 mt-1">
              Enter your M-Pesa phone number
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount (KSH)
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={paymentData.amount}
              onChange={(e) =>
                handlePaymentInputChange("amount", e.target.value)
              }
              min="1"
              disabled={paymentLoading}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-500 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
            />
            <p className="text-xs text-muted-600 mt-1">
              Enter the amount to pay
            </p>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Booking Successful"
        footer={
          <button
            onClick={() => setShowSuccessModal(false)}
            className="px-6 py-2 text-sm font-medium text-white bg-electric-blue hover:bg-electric-blue/90 rounded-lg transition-colors"
          >
            OK
          </button>
        }
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
          <p className="text-foreground">
            Your service has been successfully booked!
          </p>
        </div>
      </Modal>

      {/* Failure Modal */}
      <Modal
        show={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        title="Booking Failed"
        footer={
          <button
            onClick={() => setShowFailureModal(false)}
            className="px-6 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-colors"
          >
            OK
          </button>
        }
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
          <p className="text-foreground">
            There was an issue booking your service. Please try again.
          </p>
        </div>
      </Modal>

      {/* Permission Error Modal */}
      <Modal
        show={showPermissionError}
        onClose={() => setShowPermissionError(false)}
        title="Permission Denied"
        footer={
          <button
            onClick={() => setShowPermissionError(false)}
            className="px-6 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-colors"
          >
            Close
          </button>
        }
      >
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
          <p className="text-foreground">
            You do not have permission to delete this booking. Only the booking
            owner or an admin can delete it.
          </p>
        </div>
      </Modal>

      {/* Add CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Box>
  );
};

export default ClientDashboard;
