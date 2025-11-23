import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
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

// Import Admin Sub-components
import DashboardContent from "./pages/admin/DashboardContent";
import AdminServices from "./pages/admin/services/AdminServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import Media from "./pages/admin/Media";
import UnpaidBookings from "./pages/admin/bookings/UnpaidBookings";
import PaidBookings from "./pages/admin/bookings/PaidBookings";
import CompletedBookings from "./pages/admin/bookings/CompletedBookings";
import CancelledBookings from "./pages/admin/bookings/CancelledBookings";
import AllBookings from "./pages/admin/bookings/AllBookings";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import AdminTeam from "./pages/admin/AdminTeam";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [activeNav, setActiveNav] = useState("Home");

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const handleOpenContactModal = () => setContactModalOpen(true);
  const handleCloseContactModal = () => setContactModalOpen(false);

  const handleBackToHome = () => setCurrentPage("home");
  const handleCartClick = () => setCurrentPage("cart");
  const handleCheckout = () => setCurrentPage("checkout");
  const handleContinueToBook = () => setCurrentPage("book");
  const handleReturnToCart = () => setCurrentPage("cart");

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

        <ContactUs open={contactModalOpen} onClose={handleCloseContactModal} />

        <Footer />
      </AuthProvider>
    </>
  );
}

export default App;
