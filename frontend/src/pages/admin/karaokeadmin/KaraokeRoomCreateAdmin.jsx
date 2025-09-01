import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/axios";

// Extended time slots for more flexibility
const EXTENDED_TIME_SLOTS = [
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
];

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

// --- HELPER COMPONENTS ---

function MultiSelect({ options, selected, onChange, label }) {
  const toggle = (val) => {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val]
    );
  };
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-3 max-h-60 overflow-y-auto">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              selected.includes(opt)
                ? "bg-indigo-600 text-white border-transparent"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function FeaturesInput({ features, setFeatures }) {
  const addFeature = () => setFeatures([...features, ""]);
  const updateFeature = (i, val) =>
    setFeatures(features.map((f, idx) => (idx === i ? val : f)));
  const removeFeature = (i) =>
    setFeatures(features.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Features
      </label>
      {features.map((feature, i) => (
        <div key={i} className="flex items-center gap-3">
          <input
            type="text"
            placeholder={`Feature ${i + 1}`}
            value={feature}
            onChange={(e) => updateFeature(i, e.target.value)}
            className="px-3 py-2 mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => removeFeature(i)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove feature"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addFeature}
        className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        + Add Feature
      </button>
    </div>
  );
}

function ImagesInput({ images, setImages }) {
  const addImage = () => setImages([...images, ""]);
  const updateImage = (i, val) =>
    setImages(images.map((img, idx) => (idx === i ? val : img)));
  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Additional Images
      </label>
      {images.map((image, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder={`Image URL ${i + 1}`}
              value={image}
              onChange={(e) => updateImage(i, e.target.value)}
              className="px-3 py-2 mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {image && (
            <img
              src={image}
              alt={`Room image ${i + 1}`}
              className="h-32 w-auto rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addImage}
        className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        + Add Image
      </button>
    </div>
  );
}

const FormInput = ({ label, id, name, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      name={name || id}
      {...props}
      className="px-3 py-2 mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>
);

const FormTextarea = ({ label, id, name, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      name={name || id}
      {...props}
      className="px-3 py-2 mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>
);

// --- MAIN COMPONENT ---

const KaraokeRoomCreateAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    maxPeople: "12",
    pricePerHour: "50",
    description: "",
    microphones: "4",
    imageUrl: "",
    images: [],
    isVisible: true,
    isActive: true,
  });
  const [featuresArr, setFeaturesArr] = useState([
    "Pick-your-own songs displayed with lyrics on a large screen",
    "Professional karaoke system",
  ]);
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");
  const [blockNote, setBlockNote] = useState("");

  // Add per-day availability state
  const [availability, setAvailability] = useState(() => {
    const obj = {};
    DAYS_OF_WEEK.forEach(day => {
      obj[day] = [];
    });
    return obj;
  });
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Room name is required");
      return;
    }

    if (availability[selectedDay].length === 0) {
      setError(`No time slots selected for ${selectedDay}`);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/admin/karaoke/karaoke-rooms", {
        name: formData.name,
        description: formData.description,
        maxPeople: parseInt(formData.maxPeople),
        pricePerHour: parseFloat(formData.pricePerHour),
        inclusions: {
          microphones: parseInt(formData.microphones) || 4,
          features: featuresArr.filter((f) => f.trim() !== ""),
        },
        imageUrl: formData.imageUrl,
        images: formData.images.filter((img) => img.trim() !== ""),
        isVisible: formData.isVisible,
        isActive: formData.isActive,
        blockStartDate,
        blockEndDate,
        blockNote,
        availability,
      });

      navigate("/admin/karaoke/karaoke-rooms");
    } catch (err) {
      console.error("Error creating room:", err);
      setError("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow-lg sm:rounded-xl md:w-full">
          <div className="p-2">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Create New Karaoke Room
            </h2>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded-md mx-4 mb-4">
              {error}
            </div>
          )}

          <div className="border-t border-gray-200 p-2 space-y-8">
            {/* --- GENERAL INFO SECTION --- */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                General Information
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <FormInput
                    label="Room Name"
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <FormInput
                    label="Capacity (Max People)"
                    id="maxPeople"
                    type="number"
                    value={formData.maxPeople}
                    onChange={(e) =>
                      setFormData({ ...formData, maxPeople: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="sm:col-span-6">
                  <FormTextarea
                    label="Description"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* --- PRICING & INCLUSIONS SECTION --- */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Pricing & Inclusions
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <FormInput
                    label="Price per Hour ($)"
                    id="pricePerHour"
                    name="pricePerHour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerHour}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerHour: e.target.value })
                    }
                    placeholder="Enter price (e.g., 50.00 or 0 for free)"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <FormInput
                    label="Microphones"
                    id="microphones"
                    type="number"
                    value={formData.microphones}
                    onChange={(e) =>
                      setFormData({ ...formData, microphones: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-6">
                  <FeaturesInput
                    features={featuresArr}
                    setFeatures={setFeaturesArr}
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* --- AVAILABILITY SECTION --- */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Availability Settings
              </h3>
              <div className="mt-6">
                {/* Day Tabs */}
                <div className="flex gap-2 mb-4">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        selectedDay === day
                          ? "bg-indigo-600 text-white border-transparent"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {/* Time Slots for Selected Day */}
                <div className="flex flex-wrap gap-3">
                  {EXTENDED_TIME_SLOTS.map(slot => (
                    <button
                      type="button"
                      key={slot}
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        availability[selectedDay]?.includes(slot)
                          ? "bg-indigo-600 text-white border-transparent"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setAvailability(prev => {
                          const arr = prev[selectedDay] || [];
                          return {
                            ...prev,
                            [selectedDay]: arr.includes(slot)
                              ? arr.filter(s => s !== slot)
                              : [...arr, slot],
                          };
                        });
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Selected {availability[selectedDay]?.length || 0} time slot(s) for {selectedDay}
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* --- IMAGE SECTION --- */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Room Images
              </h3>
              <div className="mt-6 space-y-6">
                <FormInput
                  label="Main Image URL"
                  id="imageUrl"
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Room preview"
                    className="mt-4 h-40 w-auto rounded-lg object-cover"
                  />
                )}
                <ImagesInput
                  images={formData.images}
                  setImages={(images) => setFormData({ ...formData, images })}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* --- VISIBILITY SECTION --- */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Room Settings
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="flex items-center">
                  <input
                    id="isVisible"
                    name="isVisible"
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) =>
                      setFormData({ ...formData, isVisible: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isVisible"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Visible to customers
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active (available for booking)
                  </label>
                </div>
              </div>
            </div>

            {/* --- Booking Block SECTION --- */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Booking Block</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Block Start Date</label>
                  <input
                    type="date"
                    className="px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    style={{ color: 'black' }}
                    value={blockStartDate}
                    onChange={e => setBlockStartDate(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Block End Date</label>
                  <input
                    type="date"
                    className="px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    style={{ color: 'black' }}
                    value={blockEndDate}
                    onChange={e => setBlockEndDate(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Block Message</label>
                  <textarea
                    className="px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    style={{ color: 'black' }}
                    rows={2}
                    placeholder="e.g. We are closed for maintenance"
                    value={blockNote}
                    onChange={e => setBlockNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-3 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/karaoke/karaoke-rooms")}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default KaraokeRoomCreateAdmin;
