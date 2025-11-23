import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Calendar,
  Clock,
  MapPin,
  Edit,
  AlertCircle,
} from "lucide-react";
import Service from "../modals/Service";
import { AuthContext } from "../context/AuthContext";
import { CartConstants } from "../utils/constants";

export default function Cart({ onBackHome, onCheckout }) {
  const [cartItems, setCartItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, userId, isAuthenticated } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && userId) {
      CartConstants.setCartCallback(userId, (items) => {
        setCartItems(items);
      });
      const items = CartConstants.getCartItems(userId);
      setCartItems(items);
    } else {
      setCartItems([]);
    }
    return () => {
      if (userId) {
        CartConstants.removeCartCallback(userId);
      }
    };
  }, [userId, isAuthenticated]);

  const handleRemove = async (serviceId) => {
    if (!isAuthenticated || !userId) {
      alert("Pleaase log in to manage your cart.");
      return;
    }
    const result = CartConstants.removeFromCart(userId, serviceId);
    if (!result.success) {
      alert(result.error || "Failed to remove item from cart");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item.service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleUpdateCart = (serviceData) => {
    if (!isAuthenticated || !userId) {
      alert("Please log in to update your cart");
      return;
    }
    CartConstants.updateCartItem(userId, serviceData.id, serviceData);
  };

  // Fixed: Ensure subtotal is always a number
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.service?.price) || 0;
    return sum + price;
  }, 0);

  const totalItems = cartItems.length;
  const itemsWithoutDetails = cartItems.filter(
    (item) => !item.has_event_details
  ).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Your Shopping Cart
          </h1>

          <div className="bg-white rounded-lg p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Please Log In
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your cart items.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Your Shopping Cart
          </h1>

          <div className="bg-white rounded-lg p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some services to get started!
            </p>
            <button
              onClick={onBackHome}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Your Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"}
          )
        </h1>

        {/* Warning for items without event details */}
        {itemsWithoutDetails > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle
                size={20}
                className="text-yellow-600 flex-shrink-0"
              />
              <div>
                <p className="text-yellow-800 font-medium">
                  {itemsWithoutDetails} item{itemsWithoutDetails > 1 ? "s" : ""}{" "}
                  missing event details
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  You'll need to provide event details for these items before
                  booking
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onEdit={handleEditItem}
            />
          ))}
        </div>

        {/* Subtotal */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-900 text-lg font-medium">Subtotal</span>
            <span className="text-gray-900 text-2xl font-bold">
              {subtotal.toFixed(0)}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Prices are in Kenyan Shillings
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronLeft size={20} />
            Continue Shopping
          </button>

          <button
            onClick={onCheckout}
            className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ChevronRight size={20} />
          </button>
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

function CartItem({ item, onRemove, onEdit }) {
  const [showActions, setShowActions] = useState(false);
  const { service, event_date, event_time, event_location, has_event_details } =
    item;

  // Fixed: Ensure price is always a number for display
  const price = Number(service?.price) || 0;

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
      className="bg-white rounded-lg p-6 flex items-start gap-4 relative cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: has_event_details ? "#10B981" : "#F59E0B" }}
      onClick={() => setShowActions(!showActions)}
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
        alt={service.category}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-900 font-medium text-lg mb-1 truncate">
          {service.title}
        </h3>
        <p className="text-blue-600 text-sm font-semibold mb-2">
          {getCategoryDisplay()}
        </p>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {service.description}
        </p>

        {/* Event Details */}
        {has_event_details ? (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{new Date(event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{event_time}</span>
            </div>
            {event_location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span className="truncate">{event_location}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertCircle size={14} />
            <span>Event details required before booking</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <span className="text-blue-600 font-bold text-lg block">
          KES {price.toFixed(0)}
        </span>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors shadow-sm"
            title="Edit item"
          >
            <Edit size={14} className="text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(service.id);
            }}
            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors shadow-sm"
            title="Remove from cart"
          >
            <X size={14} className="text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}
