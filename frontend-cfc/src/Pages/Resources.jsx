import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Banner from "../Components/UI/Banner";
import SEO from "../Components/Common/SEO";
import API from "../Services/api";
import { useAuth } from "../Context/AuthContext";
import DebouncedSearchInput from "../Components/UI/DebouncedSearchInput";
import {
  FaSearch, FaFilter, FaDownload, FaExternalLinkAlt,
  FaLock, FaGlobe, FaCheck, FaCopy, FaPalette,
  FaImage, FaFileAlt, FaBook, FaLink, FaTimes,
} from "react-icons/fa";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "../Components/Common/Animations";

// ─────────────────────────────────────────────────────────
// CFC Region Palette (hardcoded)
// ─────────────────────────────────────────────────────────
const CFC_REGIONS = [
  { name: "Kathmandu",  colors: ["#CA163A"] },
  { name: "Pokhara",   colors: ["#F2CA50"] },
  { name: "Rupandehi", colors: ["#880696"] },
  { name: "Dang",      colors: ["#6C757D"] },
  { name: "Birgunj",   colors: ["#00A155"] },
  { name: "Farwest",   colors: ["#FF914C"] },
  { name: "Koshi",     colors: ["#EF7B97"] },
  { name: "Chitwan",   colors: ["#964A01"] },
  { name: "LB Karnali",colors: ["#bbd704"] },
  { name: "Core Team", colors: ["#0076B4", "#01152E"] },
];

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public",       color: "#10b981", bg: "#ecfdf5" },
  { value: "gm",     label: "Members",      color: "#3b82f6", bg: "#eff6ff" },
  { value: "cr",     label: "Coordinators", color: "#f59e0b", bg: "#fffbeb" },
  { value: "eb",     label: "Executives",   color: "#8b5cf6", bg: "#f5f3ff" },
  { value: "admin",  label: "Admin Only",   color: "#ef4444", bg: "#fef2f2" },
];

const CATEGORY_LABELS = {
  academic:   "Academic",
  branding:   "Branding",
  background: "Backgrounds",
  internal:   "Internal",
  other:      "Other",
};
const CATEGORY_EMOJI = {
  academic: "📚", branding: "🎨", background: "🖼️", internal: "🔒", other: "📁",
};
const CATEGORY_DESC = {
  academic:   "Notes, assignments and learning materials.",
  branding:   "Logos, banners and branding assets.",
  background: "Hero images for province and section backgrounds.",
  internal:   "Internal documents and references.",
  other:      "Miscellaneous resources.",
};

const TYPE_ICON = { file: <FaFileAlt />, image: <FaImage />, link: <FaLink />, "color-code": <FaPalette />, notes: <FaBook />, assignment: <FaFileAlt />, lab: <FaFileAlt />, project: <FaFileAlt /> };
const TYPE_COLORS = {
  file:         { bg: "#eff6ff", fg: "#3b82f6" },
  image:        { bg: "#f5f3ff", fg: "#8b5cf6" },
  link:         { bg: "#ecfeff", fg: "#06b6d4" },
  "color-code": { bg: "#fdf2f8", fg: "#ec4899" },
  notes:        { bg: "#fffbeb", fg: "#f59e0b" },
  assignment:   { bg: "#fff7ed", fg: "#f97316" },
  lab:          { bg: "#f0fdf4", fg: "#22c55e" },
  project:      { bg: "#f1f5f9", fg: "#64748b" },
};

// ─────────────────────────────────────────────────────────
// Color Helpers
// ─────────────────────────────────────────────────────────
function normaliseHex(hex) {
  const h = (hex || "").trim();
  return h.startsWith("#") ? h : `#${h}`;
}
function hexToRgb(hex) {
  const c = (hex || "").replace(/[^0-9a-fA-F]/g, "").slice(0, 6).padEnd(6, "0");
  const n = parseInt(c, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}
function hexToHsl(hex) {
  let r = 0, g = 0, b = 0;
  const c = (hex || "").replace("#", "");
  if (c.length >= 6) { r = parseInt(c.slice(0,2),16)/255; g = parseInt(c.slice(2,4),16)/255; b = parseInt(c.slice(4,6),16)/255; }
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if (max !== min) {
    const d = max-min; s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){ case r: h=((g-b)/d+(g<b?6:0))/6; break; case g: h=((b-r)/d+2)/6; break; case b: h=((r-g)/d+4)/6; break; }
  }
  return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}
