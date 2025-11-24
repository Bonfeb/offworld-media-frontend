import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Card, Container, Row, Col, Spinner } from "react-bootstrap";
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Alert,
  TextField,
  Button,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Reviews,
} from "@mui/icons-material";
import API from "../../api";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    service: "",
    user: "",
    rating: "",
    rating__gte: "",
    rating__lte: "",
  });

  const fetchReviews = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("action", "reviews");

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          queryParams.append(key, value);
        }
      });

      const response = await API.get(
        `/admin-dashboard/?${queryParams.toString()}`
      );
      setReviews(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    fetchReviews(searchFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = Object.keys(searchFilters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    setSearchFilters(clearedFilters);
    fetchReviews({});
  };

  const hasActiveFilters = Object.values(searchFilters).some(
    (value) => value && value.toString().trim()
  );

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-64 mt-8">
        <Spinner animation="border" role="status" className="text-blue-500">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="admin-reviews mt-6 mb-8 px-4">
      {/* Header Section */}
      <Paper className="p-6 mb-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border-0">
        <Row className="items-center justify-between flex-wrap">
          {/* Title: Reviews Management */}

          <div className="flex items-center justify-center gap-3">
            <Reviews sx={{ fontSize: 32, color: "#667eea" }} />
            <Typography
              variant="h4"
              component="h1"
              className="font-bold text-gray-800 mb-0"
            >
              Reviews Management
            </Typography>
          </div>
        </Row>
      </Paper>

      {/* Search and Filter Section */}
      <Paper className="p-6 mb-6 rounded-2xl shadow-md border-0">
        <Box className="flex items-center gap-3 mb-4">
          <FilterIcon color="primary" />
          <Typography variant="h6" className="text-blue-600 font-semibold">
            Search & Filter Reviews
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="Filters Active"
              color="primary"
              size="small"
              variant="outlined"
              className="border-blue-500 text-blue-600"
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* General Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Reviews"
              placeholder="Search in comments, usernames, services..."
              value={searchFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: searchFilters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange("search", "")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="bg-white"
            />
          </Grid>

          {/* Service Filter */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Service Name"
              placeholder="Filter by service name"
              value={searchFilters.service}
              onChange={(e) => handleFilterChange("service", e.target.value)}
              InputProps={{
                endAdornment: searchFilters.service && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange("service", "")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              className="bg-white"
            />
          </Grid>

          {/* User Filter */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              placeholder="Filter by username"
              value={searchFilters.user}
              onChange={(e) => handleFilterChange("user", e.target.value)}
              InputProps={{
                endAdornment: searchFilters.user && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange("user", "")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              className="bg-white"
            />
          </Grid>

          {/* Exact Rating Filter */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth className="bg-white rounded">
              <InputLabel>Exact Rating</InputLabel>
              <Select
                value={searchFilters.rating}
                label="Exact Rating"
                onChange={(e) => handleFilterChange("rating", e.target.value)}
              >
                <MenuItem value="">
                  <em>All Ratings</em>
                </MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Minimum Rating Filter */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth className="bg-white rounded">
              <InputLabel>Minimum Rating</InputLabel>
              <Select
                value={searchFilters.rating__gte}
                label="Minimum Rating"
                onChange={(e) =>
                  handleFilterChange("rating__gte", e.target.value)
                }
              >
                <MenuItem value="">
                  <em>No Minimum</em>
                </MenuItem>
                <MenuItem value="1">1+ Stars</MenuItem>
                <MenuItem value="2">2+ Stars</MenuItem>
                <MenuItem value="3">3+ Stars</MenuItem>
                <MenuItem value="4">4+ Stars</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Maximum Rating Filter */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth className="bg-white rounded">
              <InputLabel>Maximum Rating</InputLabel>
              <Select
                value={searchFilters.rating__lte}
                label="Maximum Rating"
                onChange={(e) =>
                  handleFilterChange("rating__lte", e.target.value)
                }
              >
                <MenuItem value="">
                  <em>No Maximum</em>
                </MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="5">5- Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-2 font-semibold transition-colors"
          >
            Apply Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </Button>
        </Box>
      </Paper>

      {/* Reviews Display */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <Card.Body className="p-6">
          {error && (
            <Alert severity="error" className="rounded-lg mb-6">
              {error}
            </Alert>
          )}

          {!error && reviews.length === 0 && (
            <Alert severity="info" className="rounded-lg">
              {hasActiveFilters
                ? "No reviews match your search criteria."
                : "No reviews found."}
            </Alert>
          )}

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <Card.Body className="p-6">
                  <Row className="items-start">
                    <Col xs={12}>
                      <Box className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                        <Box className="flex items-center gap-4 flex-1">
                          <Avatar
                            src={
                              review.user?.profile_pic ||
                              "/api/placeholder/60/60"
                            }
                            alt={review.user?.name}
                            className="w-16 h-16 border-2 border-gray-200"
                          />
                          <div className="flex-1">
                            <Typography
                              variant="h6"
                              className="font-semibold text-gray-800 mb-1"
                            >
                              {review.user?.username || "Unknown User"}
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-gray-600"
                            >
                              {review.service?.category || "Unknown Service"}
                            </Typography>
                          </div>
                        </Box>
                        <Rating
                          value={review.rating}
                          readOnly
                          precision={0.5}
                          size="large"
                          className="text-yellow-400"
                        />
                      </Box>

                      <Typography
                        variant="body1"
                        className="text-gray-700 leading-relaxed mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {review.comment}
                      </Typography>

                      {review.created_at && (
                        <Typography
                          variant="caption"
                          className="text-gray-500 block mt-3 text-right"
                        >
                          Posted on{" "}
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminReviews;
