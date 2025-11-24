import {
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
  bookings,
  user,
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
  onTabChange,
}) => {
  const [currentUserId, setCurrentUserId] = useState(null);

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

  // Calculate booking statistics from backend data
  const totalBookings = Object.values(bookingsData || {}).reduce(
    (total, bookingArray) => total + (bookingArray?.length || 0),
    0
  );
  const unpaidBookingsCount = bookingsData?.unpaid?.length || 0;
  const completedBookingsCount = bookingsData?.completed?.length || 0;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      color: "bg-electric-blue",
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
    {
      title: "Messages",
      value: totalMessages,
      icon: MessageCircle,
      color: "bg-cool-teal",
      textColor: "text-white",
      description: "Contact messages",
      onClick: () => onTabChange?.("messages"),
    },
  ];

  // Get recent unpaid bookings (limited to 3)
  const recentUnpaidBookings = bookingsData?.unpaid?.slice(0, 3) || [];

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

      {/* Recent Activity Cards - Responsive Grid */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Recent Activity
        </h2>

        {/* Grid that stacks on mobile, side-by-side on medium screens and up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <MessageCircle size={20} className="text-cool-teal" />
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Messages
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {hasNewMessages && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
                <span className="text-xs bg-cool-teal text-white px-2 py-1 rounded-full">
                  {totalMessages} total
                </span>
                <ChevronRight
                  size={16}
                  className="text-muted-400 group-hover:text-cool-teal transition-colors"
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
                  <MessageCircle className="w-12 h-12 text-muted-300 mx-auto mb-2 group-hover:text-cool-teal transition-colors" />
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
    </div>
  );
};

export default Overview;
