import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      onClose();
      setEmail("");
      setPassword("");
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
            Login
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
              htmlFor="email-login"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email-login"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition-colors"
              required
              placeholder="you@wonderland.com"
            />
          </div>

          <div>
            <label
              htmlFor="password-login"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password-login"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition-colors"
              required
              placeholder="Your password"
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                className="text-xs text-pink-400 hover:underline focus:outline-none"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('open-forgot-password-modal'));
                  }
                }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center pt-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-glow-pink disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="font-semibold text-pink-400 hover:text-green-400 underline transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
