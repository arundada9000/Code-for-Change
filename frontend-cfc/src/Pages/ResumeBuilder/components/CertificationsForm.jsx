import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createCertificationEntry } from "../../../Data/resumeData";

const CertificationsForm = ({ items, onChange }) => {
  const inputClass =
    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all";

  const addEntry = () => onChange([...items, createCertificationEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-5">
      {items.map((cert, index) => (
        <div
          key={cert.id}
          className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 group hover:border-slate-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white bg-secondary">
                {index + 1}
              </div>
              <span className="text-xs font-bold text-slate-500">
                {cert.name || "New Certification"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeEntry(cert.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <FaTrash size={10} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={cert.name} onChange={(e) => updateField(cert.id, "name", e.target.value)} placeholder="Certification Name" className={inputClass} />
            <input type="text" value={cert.issuer} onChange={(e) => updateField(cert.id, "issuer", e.target.value)} placeholder="Issuing Organization" className={inputClass} />
            <input type="month" value={cert.date} onChange={(e) => updateField(cert.id, "date", e.target.value)} className={inputClass} />
            <input type="url" value={cert.link} onChange={(e) => updateField(cert.id, "link", e.target.value)} placeholder="Credential URL (optional)" className={inputClass} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2.5 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all w-full justify-center cursor-pointer"
      >
        <FaPlus size={10} /> Add Certification
      </button>
    </div>
  );
};

export default CertificationsForm;
