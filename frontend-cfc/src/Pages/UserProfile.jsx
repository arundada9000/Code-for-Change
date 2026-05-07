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
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaSignOutAlt,
  FaCheckCircle,
  FaVenusMars,
  FaUniversity,
  FaBook,
  FaGlobe,
  FaIdCard,
  FaHistory,
  FaFileAlt,
} from "react-icons/fa";

import { FadeIn, SlideUp } from "../Components/Common/Animations";
import MemberCard from "../Components/MemberCard";

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
}) => {
  const inputId = name || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={inputId} className="block text-xs tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      {isEditing ? (
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true">
            <Icon size={14} style={{ color: regionColor }} />
          </div>
          <input
            id={inputId}
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 
            placeholder:text-slate-300 outline-none
            focus:border-(--region-color) ]
            transition-all duration-200"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl min-h-[46px] border border-transparent">
          <Icon
            size={14}
            className="flex-shrink-0"
            style={{ color: regionColor }}
            aria-hidden="true"
          />
          <span className="text-sm text-slate-700 break-all">
            {formData[name] || (
              <span className="text-slate-300 ">Not provided</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

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
    twitter: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    secondaryEmail: "",
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
        twitter: user.twitter || "",
        instagram: user.instagram || "",
        tiktok: user.tiktok || "",
        youtube: user.youtube || "",
        secondaryEmail: user.secondaryEmail || "",
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
      // Sanitize and validate all social link URLs before submitting
      const payload = { ...formData };
      const socialFields = ["website", "linkedin", "github", "facebook", "twitter", "instagram", "tiktok", "youtube"];
      socialFields.forEach((field) => {
        let val = payload[field];
        if (
          !val ||
          typeof val !== "string" ||
          val.trim() === "" ||
          val.trim().toLowerCase() === "n/a"
        ) {
          payload[field] = ""; // send empty string to explicitly clear the field
        } else {
          val = val.trim();
          if (!val.startsWith("http://") && !val.startsWith("https://")) {
            val = "https://" + val;
          }
          try {
            new URL(val);
            payload[field] = val;
          } catch {
            payload[field] = ""; // invalid URL — clear it silently
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
      twitter: user.twitter || "",
      instagram: user.instagram || "",
      tiktok: user.tiktok || "",
      youtube: user.youtube || "",
      secondaryEmail: user.secondaryEmail || "",
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
        <FadeIn className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative">
            {/* 1. Banner Background */}
            <div
              className="h-32 sm:h-40 w-full opacity-80"
              style={{
                background: `linear-gradient(135deg, ${regionColor}40, #e2e8f0)`,
              }}
            >
              <button
                onClick={() => setIsEditing(true)}
                className="p-4 sm:hidden bg-blue-300/20 backdrop-blur-md absolute right-4 top-4 text-blue-500 cursor-pointer border-t border-b border-white text-sm font-bold rounded-full hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
              >
                <FaEdit size={18} />
                
              </button>
            </div>

            {/* 2. Content Card */}
            <div className="px-6 pb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 -mt-12 sm:-mt-16">
                {/* LEFT COLUMN: Avatar + Name + Email Group */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  {/* Avatar */}
                  <div className="relative shrink-0 mb-4">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
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
                          <FaUser size={40} style={{ color: regionColor }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name and Verification */}
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {user.name}
                    </h1>
                    {user.isVerified && (
                      <FaCheckCircle size={22} className="text-secondary mt-1" />
                    )}
                  </div>

                  {/* Email */}
                  <p className="text-sm text-slate-400 mb-3">
                    {user.email}
                  </p>

                  {/* Role/Province Tags */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span
                      className="px-2.5 py-1 text-[10px] font-bold rounded-full capitalize text-white"
                      style={{ backgroundColor: regionColor }}
                    >
                      {user.role}
                    </span>
                    {user.province && (
                      <span
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border-2"
                        style={{
                          borderColor: `${regionColor}20`,
                          color: regionColor,
                        }}
                      >
                        <FaMapMarkerAlt size={10} />
                        {user.province}
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Isolated Action Button */}
                <div className="flex items-center gap-2 sm:pb-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2.5 bg-slate-100 cursor-pointer text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                        title="Cancel"
                      >
                        <FaTimes size={16} />
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 text-white text-sm cursor-pointer font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                        style={{ backgroundColor: regionColor }}
                      >
                        <FaSave size={14} /> {loading ? "..." : "Save"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 max-sm:hidden bg-white text-secondary cursor-pointer border-2 border-secondary text-sm font-bold rounded-full hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <FaEdit size={14} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* FULL WIDTH: Bio Section */}
              {user.bio && !isEditing && (
                <div className="text-center sm:text-left border-t border-slate-50 pt-6">
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto sm:mx-0">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* ===== CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-6 items-start">
          {/* COLUMN 1: LEFT SIDEBAR (Sticky Quick Actions) */}
          <SlideUp
            delay={0.1}
            className="lg:col-span-3 space-y-5 lg:sticky lg:top-20"
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-3">
                Quick Actions
              </p>
              <div className="space-y-2">
                <Link
                  to="/resume-builder"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                >
                  <FaFileAlt size={14} />
                  Resume Builder
                </Link>
                <MemberCard user={user} regionColor={regionColor} />
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

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <FaSignOutAlt size={14} />
                  Log Out
                </button>
              </div>
            </div>

            {/* Account Status Badge List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-3">
                Account Status
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
                  ...(user.tenure ? [{
                    label: "Tenure",
                    value: user.tenure,
                    badge: "bg-blue-50 text-blue-600",
                  }] : []),
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
              </div>
            </div>
            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <SectionTitle
                icon={FaGlobe}
                title="Social"
                regionColor={regionColor}
              />
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { icon: FaLink, url: formData.website, color: "#6366f1", label: "Web" },
                  { icon: FaLinkedinIn, url: formData.linkedin, color: "#0077b5", label: "LinkedIn" },
                  { icon: FaGithub, url: formData.github, color: "#181717", label: "GitHub" },
                  { icon: FaFacebookF, url: formData.facebook, color: "#1877f2", label: "FB" },
                  { icon: FaTwitter, url: formData.twitter, color: "#1DA1F2", label: "X" },
                  { icon: FaInstagram, url: formData.instagram, color: "#E1306C", label: "IG" },
                  { icon: FaTiktok, url: formData.tiktok, color: "#000000", label: "TikTok" },
                  { icon: FaYoutube, url: formData.youtube, color: "#FF0000", label: "YT" },
                ].map((social, index) => (
                  <button
                    key={index}
                    disabled={!social.url}
                    onClick={() =>
                      social.url && window.open(social.url, "_blank")
                    }
                    className={`p-3 rounded-xl cursor-pointer border flex flex-col items-center gap-1 transition-all ${social.url ? "bg-white border-slate-200 hover:shadow-md" : "bg-slate-50 opacity-40 cursor-not-allowed"}`}
                  >
                    <social.icon
                      size={18}
                      style={{ color: social.url ? social.color : "#94a3b8" }}
                    />
                  </button>
                ))}
              </div>
              {/* Activity Log Card */}
              <div
                className="rounded-2xl p-5 mt-5 text-white shadow-sm"
                style={{
                  background: regionColor,
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-4"
                  // style={{ color: regionColor }}
                >
                Activity
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white uppercase flex items-center gap-1.5">
                      <FaHistory size={10} /> Last Login
                    </p>
                    <p className="text-[10px] text-white/80">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "First login"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white uppercase flex items-center gap-1.5">
                      <FaCalendarAlt size={10} /> Joined
                    </p>
                    <p className="text-[10px] text-white/90">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SlideUp>

          {/* COLUMN 2: CENTER (Main Content) */}
          <SlideUp delay={0.2} className="lg:col-span-6 space-y-5">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
              <SectionTitle
                icon={FaUser}
                title="Personal Information"
                regionColor={regionColor}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                  icon={FaEnvelope}
                  label="Secondary Email"
                  name="secondaryEmail"
                  type="email"
                  placeholder="Alternative email (optional)"
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

                {/* Gender Select */}
                <div>
                  <label className="block text-xs tracking-wider mb-1.5 ml-1">
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
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-(--region-color) transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl min-h-[46px]">
                      <FaVenusMars size={14} style={{ color: regionColor }} />
                      <span className="text-sm text-slate-700 capitalize">
                        {formData.gender || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-5 pt-5 border-t border-slate-50">
                <label className="block text-xs tracking-wider mb-1.5 ml-1">
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
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[var(--region-color)] transition-all min-h-[80px]"
                    />
                  </div>
                ) : (
                  <div className="flex gap-3 px-4 py-3 bg-slate-50 rounded-xl min-h-[70px]">
                    <FaBook
                      size={14}
                      className="mt-0.5"
                      style={{ color: regionColor }}
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      {formData.bio || "No bio yet."}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Education Section */}
            {(user.education ||
              ["student", "member", "gm", "eb", "cr", "alumni"].includes(
                user.role?.toLowerCase(),
              )) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
                <SectionTitle
                  icon={FaGraduationCap}
                  title="Education"
                  regionColor={regionColor}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                <Field icon={FaLink} label="Website" name="website" type="url" placeholder="https://..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
                <Field icon={FaLinkedinIn} label="LinkedIn" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
                <Field icon={FaGithub} label="GitHub" name="github" type="url" placeholder="https://github.com/..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
                <Field icon={FaFacebookF} label="Facebook" name="facebook" type="url" placeholder="https://facebook.com/..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
                <Field icon={FaTwitter} label="Twitter / X" name="twitter" type="url" placeholder="https://twitter.com/..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
                <Field icon={FaInstagram} label="Instagram" name="instagram" type="url" placeholder="https://instagram.com/..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
                <Field icon={FaTiktok} label="TikTok" name="tiktok" type="url" placeholder="https://tiktok.com/@..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
                <Field icon={FaYoutube} label="YouTube" name="youtube" type="url" placeholder="https://youtube.com/@..." isEditing={isEditing} formData={formData} handleChange={handleChange} regionColor={regionColor} />
              </div>
            </div>
          
          </SlideUp>
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
