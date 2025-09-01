import React from "react";
import { User, Mail, Phone, Calendar } from "lucide-react";

// Shared form components
export const ServiceTab = ({ service, icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
      isActive
        ? "bg-blue-600 text-white border-blue-600 shadow-md"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-1">
    <label className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-gray-700">
      {icon}
      <span>{label}</span>
    </label>
    <input
      {...props}
      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
    />
  </div>
);

export const SelectField = ({ label, icon, children, ...props }) => (
  <div className="space-y-1">
    <label className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-gray-700">
      {icon}
      <span>{label}</span>
    </label>
    <select
      {...props}
      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-xs sm:text-sm"
    >
      {children}
    </select>
  </div>
);

export const CustomerInfoForm = ({ formData, handleInputChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        Customer Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <InputField
          label="Full Name"
          icon={<User size={16} className="text-gray-500" />}
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleInputChange}
          required
        />
        <InputField
          label="Email"
          icon={<Mail size={16} className="text-gray-500" />}
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleInputChange}
          required
        />
        <InputField
          label="Phone"
          icon={<Phone size={16} className="text-gray-500" />}
          type="tel"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleInputChange}
        />
        <InputField
          label="Date of Birth"
          icon={<Calendar size={16} className="text-gray-500" />}
          type="date"
          name="customerDob"
          value={formData.customerDob}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};
