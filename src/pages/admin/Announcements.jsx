import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Calendar, 
  Music, 
  Video, 
  Mic2, 
  Megaphone,
  Save,
  Loader2,
  Tag,
  Clock,
  AlertCircle
} from 'lucide-react';
import API from '../../api';

// Dynamic type configuration - will adapt to any types from backend
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
    // Default fallback for any unexpected types
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
    
    // Date validation based on type
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
      id: editingAnnouncement?.id || Date.now(),
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
                      // Reset dates when type changes
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
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // Load announcements from backend
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/announcements/');
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      setError('Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Save announcements to backend
  const saveAnnouncements = async (updatedAnnouncements) => {
    try {
      setSaving(true);
      setError('');
      await API.post('/announcements/update/', {
        announcements: updatedAnnouncements
      });
      await loadAnnouncements();
    } catch (err) {
      setError('Failed to save announcements');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await API.delete(`/announcements/delete/${id}/`);
      await loadAnnouncements();
    } catch (err) {
      setError('Failed to delete announcement');
    } finally {
      setSaving(false);
    }
  };

  // Add or update announcement
  const handleSaveAnnouncement = async (announcement) => {
    try {
      let updatedAnnouncements;
      
      if (editingAnnouncement) {
        updatedAnnouncements = announcements.map(a => 
          a.id === announcement.id ? announcement : a
        );
      } else {
        updatedAnnouncements = [...announcements, announcement];
      }

      await saveAnnouncements(updatedAnnouncements);
      setShowForm(false);
      setEditingAnnouncement(null);
    } catch (err) {
      // Error is already set in saveAnnouncements
    }
  };

  // Initialize
  useEffect(() => {
    loadAnnouncements();
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
    setEditingAnnouncement(null);
    setShowForm(true);
  };

  const handleEditAnnouncement = (announcement) => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements Manager</h1>
          <p className="text-gray-600">Manage promotions, releases, events, and news</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-700 flex-1">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600 text-sm">Total</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-gray-600 text-sm">Active</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-gray-600 text-sm">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.expired + stats.past}</div>
            <div className="text-gray-600 text-sm">Expired/Past</div>
          </div>
          <button
            onClick={handleNewAnnouncement}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
          >
            <Plus size={20} />
            New Announcement
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === type 
                    ? `${config.color} border border-current shadow-sm` 
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                <config.icon size={16} />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Announcements Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading announcements...</span>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No announcements yet' : `No ${getTypeConfig(filter).label.toLowerCase()} announcements`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Create your first announcement to get started' 
                  : `No ${getTypeConfig(filter).label.toLowerCase()} announcements match the current filter`}
              </p>
              <button
                onClick={handleNewAnnouncement}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
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
                    key={announcement.id}
                    className={`border-2 rounded-xl p-5 transition-all hover:shadow-md ${
                      status === 'expired' || status === 'past'
                        ? 'border-gray-200 bg-gray-50 opacity-70' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          <IconComponent size={12} className="mr-1" />
                          {config.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {announcement.description}
                    </p>

                    {/* Dates */}
                    <div className="space-y-2 mb-4">
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
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        ID: {announcement.id}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAnnouncement(announcement)}
                          disabled={saving}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(announcement.id)}
                          disabled={saving}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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