import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Calendar, 
  Music, 
  Megaphone,
  Save,
  Loader2,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import API from '../../api';

// Dynamic type configuration
const getTypeConfig = (type) => {
  const typeConfigs = {
    promotion: {
      icon: Tag,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      gradient: 'from-blue-500 to-cyan-500',
      label: 'Promotion',
      badgeColor: 'bg-blue-500'
    },
    release: {
      icon: Music,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      gradient: 'from-purple-500 to-pink-500',
      label: 'New Release',
      badgeColor: 'bg-purple-500'
    },
    event: {
      icon: Calendar,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      gradient: 'from-orange-500 to-red-500',
      label: 'Event',
      badgeColor: 'bg-orange-500'
    },
    news: {
      icon: Megaphone,
      color: 'bg-green-100 text-green-800 border-green-200',
      gradient: 'from-green-500 to-emerald-500',
      label: 'News',
      badgeColor: 'bg-green-500'
    },
    default: {
      icon: Megaphone,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      gradient: 'from-gray-500 to-gray-600',
      label: 'Announcement',
      badgeColor: 'bg-gray-500'
    }
  };

  return typeConfigs[type] || typeConfigs.default;
};

const AnnouncementForm = ({ isOpen, onClose, onSave, editingAnnouncement, isSaving }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'promotion',
    startDate: '',
    endDate: '',
    date: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData(editingAnnouncement);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        type: 'promotion',
        startDate: today,
        endDate: '',
        date: today
      });
    }
    setErrors({});
  }, [editingAnnouncement, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (formData.type === 'promotion') {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    } else {
      if (!formData.date) newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const announcement = {
      ...formData,
      id: editingAnnouncement?.id || Date.now().toString(),
    };
    onSave(announcement);
  };

  const announcementTypes = [
    { value: 'promotion', label: 'Promotion', icon: Tag },
    { value: 'release', label: 'New Release', icon: Music },
    { value: 'event', label: 'Event', icon: Calendar },
    { value: 'news', label: 'News', icon: Megaphone },
  ];

  const renderDateFields = () => {
    if (formData.type === 'promotion') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Announcement Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {announcementTypes.map((type) => {
                const IconComponent = type.icon;
                const config = getTypeConfig(type.value);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      type: type.value,
                      startDate: type.value === 'promotion' ? formData.startDate || new Date().toISOString().split('T')[0] : '',
                      endDate: type.value === 'promotion' ? formData.endDate : '',
                      date: type.value !== 'promotion' ? formData.date || new Date().toISOString().split('T')[0] : ''
                    })}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.type === type.value
                        ? `${config.color} border-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent size={16} />
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter announcement title"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter announcement description"
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Dynamic Date Fields */}
          {renderDateFields()}
        </form>

        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {editingAnnouncement ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success', title: '' });
  const [filter, setFilter] = useState('all');
  const [userStatus, setUserStatus] = useState({
    isAuthenticated: false,
    isStaff: false,
    checked: false
  });

  // Show alert function
  const showAlert = (title, message, type = 'success') => {
    setAlert({ show: true, message, type, title });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success', title: '' }), 6000);
  };

  // Handle alert close
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ show: false, message: '', type: 'success', title: '' });
  };

  // Helper function to compare IDs (handles both string and number IDs)
  const compareIds = (id1, id2) => {
    return String(id1) === String(id2);
  };

  // Generate a unique ID (handles existing numeric and string IDs)
  const generateUniqueId = () => {
    const existingIds = new Set(announcements.map(ann => String(ann.id)));
    let newId = Date.now().toString();
    
    // Ensure the ID is truly unique
    while (existingIds.has(newId)) {
      newId = (parseInt(newId) + 1).toString();
    }
    
    return newId;
  };

  // Check user authentication and staff status
  const checkUserStatus = async () => {
    try {
      // Try to load announcements - this will fail with 401/403 if user is not authenticated/staff
      const response = await API.get('/announcements/');
      
      if (response.data.status === 'success') {
        setUserStatus({
          isAuthenticated: true,
          isStaff: true, // If we can access announcements, user is staff
          checked: true
        });
        return true;
      }
    } catch (err) {
      console.log('Auth check error:', err.response?.status);
      
      if (err.response?.status === 401) {
        setUserStatus({
          isAuthenticated: false,
          isStaff: false,
          checked: true
        });
        showAlert(
          'Authentication Required', 
          'Please log in to access announcements', 
          'warning'
        );
      } else if (err.response?.status === 403) {
        setUserStatus({
          isAuthenticated: true,
          isStaff: false,
          checked: true
        });
        showAlert(
          'Staff Access Required', 
          'You need staff permissions to manage announcements', 
          'warning'
        );
      } else {
        setUserStatus({
          isAuthenticated: false,
          isStaff: false,
          checked: true
        });
        showAlert(
          'Access Error', 
          'Unable to verify user permissions', 
          'error'
        );
      }
      return false;
    }
  };

  // Load announcements from backend
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await API.get('/announcements/');
      
      if (response.data.status === 'success') {
        setAnnouncements(response.data.announcements || []);
      } else {
        showAlert(
          'Load Failed',
          'Failed to load announcements: ' + (response.data.error || 'Unknown error'),
          'error'
        );
        setAnnouncements([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load announcements';
      
      if (err.response?.status === 401) {
        showAlert('Authentication Required', 'Please log in to view announcements', 'error');
      } else if (err.response?.status === 403) {
        showAlert('Access Denied', 'Staff permissions required to view announcements', 'error');
      } else {
        showAlert('Load Failed', errorMessage, 'error');
      }
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Save announcements to backend
  const saveAnnouncements = async (updatedAnnouncements) => {
    try {
      setSaving(true);
      const response = await API.post('/announcements/update/', {
        announcements: updatedAnnouncements
      });
      
      if (response.data.status === 'success') {
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to save announcements');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save announcements';
      
      // Check if it's a permission error
      if (err.response?.status === 401) {
        showAlert('Authentication Required', 'Please log in to modify announcements', 'error');
      } else if (err.response?.status === 403) {
        showAlert('Permission Denied', 'Only staff members can modify announcements', 'error');
      } else if (err.response?.status === 404) {
        showAlert('Not Found', 'The announcements resource was not found', 'error');
      } else {
        showAlert('Save Failed', errorMessage, 'error');
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete announcement - handles both string and number IDs
  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setSaving(true);
      
      // Convert ID to string for the API call to ensure consistency
      const announcementId = String(id);
      
      const response = await API.delete(`/announcements/delete/${announcementId}/`);
      
      if (response.data.status === 'success') {
        showAlert('Success', response.data.message || 'Announcement deleted successfully', 'success');
        await loadAnnouncements();
      } else {
        throw new Error(response.data.error || 'Failed to delete announcement');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete announcement';
      
      // Check if it's a permission error
      if (err.response?.status === 401) {
        showAlert('Authentication Required', 'Please log in to delete announcements', 'error');
      } else if (err.response?.status === 403) {
        showAlert('Permission Denied', 'Only staff members can delete announcements', 'error');
      } else if (err.response?.status === 404) {
        showAlert('Not Found', 'Announcement not found', 'error');
      } else {
        showAlert('Delete Failed', errorMessage, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Add or update announcement
  const handleSaveAnnouncement = async (announcement) => {
    try {
      setSaving(true);
      let updatedAnnouncements;
      
      if (editingAnnouncement) {
        // Update existing announcement
        updatedAnnouncements = announcements.map(a => 
          compareIds(a.id, announcement.id) ? announcement : a
        );
      } else {
        // Create new announcement with unique ID
        const newAnnouncement = {
          ...announcement,
          id: generateUniqueId()
        };
        updatedAnnouncements = [...announcements, newAnnouncement];
      }

      // Save to backend first, then update state
      const success = await saveAnnouncements(updatedAnnouncements);
      if (success) {
        // Only show success and update state if backend save was successful
        if (editingAnnouncement) {
          showAlert('Success', 'Announcement updated successfully', 'success');
        } else {
          showAlert('Success', 'Announcement created successfully', 'success');
        }
        
        await loadAnnouncements(); // Reload from backend to ensure consistency
        setShowForm(false);
        setEditingAnnouncement(null);
      }
    } catch (err) {
      // Error is already handled in saveAnnouncements
      console.error('Failed to save announcement:', err);
    } finally {
      setSaving(false);
    }
  };

  // Initialize - check user status and load announcements
  useEffect(() => {
    const initialize = async () => {
      await checkUserStatus();
      await loadAnnouncements();
    };
    
    initialize();
  }, []);

  // Get unique types from announcements for filter
  const availableTypes = [...new Set(announcements.map(ann => ann.type))];

  // Filter announcements
  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(ann => ann.type === filter);

  // Check if announcement is active/expired
  const getAnnouncementStatus = (announcement) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (announcement.type === 'promotion') {
      if (!announcement.endDate) return 'active';
      return announcement.endDate >= today ? 'active' : 'expired';
    } else {
      if (!announcement.date) return 'active';
      return announcement.date >= today ? 'upcoming' : 'past';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleNewAnnouncement = () => {
    if (!userStatus.isStaff) {
      showAlert('Access Denied', 'Staff permissions required to create announcements', 'error');
      return;
    }
    setEditingAnnouncement(null);
    setShowForm(true);
  };

  const handleEditAnnouncement = (announcement) => {
    if (!userStatus.isStaff) {
      showAlert('Access Denied', 'Staff permissions required to edit announcements', 'error');
      return;
    }
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  // Statistics
  const stats = {
    total: announcements.length,
    active: announcements.filter(ann => getAnnouncementStatus(ann) === 'active').length,
    expired: announcements.filter(ann => getAnnouncementStatus(ann) === 'expired').length,
    upcoming: announcements.filter(ann => getAnnouncementStatus(ann) === 'upcoming').length,
    past: announcements.filter(ann => getAnnouncementStatus(ann) === 'past').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      {/* Snackbar Alert */}
      <Snackbar
        open={alert.show}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbar-root': {
            top: '80px !important',
          },
        }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.type}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '1rem',
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 1 }}>
            {alert.title}
          </AlertTitle>
          {alert.message}
        </Alert>
      </Snackbar>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Announcements Manager
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage promotions, releases, events, and news
          </p>
          
          {/* User Status Indicator */}
          {userStatus.checked && (
            <div className="mt-3 flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                userStatus.isStaff 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <Shield size={12} />
                <span>
                  {userStatus.isStaff 
                    ? 'Staff Access' 
                    : userStatus.isAuthenticated 
                      ? 'Limited Access' 
                      : 'Not Logged In'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats and Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600 text-xs sm:text-sm">Total</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-gray-600 text-xs sm:text-sm">Active</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-gray-600 text-xs sm:text-sm">Upcoming</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.expired + stats.past}</div>
            <div className="text-gray-600 text-xs sm:text-sm">Expired/Past</div>
          </div>
          <button
            onClick={handleNewAnnouncement}
            disabled={saving || loading || !userStatus.isStaff}
            className="col-span-2 md:col-span-4 lg:col-span-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            title={!userStatus.isStaff ? "Staff permissions required" : "Create new announcement"}
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">New Announcement</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Access Warning for Non-Staff Users */}
        {userStatus.checked && !userStatus.isStaff && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-800">Limited Access</h3>
                <p className="text-yellow-700 text-sm">
                  {userStatus.isAuthenticated 
                    ? "You need staff permissions to create, edit, or delete announcements." 
                    : "Please log in with staff account to manage announcements."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            All Types
          </button>
          {availableTypes.map(type => {
            const config = getTypeConfig(type);
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-xs sm:text-sm ${
                  filter === type 
                    ? `${config.color} border border-current shadow-sm` 
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                <config.icon size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{config.label}</span>
                <span className="xs:hidden">{config.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Announcements Grid */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600 text-sm sm:text-base">Loading announcements...</span>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Megaphone size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No announcements yet' : `No ${getTypeConfig(filter).label.toLowerCase()} announcements`}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto px-4">
                {filter === 'all' 
                  ? 'Create your first announcement to get started' 
                  : `No ${getTypeConfig(filter).label.toLowerCase()} announcements match the current filter`}
              </p>
              {filter === 'all' && userStatus.isStaff && (
                <button
                  onClick={handleNewAnnouncement}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold text-sm sm:text-base disabled:opacity-50"
                >
                  Create Announcement
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {filteredAnnouncements.map((announcement) => {
                const config = getTypeConfig(announcement.type);
                const IconComponent = config.icon;
                const status = getAnnouncementStatus(announcement);
                const statusConfig = {
                  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
                  expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
                  upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
                  past: { label: 'Past', color: 'bg-gray-100 text-gray-800' },
                }[status];

                return (
                  <div
                    key={String(announcement.id)}
                    className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all hover:shadow-md ${
                      status === 'expired' || status === 'past'
                        ? 'border-gray-200 bg-gray-50 opacity-70' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          <IconComponent size={12} className="mr-1" />
                          {config.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 leading-tight">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                      {announcement.description}
                    </p>

                    {/* Dates */}
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                      {announcement.type === 'promotion' ? (
                        <>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>{formatDate(announcement.date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        ID: {announcement.id}
                      </div>
                      {userStatus.isStaff && (
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEditAnnouncement(announcement)}
                            disabled={saving}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => deleteAnnouncement(announcement.id)}
                            disabled={saving}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Announcement Form Modal */}
      <AnnouncementForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={handleSaveAnnouncement}
        editingAnnouncement={editingAnnouncement}
        isSaving={saving}
      />
    </div>
  );
};

export default Announcements;