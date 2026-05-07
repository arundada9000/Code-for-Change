import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createEducationEntry } from "../../../Data/resumeData";

/**
 * EducationForm — manages education entries.
 */
const EducationForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

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
    <div className="space-y-4">
      {items.map((edu, index) => (
        <div
          key={edu.id}
          className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg space-y-3 relative group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase">
              #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeEntry(edu.id)}
              className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Remove"
            >
              <FaTrash size={11} />
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
            className={`${inputClass} resize-none`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors w-full justify-center cursor-pointer"
      >
        <FaPlus size={10} /> Add Education
      </button>
    </div>
  );
};

export default EducationForm;
