import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createLanguageEntry, PROFICIENCY_LEVELS } from "../../../Data/resumeData";

const LanguagesForm = ({ items, onChange }) => {
  const inputClass =
    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

  const addEntry = () => onChange([...items, createLanguageEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-4">
      {items.map((lang, index) => (
        <div key={lang.id} className="flex items-center gap-3 group">
          <span className="text-[10px] font-black text-slate-400 w-5 text-center bg-slate-100 rounded-full py-1">
            {index + 1}
          </span>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={lang.language}
              onChange={(e) => updateField(lang.id, "language", e.target.value)}
              placeholder="Language (e.g. English)"
              className={inputClass}
            />
            <div className="relative">
              <select
                value={lang.proficiency}
                onChange={(e) => updateField(lang.id, "proficiency", e.target.value)}
                className={`${inputClass} appearance-none pr-10 cursor-pointer`}
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeEntry(lang.id)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer flex-shrink-0"
            title="Remove"
          >
            <FaTrash size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2.5 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all w-full justify-center cursor-pointer mt-2"
      >
        <FaPlus size={10} /> Add Language
      </button>
    </div>
  );
};

export default LanguagesForm;
