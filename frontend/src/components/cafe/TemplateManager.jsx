import React, { useState, useEffect } from "react";
import api from "../../utils/axios";

const TemplateManager = ({
  currentTemplate,
  onTemplateChange,
  deviceType,
  onSaveLayout,
  onDuplicateLayout,
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeForBooking, setActiveForBooking] = useState(null);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);

      // Fetch templates for current device type first, then other device type
      const [currentDeviceResponse, otherDeviceResponse] = await Promise.all([
        api.get(`/admin/cafe/cafe-layout/templates?deviceType=${deviceType}`),
        api.get(
          `/admin/cafe/cafe-layout/templates?deviceType=${
            deviceType === "desktop" ? "mobile" : "desktop"
          }`
        ),
      ]);

      // Combine templates, prioritizing current device type
      const currentDeviceTemplates = currentDeviceResponse.data.templates || [];
      const otherDeviceTemplates = otherDeviceResponse.data.templates || [];

      // Create a map to deduplicate by template name, keeping the most recent version
      const templateMap = new Map();

      // Add current device templates first (they have priority)
      currentDeviceTemplates.forEach((template) => {
        templateMap.set(template.templateName, template);
      });

      // Add other device templates only if they don't exist or are newer
      otherDeviceTemplates.forEach((template) => {
        const existing = templateMap.get(template.templateName);
        if (
          !existing ||
          new Date(template.updatedAt) > new Date(existing.updatedAt)
        ) {
          templateMap.set(template.templateName, template);
        }
      });

      // Convert map to array and sort by updatedAt (newest first)
      const finalTemplates = Array.from(templateMap.values()).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      console.log(
        "Templates order:",
        finalTemplates.map((t) => ({
          name: t.templateName,
          updatedAt: t.updatedAt,
        }))
      );

      setTemplates(finalTemplates);

      // Fetch which template is active for booking
      try {
        const activeResponse = await api.get(
          `/admin/cafe/cafe-layout/active-for-booking?deviceType=${deviceType}`
        );
        setActiveForBooking(activeResponse.data.layout?.templateName || null);
      } catch (error) {
        console.error("Error fetching active template:", error);
        setActiveForBooking(null);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [deviceType]);

  // Handle template selection
  const handleTemplateSelect = (templateName) => {
    onTemplateChange(templateName);
  };

  // Handle duplicate template
  const handleDuplicateTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    try {
      setLoading(true);

      // Create both desktop and mobile templates
      await Promise.all([
        api.post("/admin/cafe/cafe-layout/duplicate", {
          sourceTemplateName: currentTemplate,
          newTemplateName: newTemplateName.trim(),
          deviceType: "desktop",
        }),
        api.post("/admin/cafe/cafe-layout/duplicate", {
          sourceTemplateName: currentTemplate,
          newTemplateName: newTemplateName.trim(),
          deviceType: "mobile",
        }),
      ]);

      setNewTemplateName("");
      setShowCreateModal(false);
      await fetchTemplates();
      onTemplateChange(newTemplateName.trim());
    } catch (error) {
      console.error("Error duplicating template:", error);
      alert("Failed to duplicate template");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete template
  const handleDeleteTemplate = async (templateName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${templateName}"? This will delete both desktop and mobile versions.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Delete both desktop and mobile versions
      await Promise.all([
        api.delete(
          `/admin/cafe/cafe-layout/template/${templateName}?deviceType=desktop`
        ),
        api.delete(
          `/admin/cafe/cafe-layout/template/${templateName}?deviceType=mobile`
        ),
      ]);

      await fetchTemplates();

      // If we deleted the current template, switch to the first available one
      if (templateName === currentTemplate && templates.length > 1) {
        const remainingTemplates = templates.filter(
          (t) => t.templateName !== templateName
        );
        if (remainingTemplates.length > 0) {
          onTemplateChange(remainingTemplates[0].templateName);
        }
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  // Handle template change
  const handleTemplateChange = (templateName) => {
    onTemplateChange(templateName);
  };

  // Handle set template as active for booking
  const handleSetActiveForBooking = async (templateName) => {
    try {
      setLoading(true);
      await api.post("/admin/cafe/cafe-layout/set-active-for-booking", {
        templateName,
        deviceType: "desktop", // This will now set for both desktop and mobile
      });
      setActiveForBooking(templateName);
      alert(
        `${templateName} is now active for customer bookings on both desktop and mobile`
      );
    } catch (error) {
      console.error("Error setting template as active:", error);
      alert("Failed to set template as active for booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded border border-gray-200 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-800">
          Template Management
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onSaveLayout()}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            Save Layout
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            Duplicate Template
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Select Template:
        </label>
        <div className="flex flex-wrap gap-1">
          {templates.map((template) => (
            <div key={template.templateName} className="flex flex-col gap-1">
              <button
                onClick={() => handleTemplateSelect(template.templateName)}
                className={`px-2 py-1 rounded border text-xs transition-colors ${
                  currentTemplate === template.templateName
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                disabled={loading}
              >
                {template.templateName}
              </button>
              <button
                onClick={() => handleSetActiveForBooking(template.templateName)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  activeForBooking === template.templateName
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                disabled={loading}
                title={
                  activeForBooking === template.templateName
                    ? "Currently active for booking"
                    : "Set as active for booking"
                }
              >
                {activeForBooking === template.templateName
                  ? "✓ Active"
                  : "Use for Booking"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Current Template Info */}
      <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-3">
        <span className="font-medium">Current:</span> {currentTemplate} |{" "}
        <span className="font-medium">Device:</span> {deviceType}
        {activeForBooking && (
          <span className="ml-2 text-green-600 font-medium">
            | Active for Booking: {activeForBooking}
          </span>
        )}
      </div>

      {/* Delete Template Buttons */}
      {templates.length > 1 && (
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Delete Template:
          </label>
          <div className="flex flex-wrap gap-1">
            {templates.map((template) => (
              <button
                key={template.templateName}
                onClick={() => handleDeleteTemplate(template.templateName)}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                disabled={loading || currentTemplate === template.templateName}
              >
                Delete {template.templateName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-sm font-semibold mb-3">
              Duplicate Template (Desktop & Mobile)
            </h3>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                New Template Name:
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm"
                autoFocus
              />
            </div>
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-800">
                Creates template for both desktop and mobile with appropriate
                sizing.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-xs"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicateTemplate}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                disabled={loading || !newTemplateName.trim()}
              >
                {loading ? "Creating..." : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
