import React, { useState } from "react";
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight, FaChevronLeft,
  FaUniversity, FaGraduationCap, FaIdCard, FaCamera, FaLayerGroup, FaMapPin
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import SEO from "../../Components/Common/SEO";
import API from "../../Services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    code: "",
    phone: "",
    collegeName: "",
    role: "gm",
    ebBody: "",
    faculty: "",
    semester: "",
    province: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const value = e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value;
    setForm({ ...form, [e.target.name]: value });
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Append basic form fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Role is already in form fields via Object.entries above

      // Append profile image if exists
      if (profilePicture) {
        formData.append("profileImage", profilePicture);
      }

      const response = await API.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFDFD]">
        <div className="w-full max-w-xl text-center space-y-6 bg-white p-12 rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-secondary/10">
          <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle size={30} />
          </div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Welcome to CFC!</h2>
          <p className="text-gray-500 font-medium">
            Your member registration was successful. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFDFD] font-sans selection:bg-secondary/10 selection:text-secondary">
      <SEO
        title="Create Account"
        description="Register for the Code for Change Nepal portal to access exclusive events, certificates, and community resources."
      />
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link to="/" className="block group text-center">
          <img src={logo} alt="CFC Logo" className="w-28 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300" />
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Code <span className="text-secondary">For Change</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Join our student-led IT community and create change.</p>
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-secondary/10 p-8 md:p-12">
          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              {/* Personal Info Section */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaUser className="text-secondary" /> Basic Information
                </h3>

                <InputField label="Full Name" name="name" icon={FaUser} placeholder="Enter full name" value={form.name} onChange={handleChange} required />
                <InputField label="Email Address" name="email" type="email" icon={FaEnvelope} placeholder="name@example.com" value={form.email} onChange={handleChange} required />
                <InputField label="Contact Number" name="phone" type="tel" icon={FaPhone} placeholder="Enter contact" value={form.phone} onChange={handleChange} required />
                <InputField label="Member Code" name="code" icon={FaIdCard} placeholder="Enter member code" value={form.code} onChange={handleChange} required />
              </div>

              {/* Academic/CFC Info Section */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaUniversity className="text-secondary" /> Association Details
                </h3>

                <InputField label="College Name" name="collegeName" icon={FaUniversity} placeholder="Enter college name" value={form.collegeName} onChange={handleChange} required />
                <InputField label="Faculty" name="faculty" icon={FaGraduationCap} placeholder="Enter faculty" value={form.faculty} onChange={handleChange} required />
                <InputField label="Semester" name="semester" icon={FaLayerGroup} placeholder="e.g. 5th" value={form.semester} onChange={handleChange} required />

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6">I am joining as</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10">
                      <FaUser />
                    </div>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className="w-full pl-14 pr-6 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:border-secondary/20 transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs"
                    >
                      <option value="gm">General Member</option>
                      <option value="eb">Executive Board (EB)</option>
                      <option value="cr">Campus Representative (CR)</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                </div>

                {form.role === 'eb' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6">EB Position</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10">
                        <FaIdCard />
                      </div>
                      <select
                        name="ebBody"
                        value={form.ebBody}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:border-secondary/20 transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs"
                      >
                        <option value="">Select Position</option>
                        <option value="tech-lead">Tech Lead</option>
                        <option value="project-lead">Project Lead</option>
                        <option value="vice-project-lead">Vice Project Lead</option>
                        <option value="operation-lead">Operation Lead</option>
                        <option value="admin-lead">Admin Lead</option>
                        <option value="hr-lead">HR Lead</option>
                        <option value="pr-lead">PR Lead</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="vice-treasurer">Vice Treasurer</option>
                        <option value="executive-member">Executive Member</option>
                        <option value="secretary">Secretary</option>
                        <option value="vice-secretary">Vice Secretary</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6">Province</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10">
                      <FaMapPin />
                    </div>
                    <select
                      name="province"
                      value={form.province}
                      onChange={handleChange}
                      required
                      className="w-full pl-14 pr-6 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:border-secondary/20 transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs"
                    >
                      <option value="">Select Province</option>
                      {['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6">Profile Picture</label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="profilePic"
                      hidden
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <label
                      htmlFor="profilePic"
                      className="w-full flex items-center gap-4 pl-6 pr-6 py-4 bg-secondary/5 border border-transparent rounded-full cursor-pointer hover:bg-white hover:border-secondary/20 transition-all font-medium text-gray-400"
                    >
                      <FaCamera className="text-gray-300 group-hover:text-secondary" />
                      <span className="text-xs truncate">{profilePicture ? profilePicture.name : "Choose profile picture"}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-8 border-t border-secondary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Password" name="password" type="password" icon={FaLock} placeholder="••••••••" value={form.password} onChange={handleChange} required />
                <InputField label="Confirm Password" name="confirmPassword" type="password" icon={FaLock} placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-secondary hover:bg-primary text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Processing Membership..." : "Complete Registration"} <FaArrowRight />
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-secondary/5">
            <p className="text-xs text-gray-400 font-medium">
              Already a member?{" "}
              <Link to="/login" className="text-secondary font-bold hover:underline">
                Log In to Portal
              </Link>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mx-auto flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors"
        >
          <FaChevronLeft size={8} /> Back to website
        </button>
      </div>
    </div>
  );
}

// Reusable Input Component for Premium Feel
const InputField = ({ label, name, type = "text", icon: Icon, placeholder, value, onChange, required = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-6">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors" />
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full pl-16 pr-8 py-4 bg-secondary/5 border border-transparent rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/20 font-medium transition-all text-sm"
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export default Register;
