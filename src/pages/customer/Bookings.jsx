import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const Bookings = ({
  data,
  loading,
  error,
  bookings,
  user, // Make sure this prop is defined
  onCancelBooking,
  onPayBooking,
  onUpdateBooking,
  cancelLoading,
  cancelBookingId,
  updateLoading,
  updateBookingId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const itemsPerPage = 10;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-electric-blue border-t-transparent mb-4"></div>
          <p className="text-muted-600 text-lg">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const bookingsData = bookings || data?.bookings;

  // Safe user data access
  const userData = user || data?.user;

  const statusConfig = {
    unpaid: {
      color: "warning",
      bgClass: "bg-warning/10",
      textClass: "text-warning",
      borderClass: "border-warning/30",
      icon: AlertCircle,
      label: "Unpaid",
    },
    paid: {
      color: "electric-blue",
      bgClass: "bg-electric-blue/10",
      textClass: "text-electric-blue",
      borderClass: "border-electric-blue/30",
      icon: CreditCard,
      label: "Paid",
    },
    completed: {
      color: "success",
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/30",
      icon: CheckCircle,
      label: "Completed",
    },
    cancelled: {
      color: "destructive",
      bgClass: "bg-destructive/10",
      textClass: "text-destructive",
      borderClass: "border-destructive/30",
      icon: XCircle,
      label: "Cancelled",
    },
  };

  const allBookings = Object.values(bookingsData || {}).flat();
  const totalPages = Math.ceil(allBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = allBookings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleShowDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          currentPage === 1
            ? "bg-muted-100 text-muted-400 cursor-not-allowed"
            : "bg-card hover:bg-electric-blue hover:text-white text-foreground border border-border"
        }`}
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      items.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-card hover:bg-electric-blue hover:text-white text-foreground border border-border transition-all"
        >
          1
        </button>
      );
      if (startPage > 2) {
        items.push(
          <span key="start-ellipsis" className="px-2 text-muted-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            page === currentPage
              ? "bg-electric-blue text-white shadow-lg"
              : "bg-card hover:bg-electric-blue hover:text-white text-foreground border border-border"
          }`}
        >
          {page}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <span key="end-ellipsis" className="px-2 text-muted-500">
            ...
          </span>
        );
      }
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-card hover:bg-electric-blue hover:text-white text-foreground border border-border transition-all"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    items.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          currentPage === totalPages
            ? "bg-muted-100 text-muted-400 cursor-not-allowed"
            : "bg-card hover:bg-electric-blue hover:text-white text-foreground border border-border"
        }`}
      >
        Next
      </button>
    );

    return items;
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bgClass} ${config.textClass} border ${config.borderClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 grid max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Bookings Overview
        </h1>
        <button className="text-sm text-red-600">
          Logout, {userData?.username || "User"}!
        </button>
      </div>
      {allBookings.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-lg border border-border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-electric-blue" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No bookings yet
            </h3>
            <p className="text-muted-600">
              Start exploring our services and make your first booking!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary to-muted-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-muted-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-foreground">
                            {booking.service?.category || "Service"}
                          </div>
                          <div className="text-xs text-muted-500 mt-1">
                            ID: #{booking.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-electric-blue" />
                          <div>
                            <div className="text-foreground font-medium">
                              {booking.event_date}
                            </div>
                            <div className="text-muted-600 text-xs flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {booking.event_time}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="w-4 h-4 text-cool-teal flex-shrink-0" />
                          <span className="line-clamp-2">
                            {booking.event_location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-foreground font-semibold">
                          <DollarSign className="w-4 h-4 text-premium-gold" />
                          {booking.service?.price
                            ? `${booking.service.price} KSH`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleShowDetails(booking)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-electric-blue bg-electric-blue/10 hover:bg-electric-blue hover:text-white rounded-lg transition-all border border-electric-blue/30"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>
                          {booking.status === "unpaid" && (
                            <>
                              <button
                                onClick={() => onPayBooking(booking)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-success hover:bg-success/90 rounded-lg transition-all shadow-sm"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Pay Now
                              </button>
                              <button
                                onClick={() =>
                                  onUpdateBooking(booking, booking.service.id)
                                }
                                disabled={
                                  updateLoading &&
                                  updateBookingId === booking.id
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-warning hover:bg-warning/90 rounded-lg transition-all shadow-sm disabled:opacity-50"
                              >
                                {updateLoading &&
                                updateBookingId === booking.id ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  "Update"
                                )}
                              </button>
                              <button
                                onClick={() => onCancelBooking(booking)}
                                disabled={
                                  cancelLoading &&
                                  cancelBookingId === booking.id
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-all shadow-sm disabled:opacity-50"
                              >
                                {cancelLoading &&
                                cancelBookingId === booking.id ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    Cancel
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border bg-muted-50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-muted-600">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(startIndex + itemsPerPage, allBookings.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {allBookings.length}
                    </span>{" "}
                    bookings
                  </div>
                  <div className="flex items-center gap-2">
                    {renderPaginationItems()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {currentBookings.map((booking) => {
              const config = statusConfig[booking.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={booking.id}
                  className="bg-card rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className={`h-2 ${config.bgClass}`}></div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {booking.service?.category || "Service"}
                        </h3>
                        <p className="text-xs text-muted-500">
                          ID: #{booking.id}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div
                          className={`w-8 h-8 rounded-lg ${config.bgClass} flex items-center justify-center`}
                        >
                          <Calendar className={`w-4 h-4 ${config.textClass}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.event_date}
                          </p>
                          <p className="text-xs text-muted-600">
                            {booking.event_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div
                          className={`w-8 h-8 rounded-lg ${config.bgClass} flex items-center justify-center`}
                        >
                          <MapPin className={`w-4 h-4 ${config.textClass}`} />
                        </div>
                        <p className="text-foreground flex-1">
                          {booking.event_location}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div
                          className={`w-8 h-8 rounded-lg ${config.bgClass} flex items-center justify-center`}
                        >
                          <DollarSign
                            className={`w-4 h-4 ${config.textClass}`}
                          />
                        </div>
                        <p className="font-semibold text-foreground">
                          {booking.service?.price
                            ? `${booking.service.price} KSH`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                      <button
                        onClick={() => handleShowDetails(booking)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-electric-blue bg-electric-blue/10 hover:bg-electric-blue hover:text-white rounded-lg transition-all border border-electric-blue/30"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {booking.status === "unpaid" && (
                        <>
                          <button
                            onClick={() => onPayBooking(booking)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-success hover:bg-success/90 rounded-lg transition-all shadow-sm"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                          <button
                            onClick={() =>
                              onUpdateBooking(booking, booking.service.id)
                            }
                            disabled={
                              updateLoading && updateBookingId === booking.id
                            }
                            className="px-4 py-2.5 text-sm font-medium text-white bg-warning hover:bg-warning/90 rounded-lg transition-all shadow-sm disabled:opacity-50"
                          >
                            {updateLoading && updateBookingId === booking.id
                              ? "Updating..."
                              : "Update"}
                          </button>
                          <button
                            onClick={() => onCancelBooking(booking)}
                            disabled={
                              cancelLoading && cancelBookingId === booking.id
                            }
                            className="px-4 py-2.5 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-all shadow-sm disabled:opacity-50"
                          >
                            {cancelLoading && cancelBookingId === booking.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="bg-card rounded-xl shadow-lg border border-border p-4">
                <div className="text-center text-sm text-muted-600 mb-4">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {renderPaginationItems()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseDetails}
            ></div>
            <div className="relative bg-card rounded-2xl shadow-2xl max-w-2xl w-full border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-muted-700 px-6 py-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Booking Details
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-muted-600 uppercase tracking-wide">
                      Booking ID
                    </label>
                    <p className="text-foreground font-bold text-lg mt-1">
                      #{selectedBooking.id}
                    </p>
                  </div>
                  <div className="bg-muted-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-muted-600 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-2">
                      <StatusBadge status={selectedBooking.status} />
                    </div>
                  </div>
                </div>

                <div className="bg-muted-50 rounded-lg p-4">
                  <label className="text-xs font-medium text-muted-600 uppercase tracking-wide">
                    Service
                  </label>
                  <p className="text-foreground font-semibold text-lg mt-1">
                    {selectedBooking.service?.category || "Service"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-electric-blue/5 rounded-lg p-4 border border-electric-blue/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-electric-blue" />
                      <label className="text-xs font-medium text-electric-blue uppercase tracking-wide">
                        Event Date
                      </label>
                    </div>
                    <p className="text-foreground font-semibold">
                      {selectedBooking.event_date}
                    </p>
                  </div>
                  <div className="bg-cool-teal/5 rounded-lg p-4 border border-cool-teal/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-cool-teal" />
                      <label className="text-xs font-medium text-cool-teal uppercase tracking-wide">
                        Event Time
                      </label>
                    </div>
                    <p className="text-foreground font-semibold">
                      {selectedBooking.event_time}
                    </p>
                  </div>
                </div>

                <div className="bg-muted-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-premium-gold" />
                    <label className="text-xs font-medium text-muted-600 uppercase tracking-wide">
                      Event Location
                    </label>
                  </div>
                  <p className="text-foreground font-medium">
                    {selectedBooking.event_location}
                  </p>
                </div>

                {selectedBooking.service?.price && (
                  <div className="bg-premium-gold/10 rounded-lg p-4 border-2 border-premium-gold/30">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-premium-gold" />
                      <label className="text-xs font-medium text-premium-gold uppercase tracking-wide">
                        Total Price
                      </label>
                    </div>
                    <p className="text-foreground font-bold text-2xl">
                      KSH {selectedBooking.service.price}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-xs font-medium text-muted-600 uppercase tracking-wide">
                      Created At
                    </label>
                    <p className="text-foreground text-sm mt-1">
                      {new Date(selectedBooking.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedBooking.updated_at && (
                    <div>
                      <label className="text-xs font-medium text-muted-600 uppercase tracking-wide">
                        Last Updated
                      </label>
                      <p className="text-foreground text-sm mt-1">
                        {new Date(selectedBooking.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-muted-50 border-t border-border flex items-center gap-3 justify-end">
                <button
                  onClick={handleCloseDetails}
                  className="px-6 py-2.5 text-sm font-medium text-foreground bg-white hover:bg-muted-100 rounded-lg transition-colors border border-border"
                >
                  Close
                </button>
                {selectedBooking?.status === "unpaid" && (
                  <button
                    onClick={() => {
                      onPayBooking(selectedBooking);
                      handleCloseDetails();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-success hover:bg-success/90 rounded-lg transition-all shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    Make Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
