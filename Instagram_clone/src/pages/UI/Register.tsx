import React, { useState } from "react";
import { register } from "../../services/services"; // Assuming your service file is correctly located
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleAccountCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Frontend validation for a better user experience
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const data = await register(formData);

      // 2. Correctly check for a successful response from Django REST Framework.
      // On success, DRF returns the created user object, which will have an 'id'.
      if (data) {
        setSuccess("Account created successfully! You can now log in.");
        // Optionally, clear the form
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        // This is a fallback for unexpected success responses
        setError("An unknown error occurred during registration.");
      }
    } catch (err: any) {
      // 3. Correctly parse the error object from Django REST Framework.
      let errorMessage = "An unexpected error occurred.";
      if (err.response?.data) {
        // Find the first field with an error (e.g., "username")
        const errorKey = Object.keys(err.response.data)[0];
        if (errorKey) {
          // Get the first error message for that field
          errorMessage = err.response.data[errorKey][0];
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Threads</h1>
          <p className="text-neutral-400">Join the conversation today.</p>
        </div>

        <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
          <form onSubmit={handleAccountCreate} className="space-y-5">
            {error && <div className="p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
            {success && <div className="p-3 bg-green-900/50 text-green-300 border border-green-700 rounded-lg">{success}</div>}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">Username</label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 text-white placeholder-neutral-400"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 text-white placeholder-neutral-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 text-white placeholder-neutral-400"
                placeholder="Enter your password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 text-white placeholder-neutral-400"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-400">
              Already have an account?{" "}
              <Link to="/login" className="text-sky-500 hover:text-sky-400">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}