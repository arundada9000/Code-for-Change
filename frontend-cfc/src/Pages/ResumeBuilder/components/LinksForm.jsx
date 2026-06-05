import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createLinkEntry } from "../../../Data/resumeData";

const LinksForm = ({ items, onChange }) => {
  const inputClass =
    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

  const addEntry = () => onChange([...items, createLinkEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-4">
      {items.map((link, index) => (
        <div key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-3 group bg-white border border-slate-100 p-3 rounded-2xl shadow-sm hover:border-slate-200 transition-colors">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-black text-slate-400 w-5 text-center bg-slate-100 rounded-full py-1">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeEntry(link.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 sm:hidden transition-all cursor-pointer"
            >
              <FaTrash size={12} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateField(link.id, "label", e.target.value)}
              placeholder="Label (e.g. Portfolio)"
              className={`${inputClass} sm:w-1/3`}
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateField(link.id, "url", e.target.value)}
              placeholder="https://..."
              className={`${inputClass} flex-1`}
            />
          </div>
          
          <button
            type="button"
            onClick={() => removeEntry(link.id)}
            className="w-10 h-10 rounded-xl hidden sm:flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer flex-shrink-0"
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
        <FaPlus size={10} /> Add Link
      </button>
    </div>
  );
};

export default LinksForm;
