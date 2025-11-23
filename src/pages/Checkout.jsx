import { useState, useEffect, useContext } from "react";
import {
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import Service from "../modals/Service";
import { CartConstants } from "../utils/constants"; // ✅ Import from constants

export default function Checkout({ onBookingSuccess, onReturnToCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActionsId, setShowActionsId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    notes: "",
  });

  const { userId, isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setCartItems([]);
      return;
    }

    // Set up callback for cart updates
    CartConstants.setCartCallback(userId, (items) => {
      console.log("Cart updated in Checkout:", items.length, "items");
      setCartItems(items);
    });

    // Get initial cart items
    const items = CartConstants.getCartItems(userId);
    setCartItems(items);

    // Cleanup function
    return () => {
      CartConstants.removeCartCallback(userId);
    };
  }, [isAuthenticated, userId]);

  // Enhanced subtotal calculation with multiple safety checks
  const calculateSubtotal = () => {
    try {
      const total = cartItems.reduce((sum, item) => {
        let price = 0;

        if (item && item.service) {
          if (item.service.price !== undefined && item.service.price !== null) {
            price = Number(item.service.price);

            if (isNaN(price)) {
              price =
                Number(String(item.service.price).replace(/[^\d.-]/g, "")) || 0;
            }
          }
        }

        return sum + price;
      }, 0);

      return total;
    } catch (error) {
      console.error("Error calculating subtotal:", error);
      return 0;
    }
  };

  const subtotal = calculateSubtotal();
  const itemsWithoutDetails = cartItems.filter(
    (item) => !item.has_event_details
  ).length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditItem = (item) => {
    setEditingItem(item.service);
    setIsModalOpen(true);
    setShowActionsId(null); // Close actions when editing
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleUpdateCart = (serviceData) => {
    if (!userId) return;

    // Update the cart item with new event details
    CartConstants.updateCartItem(userId, serviceData.id, {
      event_date: serviceData.event_date,
      event_time: serviceData.event_time,
      event_location: serviceData.event_location,
      has_event_details: serviceData.has_event_details,
    });
  };

  const handleRemoveItem = async (item) => {
    if (!userId) return;

    const confirmRemove = window.confirm(
      `Are you sure you want to remove "${item.service.title}" from your cart?`
    );

    if (confirmRemove) {
      const result = CartConstants.removeFromCart(userId, item.service.id);
      if (result.success) {
        setShowActionsId(null); // Close actions after removal
      } else {
        alert(result.error || "Failed to remove item from cart");
      }
    }
  };

  const handleBookServices = async () => {
    if (!isAuthenticated || !userId) {
      alert("Please log in to book services");
      return;
    }

    if (itemsWithoutDetails > 0) {
      alert(
        `Please add event details for ${itemsWithoutDetails} item${
          itemsWithoutDetails > 1 ? "s" : ""
        } before booking. You can edit them from the cart.`
      );
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.address
    ) {
      alert("Please fill in all required customer information fields");
      return;
    }

    setLoading(true);
    try {
      const bookingPromises = cartItems.map(async (cartItem) => {
        const bookingData = {
          service_id: cartItem.service.id,
          event_date: cartItem.event_date,
          event_time: cartItem.event_time,
          event_location: cartItem.event_location,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_phone: formData.phone,
          customer_address: formData.address,
          notes: formData.notes,
        };

        const response = await API.post(`/bookings/`, bookingData);
        return response.data;
      });

      const results = await Promise.allSettled(bookingPromises);

      const successfulBookings = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const failedBookings = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (failedBookings.length > 0) {
        console.error("Some bookings failed:", failedBookings);
        alert(`Some bookings failed. Please try again.`);
        return;
      }

      // Clear cart after successful booking
      CartConstants.clearCart(userId);

      alert(`Successfully booked ${successfulBookings.length} services!`);
      onBookingSuccess(successfulBookings);
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.error || "Failed to book services");
    } finally {
      setLoading(false);
    }
  };

  // Safe price display function
  const getSafePrice = (item) => {
    try {
      if (!item || !item.service) return 0;

      let price = item.service.price;
      if (price === undefined || price === null) return 0;

      const numericPrice = Number(price);
      return isNaN(numericPrice) ? 0 : numericPrice;
    } catch (error) {
      console.error("Error getting price for item:", item, error);
      return 0;
    }
  };

  // Safe subtotal display
  const displaySubtotal = () => {
    try {
      return typeof subtotal === "number" ? subtotal.toFixed(0) : "0";
    } catch (error) {
      console.error("Error displaying subtotal:", error);
      return "0";
    }
  };

  // Show login prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Checkout
          </h1>

          <div className="bg-white rounded-lg p-12 text-center">
            <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Please Log In
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to proceed with checkout.
            </p>
            <button
              onClick={onReturnToCart}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Checkout
          </h1>

          <div className="bg-white rounded-lg p-12 text-center">
            <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some services to proceed with checkout.
            </p>
            <button
              onClick={onReturnToCart}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Checkout</h1>

        {/* Warning for items without event details */}
        {itemsWithoutDetails > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">
                  {itemsWithoutDetails} item{itemsWithoutDetails > 1 ? "s" : ""}{" "}
                  missing event details
                </p>
                <p className="text-red-700 text-sm mt-1">
                  Click on items to add event details before booking.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CheckoutItem
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onRemove={handleRemoveItem}
                showActions={showActionsId === item.id}
                onToggleActions={() =>
                  setShowActionsId(showActionsId === item.id ? null : item.id)
                }
              />
            ))}

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({cartItems.length} items)
                  </span>
                  <span className="text-gray-900 font-medium">
                    KES {displaySubtotal()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between">
                <span className="text-gray-900 font-bold text-lg">Total</span>
                <span className="text-blue-600 font-bold text-lg">
                  KES {displaySubtotal()}
                </span>
              </div>

              <button
                onClick={handleBookServices}
                disabled={
                  loading || cartItems.length === 0 || itemsWithoutDetails > 0
                }
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mb-3"
              >
                {loading
                  ? "Booking..."
                  : itemsWithoutDetails > 0
                  ? `Complete Event Details to Book`
                  : `Book All Services (${cartItems.length})`}
              </button>

              <div className="text-center text-sm">
                <span className="text-gray-600">or </span>
                <button
                  onClick={onReturnToCart}
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  Return to cart
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Customer Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      <Service
        open={isModalOpen}
        onClose={handleCloseModal}
        service={editingItem}
        onAddToCart={handleUpdateCart}
        isEditing={true}
      />
    </div>
  );
}

