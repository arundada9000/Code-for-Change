import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createProjectEntry } from "../../../Data/resumeData";

const ProjectsForm = ({ items, onChange, accentColor = "#0076B4" }) => {
  const inputClass =
    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

  const addEntry = () => onChange([...items, createProjectEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-5">
      {items.map((proj, index) => (
        <div
          key={proj.id}
          className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 group hover:border-slate-200 transition-colors"
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
                {proj.name || "New Project"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeEntry(proj.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <FaTrash size={10} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={proj.name} onChange={(e) => updateField(proj.id, "name", e.target.value)} placeholder="Project Name" className={inputClass} />
            <input type="url" value={proj.link} onChange={(e) => updateField(proj.id, "link", e.target.value)} placeholder="Project URL (optional)" className={inputClass} />
          </div>
          <textarea value={proj.description} onChange={(e) => updateField(proj.id, "description", e.target.value)} placeholder="Brief description..." rows={2} className={`${inputClass} resize-none leading-relaxed`} />
          <input type="text" value={proj.technologies} onChange={(e) => updateField(proj.id, "technologies", e.target.value)} placeholder="Technologies (e.g. React, Node.js)" className={inputClass} />
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2.5 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all w-full justify-center cursor-pointer"
      >
        <FaPlus size={10} /> Add Project
      </button>
    </div>
  );
};

export default ProjectsForm;
