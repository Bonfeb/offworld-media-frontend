import API from "../api";

export const formatBookings = (bookings) => {
    return bookings.map((booking, index) => ({
      id: booking.id,
      user_id: booking.user.id || booking.user_id || null,
      service_id: booking.service?.id || null,
      serialNo: index + 1,
      customer: booking.user?.username || 'Unknown User',
      service: booking.service?.category || 'Unknown Service',
      audio_category: booking.service.audio_category,
      location: booking.event_location || 'N/A',
      eventDate: booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A',
      eventTime: booking.event_time || 'N/A',
      price: booking.service?.price || 0,
      status: booking.status || 'N/A',
      booked: booking.booked_at ? new Date(booking.booked_at).toLocaleString() : 'N/A',
      contact: booking.phone || null // Added rating for completed bookings
    }));
  };

  export const BOOKING_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  export const handleUpdate = (booking, bookings, setSelectedBooking, setUpdateModalOpen) => {
    console.log("Updating Booking:", booking);
    setSelectedBooking(booking)
    setUpdateModalOpen(true)
  };
  
  export const handleDelete = (booking, bookings, setSelectedBooking, setDeleteModalOpen) => {
    if (booking) {
      setSelectedBooking(booking);
      setDeleteModalOpen(true);
    }
  };
  
  export const handleUpdateConfirm = async (
    updatedBooking,
    loadBookings,
    setNotification,
    setUpdateModalOpen,
    setSubmitting
  ) => {
    setSubmitting(true);
    try {
      await API.put(`/admin-booking/${updatedBooking.id}/`, updatedBooking);
      await loadBookings(); // Refresh bookings
      setNotification({ open: true, message: "Booking updated successfully", severity: "success" });
      setUpdateModalOpen(false);
    } catch (err) {
      console.error("Failed to update booking", err);
      setNotification({ open: true, message: "Failed to update booking", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };
  
  export const handleDeleteConfirm = async (
    booking,
    bookings,
    setBookings,
    setNotification,
    setDeleteModalOpen,
    setSubmitting
  ) => {
    setSubmitting(true);
    try {
      await API.delete(`/admin-booking/${booking.id}/`);
      setBookings(bookings.filter((b) => b.id !== booking.id)); // Remove from state
      setNotification({ open: true, message: "Booking deleted successfully", severity: "success" });
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ open: true, message: "Failed to delete booking", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };
  
  export const SERVICE_CATEGORIES = {
    AUDIO: 'audio',
    GRAPHIC: 'graphic',
    PHOTO_VIDEO: 'photo-video',
    BROADCASTING: 'broadcasting',
  };

  export const handleServiceChange = (e, service, setService) => {
    const { name, value } = e.target;
    setService(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  export const handleServiceUpdate = async (serviceId, updatedService, onSuccess, onError) => {
    try {
      const response = await axios.put(`/service/${serviceId}/`, updatedService);
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      if (onError) onError(error);
      throw error;
    }
  };
  
  export const handleServiceDelete = async (serviceId, onSuccess, onError) => {
    try {
      await axios.delete(`/service/${serviceId}/`);
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      if (onError) onError(error);
      throw error;
    }
  };

  export const downloadBookingsPdf = async ({
    endpoint,
    filters = {},
    pagination = {},
    defaultFileName = 'Offworldmedia_Bookings.pdf'
  }) => {
    try {
      const queryParams = new URLSearchParams();

    // Add filters dynamically
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    // Add pagination
    if (pagination.page) queryParams.append("page", pagination.page);
    if (pagination.rowsPerPage) queryParams.append("page_size", pagination.rowsPerPage);

    // Always request PDF
    queryParams.append("pdf", "true");

    const response = await API.get(
      `${endpoint}?${queryParams.toString()}`,
      { responseType: "blob" }
    );

    let filename = defaultFileName;
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "");
    }

    // Create blob URL
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    console.error("Error downloading PDF:", err);
    return { success: false, error: err };
    }
  }

  export const CartConstants = {
    // Get cart key for a specific user
  getCartKey: (userId) =>  {
  if (userId) {
    // Check if we have data in the old format and migrate it
    const oldKey = 'service_cart';
    const newKey = `service_cart_${userId}`;
    
    if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
      const oldData = localStorage.getItem(oldKey);
      localStorage.setItem(newKey, oldData);
    }
    
    return newKey;
  }
  return 'service_cart';
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
      console.error('Error reading cart items:', error);
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
      localStorage.setItem(CartConstants.getCartKey(userId), JSON.stringify(updatedItems));

      // Notify callbacks
      CartConstants.notifyCartCallbacks(userId, updatedItems);

      return { success: true, data: updatedItems };
    } catch (error) {
      console.error("Error adding to cart:", error);
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
      const updatedItems = currentItems.filter((item) => item.service.id !== serviceId);

      localStorage.setItem(CartConstants.getCartKey(userId), JSON.stringify(updatedItems));
      CartConstants.notifyCartCallbacks(userId, updatedItems);

      return { success: true };
    } catch (error) {
      console.error("Error removing from cart:", error);
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
      const index = currentItems.findIndex((item) => item.service.id === serviceId);

      if (index > -1) {
        const updatedItems = [...currentItems];
        updatedItems[index] = {
          ...updatedItems[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };

        localStorage.setItem(CartConstants.getCartKey(userId), JSON.stringify(updatedItems));
        CartConstants.notifyCartCallbacks(userId, updatedItems);
      }

      return { success: true, data: currentItems };
    } catch (error) {
      console.error("Error updating cart item:", error);
      return { success: false, error: "Failed to update cart item" };
    }
  },
  
  // Clear entire cart
  clearCart: (userId) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID required" };
      }

      localStorage.setItem(CartConstants.getCartKey(userId), JSON.stringify([]));
      CartConstants.notifyCartCallbacks(userId, []);

      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
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
  }
  }
  