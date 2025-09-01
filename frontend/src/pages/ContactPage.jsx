import React, { useState } from "react";
import { MapPin, Phone, Mail, Send, Facebook, Instagram } from "lucide-react";
import axios from "../utils/axios.js";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await axios.post("/contact", formData);

      if (response.data.success) {
        setSubmitMessage(
          "Thank you for your message! We'll get back to you within 24 hours."
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitMessage(
          "Sorry, there was an error sending your message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending contact form:", error);
      setSubmitMessage(
        error.response?.data?.message ||
          "Sorry, there was an error sending your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-['Orbitron'] text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            GAME OVER? CONTACT US!
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ready to level up your night out? Get in touch with us for bookings,
            events, or just to say hi!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Location */}
            <div className="bg-black/50 border border-pink-500/30 rounded-lg p-6">
              <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
                LOCATION
              </h3>

              <div className="space-y-4">
                <a
                  href="https://maps.google.com/?q=-25.2846586,152.8551759"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <MapPin className="h-6 w-6 text-pink-400 mt-1 flex-shrink-0 group-hover:text-pink-300" />
                  <div>
                    <p className="text-white font-semibold group-hover:text-pink-300 transition-colors">
                      8-Bit Bar Australia
                    </p>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                      Shop 1/352 Esplanade, Scarness
                    </p>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                      QLD 4655
                    </p>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                      Australia
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-black/50 border border-green-500/30 rounded-lg p-6">
              <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                GET IN TOUCH
              </h3>

              <div className="space-y-4">
                <a
                  href="tel:+61493091188"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <Phone className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                  <div>
                    <p className="text-white font-semibold">Phone</p>
                    <p className="text-gray-300 group-hover:text-green-300 transition-colors">
                      +61 493 091 188
                    </p>
                  </div>
                </a>

                <a
                  href="mailto:info@8bitbar.com.au"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <Mail className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
                  <div>
                    <p className="text-white font-semibold">Email</p>
                    <p className="text-gray-300 group-hover:text-cyan-300 transition-colors">
                      info@8bitbar.com.au
                    </p>
                  </div>
                </a>

                {/* Website */}
                <a
                  href="https://8bitbar.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-400 group-hover:text-purple-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
                    />
                  </svg>
                  <div>
                    <p className="text-white font-semibold">Website</p>
                    <p className="text-gray-300 group-hover:text-purple-300 transition-colors">
                      8bitbar.com.au
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-black/50 border border-purple-500/30 rounded-lg p-6">
              <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                FOLLOW THE ACTION
              </h3>

              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/8bitbarHB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="https://www.instagram.com/8bitbarhb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>

              <p className="text-gray-400 text-sm mt-4">
                Follow us for the latest events, gaming tournaments, and
                behind-the-scenes content!
              </p>
            </div>

            {/* Map */}
            <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-6">
              <h3 className="font-['Orbitron'] text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
                FIND US
              </h3>
              <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps?q=-25.2846586,152.8551759&z=17&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="8-Bit Bar Location"
                  className="filter grayscale hover:grayscale-0 transition-all duration-300"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-black/50 border border-pink-500/30 rounded-lg p-8">
            <h3 className="font-['Orbitron'] text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
              SEND US A MESSAGE
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="(02) 0000-0000"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="event">Private Event</option>
                  <option value="feedback">Feedback</option>
                  <option value="general">General Question</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us how we can help you level up your experience!"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-pink flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>

              {submitMessage && (
                <div
                  className={`mt-4 p-4 rounded-lg text-center ${
                    submitMessage.includes("Thank you")
                      ? "bg-green-900/50 border border-green-500/30 text-green-400"
                      : "bg-red-900/50 border border-red-500/30 text-red-400"
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </form>

            <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">
                <strong className="text-green-400">Quick Response:</strong> We
                typically respond to all inquiries within 24 hours during
                business days. For urgent bookings, please call us directly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
