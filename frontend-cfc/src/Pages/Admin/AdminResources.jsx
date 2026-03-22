import React, { useState, useEffect } from "react";
import {
  FaPlus, FaSearch, FaFileAlt, FaTimes, FaCloudUploadAlt,
  FaBook, FaDownload, FaTrash, FaEdit, FaEye, FaLink,
  FaPalette, FaImage, FaLock, FaGlobe, FaCheck
} from "react-icons/fa";
import { MdColorLens } from "react-icons/md";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";

// ─────────────────────────────────────────────────────────
// Constants (mirrors backend)
// ─────────────────────────────────────────────────────────
const VISIBILITY_OPTIONS = [
  { value: "public",  label: "Public",      description: "Everyone",             color: "#10b981", bg: "#ecfdf5" },
  { value: "gm",      label: "Members",     description: "General Members+",     color: "#3b82f6", bg: "#eff6ff" },
  { value: "cr",      label: "Coordinators",description: "CRs + above",          color: "#f59e0b", bg: "#fffbeb" },
  { value: "eb",      label: "Executives",  description: "EB + above",            color: "#8b5cf6", bg: "#f5f3ff" },
  { value: "admin",   label: "Admin Only",  description: "Admins only",           color: "#ef4444", bg: "#fef2f2" },
];

const CATEGORY_OPTIONS = [
  { value: "academic",    label: "Academic",   },
  { value: "branding",    label: "Branding",   },
  { value: "background",  label: "Background", },
  { value: "internal",    label: "Internal",   },
  { value: "other",       label: "Other",      },
];

