import React, { useState } from "react";
import RegisterImg from "../../assets/RegisterIllustration.jpg";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaArrowRight,
  FaChevronLeft,
  FaUniversity,
  FaGraduationCap,
  FaIdCard,
  FaCamera,
  FaLayerGroup,
  FaMapPin,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaFacebook,
  FaVenusMars,
  FaHome,
  FaInfoCircle,
  FaCheckCircle,
  FaCalendar,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import SEO from "../../Components/Common/SEO";
import API from "../../Services/api";
import Banner from "../../Components/UI/Banner";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    code: "",
    phone: "",
    collegeName: "",
    role: "gm",
    tenure: "",
    ebBody: "",
    faculty: "",
    semester: "",
    province: "",
    password: "",
    confirmPassword: "",
    linkedin: "",
    github: "",
    website: "",
    facebook: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    bio: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const value =
      e.target.name === "email" ? e.target.value.toLowerCase() : e.target.value;
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

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    // Phone validation per backend schema (E.164 format roughly)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      return setError(
        "Please enter a valid phone number (e.g. 98...) without spaces",
      );
    }

    // Validate optional URLs
    const urlFields = ["website", "linkedin", "github", "facebook"];
    for (const field of urlFields) {
      if (form[field].trim()) {
        try {
          new URL(form[field].trim());
        } catch (_) {
          return setError(
            `Please enter a valid URL for ${field.charAt(0).toUpperCase() + field.slice(1)} (must include http:// or https://)`,
          );
        }
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Append form fields — skip confirmPassword (UI-only) and empty optional fields
      const excludeFields = ["confirmPassword"];
      Object.entries(form).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && value.trim() !== "") {
          formData.append(key, value.trim());
        }
      });

      // Role is already in form fields via Object.entries above

      // Append profile image if exists
      if (profilePicture) {
        formData.append("profileImage", profilePicture);
      }

      const response = await API.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
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
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Welcome to CFC!
          </h2>
          <p className="text-gray-500 font-medium">
            Your member registration was successful. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-secondary/10 selection:text-secondary">
      <Banner />

      <SEO
        title="Create Account"
        description="Register for the Code for Change Nepal portal to access exclusive events, certificates, and community resources."
      />
      <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 flex flex-col lg:flex-row gap-12 items-center">
        <div className="lg:w-1/2 w-full">
          {/* Section Header */}
          <div className="mb-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 bg-primary"></span>
              <h4 className="uppercase tracking-wider text-base font-semibold text-primary">
                Registration
              </h4>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Join us and be part of our community
            </h2>

            <p className="mt-4 text-gray-600">
              Register as a member, executive, CR, supporter, or mentor and gain
              access to events, projects, and opportunities to make a real
              impact.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2 w-full flex justify-center">
          <img
            src={RegisterImg}
            alt="Register Illustration"
            className="w-full max-w-md rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-center bg-secondary/5 py-16">
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link to="/" className="block group text-center">
            <img
              src={logo}
              alt="CFC Logo"
              className="w-28 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300"
            />
            <h1 className="text-4xl font-bold text-primary tracking-tight">
              Code <span className="text-secondary">For Change</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Join our student-led IT community and create change.
            </p>
          </Link>

          <div className="bg-white rounded-3xl shadow-xl shadow-secondary/5 border border-secondary/10 p-8 md:p-12">
            {error && (
              <div className="mb-8 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Personal Info Section */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2 mb-4">
                    <FaUser className="text-secondary" /> Basic Information
                  </h3>

                  <InputField
                    label="Full Name"
                    name="name"
                    icon={FaUser}
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={FaEnvelope}
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Contact Number"
                    name="phone"
                    type="tel"
                    icon={FaPhone}
                    placeholder="Enter contact"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Member Code"
                    name="code"
                    icon={FaIdCard}
                    placeholder="Enter member code"
                    value={form.code}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Academic/CFC Info Section */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2 mb-4">
                    <FaUniversity className="text-secondary" /> Association
                    Details
                  </h3>

                  <InputField
                    label="College Name"
                    name="collegeName"
                    icon={FaUniversity}
                    placeholder="Enter college name"
                    value={form.collegeName}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Faculty"
                    name="faculty"
                    icon={FaGraduationCap}
                    placeholder="Enter faculty"
                    value={form.faculty}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Semester"
                    name="semester"
                    icon={FaLayerGroup}
                    placeholder="e.g. 5th"
                    value={form.semester}
                    onChange={handleChange}
                    required
                  />

                  <div className="space-y-2 group">
                    <label htmlFor="role" className="text-base font-medium group-focus-within:text-secondary">
                      I am joining as
                    </label>
                    <div className="relative group mt-1">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10" aria-hidden="true">
                        <FaUser />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-4 border border-secondary/50 rounded-full outline-none focus:bg-white focus:border-secondary transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs"
                      >
                        <option value="gm">General Member</option>
                        <option value="eb">Executive Board (EB)</option>
                        <option value="cr">Campus Representative (CR)</option>
                        <option value="ippl">IPPL</option>
                        <option value="advisor">Advisor</option>
                        <option value="alumni">Alumni</option>
                        <option value="guest">Guest</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label htmlFor="tenure" className="text-base font-medium group-focus-within:text-secondary">
                      Tenure
                    </label>
                    <div className="relative group mt-1">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10" aria-hidden="true">
                        <FaCalendar />
                      </div>
                      <select
                        id="tenure"
                        name="tenure"
                        value={form.tenure}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-4 border border-secondary/50 rounded-full outline-none focus:bg-white focus:border-secondary transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs"
                      >
                        <option value="">Select Tenure</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2022-2023">2022-2023</option>
                      </select>
                    </div>
                  </div>

                  {form.role === "eb" && (
                    <div className="space-y-2 group">
                      <label htmlFor="ebBody" className="text-base font-medium group-focus-within:text-secondary">
                        EB Position
                      </label>
                      <div className="relative group mt-1">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10" aria-hidden="true">
                          <FaIdCard />
                        </div>
                        <select
                          id="ebBody"
                          name="ebBody"
                          value={form.ebBody}
                          onChange={handleChange}
                          required
                          className="w-full pl-14 pr-6 py-4 border border-secondary/50 rounded-full outline-none focus:bg-white focus:border-secondary transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs"
                        >
                          <option value="">Select Position</option>
                          <option value="tech-lead">Tech Lead</option>
                          <option value="project-lead">Project Lead</option>
                          <option value="vice-project-lead">
                            Vice Project Lead
                          </option>
                          <option value="operation-lead">Operation Lead</option>
                          <option value="admin-lead">Admin Lead</option>
                          <option value="hr-lead">HR Lead</option>
                          <option value="pr-lead">PR Lead</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="vice-treasurer">Vice Treasurer</option>
                          <option value="executive-member">
                            Executive Member
                          </option>
                          <option value="secretary">Secretary</option>
                          <option value="vice-secretary">Vice Secretary</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 group">
                    <label htmlFor="province" className="text-base font-medium group-focus-within:text-secondary">
                      Region
                    </label>
                    <div className="relative group mt-1">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10" aria-hidden="true">
                        <FaMapPin />
                      </div>
                      <select
                        id="province"
                        name="province"
                        value={form.province}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-6 py-4 border border-secondary/50 rounded-full outline-none focus:bg-white focus:border-secondary transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs"
                      >
                        <option value="">Select Region</option>
                        {[
                          "Kathmandu",
                          "Pokhara",
                          "Rupandehi",
                          "Dang",
                          "Birgunj",
                          "Farwest",
                          "Koshi",
                          "Chitwan",
                          "LB Karnali",
                        ].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium group-focus-within:text-secondary">
                      Profile Picture
                    </label>
                    <div className="relative group mt-1">
                      <input
                        type="file"
                        id="profilePic"
                        hidden
                        onChange={handleFileChange}
                        accept="image/*"
                        className="bg-none border border-secondary/50"
                      />
                      <label
                        htmlFor="profilePic"
                        className="w-full flex items-center gap-4 pl-6 pr-6 py-4 border border-secondary/50 rounded-full cursor-pointer hover:bg-white hover:border-secondary/50 transition-all font-medium text-gray-400"
                      >
                        <FaCamera className="text-gray-300 group-hover:text-secondary" />
                        <span className="text-xs truncate">
                          {profilePicture
                            ? profilePicture.name
                            : "Choose profile picture"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Professional & Additional Info Section */}
                <div className="space-y-6 md:col-span-2 pt-6 border-t border-secondary/50">
                  <h3 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2 mb-4">
                    <FaInfoCircle className="text-secondary" /> Additional
                    Details & Links (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {/* Gender Select */}
                    <div className="space-y-2 group">
                      <label htmlFor="gender" className="text-base font-medium group-focus-within:text-secondary">
                        Gender (Optional)
                      </label>
                      <div className="relative group mt-2">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-secondary transition-colors z-10" aria-hidden="true">
                          <FaVenusMars />
                        </div>
                        <select
                          id="gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="w-full pl-14 pr-6 py-4 border border-secondary/50 rounded-full outline-none focus:bg-white focus:border-secondary/50 transition-all font-medium text-gray-600 appearance-none cursor-pointer text-xs focus:ring focus:ring-secondary"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <InputField
                      label="Date of Birth (Optional)"
                      name="dateOfBirth"
                      type="date"
                      icon={FaCalendar}
                      placeholder=""
                      value={form.dateOfBirth}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Address (Optional)"
                      name="address"
                      icon={FaHome}
                      placeholder="Enter your address"
                      value={form.address}
                      onChange={handleChange}
                    />
                    <InputField
                      label="LinkedIn Profile (Optional)"
                      name="linkedin"
                      icon={FaLinkedin}
                      placeholder="https://linkedin.com/in/..."
                      value={form.linkedin}
                      onChange={handleChange}
                    />
                    <InputField
                      label="GitHub Profile (Optional)"
                      name="github"
                      icon={FaGithub}
                      placeholder="https://github.com/..."
                      value={form.github}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Portfolio / Website (Optional)"
                      name="website"
                      icon={FaGlobe}
                      placeholder="https://yourwebsite.com"
                      value={form.website}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Facebook Profile (Optional)"
                      name="facebook"
                      icon={FaFacebook}
                      placeholder="https://facebook.com/..."
                      value={form.facebook}
                      onChange={handleChange}
                    />

                    <div className="space-y-2 md:col-span-2 group">
                      <label className="text-base font-medium group-focus-within:text-secondary">
                        Short Bio (Optional)
                      </label>
                      <div className="relative group mt-1">
                        <FaInfoCircle className="absolute left-6 top-6 -translate-y-1/2 text-gray-300 transition-colors group-hover:text-secondary cursor-pointer" />
                        <textarea
                          name="bio"
                          placeholder="Tell us a little about yourself (max 1000 characters)..."
                          maxLength="1000"
                          className="w-full rounded-2xl pl-16 pr-8 py-4 border border-secondary/50 rounded-3x cursor-pointer outline-none focus:bg-white focus:ring focus:ring-secondary focus:border-secondary/50 font-medium transition-all text-sm resize-none"
                          value={form.bio}
                          onChange={handleChange}
                          rows="7"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-8 border-t border-secondary/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                    icon={FaLock}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    icon={FaLock}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-secondary group cursor-pointer hover:bg-secondary/95 hover:-translate-y-1 text-white rounded-full text-base font-medium capitalize hover:shadow-lg shadow-secondary/20 transition-all ease-in duration-200 active:scale-95 flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? "Processing Membership..." : "Complete Registration"}{" "}
                <FaArrowRight className="group-hover:translate-x-3 transition-all ease-in duration-200" />
              </button>
            </form>

            <div className="mt-8 text-center pt-8 border-t border-secondary/50">
              <p className="text-base text-gray-400">
                Already a member? <br />
                <Link
                  to="/login"
                  className="text-secondary block py-4 mt-8 border border-secondary rounded-full hover:bg-secondary transition-all ease-in duration-200 hover:text-white hover:shadow-lg shadow-secondary/20 hover:-translate-y-1 font-semibold"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mx-auto flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors"
          >
            <FaChevronLeft size={8} /> Back to website
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component for Premium Feel
const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  const inputId = name || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="group">
      <label htmlFor={inputId} className=" group-focus-within:text-secondary font-medium text-base ">
        {label}
      </label>
      <div className="relative group mt-1">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary transition-colors group-hover:text-secondary" aria-hidden="true" />
        <input
          id={inputId}
          type={type}
          name={name}
          required={required}
          autoComplete={name}
          placeholder={placeholder}
          className="w-full pl-16 pr-8 py-4  border cursor-pointer border-secondary/50 rounded-full outline-none focus:bg-white focus:ring focus:ring-secondary  font-medium transition-all text-sm"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Register;
