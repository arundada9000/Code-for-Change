import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createExperienceEntry } from "../../../Data/resumeData";

/**
 * ExperienceForm — manages work experience entries.
 */
const ExperienceForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

  const addEntry = () => {
    onChange([...items, createExperienceEntry()]);
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
      {items.map((exp, index) => (
        <div
          key={exp.id}
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
                {exp.position || "New Position"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeEntry(exp.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Remove"
            >
              <FaTrash size={10} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={exp.position}
              onChange={(e) => updateField(exp.id, "position", e.target.value)}
              placeholder="Job Title"
              className={inputClass}
            />
            <input
              type="text"
              value={exp.company}
              onChange={(e) => updateField(exp.id, "company", e.target.value)}
              placeholder="Company Name"
              className={inputClass}
            />
            <input
              type="month"
              value={exp.startDate}
              onChange={(e) => updateField(exp.id, "startDate", e.target.value)}
              className={inputClass}
            />
            <div className="flex items-center gap-3">
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) =>
                  updateField(exp.id, "endDate", e.target.value)
                }
                disabled={exp.current}
                className={`${inputClass} ${exp.current ? "opacity-40" : ""}`}
              />
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 whitespace-nowrap cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    updateField(exp.id, "current", e.target.checked)
                  }
                  className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                />
                Current
              </label>
            </div>
          </div>

          <textarea
            value={exp.description}
            onChange={(e) =>
              updateField(exp.id, "description", e.target.value)
            }
            placeholder="Describe your role, responsibilities, and achievements..."
            rows={3}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2.5 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all w-full justify-center cursor-pointer"
      >
        <FaPlus size={10} /> Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;
