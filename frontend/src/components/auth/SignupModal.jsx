import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dob, setDob] = useState("");
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await signup(name, email, password, dob);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    // This is the line to fix: Changed to items-center to center the modal on screen.
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-black/50 border border-pink-500/30 rounded-lg p-8 max-w-md w-full mx-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-['Orbitron'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            Create Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-pink-500 transition-colors"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name-signup"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name-signup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition-colors"
              required
              placeholder="e.g., Alice"
            />
          </div>

          <div>
            <label
              htmlFor="email-signup"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email-signup"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition-colors"
              required
              placeholder="you@wonderland.com"
            />
          </div>

          <div>
            <label
              htmlFor="password-signup"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password *
            </label>
            <input
              type="password"
              id="password-signup"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition-colors"
              required
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword-signup"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword-signup"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition-colors"
              required
              placeholder="Re-enter your password"
            />
          </div>

          <div>
            <label
              htmlFor="dob-signup"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Date of Birth (optional)
            </label>
            <input
              type="date"
              id="dob-signup"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition-colors"
              placeholder="YYYY-MM-DD"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center pt-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-pink disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-pink-400 hover:text-green-400 underline transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
