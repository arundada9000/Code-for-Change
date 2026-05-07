import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaGithub,
  FaBriefcase,
} from "react-icons/fa";

const inputClass =
  "w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

/**
 * Single field row — defined OUTSIDE the parent to prevent unmount on re-render.
 */
const Field = ({ icon: Icon, name, placeholder, type = "text", fullWidth, value, onChange, accentColor }) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Icon size={13} style={{ color: accentColor }} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  </div>
);

/**
 * PersonalInfoForm — edits personalInfo section of resume data.
 */
const PersonalInfoForm = ({ data, onChange, accentColor = "#0076B4" }) => {
  const handle = (e) => onChange(e.target.name, e.target.value);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field icon={FaUser} name="fullName" placeholder="Full Name" value={data.fullName || ""} onChange={handle} accentColor={accentColor} />
        <Field icon={FaBriefcase} name="title" placeholder="Job Title (e.g. Frontend Developer)" value={data.title || ""} onChange={handle} accentColor={accentColor} />
        <Field icon={FaEnvelope} name="email" placeholder="Email" type="email" value={data.email || ""} onChange={handle} accentColor={accentColor} />
        <Field icon={FaPhone} name="phone" placeholder="Phone" type="tel" value={data.phone || ""} onChange={handle} accentColor={accentColor} />
        <Field icon={FaMapMarkerAlt} name="address" placeholder="Location (e.g. Kathmandu, Nepal)" value={data.address || ""} onChange={handle} accentColor={accentColor} />
        <Field icon={FaGlobe} name="website" placeholder="Website URL" type="url" value={data.website || ""} onChange={handle} accentColor={accentColor} />
        <Field icon={FaLinkedinIn} name="linkedin" placeholder="LinkedIn URL" type="url" value={data.linkedin || ""} onChange={handle} accentColor={accentColor} />
        <Field icon={FaGithub} name="github" placeholder="GitHub URL" type="url" value={data.github || ""} onChange={handle} accentColor={accentColor} />
      </div>

      {/* Summary / Objective */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Professional Summary
        </label>
        <textarea
          name="summary"
          value={data.summary || ""}
          onChange={handle}
          placeholder="Write a brief professional summary or objective..."
          rows={3}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
