import React, { useState, useEffect, useCallback } from "react";
import { Search, Clear, Download } from "@mui/icons-material";
import BookingsTable from "./BookingsTable";
import BookingModals from "./BookingModals";
import API from "../../../api";
import {
  BOOKING_STATUS,
  formatBookings,
  handleUpdate,
  handleDelete,
  handleDeleteConfirm,
  handleUpdateConfirm,
  downloadBookingsPdf,
} from "../../../utils/constants";

const CancelledBookings = () => {
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Search and pagination state
  const [filters, setFilters] = useState({
    username: "",
    service: "",
    event_location: "",
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    totalCount: 0,
  });

  // Modal states
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);

  const loadBookings = useCallback(
    async (searchFilters = filters, paginationParams = pagination) => {
      try {
        setLoading(true);

        // Prepare API parameters
        const params = {
          action: "bookings",
          status: BOOKING_STATUS.CANCELLED,
          page: paginationParams.page + 1, // Django uses 1-based pagination
          page_size: paginationParams.rowsPerPage,
        };

        // Add search filters (excluding empty values)
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value && value.trim()) {
            params[key] = value.trim();
          }
        });

        const response = await API.get("/admin-dashboard/", { params });

        console.log("API Response:", response.data);
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        // Handle both paginated and non-paginated responses
        let bookings, totalCount;

        if (response.data.results) {
          // Paginated response
          bookings = response.data.results || [];
          totalCount = response.data.count || 0;
        } else {
          // Non-paginated response (fallback)
          bookings = response.data || [];
          totalCount = bookings.length;
        }

        console.log("Total bookings received:", bookings.length);
        console.log("Total count:", totalCount);

        const formattedBookings = formatBookings(bookings);
        setCancelledBookings(formattedBookings);

        // Update pagination with total count
        setPagination((prev) => ({
          ...prev,
          totalCount: totalCount,
        }));

        setError(null);
      } catch (err) {
        console.error("Failed to load cancelled bookings", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination]
  );

  // Initial load
  useEffect(() => {
    loadBookings();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Handle filter changes with debouncing
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      const resetPagination = { ...pagination, page: 0 };
      setPagination(resetPagination);
      loadBookings(newFilters, resetPagination);
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);
  };

  // Handle immediate search
  const handleSearchClick = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const resetPagination = { ...pagination, page: 0 };
    setPagination(resetPagination);
    loadBookings(filters, resetPagination);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      username: "",
      service: "",
      event_location: "",
    };
    setFilters(clearedFilters);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const resetPagination = { ...pagination, page: 0 };
    setPagination(resetPagination);
    loadBookings(clearedFilters, resetPagination);
  };

  // Handle pagination changes
  const handlePageChange = (event, newPage) => {
    const newPagination = { ...pagination, page: newPage };
    setPagination(newPagination);
    loadBookings(filters, newPagination);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const newPagination = {
      ...pagination,
      rowsPerPage: newRowsPerPage,
      page: 0, // Reset to first page when changing page size
    };
    setPagination(newPagination);
    loadBookings(filters, newPagination);
  };

  // Modal handlers
  const handleEditClick = (booking) =>
    handleUpdate(
      booking,
      cancelledBookings,
      setSelectedBooking,
      setUpdateModalOpen
    );

  const handleDeleteClick = (booking) =>
    handleDelete(
      booking,
      cancelledBookings,
      setSelectedBooking,
      setDeleteModalOpen
    );

  const handleConfirmUpdate = (updatedBooking) =>
    handleUpdateConfirm(
      updatedBooking,
      () => loadBookings(filters, pagination), // Reload with current filters and pagination
      setSnackbar,
      setUpdateModalOpen,
      setSubmitting
    );

  const handleConfirmDelete = (booking) =>
    handleDeleteConfirm(
      booking,
      cancelledBookings,
      setCancelledBookings,
      setSnackbar,
      setDeleteModalOpen,
      setSubmitting,
      () => loadBookings(filters, pagination) // Reload after delete
    );

  const handleDownloadPdf = () => {
    downloadBookingsPdf({
      endpoint: "/admin-dashboard/",
      filters: {
        status: BOOKING_STATUS.CANCELLED,
        username: filters.username,
        service: filters.service,
        event_location: filters.event_location,
      },
      pagination: {
        page: pagination.page,
        rowsPerPage: pagination.rowsPerPage,
      },
      defaultFilename: "Offworldmedia_Cancelled_Bookings.pdf",
    }).then((res) => {
      if (res.success) {
        setSnackbar({
          open: true,
          message: "PDF downloaded successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to download PDF",
          severity: "error",
        });
      }
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value.trim()
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="my-4 sm:my-6 md:my-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6"></div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Search & Filter
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Username Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by username..."
                value={filters.username}
                onChange={(e) => handleFilterChange("username", e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {filters.username && (
                <button
                  onClick={() => handleFilterChange("username", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <Clear className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                Username
              </label>
            </div>

            {/* Service Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by service..."
                value={filters.service}
                onChange={(e) => handleFilterChange("service", e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {filters.service && (
                <button
                  onClick={() => handleFilterChange("service", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <Clear className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                Service
              </label>
            </div>

            {/* Event Location Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by location..."
                value={filters.event_location}
                onChange={(e) =>
                  handleFilterChange("event_location", e.target.value)
                }
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {filters.event_location && (
                <button
                  onClick={() => handleFilterChange("event_location", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <Clear className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                Event Location
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSearchClick}
                disabled={loading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Search className="w-4 h-4" />
                Search
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  disabled={loading}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <Clear className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-xs sm:text-sm text-gray-600">
              {loading
                ? "Loading..."
                : `Showing ${cancelledBookings.length} of ${pagination.totalCount} cancelled bookings`}
            </p>

            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <BookingsTable
              bookings={cancelledBookings}
              bookingType="cancelled"
              onUpdate={handleEditClick}
              onDelete={handleDeleteClick}
              loading={loading}
            />
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-700 whitespace-nowrap">
                  Rows per page:
                </span>
                <select
                  value={pagination.rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page info and navigation */}
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm text-gray-700">
                  {pagination.page * pagination.rowsPerPage + 1}–
                  {Math.min(
                    (pagination.page + 1) * pagination.rowsPerPage,
                    pagination.totalCount
                  )}{" "}
                  of {pagination.totalCount}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={(e) => handlePageChange(e, 0)}
                    disabled={pagination.page === 0}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="First page"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => handlePageChange(e, pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => handlePageChange(e, pagination.page + 1)}
                    disabled={
                      pagination.page >=
                      Math.ceil(
                        pagination.totalCount / pagination.rowsPerPage
                      ) -
                        1
                    }
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) =>
                      handlePageChange(
                        e,
                        Math.ceil(
                          pagination.totalCount / pagination.rowsPerPage
                        ) - 1
                      )
                    }
                    disabled={
                      pagination.page >=
                      Math.ceil(
                        pagination.totalCount / pagination.rowsPerPage
                      ) -
                        1
                    }
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Last page"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModals
        updateOpen={updateModalOpen}
        deleteOpen={deleteModalOpen}
        onUpdateClose={() => setUpdateModalOpen(false)}
        onDeleteClose={() => setDeleteModalOpen(false)}
        onUpdateConfirm={handleConfirmUpdate}
        onDeleteConfirm={handleConfirmDelete}
        updateBooking={selectedBooking}
        isLoading={submitting}
      />

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              snackbar.severity === "success"
                ? "bg-green-500 text-white"
                : snackbar.severity === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <span className="text-sm sm:text-base">{snackbar.message}</span>
            <button
              onClick={handleSnackbarClose}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Clear className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CancelledBookings;
