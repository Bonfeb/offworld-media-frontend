import {
  ShoppingCart,
  Calendar,
  Star,
  MessageCircle,
  ThumbsUp,
  Mail,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const Overview = ({
  data,
  loading,
  error,
  cart,
  bookings,
  user,
  onRemoveFromCart,
  onCancelBooking,
  onPayBooking,
  onBookService,
  onUpdateBooking,
  bookingLoading,
  bookingServiceId,
  cancelLoading,
  cancelBookingId,
  updateLoading,
  updateBookingId,
  removeLoading,
  removeServiceId,
  onTabChange,
}) => {
  const [localCartItems, setLocalCartItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID and load their cart items from localStorage
  useEffect(() => {
    const loadUserCart = () => {
      try {
        // Get current user ID from props or session
        const userId = user?.id || data?.user?.id;
        setCurrentUserId(userId);

        if (userId) {
          // Use the CartConstants to get user-specific cart key
          const cartKey = CartConstants.getCartKey(userId);
          const savedCart = localStorage.getItem(cartKey);

          if (savedCart) {
            const cartItems = JSON.parse(savedCart);
            setLocalCartItems(cartItems);
          } else {
            setLocalCartItems([]);
          }
        } else {
          setLocalCartItems([]);
        }
      } catch (error) {
        setLocalCartItems([]);
      }
    };

    loadUserCart();

    // Listen for storage changes (in case cart is updated in other tabs)
    const handleStorageChange = (e) => {
      if (currentUserId && e.key === CartConstants.getCartKey(currentUserId)) {
        loadUserCart();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Set up cart callback for real-time updates within the same tab
    if (currentUserId) {
      CartConstants.setCartCallback(currentUserId, (items) => {
        setLocalCartItems(items);
      });
    }

    // Cleanup
    return () => {
      if (currentUserId) {
        CartConstants.removeCartCallback(currentUserId);
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, data?.user, currentUserId]);

  // Also update when user data changes
  useEffect(() => {
    if (user?.id && user.id !== currentUserId) {
      setCurrentUserId(user.id);
    }
  }, [user, currentUserId]);

  if (loading && !data) {
    return (
      <div className="text-center py-8 text-foreground">
        Loading overview...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-error">{error}</div>;
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-600">No data available</div>
    );
  }

  // Use props data or fallback to data prop from backend
  const userData = user || data.user;
  const bookingsData = bookings || data.bookings;
  const reviewsData = data.reviews || [];
  const messagesData = data.messages || [];
  const totalReviews = data.total_reviews || 0;
  const totalMessages = data.total_messages || 0;

  // Use localStorage cart items (user-specific) instead of backend cart
  const cartData = localCartItems;
  const cartItemsCount = cartData.length;

  // Calculate booking statistics from backend data
  const totalBookings = Object.values(bookingsData || {}).reduce(
    (total, bookingArray) => total + (bookingArray?.length || 0),
    0
  );
  const unpaidBookingsCount = bookingsData?.unpaid?.length || 0;
  const completedBookingsCount = bookingsData?.completed?.length || 0;

  const stats = [
    {
      title: "Cart Items",
      value: cartItemsCount,
      icon: ShoppingCart,
      color: "bg-electric-blue",
      textColor: "text-white",
      description: "Services in your cart",
      onClick: () => handleCardClick("cart"),
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      color: "bg-cool-teal",
      textColor: "text-white",
      description: "All your bookings",
      onClick: () => onTabChange?.("bookings"),
    },
    {
      title: "Unpaid Bookings",
      value: unpaidBookingsCount,
      icon: Calendar,
      color: "bg-warning",
      textColor: "text-foreground",
      description: "Pending payment",
      onClick: () => onTabChange?.("bookings"),
    },
    {
      title: "Completed Bookings",
      value: completedBookingsCount,
      icon: Star,
      color: "bg-premium-gold",
      textColor: "text-foreground",
      description: "Successfully completed",
      onClick: () => onTabChange?.("bookings"),
    },
  ];

  // Get recent unpaid bookings (limited to 3)
  const recentUnpaidBookings = bookingsData?.unpaid?.slice(0, 3) || [];

  // Get recent cart items (limited to 3)
  const recentCartItems = cartData?.slice(0, 3) || [];

  // Get recent reviews (limited to 3)
  const recentReviews = reviewsData.slice(0, 3);

  // Get recent messages (limited to 3)
  const recentMessages = messagesData.slice(0, 3);

  // Check for new/unread messages based on status
  const hasNewMessages = messagesData.some(
    (message) => message.status === "unread"
  );

  // Handle card clicks
  const handleCardClick = (cardType) => {
    switch (cardType) {
      case "cart":
        // Navigate to Cart component (separate route)
        window.location.href = "/cart";
        break;
      case "bookings":
        onTabChange?.("bookings");
        break;
      case "messages":
        onTabChange?.("messages");
        break;
      case "reviews":
        onTabChange?.("reviews");
        break;
      default:
        break;
    }
  };

  // Handle individual cart item click (for editing)
  const handleCartItemClick = (item) => {
    // Optionally open edit modal or navigate to cart with edit mode
    window.location.href = "/cart";
  };

  // Handle individual booking click
  const handleBookingItemClick = (booking) => {
    // Navigate to bookings tab, could potentially highlight this booking
    onTabChange?.("bookings");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <button className="text-sm text-red-600">
          Logout, {userData?.username || "User"}!
        </button>
      </div>

      {/* Stats Grid */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-600">
                  {stat.title}
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-500 mt-1">
                  {stat.description}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${stat.color} ${stat.textColor} flex-shrink-0`}
              >
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Row 1 */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Bookings Card */}
        <div
          className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
          onClick={() => handleCardClick("bookings")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-electric-blue" />
              <h3 className="text-lg font-semibold text-foreground">
                Recent Bookings
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-electric-blue text-white px-2 py-1 rounded-full">
                {unpaidBookingsCount} unpaid
              </span>
              <ChevronRight
                size={16}
                className="text-muted-400 group-hover:text-electric-blue transition-colors"
              />
            </div>
          </div>
          <div className="space-y-3">
            {recentUnpaidBookings.length > 0 ? (
              recentUnpaidBookings.map((booking, index) => (
                <div
                  key={booking.id || index}
                  className="flex items-center justify-between p-3 bg-muted-50 rounded-lg hover:bg-muted-100 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleBookingItemClick(booking);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {booking.service?.category || `Booking #${booking.id}`}
                    </p>
                    <p className="text-sm text-muted-600 truncate">
                      {booking.event_date} • {booking.event_time}
                    </p>
                    <p className="text-xs text-muted-500 truncate mt-1">
                      {booking.event_location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className="px-2 py-1 bg-warning bg-opacity-20 text-warning text-xs rounded-full whitespace-nowrap">
                      Unpaid
                    </span>
                    {booking.service?.price && (
                      <span className="text-xs font-semibold text-premium-gold">
                        KSH {booking.service.price}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 group">
                <Calendar className="w-12 h-12 text-muted-300 mx-auto mb-2 group-hover:text-electric-blue transition-colors" />
                <p className="text-muted-500 group-hover:text-foreground transition-colors">
                  No recent bookings
                </p>
                <p className="text-xs text-muted-400 mt-1 group-hover:text-muted-500 transition-colors">
                  Your unpaid bookings will appear here
                </p>
              </div>
            )}
          </div>
          {totalBookings > 3 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-500 text-center group-hover:text-muted-600 transition-colors">
                Showing 3 of {unpaidBookingsCount} unpaid bookings
              </p>
            </div>
          )}
        </div>

        {/* Cart Summary Card */}
        <div
          className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
          onClick={() => handleCardClick("cart")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-cool-teal" />
              <h3 className="text-lg font-semibold text-foreground">
                Cart Items
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-cool-teal text-white px-2 py-1 rounded-full">
                {cartItemsCount} items
              </span>
              <ChevronRight
                size={16}
                className="text-muted-400 group-hover:text-cool-teal transition-colors"
              />
            </div>
          </div>
          <div className="space-y-3">
            {recentCartItems.length > 0 ? (
              recentCartItems.map((item, index) => (
                <div
                  key={item.id || item.service?.id || index}
                  className="flex items-center justify-between p-3 bg-muted-50 rounded-lg hover:bg-muted-100 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleCartItemClick(item);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {item.service?.title ||
                        item.service?.category ||
                        "Service"}
                    </p>
                    <p className="text-sm text-muted-600">
                      KSH {item.service?.price || 0}
                    </p>
                    {item.event_date && (
                      <p className="text-xs text-muted-500 truncate mt-1">
                        {item.event_date} • {item.event_time}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    {item.added_at && (
                      <span className="text-xs text-muted-500 whitespace-nowrap">
                        Added: {new Date(item.added_at).toLocaleDateString()}
                      </span>
                    )}
                    {item.event_location && (
                      <span className="text-xs text-muted-400">
                        {item.event_location}
                      </span>
                    )}
                    {!item.has_event_details && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                        Needs Details
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 group">
                <ShoppingCart className="w-12 h-12 text-muted-300 mx-auto mb-2 group-hover:text-cool-teal transition-colors" />
                <p className="text-muted-500 group-hover:text-foreground transition-colors">
                  Your cart is empty
                </p>
                <p className="text-xs text-muted-400 mt-1 group-hover:text-muted-500 transition-colors">
                  Add services to your cart to see them here
                </p>
              </div>
            )}
          </div>
          {cartItemsCount > 3 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-500 text-center group-hover:text-muted-600 transition-colors">
                Showing 3 of {cartItemsCount} cart items
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Row 2 */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Reviews Card */}
        <div
          className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
          onClick={() => handleCardClick("reviews")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ThumbsUp size={20} className="text-premium-gold" />
              <h3 className="text-lg font-semibold text-foreground">
                Recent Reviews
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-premium-gold text-white px-2 py-1 rounded-full">
                {totalReviews} total
              </span>
              <ChevronRight
                size={16}
                className="text-muted-400 group-hover:text-premium-gold transition-colors"
              />
            </div>
          </div>
          <div className="space-y-3">
            {recentReviews.length > 0 ? (
              recentReviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className="p-3 bg-muted-50 rounded-lg hover:bg-muted-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground truncate">
                      {review.user?.username || "You"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={14}
                          className={
                            starIndex < (review.rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-600 line-clamp-2">
                    "{review.comment || "No comment provided"}"
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-500">
                      {review.service?.category || "Service"}
                    </p>
                    <p className="text-xs text-muted-500">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "Unknown date"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 group">
                <ThumbsUp className="w-12 h-12 text-muted-300 mx-auto mb-2 group-hover:text-premium-gold transition-colors" />
                <p className="text-muted-500 group-hover:text-foreground transition-colors">
                  No reviews yet
                </p>
                <p className="text-xs text-muted-400 mt-1 group-hover:text-muted-500 transition-colors">
                  Your reviews will appear here
                </p>
              </div>
            )}
          </div>
          {totalReviews > 3 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-500 text-center group-hover:text-muted-600 transition-colors">
                Showing 3 of {totalReviews} reviews
              </p>
            </div>
          )}
        </div>

        {/* Recent Messages Card */}
        <div
          className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
          onClick={() => handleCardClick("messages")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-electric-blue" />
              <h3 className="text-lg font-semibold text-foreground">
                Recent Messages
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {hasNewMessages && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
              <span className="text-xs bg-electric-blue text-white px-2 py-1 rounded-full">
                {totalMessages} total
              </span>
              <ChevronRight
                size={16}
                className="text-muted-400 group-hover:text-electric-blue transition-colors"
              />
            </div>
          </div>
          <div className="space-y-3">
            {recentMessages.length > 0 ? (
              recentMessages.map((message, index) => (
                <div
                  key={message.id || index}
                  className="p-3 bg-muted-50 rounded-lg hover:bg-muted-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {message.name || "Anonymous"}
                      </p>
                      {message.status === "unread" && (
                        <span className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-500 text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <Mail size={14} className="text-muted-400" />
                  </div>
                  <p className="text-sm text-muted-600 line-clamp-2">
                    "{message.content || message.message || "No content"}"
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-500">
                      {message.subject || "No subject"}
                    </p>
                    <p className="text-xs text-muted-500">
                      {message.created_at || message.sent_at
                        ? new Date(
                            message.created_at || message.sent_at
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 group">
                <MessageCircle className="w-12 h-12 text-muted-300 mx-auto mb-2 group-hover:text-electric-blue transition-colors" />
                <p className="text-muted-500 group-hover:text-foreground transition-colors">
                  No messages yet
                </p>
                <p className="text-xs text-muted-400 mt-1 group-hover:text-muted-500 transition-colors">
                  Your contact messages will appear here
                </p>
              </div>
            )}
          </div>
          {totalMessages > 3 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-500 text-center group-hover:text-muted-600 transition-colors">
                Showing 3 of {totalMessages} messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;

export const CartConstants = {
  // Get cart key for a specific user
  getCartKey: (userId) => {
    if (userId) {
      // Check if we have data in the old format and migrate it
      const oldKey = "service_cart";
      const newKey = `service_cart_${userId}`;

      if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
        const oldData = localStorage.getItem(oldKey);
        localStorage.setItem(newKey, oldData);
      }

      return newKey;
    }
    return "service_cart";
  },

  // Cart update callbacks by user ID
  cartCallbacks: new Map(),

  // Set callback for a specific user
  setCartCallback: (userId, callback) => {
    if (userId && callback) {
      CartConstants.cartCallbacks.set(userId, callback);
      // Immediately call callback with current cart items
      const currentItems = CartConstants.getCartItems(userId);
      callback(currentItems);
    }
  },

  // Remove callback for a user
  removeCartCallback: (userId) => {
    CartConstants.cartCallbacks.delete(userId);
  },

  // Notify all callbacks for a user
  notifyCartCallbacks: (userId, items) => {
    const callback = CartConstants.cartCallbacks.get(userId);
    if (callback) {
      callback(items);
    }
  },

  // Get cart items for a user
  getCartItems: (userId) => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(CartConstants.getCartKey(userId));
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  },

  // Add item to cart
  addToCart: (userId, serviceData) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID required" };
      }

      const currentItems = CartConstants.getCartItems(userId);
      const existingItemIndex = currentItems.findIndex(
        (item) => item.service.id === serviceData.id
      );

      let updatedItems;

      if (existingItemIndex > -1) {
        // Update existing item
        updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          event_date: serviceData.event_date,
          event_time: serviceData.event_time,
          event_location: serviceData.event_location,
          updated_at: new Date().toISOString(),
        };
      } else {
        // Add new item
        const cartItem = {
          id: Date.now(),
          service: { ...serviceData },
          event_date: serviceData.event_date,
          event_time: serviceData.event_time,
          event_location: serviceData.event_location,
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        updatedItems = [...currentItems, cartItem];
      }

      // Save to storage
      localStorage.setItem(
        CartConstants.getCartKey(userId),
        JSON.stringify(updatedItems)
      );

      // Notify callbacks
      CartConstants.notifyCartCallbacks(userId, updatedItems);

      return { success: true, data: updatedItems };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove item from cart
  removeFromCart: (userId, serviceId) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID required" };
      }

      const currentItems = CartConstants.getCartItems(userId);
      const updatedItems = currentItems.filter(
        (item) => item.service.id !== serviceId
      );

      localStorage.setItem(
        CartConstants.getCartKey(userId),
        JSON.stringify(updatedItems)
      );
      CartConstants.notifyCartCallbacks(userId, updatedItems);

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to remove from cart" };
    }
  },

  // Update cart item
  updateCartItem: (userId, serviceId, updates) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID required" };
      }

      const currentItems = CartConstants.getCartItems(userId);
      const index = currentItems.findIndex(
        (item) => item.service.id === serviceId
      );

      if (index > -1) {
        const updatedItems = [...currentItems];
        updatedItems[index] = {
          ...updatedItems[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };

        localStorage.setItem(
          CartConstants.getCartKey(userId),
          JSON.stringify(updatedItems)
        );
        CartConstants.notifyCartCallbacks(userId, updatedItems);
      }

      return { success: true, data: currentItems };
    } catch (error) {;
      return { success: false, error: "Failed to update cart item" };
    }
  },

  // Clear entire cart
  clearCart: (userId) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID required" };
      }

      localStorage.setItem(
        CartConstants.getCartKey(userId),
        JSON.stringify([])
      );
      CartConstants.notifyCartCallbacks(userId, []);

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to clear cart" };
    }
  },

  // Get cart count for a user
  getCartCount: (userId) => {
    return CartConstants.getCartItems(userId).length;
  },

  // Check if service is in cart
  isServiceInCart: (userId, serviceId) => {
    return CartConstants.getCartItems(userId).some(
      (item) => item.service.id === serviceId
    );
  },
};
