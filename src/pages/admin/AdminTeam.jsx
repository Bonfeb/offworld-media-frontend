import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Loader2,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import API from "../../api";

export default function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    profile_pic: null,
    facebook_link: "",
    twitter_link: "",
    instagram_link: "",
  });

  const [previewImage, setPreviewImage] = useState(null);

  const roleOptions = [
    { value: "ceo", label: "CEO", icon: "👔" },
    { value: "producer", label: "Producer", icon: "🎬" },
    { value: "director", label: "Director", icon: "🎥" },
    { value: "editor", label: "Editor", icon: "✂️" },
    { value: "photographer", label: "Photographer", icon: "📸" },
    { value: "videographer", label: "Videographer", icon: "🎞️" },
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Calculate slides per view based on screen size
  const getSlidesPerView = () => {
    if (typeof window === "undefined") return 4;

    const width = window.innerWidth;
    if (width >= 1280) return 4; // xl screens
    if (width >= 1024) return 3; // lg screens
    if (width >= 768) return 2; // md screens
    return 1; // sm and xs screens
  };

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.get("/team/");
      setTeamMembers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error("Error fetching team members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, profile_pic: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("role", formData.role);
    submitData.append("bio", formData.bio);

    if (formData.profile_pic instanceof File) {
      submitData.append("profile_pic", formData.profile_pic);
    }

    if (formData.facebook_link)
      submitData.append("facebook_link", formData.facebook_link);
    if (formData.twitter_link)
      submitData.append("twitter_link", formData.twitter_link);
    if (formData.instagram_link)
      submitData.append("instagram_link", formData.instagram_link);

    try {
      const url = editingMember ? `/team/${editingMember.id}/` : "/team/";

      if (editingMember) {
        await API.put(url, submitData);
      } else {
        await API.post(url, submitData);
      }

      await fetchTeamMembers();
      handleCloseModal();

      alert(
        editingMember
          ? "Team member updated successfully!"
          : "Team member added successfully!"
      );
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      console.error("Error saving team member:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      profile_pic: null,
      facebook_link: member.facebook_link || "",
      twitter_link: member.twitter_link || "",
      instagram_link: member.instagram_link || "",
    });
    setPreviewImage(member.profile_pic);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/team/${id}/`);

      await fetchTeamMembers();
      setDeleteConfirm(null);
      alert("Team member deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      console.error("Error deleting team member:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      bio: "",
      profile_pic: null,
      facebook_link: "",
      twitter_link: "",
      instagram_link: "",
    });
    setPreviewImage(null);
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find((r) => r.value === role);
    return roleOption?.icon || "🎭";
  };

  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find((r) => r.value === role);
    return roleOption?.label || role;
  };

  // Carousel navigation
  const nextSlide = () => {
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.max(
      0,
      Math.ceil(filteredMembers.length / slidesPerView) - 1
    );
    setCurrentSlide((prev) => (prev < maxSlide ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const slidesPerView = getSlidesPerView();
  const totalSlides = Math.ceil(filteredMembers.length / slidesPerView);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 lg:w-7 lg:h-7 text-electric-blue" />
              Team Management
            </h1>
            <p className="text-muted-600 text-sm mt-1">
              Manage your team members and their information
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-electric-blue hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium touch-target"
          >
            <Plus size={20} />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-900 font-semibold">Error Loading Team</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={fetchTeamMembers}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-muted-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? "No members found" : "No team members yet"}
            </h3>
            <p className="text-muted-600 mb-6">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by adding your first team member"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-electric-blue hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <Plus size={20} />
                Add Team Member
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex-shrink-0 w-full sm:w-1/1 md:w-1/2 lg:w-1/3 xl:w-1/4 p-2"
                  >
                    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Profile Image */}
                      <div className="relative mb-4 flex-grow-0">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-muted-100 bg-gradient-to-br from-electric-blue to-cool-teal">
                          {member.profile_pic ? (
                            <img
                              src={member.profile_pic}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card border-2 border-muted-100 rounded-full px-3 py-1">
                          <span className="text-lg">
                            {getRoleIcon(member.role)}
                          </span>
                        </div>
                      </div>

                      {/* Member Info */}
                      <div className="text-center mb-4 flex-grow">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {member.name}
                        </h3>
                        <p className="text-sm font-medium text-electric-blue uppercase tracking-wide">
                          {getRoleLabel(member.role)}
                        </p>
                        <p className="text-sm text-muted-600 mt-2 line-clamp-2">
                          {member.bio}
                        </p>
                      </div>

                      {/* Social Links */}
                      {(member.facebook_link ||
                        member.twitter_link ||
                        member.instagram_link) && (
                        <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-border flex-grow-0">
                          {member.facebook_link && (
                            <a
                              href={member.facebook_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 flex items-center justify-center bg-muted-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                            >
                              <Facebook size={14} />
                            </a>
                          )}
                          {member.twitter_link && (
                            <a
                              href={member.twitter_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 flex items-center justify-center bg-muted-50 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors"
                            >
                              <Twitter size={14} />
                            </a>
                          )}
                          {member.instagram_link && (
                            <a
                              href={member.instagram_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 flex items-center justify-center bg-muted-50 hover:bg-pink-600 hover:text-white rounded-lg transition-colors"
                            >
                              <Instagram size={14} />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleEdit(member)}
                          className="flex-1 flex items-center justify-center gap-2 bg-muted-50 hover:bg-electric-blue hover:text-white text-foreground px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(member)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide >= totalSlides - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-electric-blue"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 lg:p-6 flex items-center justify-between">
              <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center hover:bg-muted-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 lg:p-6 space-y-4">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-muted-100 bg-gradient-to-br from-electric-blue to-cool-teal flex-shrink-0">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {formData.name.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 bg-muted-50 hover:bg-muted-100 border border-border rounded-lg px-4 py-2.5 transition-colors">
                      <Upload size={18} />
                      <span className="text-sm font-medium">Choose Image</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-muted-50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-muted-50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue"
                  >
                    <option value="">Select role</option>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2.5 bg-muted-50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue resize-none"
                  placeholder="Enter bio"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Social Links (Optional)
                </h3>

                <div>
                  <label className="block text-sm text-muted-600 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="facebook_link"
                    value={formData.facebook_link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-muted-50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue"
                    placeholder="https://facebook.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-600 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter_link"
                    value={formData.twitter_link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-muted-50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-600 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram_link"
                    value={formData.instagram_link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-muted-50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-electric-blue"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 bg-muted-50 hover:bg-muted-100 text-foreground rounded-lg transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-electric-blue hover:bg-blue-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingMember ? (
                    "Update Member"
                  ) : (
                    "Add Member"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Delete Team Member?
                </h3>
                <p className="text-sm text-muted-600">
                  Are you sure you want to delete{" "}
                  <strong>{deleteConfirm.name}</strong>? This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-muted-50 hover:bg-muted-100 text-foreground rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