const TYPE_OPTIONS = [
  { value: "file",       label: "Document / File",   icon: <FaFileAlt /> },
  { value: "image",      label: "Image",              icon: <FaImage />   },
  { value: "link",       label: "Link / URL",         icon: <FaLink />    },
  { value: "color-code", label: "Color Code",         icon: <FaPalette /> },
  { value: "notes",      label: "Notes",              icon: <FaBook />    },
  { value: "assignment", label: "Assignment",         icon: <FaFileAlt /> },
  { value: "lab",        label: "Lab Sheet",          icon: <FaFileAlt /> },
  { value: "project",    label: "Project",            icon: <FaFileAlt /> },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const getVisibility = (val) => VISIBILITY_OPTIONS.find(v => v.value === val) || VISIBILITY_OPTIONS[0];

function hexToRgb(hex) {
  const clean = hex?.replace(/[^0-9a-fA-F]/g, "").slice(0, 6) || "000000";
  const padded = clean.padEnd(6, "0");
  const num = parseInt(padded, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToHsl(hex) {
  let r = 0, g = 0, b = 0;
  const clean = hex?.replace("#", "") || "000000";
  if (clean.length >= 6) {
    r = parseInt(clean.slice(0,2), 16) / 255;
    g = parseInt(clean.slice(2,4), 16) / 255;
    b = parseInt(clean.slice(4,6), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

// ─────────────────────────────────────────────────────────
// Small Components
// ─────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, type = "text", required, placeholder, name }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}{required && " *"}</label>
    <input
      type={type} name={name} required={required} placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 font-medium text-sm transition-all"
      value={value} onChange={onChange}
    />
  </div>
);

const TextAreaField = ({ label, value, onChange, rows = 3, required, placeholder, name }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}{required && " *"}</label>
    <textarea
      name={name} rows={rows} required={required} placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 font-medium text-sm transition-all resize-none"
      value={value} onChange={onChange}
    />
  </div>
);

// ─────────────────────────────────────────────────────────
// Color Chip Component
// ─────────────────────────────────────────────────────────
function ColorChip({ hex }) {
  const [copied, setCopied] = useState(null);
  const color = hex?.startsWith("#") ? hex : `#${hex}`;
  const formats = [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: hexToRgb(color) },
    { label: "HSL", value: hexToHsl(color) },
  ];
  const copy = (val, label) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
    toast.success(`${label} copied!`);
  };
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {formats.map(f => (
        <button
          key={f.label}
          type="button"
          onClick={() => copy(f.value, f.label)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-wider hover:bg-white hover:shadow-sm transition-all group"
        >
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-slate-500">{f.label}</span>
          <span className="text-slate-700">{f.value}</span>
          {copied === f.label
            ? <FaCheck className="text-emerald-500 text-[8px]" />
            : <span className="opacity-0 group-hover:opacity-100 text-slate-400 text-[8px]">copy</span>
          }
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: "", description: "", category: "other", visibility: "public",
  type: "file", fileUrl: "", colorHex: "", externalLink: "", subject: "",
  semester: "", tags: "", uploadedBy: "Admin", isActive: true, file: null,
};

function AdminResources() {
  const [resources, setResources]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [filterCategory, setFilterCategory]     = useState("all");
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingResource, setEditingResource]   = useState(null);
  const [viewingResource, setViewingResource]   = useState(null);
  const [deleteModalOpen, setDeleteModalOpen]   = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [formData, setFormData]           = useState(EMPTY_FORM);

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      // Admin sees all – backend returns admin-level resources
      const response = await API.get("/resources");
      setResources(Array.isArray(response.data.data) ? response.data.data : []);
    } catch {
      toast.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData(prev => ({ ...prev, file: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingResource(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === "file") { if (v) data.append("file", v); }
        else data.append(k, v);
      });

      if (editingResource) {
        await API.put(`/resources/${editingResource._id}`, data);
        toast.success("Resource updated!");
      } else {
        await API.post("/resources", data);
        toast.success("Resource created!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title || "", description: resource.description || "",
      category: resource.category || "other", visibility: resource.visibility || "public",
      type: resource.type || "file", fileUrl: resource.fileUrl || "",
      colorHex: resource.colorHex || "", externalLink: resource.externalLink || "",
      subject: resource.subject || "", semester: resource.semester || "",
      tags: Array.isArray(resource.tags) ? resource.tags.join(", ") : "",
      uploadedBy: resource.uploadedBy || "Admin", isActive: resource.isActive ?? true, file: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/resources/${resourceToDelete._id}`);
      toast.success("Resource deleted");
      setDeleteModalOpen(false);
      fetchResources();
    } catch { toast.error("Failed to delete resource"); }
  };

  // Filtered display
  const filtered = resources.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVis = filterVisibility === "all" || r.visibility === filterVisibility;
    const matchCat = filterCategory === "all" || r.category === filterCategory;
    return matchSearch && matchVis && matchCat;
  });

  // Group by category for display
  const grouped = filtered.reduce((acc, r) => {
    const cat = r.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const typeIcon = (type) => {
    const map = { file: <FaFileAlt />, image: <FaImage />, link: <FaLink />, "color-code": <FaPalette />, notes: <FaBook />, assignment: <FaFileAlt />, lab: <FaFileAlt />, project: <FaFileAlt /> };
    return map[type] || <FaFileAlt />;
  };

  const typeColor = (type) => {
    const map = { file: "bg-blue-50 text-blue-600", image: "bg-purple-50 text-purple-600", link: "bg-cyan-50 text-cyan-600", "color-code": "bg-pink-50 text-pink-600", notes: "bg-amber-50 text-amber-600", assignment: "bg-orange-50 text-orange-600", lab: "bg-teal-50 text-teal-600", project: "bg-violet-50 text-violet-600" };
    return map[type] || "bg-slate-50 text-slate-500";
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight mb-1">
            Shared <span className="text-emerald-600">Resources</span>
          </h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Manage assets, files, links &amp; branding materials
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
        >
          <FaPlus className="group-hover:rotate-90 transition-transform" /> ADD RESOURCE
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {VISIBILITY_OPTIONS.map(v => {
          const count = resources.filter(r => r.visibility === v.value).length;
          return (
            <button
              key={v.value}
              onClick={() => setFilterVisibility(filterVisibility === v.value ? "all" : v.value)}
              className={`p-4 rounded-2xl border text-left transition-all ${filterVisibility === v.value ? "border-transparent shadow-md" : "bg-white border-slate-100 hover:shadow-sm"}`}
              style={filterVisibility === v.value ? { backgroundColor: v.bg, borderColor: v.color } : {}}
            >
              <div className="text-xl font-black" style={{ color: v.color }}>{count}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{v.label}</div>
            </button>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative col-span-1 md:col-span-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text" placeholder="Search resources..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 transition-all font-medium text-sm"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-medium text-sm text-slate-600 appearance-none cursor-pointer"
          value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Total:</span>
          <span className="text-lg font-black text-primary">{resources.length}</span>
          <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Active</span>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-slate-100">
          <div className="text-5xl mb-4">📂</div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No resources found</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => {
          const catInfo = CATEGORY_OPTIONS.find(c => c.value === cat);
          return (
            <div key={cat} className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                <span>{catInfo?.label || cat}</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{items.length}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(res => {
                  const vis = getVisibility(res.visibility);
                  return (
                    <div key={res._id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                      {/* Color preview for color-code type */}
                      {res.type === "color-code" && res.colorHex && (
                        <div className="h-20 -mx-5 -mt-5 mb-4 rounded-t-3xl" style={{ backgroundColor: res.colorHex.startsWith("#") ? res.colorHex : `#${res.colorHex}` }} />
                      )}
                      {/* Image preview */}
                      {res.type === "image" && res.fileUrl && (
                        <div className="h-24 -mx-5 -mt-5 mb-4 rounded-t-3xl overflow-hidden">
                          <img src={res.fileUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}

                      {/* Type Icon + Visibility badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${typeColor(res.type)}`}>
                          {typeIcon(res.type)}
                        </div>
                        <span
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                          style={{ backgroundColor: vis.bg, color: vis.color }}
                        >
                          {vis.value === "public" ? <FaGlobe className="text-[8px]" /> : <FaLock className="text-[8px]" />}
                          {vis.label}
                        </span>
                      </div>

                      <h4 className="font-black text-primary text-sm mb-1 leading-tight">{res.title}</h4>
                      <p className="text-[11px] text-slate-400 font-medium mb-3 line-clamp-2">{res.description}</p>

                      {/* Color swatches */}
                      {res.type === "color-code" && res.colorHex && (
                        <ColorChip hex={res.colorHex} />
                      )}

                      {/* Subject / Tags */}
                      {res.subject && (
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mt-2">📍 {res.subject}</div>
                      )}
                      {res.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {res.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold">#{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1 text-slate-300 font-black text-[10px]">
                          <FaDownload size={9} /> {res.downloads || 0}
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => setViewingResource(res)} className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90" title="View">
                            <FaEye size={12} />
                          </button>
                          <button onClick={() => handleEdit(res)} className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90" title="Edit">
                            <FaEdit size={12} />
                          </button>
                          <button onClick={() => { setResourceToDelete(res); setDeleteModalOpen(true); }} className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90" title="Delete">
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* ── Delete Modal ── */}
      <DeleteModal
        isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete} title="Delete Resource"
        message={`Are you sure you want to delete "${resourceToDelete?.title}"? This cannot be undone.`}
      />

      {/* ── Create / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[92vh] overflow-hidden relative shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tight">
                  {editingResource ? "Edit" : "Add"} <span className="text-emerald-600">Resource</span>
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {editingResource ? "Update resource details" : "Share a new resource with your team"}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar">

              {/* ─ Title + Type ─ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField label="Resource Title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g., CFC Logo Pack" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type *</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 appearance-none">
                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 appearance-none">
                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* ─ Visibility Picker ─ */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Visibility Level *</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {VISIBILITY_OPTIONS.map(v => (
                    <button
                      key={v.value} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, visibility: v.value }))}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${formData.visibility === v.value ? "border-current shadow-sm" : "border-slate-100 bg-slate-50 hover:bg-white"}`}
                      style={formData.visibility === v.value ? { borderColor: v.color, backgroundColor: v.bg } : {}}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: formData.visibility === v.value ? v.color : "#94a3b8" }}>{v.label}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{v.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ─ Content Fields (conditional on type) ─ */}
              {formData.type === "color-code" ? (
                <div className="space-y-3">
                  <InputField label="Color Hex" name="colorHex" value={formData.colorHex} onChange={handleInputChange} placeholder="#FF5733" />
                  {formData.colorHex && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-16 h-16 rounded-2xl shadow-inner border border-slate-200" style={{ backgroundColor: formData.colorHex.startsWith("#") ? formData.colorHex : `#${formData.colorHex}` }} />
                      <ColorChip hex={formData.colorHex} />
                    </div>
                  )}
                </div>
              ) : formData.type === "link" ? (
                <InputField label="External Link" name="externalLink" value={formData.externalLink} onChange={handleInputChange} placeholder="https://..." />
              ) : (
                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload File (Optional)</label>
                    <input type="file" onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all"
                    />
                  </div>
                  <InputField label="Or External URL" name="fileUrl" value={formData.fileUrl} onChange={handleInputChange} placeholder="https://drive.google.com/..." />
                </div>
              )}

              {/* ─ Subject & Semester ─ */}
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Subject / Province / Tag" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g., Kathmandu (for backgrounds)" />
                <InputField label="Semester (Academic)" name="semester" value={formData.semester} onChange={handleInputChange} placeholder="e.g., First" />
              </div>

              {/* ─ Tags ─ */}
              <InputField label="Tags (comma-separated)" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g., logo, brand, official" />

              {/* ─ Description ─ */}
              <TextAreaField label="Description" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Brief description of this resource..." />

              {/* ─ Active Toggle ─ */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-12 h-6 rounded-full transition-all ${formData.isActive ? "bg-emerald-500" : "bg-slate-200"}`} onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}>
                  <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all shadow-sm ${formData.isActive ? "translate-x-6" : ""}`} />
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active (visible to users)</span>
              </label>

              {/* ─ Footer ─ */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs tracking-widest hover:bg-slate-200 transition-all">
                  CANCEL
                </button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:bg-emerald-300">
                  {submitting ? "SAVING..." : (editingResource ? "UPDATE RESOURCE" : "SAVE RESOURCE")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Quick View Modal ── */}
      {viewingResource && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setViewingResource(null)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
            {/* Color banner */}
            {viewingResource.type === "color-code" && viewingResource.colorHex && (
              <div className="h-32 flex items-center justify-center" style={{ backgroundColor: viewingResource.colorHex.startsWith("#") ? viewingResource.colorHex : `#${viewingResource.colorHex}` }}>
                <span className="text-white font-black text-2xl tracking-widest uppercase">
                  {viewingResource.colorHex}
                </span>
              </div>
            )}
            {viewingResource.type === "image" && viewingResource.fileUrl && (
              <div className="h-44 overflow-hidden">
                <img src={viewingResource.fileUrl} alt={viewingResource.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${typeColor(viewingResource.type)}`}>
                  {typeIcon(viewingResource.type)}
                </div>
                <button onClick={() => setViewingResource(null)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-100 transition-all">
                  <FaTimes />
                </button>
              </div>

              <div className="mb-5">
                <h3 className="text-xl font-black text-primary">{viewingResource.title}</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">{viewingResource.description}</p>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Category", value: CATEGORY_OPTIONS.find(c => c.value === viewingResource.category)?.label },
                  { label: "Type", value: TYPE_OPTIONS.find(t => t.value === viewingResource.type)?.label },
                  { label: "Uploaded By", value: viewingResource.uploadedBy },
                  { label: "Downloads", value: viewingResource.downloads || 0 },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                    <div className="font-bold text-sm text-primary mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Visibility */}
              {(() => {
                const vis = getVisibility(viewingResource.visibility);
                return (
                  <div className="p-3 rounded-2xl mb-4 flex items-center gap-3" style={{ backgroundColor: vis.bg }}>
                    {vis.value === "public" ? <FaGlobe style={{ color: vis.color }} /> : <FaLock style={{ color: vis.color }} />}
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: vis.color }}>{vis.label} — {vis.description}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Color chips */}
              {viewingResource.type === "color-code" && viewingResource.colorHex && (
                <div className="mb-4">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Color Formats</div>
                  <ColorChip hex={viewingResource.colorHex} />
                </div>
              )}

              {/* Tags */}
              {viewingResource.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {viewingResource.tags.map(t => <span key={t} className="px-3 py-1 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-bold">#{t}</span>)}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => { setViewingResource(null); handleEdit(viewingResource); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] tracking-widest hover:bg-slate-200 transition-all uppercase">
                  Edit
                </button>
                {(viewingResource.fileUrl || viewingResource.externalLink) && (
                  <a
                    href={viewingResource.fileUrl || viewingResource.externalLink}
                    target="_blank" rel="noreferrer"
                    onClick={() => API.post(`/resources/${viewingResource._id}/download`).catch(() => {})}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 uppercase flex items-center justify-center gap-2"
                  >
                    <FaDownload /> Download / Open
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminResources;
