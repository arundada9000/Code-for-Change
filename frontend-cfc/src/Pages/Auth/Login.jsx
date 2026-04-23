import React, { useState } from "react";
import { FaLock, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../Context/AuthContext";
import SEO from "../../Components/Common/SEO";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(form.email, form.password);

    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFDFD] font-sans selection:bg-secondary/10 selection:text-secondary">
      <SEO title="Login" />
      <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link to="/" className="block group">
          <img
            src={logo}
            alt="CFC Logo"
            className="w-32 mx-auto group-hover:scale-105 transition-transform duration-300"
          />

          <div className="text-center space-y-4 mt-8">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Code <span className="text-secondary">For Change</span>
            </h1>
          </div>
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-secondary/10 p-10 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Continue your mission to create change.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6"
              >
                Email Address
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full pl-16 pr-8 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/20 font-medium transition-all"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6"
              >
                Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-16 pr-8 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/20 font-medium transition-all"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 border-secondary/20 rounded text-secondary focus:ring-secondary"
                />
                <label
                  htmlFor="remember"
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forget-password"
                className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              className={`w-full py-4 bg-secondary hover:bg-primary text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {loading ? "Authenticating..." : "Log in to Dashboard"}{" "}
              <FaArrowRight />
            </button>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-400 font-medium">
                New here?{" "}
                <Link
                  to="/register"
                  className="text-secondary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded cursor-pointer"
                >
                  Create an account
                </Link>
              </p>
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

export default Login;
