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
    <div className="min-h-screen flex font-sans selection:bg-secondary/10 selection:text-secondary">
      <SEO title="Login" />

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* ── Left Panel: Dark branded side ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden flex-col justify-between p-12 xl:p-16"
        style={{
          background: 'linear-gradient(135deg, #01152E 0%, #012340 40%, #013055 70%, #01152E 100%)',
        }}
      >
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,118,180,0.3), rgba(56,189,248,0.15))',
              animation: 'gradient-shift 8s ease-in-out infinite',
              backgroundSize: '200% 200%',
            }}
          />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{
              background: 'linear-gradient(225deg, rgba(0,118,180,0.2), rgba(147,51,234,0.1))',
              animation: 'gradient-shift 12s ease-in-out infinite',
              animationDelay: '3s',
              backgroundSize: '200% 200%',
            }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Orbiting dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
            <div
              className="w-2 h-2 rounded-full bg-secondary/40"
              style={{ animation: 'orbit 20s linear infinite' }}
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
            <div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400/30"
              style={{ animation: 'orbit 30s linear infinite reverse' }}
            />
          </div>

          {/* Gradient ring */}
          <div className="absolute top-[15%] right-[10%] w-48 h-48 rounded-full border border-white/[0.04]" />
          <div className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full border border-secondary/[0.08]" />
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logo} alt="CFC Logo" className="w-14 drop-shadow-lg" />
            <span className="text-white/80 text-sm font-semibold tracking-wide">Code for Change</span>
          </Link>
        </div>

        {/* Center: Headline + floating cards */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              Empowering<br />
              Nepal's <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-cyan-400">digital</span><br />
              generation.
            </h2>
            <p className="text-blue-200/50 text-sm max-w-xs leading-relaxed mt-4">
              Manage events, track impact metrics, and drive change across all 7 provinces from one dashboard.
            </p>
          </div>

          {/* Floating glassmorphism cards */}
          <div className="relative h-40">
            {/* Card 1 */}
            <div
              className="absolute left-0 top-0 bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/[0.08] px-5 py-4 w-52"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary text-sm">📊</div>
                <p className="text-white/70 text-xs font-medium">Impact Tracked</p>
              </div>
              <p className="text-white text-2xl font-bold">2,400+</p>
              <p className="text-emerald-400/70 text-[11px] mt-1">↑ 18% this quarter</p>
            </div>

            {/* Card 2 */}
            <div
              className="absolute right-0 top-6 bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/[0.08] px-5 py-4 w-48"
              style={{ animation: 'float-delayed 7s ease-in-out infinite', animationDelay: '1s' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">🎓</div>
                <p className="text-white/70 text-xs font-medium">Schools Reached</p>
              </div>
              <p className="text-white text-2xl font-bold">80+</p>
              <p className="text-blue-300/50 text-[11px] mt-1">Across 7 provinces</p>
            </div>
          </div>
        </div>

        {/* Bottom: Stats bar */}
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex -space-x-2">
            {['bg-secondary', 'bg-cyan-500', 'bg-purple-500', 'bg-emerald-500'].map((bg, i) => (
              <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-primary flex items-center justify-center text-white text-[10px] font-bold`}>
                {['C', 'F', 'C', '+'[0]][i]}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs">
            <span className="text-white/70 font-semibold">1,000+</span> members building change
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login form ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile header */}
        <div className="lg:hidden px-6 py-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #01152E, #013055)' }}>
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-secondary/20 blur-[60px]" />
          </div>
          <Link to="/" className="relative z-10 flex items-center gap-3">
            <img src={logo} alt="CFC Logo" className="w-9 drop-shadow-lg" />
            <span className="text-lg font-bold text-white tracking-tight">Code for Change</span>
          </Link>
        </div>


        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Sign in to continue your mission.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-xl text-sm font-medium text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-500 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors text-sm" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-sm font-medium transition-all"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-500 ml-1"
                >
                  Password
                </label>
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors text-sm" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-sm font-medium transition-all"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-3.5 h-3.5 border-slate-300 rounded text-secondary focus:ring-secondary"
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs text-gray-500 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forget-password"
                  className="text-xs font-medium text-secondary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-disabled={loading}
                className={`w-full py-3.5 bg-secondary hover:bg-primary text-white rounded-xl font-semibold text-sm shadow-md shadow-secondary/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {loading ? "Signing in..." : "Sign in"}{" "}
                <FaArrowRight className="text-xs" />
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-secondary font-semibold hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center lg:text-left lg:px-10">
          <p className="text-xs text-gray-300">
            © {new Date().getFullYear()} Code for Change Nepal
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
