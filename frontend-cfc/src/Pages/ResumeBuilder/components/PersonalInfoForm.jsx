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
  "w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

/**
 * Single field row — defined OUTSIDE the parent to prevent unmount on re-render.
 */
const Field = ({ icon: Icon, name, placeholder, type = "text", fullWidth, value, onChange, accentColor }) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <div className="relative group/field">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center transition-colors">
        <Icon size={12} style={{ color: accentColor }} className="opacity-60 group-focus-within/field:opacity-100 transition-opacity" />
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
    <div className="space-y-5">
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
        <label className="block text-xs font-black text-slate-500 uppercase mb-2">
          Professional Summary
        </label>
        <textarea
          name="summary"
          value={data.summary || ""}
          onChange={handle}
          placeholder="Write a brief professional summary or objective..."
          rows={4}
          className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
