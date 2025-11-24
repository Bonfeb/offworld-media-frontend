import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  FileText,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

const Bookings = ({ data, loading, error, bookings, user }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine all bookings from different statuses
  const allBookings = [
    ...(bookings?.unpaid || []),
    ...(bookings?.paid || []),
    ...(bookings?.completed || []),
    ...(bookings?.cancelled || []),
  ];

  // Pagination calculations
  const totalBookings = allBookings.length;
  const totalPages = Math.ceil(totalBookings / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalBookings);
  const currentBookings = allBookings.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "paid":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg mx-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              My Bookings
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Manage and view all your service bookings
            </p>
          </div>
          <div className="bg-teal-50 rounded-lg px-4 py-2 border border-teal-200">
            <p className="text-teal-800 font-semibold text-sm sm:text-base">
              Total: {totalBookings} bookings
            </p>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {allBookings.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No bookings found</p>
            <p className="text-gray-500 mt-2">
              {user?.username
                ? `Hi ${user.username}, you have no bookings yet.`
                : "Your service bookings will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Table - Scrollable on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Date
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(booking)}
                    >
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          {formatDate(booking.event_date)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {booking.service?.title ||
                            booking.service?.category ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(booking);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-white px-3 sm:px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Rows info */}
                <div className="flex items-center gap-3 text-sm text-gray-700 flex-wrap">
                  <div className="text-xs sm:text-sm">
                    Showing {startIndex + 1} - {endIndex} of {totalBookings}
                  </div>
                  <div className="hidden sm:block text-gray-300">|</div>
                  <div className="text-xs sm:text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  {/* Rows per page selector */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <label htmlFor="rowsPerPage" className="whitespace-nowrap">
                      Rows:
                    </label>
                    <select
                      id="rowsPerPage"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>

                    {/* Page numbers - responsive */}
                    <div className="hidden xs:flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage <= 2) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-teal-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Status Badge */}
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedBooking.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  {selectedBooking.invoice_number && (
                    <div className="bg-gray-100 rounded-lg px-3 py-1">
                      <span className="text-sm text-gray-700 font-mono">
                        Invoice: {selectedBooking.invoice_number}
                      </span>
                    </div>
                  )}
                </div>

                {/* Service Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Service Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Service:
                        </span>
                        <p className="text-gray-900 mt-1">
                          {selectedBooking.service?.title ||
                            selectedBooking.service?.category ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Category:
                        </span>
                        <p className="text-gray-900 mt-1 capitalize">
                          {selectedBooking.service?.category || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Event Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Date:</span>
                        <span className="text-gray-900">
                          {formatDate(selectedBooking.event_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Time:</span>
                        <span className="text-gray-900">
                          {formatTime(selectedBooking.event_time)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">
                            Location:
                          </span>
                          <p className="text-gray-900 mt-1">
                            {selectedBooking.event_location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Booking Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Booking ID:
                      </span>
                      <p className="text-gray-900 font-mono mt-1">
                        {selectedBooking.id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Booked At:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {formatDateTime(selectedBooking.booked_at)}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-700">User:</span>
                      <p className="text-gray-900 mt-1">
                        {user?.username || user?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                  {selectedBooking.status === "unpaid" && (
                    <button className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                      Make Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
