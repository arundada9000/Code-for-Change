import React, { useState } from "react";
import { FaEnvelope, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import API from "../../Services/api";
import SEO from "../../Components/Common/SEO";

function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/forget-password", { email });
      if (res.data.success) {
        setSuccess(true);
        // Pass email to next step via React Router state
        navigate("/verify-otp", { state: { email } });
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFDFD] font-sans selection:bg-secondary/10 selection:text-secondary">
      <SEO title="Forgot Password" />
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
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Enter your email to receive a secure OTP for reset.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-secondary/5 border border-secondary/10 text-secondary px-6 py-4 rounded-2xl text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
                OTP sent successfully! Redirecting...
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-6">
                Email Address
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full pl-16 pr-8 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/20 font-medium transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-4 bg-secondary hover:bg-primary text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-3 ${loading || success ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Sending OTP..." : "Send Recovery Code"} <FaArrowRight />
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-xs text-gray-400 font-bold hover:text-secondary flex items-center justify-center gap-2 transition-colors mx-auto"
              >
                <FaArrowLeft size={10} /> Back to Login
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Code for change Nepal
        </p>
      </div>
    </div>
  );
}

export default ForgetPassword;
