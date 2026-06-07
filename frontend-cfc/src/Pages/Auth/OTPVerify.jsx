import React, { useState, useEffect } from "react";
import { FaKey, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import API from "../../Services/api";
import SEO from "../../Components/Common/SEO";

function OTPVerify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { state } = useLocation();
  const email = state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forget-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      if (res.data.success) {
        setSuccess(true);
        // Pass email and resetToken to next step via React Router state
        setTimeout(() => {
          navigate("/reset-password", { state: { email, resetToken: res.data.data.resetToken } });
        }, 2000);
      } else {
        setError(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await API.post("/auth/resend-otp", { email });
      setCooldown(60);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFDFD] font-sans selection:bg-secondary/10 selection:text-secondary">
      <SEO title="Verify OTP" />
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
              Verify OTP
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              We've sent a code to <span className="text-secondary font-bold">{email}</span>
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
                OTP Verified! Redirecting...
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-6">
                Verification Code
              </label>
              <div className="relative group">
                <FaKey className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="••••••"
                  className="w-full pl-16 pr-8 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/20 font-black tracking-[1em] text-center text-xl transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success || otp.length < 6}
              className={`w-full py-4 bg-secondary hover:bg-primary text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-3 ${loading || success || otp.length < 6 ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Verifying..." : "Verify Code"} <FaArrowRight />
            </button>

            <div className="flex flex-col gap-6 text-center pt-4">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Didn't receive code?{" "}
                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={handleResend}
                  className={`font-black transition-colors ${cooldown > 0 ? "text-gray-300 cursor-not-allowed" : "text-secondary hover:text-primary underline"}`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Now"}
                </button>
              </p>

              <button
                type="button"
                onClick={() => navigate("/forget-password")}
                className="text-xs text-gray-400 font-bold hover:text-secondary flex items-center justify-center gap-2 transition-colors mx-auto"
              >
                <FaArrowLeft size={10} /> Change Email
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

export default OTPVerify;
