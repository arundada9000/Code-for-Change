import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createEducationEntry } from "../../../Data/resumeData";

/**
 * EducationForm — manages education entries.
 */
const EducationForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

  const addEntry = () => {
    onChange([...items, createEducationEntry()]);
  };

  const removeEntry = (id) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateField = (id, field, value) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  return (
    <div className="space-y-5">
      {items.map((edu, index) => (
        <div
          key={edu.id}
          className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 relative group hover:border-slate-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: accentColor }}
              >
                {index + 1}
              </div>
              <span className="text-xs font-bold text-slate-500">
                {edu.institution || "New Education"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeEntry(edu.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Remove"
            >
              <FaTrash size={10} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => updateField(edu.id, "institution", e.target.value)}
              placeholder="Institution / College"
              className={inputClass}
            />
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => updateField(edu.id, "degree", e.target.value)}
              placeholder="Degree (e.g. B.Sc., MBA)"
              className={inputClass}
            />
            <input
              type="text"
              value={edu.field}
              onChange={(e) => updateField(edu.id, "field", e.target.value)}
              placeholder="Field of Study"
              className={inputClass}
            />
            <input
              type="text"
              value={edu.gpa}
              onChange={(e) => updateField(edu.id, "gpa", e.target.value)}
              placeholder="GPA (optional)"
              className={inputClass}
            />
            <input
              type="month"
              value={edu.startDate}
              onChange={(e) => updateField(edu.id, "startDate", e.target.value)}
              className={inputClass}
            />
            <input
              type="month"
              value={edu.endDate}
              onChange={(e) => updateField(edu.id, "endDate", e.target.value)}
              className={inputClass}
            />
          </div>

          <textarea
            value={edu.description}
            onChange={(e) => updateField(edu.id, "description", e.target.value)}
            placeholder="Additional details (honors, relevant coursework, etc.)"
            rows={2}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2.5 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all w-full justify-center cursor-pointer"
      >
        <FaPlus size={10} /> Add Education
      </button>
    </div>
  );
};

export default EducationForm;
