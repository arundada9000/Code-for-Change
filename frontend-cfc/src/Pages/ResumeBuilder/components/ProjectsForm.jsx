import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createProjectEntry } from "../../../Data/resumeData";

const ProjectsForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

  const addEntry = () => onChange([...items, createProjectEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-4">
      {items.map((proj, index) => (
        <div key={proj.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg space-y-3 group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase">#{index + 1}</span>
            <button type="button" onClick={() => removeEntry(proj.id)} className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><FaTrash size={11} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={proj.name} onChange={(e) => updateField(proj.id, "name", e.target.value)} placeholder="Project Name" className={inputClass} />
            <input type="url" value={proj.link} onChange={(e) => updateField(proj.id, "link", e.target.value)} placeholder="Project URL (optional)" className={inputClass} />
          </div>
          <textarea value={proj.description} onChange={(e) => updateField(proj.id, "description", e.target.value)} placeholder="Brief description..." rows={2} className={`${inputClass} resize-none`} />
          <input type="text" value={proj.technologies} onChange={(e) => updateField(proj.id, "technologies", e.target.value)} placeholder="Technologies (e.g. React, Node.js)" className={inputClass} />
        </div>
      ))}
      <button type="button" onClick={addEntry} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors w-full justify-center cursor-pointer">
        <FaPlus size={10} /> Add Project
      </button>
    </div>
  );
};

export default ProjectsForm;
