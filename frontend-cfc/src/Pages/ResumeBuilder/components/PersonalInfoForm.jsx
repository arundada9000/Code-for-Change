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

/**
 * PersonalInfoForm — edits personalInfo section of resume data.
 *
 * Props:
 *   - data: personalInfo object
 *   - onChange: (field, value) => void
 *   - accentColor: hex string
 */
const PersonalInfoForm = ({ data, onChange, accentColor = "#0076B4" }) => {
  const handle = (e) => onChange(e.target.name, e.target.value);

  const inputClass =
    "w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

  const Field = ({ icon: Icon, name, placeholder, type = "text", fullWidth = false }) => (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon size={13} style={{ color: accentColor }} />
        </div>
        <input
          type={type}
          name={name}
          value={data[name] || ""}
          onChange={handle}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field icon={FaUser} name="fullName" placeholder="Full Name" />
        <Field icon={FaBriefcase} name="title" placeholder="Job Title (e.g. Frontend Developer)" />
        <Field icon={FaEnvelope} name="email" placeholder="Email" type="email" />
        <Field icon={FaPhone} name="phone" placeholder="Phone" type="tel" />
        <Field icon={FaMapMarkerAlt} name="address" placeholder="Location (e.g. Kathmandu, Nepal)" />
        <Field icon={FaGlobe} name="website" placeholder="Website URL" type="url" />
        <Field icon={FaLinkedinIn} name="linkedin" placeholder="LinkedIn URL" type="url" />
        <Field icon={FaGithub} name="github" placeholder="GitHub URL" type="url" />
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
