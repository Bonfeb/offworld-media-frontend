import { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMessage, faStar, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { Typography, CircularProgress } from "@mui/material";

const DashboardContent = () => {
  const { username } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_bookings: 0,
      unpaid_bookings: 0,
      paid_bookings: 0,
      completed_bookings: 0,
      cancelled_bookings: 0,
    },
    percentages: {
      paid: 0,
      unpaid: 0,
      completed: 0,
      cancelled: 0,
    },
    recentBookings: [],
    recentReviews: [],
    recentMessages: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out after 20 seconds"));
          }, 20000);
        });
        const response = await Promise.race([
          API.get("/admin-dashboard/", {
            withCredentials: true,
          }),
          timeoutPromise,
        ]);

        const {
          recent_bookings,
          recent_reviews,
          recent_messages,
          stats,
          percentages,
        } = response.data;
        setDashboardData({
          stats,
          percentages,
          recentBookings: recent_bookings?.slice(0, 3) || [],
          recentReviews: recent_reviews?.slice(0, 3) || [],
          recentMessages: recent_messages?.slice(0, 3) || [],
        });

        setError(null);
      } catch (err) {
        if (err.response) {
        } else if (err.request) {
        } else {
        }
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
      const hours = Math.floor(interval);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    interval = seconds / 60;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  // Stats Card Component
  const StatsCard = ({ icon, value, label, color }) => (
    <div className="bg-surface rounded-xl shadow-lg border border-border p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xl lg:text-2xl font-bold text-foreground">
            {value}
          </div>
          <div className="text-muted-600 text-xs mt-1">{label}</div>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
          style={{ backgroundColor: color }}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );

  // Booking type colors for professional pie chart
  const bookingTypeColors = {
    paid: "#48bb78", // Green
    unpaid: "#f6ad55", // Orange
    completed: "#4299e1", // Blue
    cancelled: "#f56565", // Red
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress className="text-foreground" />
        <div className="text-foreground ml-4">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive text-destructive-foreground p-4 rounded-lg mb-6">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8 text-muted-600">No data available</div>
    );
  }

  const { stats, percentages, recentBookings, recentReviews, recentMessages } =
    dashboardData;

  return (
    <div className="space-y-6 min-h-screen">
      {/* Stats Grid */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatsCard
          icon={faCalendarAlt}
          value={stats?.total_bookings || 0}
          label="Total Bookings"
          color="#4299e1"
        />
        <StatsCard
          icon={faCalendarAlt}
          value={stats?.unpaid_bookings || 0}
          label="Unpaid Bookings"
          color="#f6ad55"
        />
        <StatsCard
          icon={faCalendarAlt}
          value={stats?.paid_bookings || 0}
          label="Paid Bookings"
          color="#48bb78"
        />
        <StatsCard
          icon={faCalendarAlt}
          value={stats?.completed_bookings || 0}
          label="Completed Bookings"
          color="#00b8c8"
        />
        <StatsCard
          icon={faCalendarAlt}
          value={stats?.cancelled_bookings || 0}
          label="Cancelled Bookings"
          color="#f56565"
        />
      </div>

      {/* Main Content Row - All cards in one row on medium+ screens */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Column 1 - Booking Stats */}
        <div className="bg-surface rounded-xl p-6 shadow-lg border border-border xl:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-sm" />
            </div>
            <Typography variant="h6" className="text-foreground">
              Booking Stats
            </Typography>
          </div>
          
          <div className="flex justify-center my-4">
            <div className="relative w-40 h-40">
              {/* Multi-colored pie chart */}
              <svg width="160" height="160" viewBox="0 0 32 32" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="none"
                  stroke="#e8eaed"
                  strokeWidth="1"
                />
                
                {/* Paid segment */}
                <circle
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="none"
                  stroke={bookingTypeColors.paid}
                  strokeWidth="3"
                  strokeDasharray={`${percentages?.paid || 0} ${100 - (percentages?.paid || 0)}`}
                  strokeDashoffset="0"
                />
                
                {/* Unpaid segment */}
                <circle
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="none"
                  stroke={bookingTypeColors.unpaid}
                  strokeWidth="3"
                  strokeDasharray={`${percentages?.unpaid || 0} ${100 - (percentages?.unpaid || 0)}`}
                  strokeDashoffset={-(percentages?.paid || 0)}
                />
                
                {/* Completed segment */}
                <circle
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="none"
                  stroke={bookingTypeColors.completed}
                  strokeWidth="3"
                  strokeDasharray={`${percentages?.completed || 0} ${100 - (percentages?.completed || 0)}`}
                  strokeDashoffset={-(percentages?.paid || 0) - (percentages?.unpaid || 0)}
                />
                
                {/* Cancelled segment */}
                <circle
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="none"
                  stroke={bookingTypeColors.cancelled}
                  strokeWidth="3"
                  strokeDasharray={`${percentages?.cancelled || 0} ${100 - (percentages?.cancelled || 0)}`}
                  strokeDashoffset={-(percentages?.paid || 0) - (percentages?.unpaid || 0) - (percentages?.completed || 0)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xl font-bold text-center text-foreground">
                  {stats?.total_bookings || 0}
                  <div className="text-sm text-muted-600 font-normal">
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mt-6">
            {[
              {
                label: "Paid",
                value: percentages?.paid || 0,
                color: bookingTypeColors.paid,
                count: stats?.paid_bookings || 0,
              },
              {
                label: "Unpaid",
                value: percentages?.unpaid || 0,
                color: bookingTypeColors.unpaid,
                count: stats?.unpaid_bookings || 0,
              },
              {
                label: "Completed",
                value: percentages?.completed || 0,
                color: bookingTypeColors.completed,
                count: stats?.completed_bookings || 0,
              },
              {
                label: "Cancelled",
                value: percentages?.cancelled || 0,
                color: bookingTypeColors.cancelled,
                count: stats?.cancelled_bookings || 0,
              },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 hover:bg-muted-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="text-sm text-foreground">{item.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">
                    {item.value}%
                  </div>
                  <div className="text-xs text-muted-600">
                    {item.count} bookings
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 - Recent Bookings */}
        <div className="bg-surface rounded-xl p-6 shadow-lg border border-border xl:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center">
              <FontAwesomeIcon icon={faMessage} className="text-white text-sm" />
            </div>
            <Typography variant="h6" className="text-foreground">
              Recent Bookings
            </Typography>
          </div>
          
          <div className="space-y-4">
            {recentBookings?.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center p-3 bg-muted-50 rounded-lg hover:bg-muted-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-semibold text-sm truncate">
                      {booking.service?.category || "Unknown Service"}
                    </div>
                    <div className="text-xs text-muted-600 truncate">
                      {booking.user?.username || "Unknown User"} • {formatDate(booking.event_date)}
                    </div>
                  </div>
                  <span 
                    className="px-2 py-1 text-xs rounded-full text-white font-medium whitespace-nowrap ml-2"
                    style={{ 
                      backgroundColor: 
                        booking.status === 'paid' ? bookingTypeColors.paid :
                        booking.status === 'unpaid' ? bookingTypeColors.unpaid :
                        booking.status === 'completed' ? bookingTypeColors.completed :
                        booking.status === 'cancelled' ? bookingTypeColors.cancelled :
                        '#6e7485'
                    }}
                  >
                    {booking.status || "Unknown"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted-600 text-center py-8">
                No recent bookings found
              </div>
            )}
          </div>
        </div>

        {/* Column 3 - Recent Reviews */}
        <div className="bg-surface rounded-xl p-6 shadow-lg border border-border xl:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-premium-gold flex items-center justify-center">
              <FontAwesomeIcon icon={faStar} className="text-white text-sm" />
            </div>
            <Typography variant="h6" className="text-foreground">
              Recent Reviews
            </Typography>
          </div>
          
          <div className="space-y-4">
            {recentReviews?.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review.id} className="p-3 bg-muted-50 rounded-lg hover:bg-muted-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-foreground font-semibold text-sm">
                      {review.user?.username || "Unknown User"}
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xs ${
                            star <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-muted-600 text-sm italic line-clamp-2">
                    "{review.comment || "No comment"}"
                  </div>
                  <div className="text-xs text-muted-500 mt-2">
                    {formatDate(review.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-600 text-center py-8">
                No recent reviews found
              </div>
            )}
          </div>
        </div>

        {/* Column 4 - Recent Messages */}
        <div className="bg-surface rounded-xl p-6 shadow-lg border border-border xl:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cool-teal flex items-center justify-center">
              <FontAwesomeIcon icon={faEnvelope} className="text-white text-sm" />
            </div>
            <Typography variant="h6" className="text-foreground">
              Recent Messages
            </Typography>
          </div>
          
          <div className="space-y-4">
            {recentMessages?.length > 0 ? (
              recentMessages.map((message) => (
                <div key={message.id} className="p-3 bg-muted-50 rounded-lg hover:bg-muted-100 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-foreground font-semibold text-sm">
                      {message.name || "Unknown User"}
                    </div>
                    {message.is_new && (
                      <span className="bg-electric-blue text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-muted-600 text-sm line-clamp-2">
                    "{message.content || "No content"}"
                  </div>
                  <div className="text-xs text-muted-500 mt-2">
                    {message.created_at
                      ? timeAgo(message.created_at)
                      : "Unknown date"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-600 text-center py-8">
                No recent messages found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;