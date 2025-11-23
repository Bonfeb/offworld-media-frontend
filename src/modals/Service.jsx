import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Clock, Info } from "lucide-react";

export default function Service({
  open,
  onClose,
  service,
  onAddToCart,
  isEditing = false,
}) {
  const [eventDetails, setEventDetails] = useState({
    event_date: "",
    event_time: "",
    event_location: "",
  });
  const [addEventDetails, setAddEventDetails] = useState(false);

  const isAudioService = service?.category === "audio";

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    if (service && isEditing) {
      setAddEventDetails(true);
      setEventDetails({
        event_date: "", // Set from cart item
        event_time: "", // Set from cart item
        event_location: "", // Set from cart item
      });
    } else {
      setAddEventDetails(false);
      setEventDetails({
        event_date: "",
        event_time: "",
        event_location: "",
      });
    }
  }, [service, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddToCartClick = () => {
    let cartData;

    if (addEventDetails) {
      if (!eventDetails.event_date || !eventDetails.event_time) {
        alert("Please fill in event date and time");
        return;
      }

      if (!isAudioService && !eventDetails.event_location) {
        alert("Please fill in event location");
        return;
      }

      cartData = {
        ...service,
        event_date: eventDetails.event_date,
        event_time: eventDetails.event_time,
        event_location: isAudioService ? null : eventDetails.event_location,
        has_event_details: true,
      };
    } else {
      cartData = {
        ...service,
        event_date: null,
        event_time: null,
        event_location: null,
        has_event_details: false,
      };
    }

    onAddToCart(cartData);
    onClose();
    setEventDetails({ event_date: "", event_time: "", event_location: "" });
    setAddEventDetails(false);
  };

  if (!open || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {isEditing ? "Edit Service" : "Service Details"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {capitalize(service.category)}
              {service.audio_category &&
                ` • ${capitalize(service.audio_category)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Service Info */}
            <div className="space-y-6">
              {/* Service Image */}
              {service.image ? (
                <div className="aspect-video lg:aspect-square overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={service.image}
                    alt={service.title || service.category}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video lg:aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <div className="text-4xl text-blue-600 mb-2">🎵</div>
                    <p className="text-blue-700 font-medium">
                      {capitalize(service.category)}
                    </p>
                  </div>
                </div>
              )}

              {/* Service Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.title || capitalize(service.category)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <span className="text-lg font-semibold text-gray-700">
                    Price:
                  </span>
                  <span className="text-2xl font-bold text-green-700">
                    KES {Number(service.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Event Details & Actions */}
            <div className="space-y-6">
              {/* Event Details Toggle */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Info size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Event Details
                      </h4>
                      <p className="text-sm text-gray-600">
                        {addEventDetails
                          ? "Add event date, time, and location"
                          : "You can add event details now or later"}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addEventDetails}
                      onChange={(e) => setAddEventDetails(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Event Details Form - Conditionally Rendered */}
              {addEventDetails && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-blue-600" />
                      Event Information
                    </h4>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="event_date"
                          value={eventDetails.event_date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="event_time"
                          value={eventDetails.event_time}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Location - Conditionally Rendered */}
                    {!isAudioService && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin size={16} />
                          Event Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="event_location"
                          value={eventDetails.event_location}
                          onChange={handleInputChange}
                          placeholder="Enter event venue or address"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    )}

                    {isAudioService && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Clock
                            size={18}
                            className="text-blue-600 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Studio Service
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              Audio services are conducted at our professional
                              studio. We'll contact you to schedule the session
                              after booking.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Features */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info size={18} className="text-blue-600" />
                  Service Includes
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Professional equipment and setup
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Expert technical support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Quality assurance guarantee
                  </li>
                  {isAudioService && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Studio facilities included
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t bg-gray-50 p-4 sm:p-6 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCartClick}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isEditing ? "Update Cart" : "Add to Cart"}
              {addEventDetails && " with Event Details"}
            </button>
          </div>

          {!addEventDetails && (
            <p className="text-center text-sm text-gray-600 mt-3">
              You can add event details later during checkout
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
