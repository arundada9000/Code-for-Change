import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createLinkEntry } from "../../../Data/resumeData";

const LinksForm = ({ items, onChange }) => {
  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

  const addEntry = () => onChange([...items, createLinkEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-4">
      {items.map((link, index) => (
        <div key={link.id} className="flex items-center gap-3 group">
          <span className="text-xs font-bold text-slate-400 w-5">#{index + 1}</span>
          <input type="text" value={link.label} onChange={(e) => updateField(link.id, "label", e.target.value)} placeholder="Label (e.g. Portfolio)" className={`${inputClass} flex-1`} />
          <input type="url" value={link.url} onChange={(e) => updateField(link.id, "url", e.target.value)} placeholder="https://..." className={`${inputClass} flex-1`} />
          <button type="button" onClick={() => removeEntry(link.id)} className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><FaTrash size={11} /></button>
        </div>
      ))}
      <button type="button" onClick={addEntry} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors w-full justify-center cursor-pointer">
        <FaPlus size={10} /> Add Link
      </button>
    </div>
  );
};

export default LinksForm;