function isLight(hex) {
  const c = (hex||"").replace("#","");
  return 0.299*parseInt(c.slice(0,2),16) + 0.587*parseInt(c.slice(2,4),16) + 0.114*parseInt(c.slice(4,6),16) > 140;
}

// ─────────────────────────────────────────────────────────
// CopyButton (shared tiny component)
// ─────────────────────────────────────────────────────────
function CopyButton({ value, label, hex }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group/fmt"
      title={`Copy ${label}: ${value}`}
    >
      <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400 group-hover/fmt:text-primary">{label}</span>
      {copied
        ? <FaCheck className="text-emerald-500" size={9} />
        : <FaCopy className="text-gray-200 opacity-0 group-hover/fmt:opacity-100" size={9} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Region Swatch
// ─────────────────────────────────────────────────────────
function RegionSwatch({ hex }) {
  const [copied, setCopied] = useState(false);
  const color = normaliseHex(hex);
  const light = isLight(color);
  const copyHex = () => {
    navigator.clipboard.writeText(color.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-16 rounded-2xl flex items-end p-3 cursor-pointer hover:opacity-90 transition-all active:scale-95 group/sw relative overflow-hidden"
        style={{ backgroundColor: color }}
        onClick={copyHex}
        title="Click to copy HEX"
      >
        <span className={`font-bold text-[10px] tracking-widest uppercase drop-shadow-sm ${light ? "text-slate-800/70" : "text-white/80"}`}>
          {color.toUpperCase()}
        </span>
        {copied && (
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${light ? "text-slate-800" : "text-white"}`}>
            <FaCheck className="mr-1" size={9} /> Copied!
          </span>
        )}
      </div>
      <div className="flex gap-1">
        <CopyButton value={color.toUpperCase()} label="HEX" hex={color} />
        <CopyButton value={hexToRgb(color)} label="RGB" hex={color} />
        <CopyButton value={hexToHsl(color)} label="HSL" hex={color} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Region Palette Section
// ─────────────────────────────────────────────────────────
function RegionPalette() {
  return (
    <section className="mb-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-0.5 w-8 bg-primary" />
            <h4 className="uppercase tracking-wider text-xs font-bold text-primary">Colour Palette</h4>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Region Colour Codes
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Official branch colors — click any swatch or HEX / RGB / HSL to copy instantly.
          </p>
        </div>
        <span className="px-4 py-2 bg-primary/5 text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-primary/10 shrink-0">
          {CFC_REGIONS.length} Regions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {CFC_REGIONS.map(region => (
          <div
            key={region.name}
            className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
          >
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">{region.name}</p>
            <div className="flex flex-col gap-3">
              {region.colors.map(hex => <RegionSwatch key={hex} hex={hex} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Resource Card – color-code type
// ─────────────────────────────────────────────────────────
function ColorResourceCard({ resource }) {
  const hex = normaliseHex(resource.colorHex);
  const light = isLight(hex);
  const vis = VISIBILITY_OPTIONS.find(v => v.value === resource.visibility) || VISIBILITY_OPTIONS[0];
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className="h-28 relative" style={{ backgroundColor: hex }}>
        <span className={`absolute bottom-3 left-4 font-bold text-sm tracking-widest ${light ? "text-slate-800/70" : "text-white/80"}`}>
          {hex.toUpperCase()}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur text-white">
          {vis.value === "public" ? <FaGlobe size={7} /> : <FaLock size={7} />} {vis.label}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-primary text-sm mb-0.5">{resource.title}</h3>
        <p className="text-[11px] text-gray-400 mb-3 line-clamp-2">{resource.description}</p>
        <div className="flex gap-1">
          <CopyButton value={hex.toUpperCase()} label="HEX" />
          <CopyButton value={hexToRgb(hex)} label="RGB" />
          <CopyButton value={hexToHsl(hex)} label="HSL" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Resource Card – generic
// ─────────────────────────────────────────────────────────
function ResourceCard({ resource }) {
  if (resource.type === "color-code") return <ColorResourceCard resource={resource} />;

  const colors = TYPE_COLORS[resource.type] || TYPE_COLORS.file;
  const icon = TYPE_ICON[resource.type] || <FaFileAlt />;
  const vis = VISIBILITY_OPTIONS.find(v => v.value === resource.visibility) || VISIBILITY_OPTIONS[0];
  const hasContent = resource.fileUrl || resource.externalLink;

  const handleDownload = () => {
    API.post(`/resources/${resource._id}/download`).catch(() => {});
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image preview */}
      {resource.type === "image" && resource.fileUrl && (
        <div className="h-40 overflow-hidden">
          <img src={resource.fileUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-inner" style={{ backgroundColor: colors.bg, color: colors.fg }}>
            {icon}
          </div>
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: vis.bg, color: vis.color }}
          >
            {vis.value === "public" ? <FaGlobe size={7} /> : <FaLock size={7} />} {vis.label}
          </span>
        </div>

        {/* Title & desc */}
        <h3 className="font-bold text-primary text-sm mb-1 leading-tight">{resource.title}</h3>
        <p className="text-xs text-gray-400 mb-3 flex-1 line-clamp-3 leading-relaxed">{resource.description}</p>

        {/* Subject */}
        {resource.subject && (
          <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">
            📍 {resource.subject}{resource.semester ? ` · Sem ${resource.semester}` : ""}
          </div>
        )}

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map(t => (
              <span key={t} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-bold border border-gray-100">#{t}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-50 mt-auto">
          <span className="text-[9px] font-bold text-gray-300 flex items-center gap-1 flex-1">
            <FaDownload size={8} /> {resource.downloads || 0}
          </span>
          {hasContent && (
            <a
              href={resource.fileUrl || resource.externalLink}
              target="_blank"
              rel="noreferrer"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white transition-all active:scale-95 hover:opacity-90"
              style={{ backgroundColor: colors.fg }}
            >
              {resource.type === "link" ? <><FaExternalLinkAlt size={8} /> Open</> : <><FaDownload size={8} /> Download</>}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 animate-pulse">
      <div className="w-10 h-10 bg-gray-100 rounded-2xl mb-4" />
      <div className="h-4 bg-gray-100 rounded-xl w-3/4 mb-2" />
      <div className="h-3 bg-gray-50 rounded-xl w-full mb-1" />
      <div className="h-3 bg-gray-50 rounded-xl w-2/3 mb-5" />
      <div className="h-8 bg-gray-100 rounded-xl w-28" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Active Filter Chip
// ─────────────────────────────────────────────────────────
function FilterChip({ label, onClear }) {
  return (
    <span className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all group animate-in zoom-in duration-200">
      {label}
      <button
        onClick={onClear}
        className="w-4 h-4 flex items-center justify-center bg-primary/20 hover:bg-primary hover:text-white rounded-lg transition-all"
      >
        <FaTimes size={7} />
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────
export default function Resources() {
  const { user, isAuthenticated } = useAuth();
  const [resources, setResources]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType]         = useState("All");

  const userRole = user?.role?.toLowerCase() ?? "guest";

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/resources");
      setResources(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // Derived filter options
  const categories = ["All", ...new Set(resources.map(r => r.category).filter(Boolean))];
  const types      = ["All", ...new Set(resources.map(r => r.type).filter(Boolean))];

  // Filtered resources
  const filtered = resources.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q) ||
      r.tags?.some(t => t.toLowerCase().includes(q));
    const matchCat  = activeCategory === "All" || r.category === activeCategory;
    const matchType = activeType === "All" || r.type === activeType;
    return matchSearch && matchCat && matchType;
  });

  // Grouped by category
  const grouped = filtered.reduce((acc, r) => {
    const cat = r.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const hasActiveFilters = search || activeCategory !== "All" || activeType !== "All";

  const clearFilters = () => {
    setSearch(""); setActiveCategory("All"); setActiveType("All");
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen pb-32">
      <SEO
        title="Resource Hub | Code for Change Nepal"
        description="Access branding assets, region color codes, academic resources, and shared materials from Code for Change Nepal."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }]}
      />

      {/* Banner — matches all other pages */}
      <Banner />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Page Header ── */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-8 bg-primary" />
              <h4 className="uppercase tracking-wider text-xs font-bold text-primary">
                {isAuthenticated ? `${userRole.toUpperCase()} Access` : "Open Resources"}
              </h4>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Resource Hub
            </h2>
            <p className="text-gray-500 font-medium max-w-xl text-base">
              Branding materials, color codes, academic resources, and shared assets — all in one place.
            </p>
          </div>

          <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Available</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{filtered.length}</span>
              <span className="text-xs font-medium text-gray-500">Resources</span>
            </div>
          </div>
        </div>

        {/* ── Search & Filters Card ── */}
        <SlideUp className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-primary/5 border border-primary/10 overflow-hidden mb-12">
          <div className="p-6 md:p-8 space-y-8">
            {/* Search */}
            <div className="relative group">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-all" />
              <DebouncedSearchInput
                placeholder="Search by title, subject, tags..."
                value={search}
                onSearch={setSearch}
                className="w-full pl-14 pr-6 py-4 bg-primary/5 border-2 border-transparent rounded-2xl text-sm font-bold text-primary placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  <FaFilter className="text-primary text-[10px]" />
                  <label className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Category</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 text-[10px] font-bold uppercase tracking-wider ${
                        activeCategory === cat
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/10 -translate-y-0.5"
                          : "bg-primary/5 border-transparent text-gray-400 hover:border-primary/20 hover:text-primary"
                      }`}
                    >
                      {cat === "All" ? "All" : `${CATEGORY_EMOJI[cat] || ""} ${CATEGORY_LABELS[cat] || cat}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  <FaFilter className="text-primary text-[10px]" />
                  <label className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Type</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {types.map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        activeType === type
                          ? "bg-secondary border-secondary text-white shadow-md shadow-secondary/10 -translate-y-0.5"
                          : "bg-white border-secondary/10 text-gray-400 hover:border-secondary/30 hover:text-secondary"
                      }`}
                    >
                      {type !== "All" && <span style={{ color: activeType === type ? "white" : TYPE_COLORS[type]?.fg }}>{TYPE_ICON[type] || null}</span>}
                      {type === "All" ? "All Types" : type.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active filters row */}
          {hasActiveFilters && (
            <div className="bg-primary/5 border-t border-primary/10 px-8 md:px-12 py-4 flex flex-wrap items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Filters:</span>
              {search && <FilterChip label={`"${search}"`} onClear={() => setSearch("")} />}
              {activeCategory !== "All" && <FilterChip label={activeCategory} onClear={() => setActiveCategory("All")} />}
              {activeType !== "All" && <FilterChip label={activeType} onClear={() => setActiveType("All")} />}
              <button onClick={clearFilters} className="ml-auto text-[9px] font-bold text-red-400 uppercase tracking-widest hover:underline">
                Clear All
              </button>
            </div>
          )}
        </SlideUp>

        {/* ── Region Colour Palette ── */}
        {(activeCategory === "All" || activeCategory === "branding") && !search && activeType === "All" && (
          <RegionPalette />
        )}

        {/* ── Dynamic Resources ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-24 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
              <FaSearch size={36} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3">
              {search ? "No matches found" : "No resources yet"}
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
              {!isAuthenticated
                ? "Some resources are members-only. "
                : search
                  ? `No results for "${search}". Try different keywords or reset filters.`
                  : "Nothing here yet. Check back soon."}
            </p>
            {!isAuthenticated && (
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/20">
                Log In to Access More
              </Link>
            )}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-6 py-3 bg-secondary text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-all ml-3">
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <section key={cat} className="mb-14">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="h-0.5 w-6 bg-primary/30" />
                    <h4 className="uppercase tracking-wider text-[10px] font-bold text-primary/60">
                      {CATEGORY_EMOJI[cat] || ""} {CATEGORY_LABELS[cat] || cat}
                    </h4>
                  </div>
                  <p className="text-gray-400 text-xs font-medium">{CATEGORY_DESC[cat] || ""}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map(r => (
                  <StaggerItem key={r._id}>
                    <ResourceCard resource={r} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          ))
        )}

        {/* Members-only CTA */}
        {!isAuthenticated && resources.length > 0 && !hasActiveFilters && (
          <div className="mt-16 bg-white rounded-3xl p-12 text-center border border-primary/10 shadow-sm">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-5">
              <FaLock className="text-primary/40" size={22} />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-2">Members-only Resources</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 max-w-sm mx-auto">
              Log in to access branding kits, internal docs, and exclusive materials shared by the CFC team.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl shadow-primary/20"
            >
              Log In to Access
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
