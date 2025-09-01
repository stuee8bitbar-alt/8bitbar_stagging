import React, { useState } from "react";
import { MdClose, MdPerson, MdEmail, MdPhone, MdCake } from "react-icons/md";
import api from "../../../utils/axios";

const CustomerInputPopup = ({
  isOpen,
  onClose,
  onCustomerSubmit,
  initialData = {},
}) => {
  const [formData, setFormData] = useState({
    customerName: initialData.customerName || "",
    customerEmail: initialData.customerEmail || "",
    customerPhone: initialData.customerPhone || "",
    customerDob: initialData.customerDob || "",
  });
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userFound, setUserFound] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to fetch user details by email
  const fetchUserByEmail = async (email) => {
    if (!email || email.trim() === "") return;
    
    try {
      setIsLoadingUser(true);
      const response = await api.get(
        `/user/by-email/${encodeURIComponent(email.trim())}`
      );
      
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        
        // Auto-populate form fields with user data
        setFormData(prev => ({
          ...prev,
          customerName: userData.name || prev.customerName,
          customerPhone: userData.phone || prev.customerPhone,
          customerDob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : prev.customerDob,
        }));
        
        setUserFound(true);
        console.log("User data auto-populated:", userData);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // User not found - this is normal, don't show error
        console.log("No existing user found for this email");
      } else {
        console.error("Error fetching user by email:", error);
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCustomerSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[120vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Customer Information</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <MdClose size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                onBlur={(e) => fetchUserByEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email address"
              />
              {isLoadingUser && (
                <div className="absolute right-3 top-8">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {userFound && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
                ✅ User found! Details have been auto-populated.
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Date of Birth Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="customerDob"
                value={formData.customerDob}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white text-base font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerInputPopup;
