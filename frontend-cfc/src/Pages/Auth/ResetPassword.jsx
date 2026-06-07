import React, { useState, useEffect } from "react";
import { FaLock, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import API from "../../Services/api";
import SEO from "../../Components/Common/SEO";

function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { state } = useLocation();
  const email = state?.email;
  const resetToken = state?.resetToken;

  useEffect(() => {
    if (!email || !resetToken) {
      navigate("/forget-password");
    }
  }, [email, resetToken, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (formData.newPassword.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/reset-password", {
        email,
        resetToken,
        newPassword: formData.newPassword
      });
      if (res.data.success) {
        setSuccess(true);
        // React Router state will be cleared naturally on navigation
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(res.data.message || "Reset failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFDFD] font-sans selection:bg-secondary/10 selection:text-secondary">
      <SEO title="Reset Password" />
      <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link to="/" className="block group text-center">
          <img src={logo} alt="Logo" className="w-32 mx-auto group-hover:scale-105 transition-transform duration-300" />

          <div className="text-center space-y-4 mt-8">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Code <span className="text-secondary">For Change</span>
            </h1>
          </div>
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-secondary/10 p-10 md:p-12">
          {!success ? (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-bold text-primary tracking-tight">
                  New Password
                </h2>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Set a strong password to protect your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-6">
                    New Password
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                    <input
                      type="password"
                      name="newPassword"
                      required
                      placeholder="••••••••"
                      className="w-full pl-16 pr-8 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/20 font-medium transition-all"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-6">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      className="w-full pl-16 pr-8 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/20 font-medium transition-all"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 bg-secondary hover:bg-primary text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Updating..." : "Update Password"} <FaArrowRight />
                </button>
              </form>
            </>
          ) : (
            <div className="py-10 text-center space-y-6">
              <div className="flex justify-center">
                <FaCheckCircle size={60} className="text-secondary animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary tracking-tight">
                  Password Updated
                </h2>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Your password has been changed successfully.
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-10">
                  Redirecting to login in a moment...
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Code for change Nepal
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
