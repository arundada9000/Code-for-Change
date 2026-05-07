import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createExperienceEntry } from "../../../Data/resumeData";

/**
 * ExperienceForm — manages work experience entries.
 *
 * Props:
 *   - items: experience array
 *   - onChange: (updatedArray) => void
 *   - accentColor: hex string
 */
const ExperienceForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

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
    <div className="space-y-4">
      {items.map((exp, index) => (
        <div
          key={exp.id}
          className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg space-y-3 relative group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase">
              #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeEntry(exp.id)}
              className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Remove"
            >
              <FaTrash size={11} />
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
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) =>
                  updateField(exp.id, "endDate", e.target.value)
                }
                disabled={exp.current}
                className={`${inputClass} ${exp.current ? "opacity-40" : ""}`}
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    updateField(exp.id, "current", e.target.checked)
                  }
                  className="accent-blue-500"
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
        <FaPlus size={10} /> Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;