// Separate CheckoutItem component for better organization
function CheckoutItem({
  item,
  onEdit,
  onRemove,
  showActions,
  onToggleActions,
}) {
  const { service, event_date, event_time, event_location, has_event_details } =
    item;

  // Safe price display
  const getSafePrice = () => {
    try {
      if (!service || !service.price) return 0;
      const price = Number(service.price);
      return isNaN(price) ? 0 : price;
    } catch (error) {
      return 0;
    }
  };

  const price = getSafePrice();

  const getCategoryDisplay = () => {
    if (service.category === "audio" && service.audio_category) {
      const audioSubcategories = {
        beat_making: "Beat Making",
        sound_recording: "Sound Recording",
        mixing: "Mixing",
        mastering: "Mastering",
        music_video: "Music Video Production",
      };
      return (
        audioSubcategories[service.audio_category] || service.audio_category
      );
    }

    const categoryConfig = {
      "photo-video": "Photo & Video",
      audio: "Music Production",
      graphic: "Graphic Design",
      broadcasting: "Digital Broadcasting",
    };

    return categoryConfig[service.category] || service.category;
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 relative cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={onToggleActions}
    >
      {/* Status Badge */}
      <div
        className={`absolute -top-2 -left-2 px-2 py-1 rounded-full text-xs font-medium ${
          has_event_details
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {has_event_details ? "Details Added" : "Needs Details"}
      </div>

      {/* Image */}
      <img
        src={service.image}
        alt={service.title}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-900 font-medium text-sm mb-1">
          {service.title}
        </h3>
        <p className="text-blue-600 text-xs font-semibold mb-2">
          {getCategoryDisplay()}
        </p>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">
          {service.description}
        </p>

        {/* Event Details */}
        {has_event_details ? (
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{event_time}</span>
            </div>
            {event_location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate">{event_location}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <AlertCircle size={12} />
            <span>Click to add event details</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <span className="text-gray-900 font-semibold text-sm block">
          KES {price.toFixed(0)}
        </span>
      </div>

      {/* Action Buttons - Show on click */}
      {showActions && (
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors shadow-sm"
            title="Edit event details"
          >
            <Edit size={12} className="text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item);
            }}
            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors shadow-sm"
            title="Remove from cart"
          >
            <Trash2 size={12} className="text-red-600" />
          </button>
        </div>
      )}

      {/* Click hint for mobile */}
      {!showActions && (
        <div className="absolute right-2 top-2 opacity-60">
          <Edit size={14} className="text-gray-400" />
        </div>
      )}
    </div>
  );
}
