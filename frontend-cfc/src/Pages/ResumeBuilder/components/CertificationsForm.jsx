import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createCertificationEntry } from "../../../Data/resumeData";

const CertificationsForm = ({ items, onChange }) => {
  const inputClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:bg-white transition-all";

  const addEntry = () => onChange([...items, createCertificationEntry()]);
  const removeEntry = (id) => onChange(items.filter((i) => i.id !== id));
  const updateField = (id, field, value) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="space-y-4">
      {items.map((cert, index) => (
        <div key={cert.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg space-y-3 group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase">#{index + 1}</span>
            <button type="button" onClick={() => removeEntry(cert.id)} className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><FaTrash size={11} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={cert.name} onChange={(e) => updateField(cert.id, "name", e.target.value)} placeholder="Certification Name" className={inputClass} />
            <input type="text" value={cert.issuer} onChange={(e) => updateField(cert.id, "issuer", e.target.value)} placeholder="Issuing Organization" className={inputClass} />
            <input type="month" value={cert.date} onChange={(e) => updateField(cert.id, "date", e.target.value)} className={inputClass} />
            <input type="url" value={cert.link} onChange={(e) => updateField(cert.id, "link", e.target.value)} placeholder="Credential URL (optional)" className={inputClass} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addEntry} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors w-full justify-center cursor-pointer">
        <FaPlus size={10} /> Add Certification
      </button>
    </div>
  );
};

export default CertificationsForm;
