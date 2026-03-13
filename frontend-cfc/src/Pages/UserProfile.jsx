import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import API from "../Services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaGraduationCap,
  FaLink,
  FaLinkedinIn,
  FaGithub,
  FaFacebookF,
  FaSignOutAlt,
  FaCheckCircle,
  FaVenusMars,
  FaUniversity,
  FaBook,
  FaGlobe,
  FaIdCard,
  FaHistory,
} from "react-icons/fa";

// Region color map
const REGION_COLORS = {
  kathmandu: "#CA163A",
  pokhara: "#F2CA50",
  rupandehi: "#880696",
  dang: "#6C757D",
  birgunj: "#00A155",
  farwest: "#FF914C",
  koshi: "#EF7B97",
  chitwan: "#964A01",
  "lb karnali": "#bbd704",
  "core team": "#0076B4",
};

const getRegionColor = (province) => {
  if (!province) return "#0076B4"; // default secondary
  const key = province.toLowerCase().trim();
  return REGION_COLORS[key] || "#0076B4";
};

// ====== Reusable Components ======

const Field = ({
  icon: Icon,
  label,
  name,
  type = "text",
  placeholder,
  isEditing,
  formData,
  handleChange,
  regionColor,
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
      {label}
    </label>
    {isEditing ? (
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
          <Icon size={14} style={{ color: regionColor }} />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 
                     placeholder:text-slate-300 outline-none
                     focus:border-[var(--region-color)] focus:shadow-[0_0_0_3px_var(--region-color-light)]
                     transition-all duration-200"
        />
      </div>
    ) : (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl min-h-[46px] border border-transparent">
        <Icon size={14} className="flex-shrink-0" style={{ color: regionColor }} />
        <span className="text-sm text-slate-700 break-all">
          {formData[name] || (
            <span className="text-slate-300 italic">Not provided</span>
          )}
        </span>
      </div>
    )}
  </div>
);

const SectionTitle = ({ icon: Icon, title, regionColor }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div
      className="p-1.5 rounded-md"
      style={{ backgroundColor: `${regionColor}15`, color: regionColor }}
    >
      <Icon size={14} />
    </div>
    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

function UserProfile() {
  const { user, updateUserData, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imgError, setImgError] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
    gender: "",
    dateOfBirth: "",
    collegeName: "",
    university: "",
    faculty: "",
    semester: "",
    website: "",
    linkedin: "",
    github: "",
    facebook: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        collegeName: user.education?.collegeName || "",
        university: user.education?.university || "",
        faculty: user.education?.faculty || "",
        semester: user.education?.semester || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        facebook: user.facebook || "",
      });
      setImgError(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const regionColor = getRegionColor(user.province);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      // Create a clean payload so invalid legacy data doesn't fail backend Zod URL validation
      const payload = { ...formData };
      ['website', 'linkedin', 'github', 'facebook'].forEach((field) => {
        let val = payload[field];
        if (!val || typeof val !== 'string' || val.trim() === '' || val.trim().toLowerCase() === 'n/a') {
          delete payload[field];
        } else {
          val = val.trim();
          if (!val.startsWith('http://') && !val.startsWith('https://')) {
            val = 'https://' + val;
          }
          // Only send it to the backend if it's actually a valid URL, otherwise let the backend default/ignore it
          try {
            new URL(val);
            payload[field] = val;
          } catch {
            delete payload[field]; // Ignore bad legacy data silently instead of blocking the whole profile save
          }
        }
      });

      const res = await API.patch("/auth/profile", payload);
      if (res.data.success) {
        updateUserData(res.data.data);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      }
    } catch (err) {
      console.error("Profile save error:", err.response?.data || err);
      let errorMsg = err.response?.data?.message || "Failed to update profile";
      if (err.response?.data?.errors?.length > 0) {
        errorMsg = `${err.response.data.errors[0].field}: ${err.response.data.errors[0].message}`;
      }
      setMessage({
        type: "error",
        text: errorMsg,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      bio: user.bio || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      collegeName: user.education?.collegeName || "",
      university: user.education?.university || "",
      faculty: user.education?.faculty || "",
      semester: user.education?.semester || "",
      website: user.website || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
      facebook: user.facebook || "",
    });
    setIsEditing(false);
  };

  const showProfileImage = user.profileImage && !imgError;

  return (
    <div 
      className="min-h-screen bg-slate-50 py-6 md:py-10 px-4 sm:px-6"
      style={{
        "--region-color": regionColor,
        "--region-color-light": `${regionColor}20`,
      }}
    >
      <div className="max-w-5xl mx-auto space-y-5">
        {/* ===== TOAST ===== */}
        {message.text && (
          <div
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
                        flex items-center gap-2 max-w-xs
                        ${
                          message.type === "success"
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
            style={{ animation: "profileSlideIn 0.3s ease" }}
          >
            <FaCheckCircle size={14} />
            {message.text}
          </div>
        )}

        {/* ===== PROFILE HEADER CARD ===== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Accent bar */}
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg, ${regionColor}, ${regionColor}88, ${regionColor}44)`,
            }}
          />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 self-center sm:self-start">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 shadow-md"
                  style={{ borderColor: `${regionColor}40` }}
                >
                  {showProfileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `${regionColor}15` }}
                    >
                      <FaUser size={36} style={{ color: `${regionColor}80` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
                  {user.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide text-white"
                    style={{ backgroundColor: regionColor }}
                  >
                    {user.role}
                  </span>
                  {user.province && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide border"
                      style={{ borderColor: regionColor, color: regionColor }}
                    >
                      <FaMapMarkerAlt size={10} />
                      {user.province}
                    </span>
                  )}
                  {user.isVerified && (
                    <FaCheckCircle
                      size={16}
                      className="mt-0.5"
                      style={{ color: regionColor }}
                      title="Verified"
                    />
                  )}
                </div>

                <p className="text-sm text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                  <FaEnvelope size={12} className="text-slate-400" />
                  {user.email}
                </p>

                {user.bio && !isEditing && (
                  <p className="text-sm text-slate-500 mt-2 max-w-lg leading-relaxed line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-row sm:flex-col gap-2 self-center sm:self-start flex-shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl
                                 hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                      <FaTimes size={12} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl
                                 transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
                      style={{ backgroundColor: regionColor }}
                    >
                      <FaSave size={12} /> {loading ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl
                               hover:border-slate-300 transition-all flex items-center gap-2"
                  >
                    <FaEdit size={12} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT — Form sections */}
          <div className="lg:col-span-8 space-y-5">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
              <SectionTitle icon={FaUser} title="Personal Information" regionColor={regionColor} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  icon={FaUser}
                  label="Full Name"
                  name="name"
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  regionColor={regionColor}
                />
                <Field
                  icon={FaPhoneAlt}
                  label="Phone"
                  name="phone"
                  type="tel"
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  regionColor={regionColor}
                />
                <Field
                  icon={FaMapMarkerAlt}
                  label="Address"
                  name="address"
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  regionColor={regionColor}
                />

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Gender
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <FaVenusMars size={14} style={{ color: regionColor }} />
                      </div>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800
                                   outline-none focus:border-[var(--region-color)] focus:shadow-[0_0_0_3px_var(--region-color-light)]
                                   transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl min-h-[46px] border border-transparent">
                      <FaVenusMars
                        size={14}
                        className="flex-shrink-0"
                        style={{ color: regionColor }}
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {formData.gender || (
                          <span className="text-slate-300 italic normal-case">
                            Not provided
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <FaCalendarAlt size={14} style={{ color: regionColor }} />
                      </div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800
                                   outline-none focus:border-[var(--region-color)] focus:shadow-[0_0_0_3px_var(--region-color-light)]
                                   transition-all duration-200"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl min-h-[46px] border border-transparent">
                      <FaCalendarAlt
                        size={14}
                        className="flex-shrink-0"
                        style={{ color: regionColor }}
                      />
                      <span className="text-sm text-slate-700">
                        {formData.dateOfBirth ? (
                          new Date(formData.dateOfBirth).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" },
                          )
                        ) : (
                          <span className="text-slate-300 italic">
                            Not provided
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Bio
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5">
                      <FaBook size={14} style={{ color: regionColor }} />
                    </div>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800
                                 placeholder:text-slate-300 outline-none
                                 focus:border-[var(--region-color)] focus:shadow-[0_0_0_3px_var(--region-color-light)]
                                 transition-all duration-200 resize-y min-h-[80px]"
                    />
                  </div>
                ) : (
                  <div className="flex gap-3 px-4 py-3 bg-slate-50 rounded-xl min-h-[70px] border border-transparent">
                    <FaBook
                      size={14}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: regionColor }}
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      {formData.bio || (
                        <span className="text-slate-300 italic">
                          No bio yet. Click Edit to add one.
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Education */}
            {(user.education ||
              ["student", "member", "gm", "eb", "cr", "alumni"].includes(
                user.role?.toLowerCase(),
              )) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
                <SectionTitle icon={FaGraduationCap} title="Education" regionColor={regionColor} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    icon={FaUniversity}
                    label="College"
                    name="collegeName"
                    isEditing={isEditing}
                    formData={formData}
                    handleChange={handleChange}
                    regionColor={regionColor}
                  />
                  <Field
                    icon={FaUniversity}
                    label="University"
                    name="university"
                    isEditing={isEditing}
                    formData={formData}
                    handleChange={handleChange}
                    regionColor={regionColor}
                  />
                  <Field
                    icon={FaGraduationCap}
                    label="Faculty"
                    name="faculty"
                    isEditing={isEditing}
                    formData={formData}
                    handleChange={handleChange}
                    regionColor={regionColor}
                  />
                  <Field
                    icon={FaCalendarAlt}
                    label="Semester"
                    name="semester"
                    isEditing={isEditing}
                    formData={formData}
                    handleChange={handleChange}
                    regionColor={regionColor}
                  />
                </div>
              </div>
            )}

            {/* Social */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
              <SectionTitle icon={FaGlobe} title="Social Links" regionColor={regionColor} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  icon={FaLink}
                  label="Website"
                  name="website"
                  type="url"
                  placeholder="https://..."
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  regionColor={regionColor}
                />
                <Field
                  icon={FaLinkedinIn}
                  label="LinkedIn"
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  regionColor={regionColor}
                />
                <Field
                  icon={FaGithub}
                  label="GitHub"
                  name="github"
                  type="url"
                  placeholder="https://github.com/..."
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  regionColor={regionColor}
                />
                <Field
                  icon={FaFacebookF}
                  label="Facebook"
                  name="facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  isEditing={isEditing}
                  formData={formData}
                  handleChange={handleChange}
                  regionColor={regionColor}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Quick Actions
              </p>
              <div className="space-y-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: "#01152E" }}
                  >
                    <FaShieldAlt size={14} style={{ color: regionColor }} />
                    Admin Dashboard
                  </Link>
                )}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: `${regionColor}10`,
                      color: regionColor,
                    }}
                  >
                    <FaEdit size={14} />
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold
                             hover:bg-rose-100 transition-all"
                >
                  <FaSignOutAlt size={14} />
                  Log Out
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Account
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "Status",
                    value: user.isActive ? "Active" : "Inactive",
                    badge: user.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600",
                  },
                  {
                    label: "Verified",
                    value: user.isVerified ? "Yes" : "Pending",
                    badge: user.isVerified
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${item.badge}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Role</span>
                  <span className="text-[11px] font-bold text-slate-600 uppercase">
                    {user.role}
                  </span>
                </div>
                {user.membership?.membershipId && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Member ID</span>
                    <span className="text-[11px] font-bold text-slate-600 font-mono">
                      {user.membership.membershipId}
                    </span>
                  </div>
                )}
                {user.province && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Region</span>
                    <span
                      className="text-[11px] font-bold flex items-center gap-1.5"
                      style={{ color: regionColor }}
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: regionColor }}
                      />
                      {user.province}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            <div
              className="rounded-2xl p-5 text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, #01152E, ${regionColor}90)`,
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: regionColor }}
              >
                Activity
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <FaHistory size={10} /> Last Login
                  </p>
                  <p className="text-sm font-medium text-white/80 mt-0.5">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "First login"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <FaCalendarAlt size={10} /> Member Since
                  </p>
                  <p className="text-sm font-medium text-white/80 mt-0.5">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes profileSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default UserProfile;
