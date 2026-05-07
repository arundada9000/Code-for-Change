import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createLanguageEntry, PROFICIENCY_LEVELS } from "../../../Data/resumeData";

const LanguagesForm = ({ items, onChange }) => {
  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

  const addEntry = () => onChange([...items, createLanguageEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-4">
      {items.map((lang, index) => (
        <div key={lang.id} className="flex items-center gap-3 group">
          <span className="text-xs font-bold text-slate-400 w-5">#{index + 1}</span>
          <input type="text" value={lang.language} onChange={(e) => updateField(lang.id, "language", e.target.value)} placeholder="Language" className={`${inputClass} flex-1`} />
          <select value={lang.proficiency} onChange={(e) => updateField(lang.id, "proficiency", e.target.value)} className={`${inputClass} w-36`}>
            {PROFICIENCY_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <button type="button" onClick={() => removeEntry(lang.id)} className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><FaTrash size={11} /></button>
        </div>
      ))}
      <button type="button" onClick={addEntry} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors w-full justify-center cursor-pointer">
        <FaPlus size={10} /> Add Language
      </button>
    </div>
  );
};

export default LanguagesForm;
