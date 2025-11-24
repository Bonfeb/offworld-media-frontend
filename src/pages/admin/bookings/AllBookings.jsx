import React, { useState, useEffect } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Delete,
  NavigateBefore,
  NavigateNext,
  Search,
  Clear,
  Dashboard,
  Event,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import BookingModals from "./BookingModals";
import API from "../../../api";

// Row component to handle the expandable functionality
function Row({ booking, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "unpaid":
        return "warning";
      case "paid":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={{ width: isMobile ? "40px" : "50px" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" className="text-xs sm:text-sm">
          {booking.user?.username || booking.user}
        </TableCell>
        {!isMobile && (
          <TableCell className="text-xs sm:text-sm">
            {booking.service?.category || booking.service}
          </TableCell>
        )}
        <TableCell className="text-xs sm:text-sm">
          {format(new Date(booking.event_date), "MMM dd, yyyy")}
        </TableCell>
        <TableCell>
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status)}
            size={isMobile ? "small" : "medium"}
            className="text-xs"
          />
        </TableCell>
        <TableCell align="right">
          <div className="flex justify-end space-x-1">
            <Tooltip title="Edit booking">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(booking)}
              >
                <Edit fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete booking">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(booking)}
              >
                <Delete fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={isMobile ? 5 : 6}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                className="text-sm sm:text-base"
              >
                Booking Details
              </Typography>
              <Table size="small" aria-label="booking details">
                <TableBody>
                  {isMobile && (
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                        className="text-xs sm:text-sm font-bold"
                      >
                        Service
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {booking.service?.category || booking.service}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      className="text-xs sm:text-sm font-bold"
                    >
                      Event Time
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {booking.event_time}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      className="text-xs sm:text-sm font-bold"
                    >
                      Event Location
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {booking.event_location}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      className="text-xs sm:text-sm font-bold"
                    >
                      Booked at
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {format(
                        new Date(booking.booked_at),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      className="text-xs sm:text-sm font-bold"
                    >
                      Customer Contact
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {booking.user?.phone || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      className="text-xs sm:text-sm font-bold"
                    >
                      Booking ID
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {booking.id}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// Custom pagination display component
function CustomPaginationDisplay({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: isMobile ? 1 : 2,
        gap: isMobile ? 1 : 2,
      }}
    >
      {!isMobile && (
        <Typography variant="body2" color="text.secondary">
          Rows per page:
        </Typography>
      )}
      <FormControl size="small" sx={{ minWidth: 80 }}>
        <Select
          value={rowsPerPage}
          onChange={(e) => onPageChange(null, 0, e.target.value)}
          displayEmpty
        >
          {[5, 10, 25, 50].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="body2" color="text.secondary">
        {page * rowsPerPage + 1}–
        {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          disabled={page === 0}
          onClick={(e) => onPageChange(e, page - 1)}
          size={isMobile ? "small" : "medium"}
        >
          <NavigateBefore />
        </IconButton>
        <IconButton
          disabled={(page + 1) * rowsPerPage >= totalCount}
          onClick={(e) => onPageChange(e, page + 1)}
          size={isMobile ? "small" : "medium"}
        >
          <NavigateNext />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Search functionality states
  const [filters, setFilters] = useState({
    user: "",
    service: "",
    event_location: "",
    status: "",
  });

  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    if (!isSearchMode) {
      fetchBookings();
    }
  }, [page, rowsPerPage, isSearchMode]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `/admin-dashboard/?action=bookings&page=${
          page + 1
        }&per_page=${rowsPerPage}`
      );

      setBookings(response.data.bookings || response.data);
      setTotalCount(response.data.total || response.data.length);
      setLoading(false);
    } catch (err) {
      setError("Failed to load bookings");
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage, newRowsPerPage = rowsPerPage) => {
    setPage(newPage);
    if (newRowsPerPage !== rowsPerPage) {
      setRowsPerPage(newRowsPerPage);
    }
  };

  // Search functionality handlers
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    setSearched(true);
    setIsSearchMode(true);
    setPage(0);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      params.append("page", "1");
      params.append("per_page", rowsPerPage.toString());

      const response = await API.get(
        `/admin-dashboard/?action=bookings${params.toString()}`
      );
      const bookingsData = response.data.bookings || response.data || [];
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(bookingsArray);
      setTotalCount(response.data.total || response.data.length);
    } catch (error) {
      setBookings([]);
      setTotalCount(0);
      setError(
        "Failed to search bookings. Kindly try again using other variables."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setFilters({
      user: "",
      service: "",
      event_location: "",
      status: "",
    });
    setSearched(false);
    setIsSearchMode(false);
    setPage(0);
    setError(null);
    fetchBookings();
  };

  // Modal handlers
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setUpdateModalOpen(true);
  };

  const handleDeleteBooking = (booking) => {
    setSelectedBooking(booking);
    setDeleteModalOpen(true);
  };

  const handleCreateClose = () => {
    setCreateModalOpen(false);
  };

  const handleUpdateClose = () => {
    setUpdateModalOpen(false);
    setSelectedBooking(null);
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCreateConfirm = (newBooking) => {
  };

  const handleUpdateConfirm = (updatedBooking) => {
  };

  const handleDeleteConfirm = (bookingId) => {
  };

  const refreshData = () => {
    if (isSearchMode) {
      handleSearch();
    } else {
      fetchBookings();
    }
  };

  // Display only the current page of bookings
  const displayedBookings = bookings || [];

  if (loading && page === 0 && !isSearchMode) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {/* Search Filters Section */}
        <Box sx={{ padding: isMobile ? 1 : 2 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                className="text-sm sm:text-base"
              >
                Search Filters
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="User"
                    name="user"
                    value={filters.user}
                    onChange={handleFilterChange}
                    size="small"
                    className="text-xs sm:text-sm"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Service"
                    name="service"
                    value={filters.service}
                    onChange={handleFilterChange}
                    size="small"
                    className="text-xs sm:text-sm"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Event Location"
                    name="event_location"
                    value={filters.event_location}
                    onChange={handleFilterChange}
                    size="small"
                    className="text-xs sm:text-sm"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    size="small"
                    className="text-xs sm:text-sm"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="unpaid">Unpaid</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </TextField>
                </Grid>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  disabled={searchLoading}
                  startIcon={
                    searchLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Search />
                    )
                  }
                  size={isMobile ? "small" : "medium"}
                  className="w-full sm:w-auto"
                >
                  {searchLoading ? "Searching..." : "Search Bookings"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearSearch}
                  startIcon={<Clear />}
                  disabled={searchLoading}
                  size={isMobile ? "small" : "medium"}
                  className="w-full sm:w-auto"
                >
                  Clear Search
                </Button>
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexDirection: isMobile ? "column" : "row",
                }}
              ></Box>
            </CardContent>
          </Card>
        </Box>

        <Divider />

        <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
          <Table
            stickyHeader
            aria-label="collapsible table"
            size={isMobile ? "small" : "medium"}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: isMobile ? "40px" : "50px" }} />
                <TableCell className="text-xs sm:text-sm font-bold">
                  Customer
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-xs sm:text-sm font-bold">
                    Service
                  </TableCell>
                )}
                <TableCell className="text-xs sm:text-sm font-bold">
                  Event Date
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-bold">
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  className="text-xs sm:text-sm font-bold"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(loading || searchLoading) && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 6} align="center">
                    <CircularProgress size={isMobile ? 24 : 30} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && !searchLoading && displayedBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 6} align="center">
                    <Alert severity="info" className="w-full">
                      <Typography variant="body2">
                        {searched && isSearchMode
                          ? "No search results found. Try different filters."
                          : "No bookings found"}
                      </Typography>
                    </Alert>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !searchLoading &&
                displayedBookings.map((booking) => (
                  <Row
                    key={booking.id}
                    booking={booking}
                    onEdit={handleEditBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <CustomPaginationDisplay
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
        />
      </Paper>

      {/* BookingModals component integration */}
      <BookingModals
        createOpen={createModalOpen}
        updateOpen={updateModalOpen}
        deleteOpen={deleteModalOpen}
        onCreateClose={handleCreateClose}
        onUpdateClose={handleUpdateClose}
        onDeleteClose={handleDeleteClose}
        onCreateConfirm={handleCreateConfirm}
        onUpdateConfirm={handleUpdateConfirm}
        onDeleteConfirm={handleDeleteConfirm}
        updateBooking={selectedBooking}
        refreshData={refreshData}
      />
    </>
  );
}
