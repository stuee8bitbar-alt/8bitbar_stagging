import React, { useState, useEffect } from "react";
import api from "../../../utils/axios";

const CafeSettingsAdmin = () => {
  const [settings, setSettings] = useState({
    timeSlots: [],
    pricePerChairPerHour: 10,
    maxDuration: 8,
    weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("Template 1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchSettings();
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/cafe/cafe-layout/templates");
      const templateNames = [
        ...new Set(response.data.templates.map((t) => t.templateName)),
      ];
      setTemplates(templateNames);
      if (
        templateNames.length > 0 &&
        !templateNames.includes(selectedTemplate)
      ) {
        setSelectedTemplate(templateNames[0]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/admin/cafe/cafe-settings?templateName=${selectedTemplate}`
      );
      setSettings(response.data.settings);
    } catch (error) {
      console.error("Error fetching cafe settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setMessage("");

      await api.put("/admin/cafe/cafe-settings", {
        ...settings,
        templateName: selectedTemplate,
      });
      setMessage("Settings saved successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving cafe settings:", error);
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // All available time slots (24 hours)
  const allTimeSlots = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  const toggleTimeSlot = (timeSlot) => {
    setSettings((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(timeSlot)
        ? prev.timeSlots.filter((slot) => slot !== timeSlot)
        : [...prev.timeSlots, timeSlot].sort(),
    }));
  };

  const toggleWeekDay = (day) => {
    setSettings((prev) => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter((d) => d !== day)
        : [...prev.weekDays, day].sort(),
    }));
  };

  const formatTimeForDisplay = (timeString) => {
    const hour = parseInt(timeString.split(":")[0]);
    return hour > 12
      ? `${hour - 12}:00 PM`
      : hour === 12
      ? "12:00 PM"
      : `${hour}:00 AM`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Cafe Settings
          </h1>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium self-start sm:self-auto"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Template Selection */}
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">
            Template Settings
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Select Template:
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
            >
              {templates.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
            <span className="text-xs sm:text-sm text-gray-500">
              Settings for: <strong>{selectedTemplate}</strong>
            </span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.includes("success")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Basic Settings */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 lg:col-span-1">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">
              Basic Settings for {selectedTemplate}
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Price per Chair per Hour ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.pricePerChairPerHour}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      pricePerChairPerHour: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="Enter price (e.g., 10.00 or 0 for free)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Maximum Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={settings.maxDuration}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxDuration: parseInt(e.target.value) || 1,
                    }))
                  }
                  placeholder="Enter max hours (e.g., 8)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                />
              </div>

              {/* Week Days Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Available Week Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const isSelected = settings.weekDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleWeekDay(day)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-green-400 hover:bg-green-50"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected {settings.weekDays.length} day(s) - Customers can only book on selected days
                </p>
              </div>
            </div>
          </div>

          {/* Time Slots Management */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 lg:col-span-2">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Available Time Slots for {selectedTemplate}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Click on time slots to enable/disable them. Selected slots will
                be available for booking.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {allTimeSlots.map((timeSlot) => {
                const isSelected = settings.timeSlots.includes(timeSlot);
                return (
                  <button
                    key={timeSlot}
                    onClick={() => toggleTimeSlot(timeSlot)}
                    className={`px-2 sm:px-3 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                    }`}
                  >
                    {formatTimeForDisplay(timeSlot)}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                <span className="text-gray-600">
                  Selected:{" "}
                  <strong className="text-purple-600">
                    {settings.timeSlots.length}
                  </strong>{" "}
                  time slots
                </span>
                <span className="text-gray-500 text-xs">
                  {settings.timeSlots.length > 0 && (
                    <span className="break-words">
                      {settings.timeSlots
                        .map((slot) => formatTimeForDisplay(slot))
                        .join(", ")}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 sm:mt-8 bg-white shadow-md rounded-lg p-4 sm:p-6 text-gray-900">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">
            Preview for {selectedTemplate}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <strong className="text-gray-900 block mb-1">Pricing:</strong>
              <span>${settings.pricePerChairPerHour}/chair/hour</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <strong className="text-gray-900 block mb-1">
                Max Duration:
              </strong>
              <span>{settings.maxDuration} hours</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <strong className="text-gray-900 block mb-1">
                Available Days:
              </strong>
              <span>
                {settings.weekDays.length === 7 ? "All days" : settings.weekDays.join(", ")}
              </span>
            </div>
          </div>

          <div className="text-gray-700">
            <strong className="text-gray-900 text-sm sm:text-base">
              Available Time Slots ({settings.timeSlots.length}):
            </strong>
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
              {settings.timeSlots.length > 0 ? (
                settings.timeSlots.map((slot, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs sm:text-sm font-medium"
                  >
                    {formatTimeForDisplay(slot)}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-xs sm:text-sm italic">
                  No time slots configured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeSettingsAdmin;
