import { useState, useEffect, useRef } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactUs from "./modals/ContactUs";
import { AuthProvider } from "./context/AuthContext";
import ClientDashboard from "./pages/customer/ClientDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SignIn from "../src/components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ChangePassword from "./components/auth/ChangePassword";
import DashboardContent from "./pages/admin/DashboardContent";
import AdminServices from "./pages/admin/services/AdminServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import Announcements from "./pages/admin/Announcements";
import Media from "./pages/admin/Media";
import UnpaidBookings from "./pages/admin/bookings/UnpaidBookings";
import PaidBookings from "./pages/admin/bookings/PaidBookings";
import CompletedBookings from "./pages/admin/bookings/CompletedBookings";
import CancelledBookings from "./pages/admin/bookings/CancelledBookings";
import AllBookings from "./pages/admin/bookings/AllBookings";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import AdminTeam from "./pages/admin/AdminTeam";
import ServiceDetails from "./pages/ServiceDetails";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [activeNav, setActiveNav] = useState("Home");

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  const handleOpenContactModal = () => setContactModalOpen(true);
  const handleCloseContactModal = () => setContactModalOpen(false);
  
  const handleOpenSignIn = () => setIsSignInOpen(true);
  const handleCloseSignIn = () => setIsSignInOpen(false);
  
  const handleOpenSignUp = () => setIsSignUpOpen(true);
  const handleCloseSignUp = () => setIsSignUpOpen(false);
  
  const handleOpenForgotPassword = () => setIsForgotPasswordOpen(true);
  const handleCloseForgotPassword = () => setIsForgotPasswordOpen(false);

  const handleBackToHome = () => setCurrentPage("home");
  const handleCartClick = () => setCurrentPage("cart");
  const handleCheckout = () => setCurrentPage("checkout");
  const handleContinueToBook = () => setCurrentPage("book");
  const handleReturnToCart = () => setCurrentPage("cart");

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Alt+A combination
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsSignInOpen(true); // 👉 OPEN SIGN-IN MODAL
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMobileTap = () => {
      setTapCount(prev => {
        const newCount = prev + 1;
        
        // Clear existing timeout
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
        }
        
        // Set new timeout to reset counter
        tapTimeoutRef.current = setTimeout(() => {
          setTapCount(0);
          setShowAdminAccess(false);
        }, 2000); // Reset after 2 seconds
        
        // Show admin access on triple tap
        if (newCount >= 3) {
          setShowAdminAccess(true);
          setTapCount(0);
        }
        
        return newCount;
      });
    };

    // Add click listener to footer (discreet location)
    const footer = document.querySelector('footer');
    if (footer) {
      footer.addEventListener('click', handleMobileTap);
      return () => footer.removeEventListener('click', handleMobileTap);
    }
  }, []);

  const handleSignInSuccess = () => {
    handleCloseSignIn();
    navigate("/admin-dashboard");
  };

  const handleSwitchToSignUp = () => {
    handleCloseSignIn();
    handleOpenSignUp();
  };

  const handleSwitchToForgotPassword = () => {
    handleCloseSignIn();
    handleOpenForgotPassword();
  };

  const handleSwitchToSignIn = () => {
    handleCloseSignUp();
    handleCloseForgotPassword();
    handleOpenSignIn();
  };

  return (
    <>
      <AuthProvider>
        <Header
          onCartClick={handleCartClick}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
        />

        <main style={{ paddingBottom: "69px" }}>
          <Routes>
            <Route
              path="/"
              element={<Home onOpenContact={handleOpenContactModal} />}
            />

            {/* Cart now has its own route */}
            <Route path="/cart" element={<Cart />} />

            {/* Checkout also gets its own route */}
            <Route path="/checkout" element={<Checkout />} />

            {/* Admin Dashboard with nested routes */}
            <Route path="/admin-dashboard/*" element={<AdminDashboard />}>
              <Route index element={<DashboardContent />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="media" element={<Media />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="unpaid-bookings" element={<UnpaidBookings />} />
              <Route path="paid-bookings" element={<PaidBookings />} />
              <Route
                path="completed-bookings"
                element={<CompletedBookings />}
              />
              <Route
                path="cancelled-bookings"
                element={<CancelledBookings />}
              />
              <Route path="all-bookings" element={<AllBookings />} />
              <Route path="team" element={<AdminTeam />} />
            </Route>

            <Route path="/client-dashboard/*" element={<ClientDashboard />} />

            <Route
              path="/reset-password/:uidb64/:token"
              element={<ResetPasswordPage />}
            />

            {/* Route all section navigation to home page */}
            <Route
              path="/services"
              element={<Home onOpenContact={handleOpenContactModal} />}
            />
            <Route path="/service/:serviceId" element={<ServiceDetails />} />
            <Route
              path="/about"
              element={<Home onOpenContact={handleOpenContactModal} />}
            />
            <Route
              path="/testimonials"
              element={<Home onOpenContact={handleOpenContactModal} />}
            />
            <Route
              path="/team"
              element={<Home onOpenContact={handleOpenContactModal} />}
            />
            <Route
              path="/contact"
              element={<Home onOpenContact={handleOpenContactModal} />}
            />
          </Routes>
        </main>

        {/* Render all modals */}
        <ContactUs open={contactModalOpen} onClose={handleCloseContactModal} />
        
        <SignIn 
          isOpen={isSignInOpen} 
          onClose={handleCloseSignIn}
          onSignInSuccess={handleSignInSuccess}
          onSwitchToSignUp={handleSwitchToSignUp}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
        
        <SignUp 
          isOpen={isSignUpOpen} 
          onClose={handleCloseSignUp}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
        
        <ForgotPassword 
          open={isForgotPasswordOpen} 
          onClose={handleCloseForgotPassword}
          onSwitchToSignIn={handleSwitchToSignIn}
        />

        <Footer />
      </AuthProvider>
    </>
  );
}

export default App;