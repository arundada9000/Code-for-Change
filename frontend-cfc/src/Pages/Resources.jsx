import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaDownload,
  FaLink,
  FaPalette,
  FaImage,
  FaFileAlt,
  FaBook,
  FaSearch,
  FaFilter,
  FaLock,
  FaGlobe,
  FaCheck,
  FaExternalLinkAlt,
  FaCopy,
} from "react-icons/fa";
import { MdColorLens } from "react-icons/md";
import API from "../Services/api";
import { useAuth } from "../Context/AuthContext";
import SEO from "../Components/Common/SEO";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const ROLE_LEVEL = { guest: 0, gm: 1, cr: 2, eb: 3, admin: 4, superadmin: 4 };

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", color: "#10b981", bg: "#ecfdf5" },
  { value: "gm", label: "Members", color: "#3b82f6", bg: "#eff6ff" },
  { value: "cr", label: "Coordinators", color: "#f59e0b", bg: "#fffbeb" },
  { value: "eb", label: "Executives", color: "#8b5cf6", bg: "#f5f3ff" },
  { value: "admin", label: "Admin Only", color: "#ef4444", bg: "#fef2f2" },
];

const CATEGORY_LABELS = {
  academic: "Academic",
  branding: "Branding",
  background: "Backgrounds",
  internal: "Internal",
  other: "Other",
};

const CATEGORY_DESCRIPTIONS = {
  academic: "Notes, assignments, and learning materials.",
  branding: "Logos, banners, and branding assets.",
  background: "Hero and background images for the website.",
  internal: "Internal documents and references.",
  other: "Miscellaneous resources.",
};

const TYPE_ICON = {
  file: <FaFileAlt />,
  image: <FaImage />,
  link: <FaLink />,
  "color-code": <FaPalette />,
  notes: <FaBook />,
  assignment: <FaFileAlt />,
  lab: <FaFileAlt />,
  project: <FaFileAlt />,
};

const TYPE_COLORS = {
  file: { bg: "#eff6ff", fg: "#3b82f6" },
  image: { bg: "#f5f3ff", fg: "#8b5cf6" },
  link: { bg: "#ecfeff", fg: "#06b6d4" },
  "color-code": { bg: "#fdf2f8", fg: "#ec4899" },
  notes: { bg: "#fffbeb", fg: "#f59e0b" },
  assignment: { bg: "#fff7ed", fg: "#f97316" },
  lab: { bg: "#f0fdf4", fg: "#22c55e" },
  project: { bg: "#f1f5f9", fg: "#64748b" },
};

// ─────────────────────────────────────────────────────────
// CFC Region Color Palette (hardcoded)
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
// Color Utilities
// ─────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const clean = (hex || "")
    .replace(/[^0-9a-fA-F]/g, "")
    .slice(0, 6)
    .padEnd(6, "0");
  const num = parseInt(clean, 16);
  return `rgb(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255})`;
}

function hexToHsl(hex) {
  let r = 0,
    g = 0,
    b = 0;
  const c = (hex || "").replace("#", "");
  if (c.length >= 6) {
    r = parseInt(c.slice(0, 2), 16) / 255;
    g = parseInt(c.slice(2, 4), 16) / 255;
    b = parseInt(c.slice(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function normaliseHex(hex) {
  const h = (hex || "").trim();
  return h.startsWith("#") ? h : `#${h}`;
}

// ─────────────────────────────────────────────────────────
// Region Palette Component
// ─────────────────────────────────────────────────────────
function RegionSwatch({ hex }) {
  const [copied, setCopied] = useState(null);
  const color = hex.startsWith("#") ? hex : `#${hex}`;
  const formats = [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: hexToRgb(color) },
    { label: "HSL", value: hexToHsl(color) },
  ];
  const copy = (val, label) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };
  // Determine if color is dark (to pick text color)
  const cleanH = color.replace("#", "");
  const lum = 0.299 * parseInt(cleanH.slice(0,2),16) + 0.587 * parseInt(cleanH.slice(2,4),16) + 0.114 * parseInt(cleanH.slice(4,6),16);
  const textColor = lum > 140 ? "text-slate-800" : "text-white";

  return (
    <div className="flex flex-col gap-2">
      {/* Main swatch */}
      <div
        className="h-20 rounded-2xl flex items-end p-3 cursor-pointer hover:opacity-90 transition-opacity active:scale-95"
        style={{ backgroundColor: color }}
        onClick={() => copy(color.toUpperCase(), "HEX")}
        title="Click to copy HEX"
      >
        <span className={`font-black text-xs tracking-widest uppercase drop-shadow-sm ${textColor} opacity-80`}>
          {color.toUpperCase()}
        </span>
      </div>
      {/* Format copy buttons */}
      <div className="flex gap-1">
        {formats.map(f => (
          <button
            key={f.label}
            onClick={() => copy(f.value, f.label)}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group/fmt"
            title={`Copy ${f.label}: ${f.value}`}
          >
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 group-hover/fmt:text-slate-600">{f.label}</span>
            {copied === f.label
              ? <FaCheck className="text-emerald-500" size={9} />
              : <FaCopy className="text-slate-300 opacity-0 group-hover/fmt:opacity-100" size={9} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function RegionPalette() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
            🎨 Region Color Palette
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-0.5">
            Official branch colors — click any swatch or format button to copy.
          </p>
        </div>
        <span className="ml-auto px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
          {CFC_REGIONS.length} Regions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {CFC_REGIONS.map(region => (
          <div key={region.name} className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{region.name}</p>
            <div className={`flex flex-col gap-3 ${region.colors.length > 1 ? "" : ""}`}>
              {region.colors.map(hex => (
                <RegionSwatch key={hex} hex={hex} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Color Card
// ─────────────────────────────────────────────────────────
function ColorCard({ resource }) {
  const [copied, setCopied] = useState(null);
  const hex = normaliseHex(resource.colorHex);
  const formats = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: hexToRgb(hex) },
    { label: "HSL", value: hexToHsl(hex) },
  ];
  const copy = (val, label) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
      {/* Swatch */}
      <div className="h-36 relative" style={{ backgroundColor: hex }}>
        <div className="absolute inset-0 flex items-end p-4">
          <span className="text-white/80 font-black text-lg tracking-widest drop-shadow">
            {hex.toUpperCase()}
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-5">
        <h3 className="font-black text-primary text-sm mb-1">
          {resource.title}
        </h3>
        <p className="text-[11px] text-slate-400 font-medium mb-4">
          {resource.description}
        </p>
        {/* Copy buttons */}
        <div className="space-y-2">
          {formats.map((f) => (
            <button
              key={f.label}
              onClick={() => copy(f.value, f.label)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-all group/btn"
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: hex }}
              />
              <span className="text-[10px] font-black text-slate-400 w-8">
                {f.label}
              </span>
              <span className="text-[11px] font-bold text-slate-600 flex-1 font-mono">
                {f.value}
              </span>
              <span className="shrink-0 transition-all">
                {copied === f.label ? (
                  <FaCheck className="text-emerald-500 text-[10px]" />
                ) : (
                  <FaCopy className="text-slate-300 text-[10px] opacity-0 group-hover/btn:opacity-100" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Generic Resource Card
// ─────────────────────────────────────────────────────────
function ResourceCard({ resource, userRole }) {
  if (resource.type === "color-code") return <ColorCard resource={resource} />;

  const colors = TYPE_COLORS[resource.type] || TYPE_COLORS.file;
  const icon = TYPE_ICON[resource.type] || <FaFileAlt />;
  const vis =
    VISIBILITY_OPTIONS.find((v) => v.value === resource.visibility) ||
    VISIBILITY_OPTIONS[0];
  const hasContent = resource.fileUrl || resource.externalLink;

  const handleDownload = () => {
    API.post(`/resources/${resource._id}/download`).catch(() => {});
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
      {/* Image Preview */}
      {resource.type === "image" && resource.fileUrl && (
        <div className="h-44 overflow-hidden">
          <img
            src={resource.fileUrl}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm"
            style={{ backgroundColor: colors.bg, color: colors.fg }}
          >
            {icon}
          </div>
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ backgroundColor: vis.bg, color: vis.color }}
          >
            {vis.value === "public" ? (
              <FaGlobe className="text-[7px]" />
            ) : (
              <FaLock className="text-[7px]" />
            )}
            {vis.label}
          </span>
        </div>

        {/* Body */}
        <h3 className="font-black text-primary text-sm mb-1 leading-tight">
          {resource.title}
        </h3>
        <p className="text-[11px] text-slate-400 font-medium mb-3 flex-1 line-clamp-3">
          {resource.description}
        </p>

        {/* Subject tag */}
        {resource.subject && (
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">
            📍 {resource.subject}
            {resource.semester ? ` · ${resource.semester} Sem` : ""}
          </div>
        )}

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold border border-slate-100"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50 mt-auto">
          <span className="text-[9px] font-black text-slate-300 flex items-center gap-1 flex-1">
            <FaDownload className="text-[8px]" /> {resource.downloads || 0}
          </span>
          {hasContent && (
            <a
              href={resource.fileUrl || resource.externalLink}
              target="_blank"
              rel="noreferrer"
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all active:scale-95 shadow-sm hover:shadow-md"
              style={{ backgroundColor: colors.fg }}
            >
              {resource.type === "link" ? (
                <>
                  <FaExternalLinkAlt size={9} /> Open
                </>
              ) : (
                <>
                  <FaDownload size={9} /> Download
                </>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Skeleton Loaders
// ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 animate-pulse">
      <div className="w-11 h-11 bg-slate-100 rounded-2xl mb-4" />
      <div className="h-4 bg-slate-100 rounded-xl w-3/4 mb-2" />
      <div className="h-3 bg-slate-50 rounded-xl w-full mb-1" />
      <div className="h-3 bg-slate-50 rounded-xl w-2/3 mb-4" />
      <div className="h-8 bg-slate-100 rounded-xl w-28 mt-auto" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────
export default function Resources() {
  const { user, isAuthenticated } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");

  const userRole = user?.role?.toLowerCase() ?? "guest";
  const userLevel = ROLE_LEVEL[userRole] ?? 0;

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

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Filter
  const filtered = resources.filter((r) => {
    const matchSearch =
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.subject?.toLowerCase().includes(search.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === "all" || r.category === activeCategory;
    const matchType = activeType === "all" || r.type === activeType;
    return matchSearch && matchCat && matchType;
  });

  // Unique categories in current results
  const availableCategories = [
    "all",
    ...new Set(resources.map((r) => r.category).filter(Boolean)),
  ];
  const availableTypes = [
    "all",
    ...new Set(resources.map((r) => r.type).filter(Boolean)),
  ];

  // Group by category
  const grouped = filtered.reduce((acc, r) => {
    const cat = r.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const visLabel = VISIBILITY_OPTIONS.find(
    (v) => v.value === (userRole === "guest" ? "public" : userRole),
  );

  return (
    <>
      <SEO
        title="Resources | Code for Change Nepal"
        description="Access learning materials, branding assets, job descriptions, and shared resources from Code for Change Nepal."
      />

      <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
        {/* ── HERO ── */}
        <section className="bg-gradient-to-br from-primary via-slate-800 to-primary relative overflow-hidden py-24 px-4">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-widest mb-6">
              {isAuthenticated ? (
                <>
                  <FaLock className="text-[9px]" />{" "}
                  {visLabel?.label || userRole} Access
                </>
              ) : (
                <>
                  <FaGlobe className="text-[9px]" /> Public Resources
                </>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 leading-none">
              Resource <span className="text-emerald-400">Hub</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium max-w-xl mx-auto leading-relaxed">
              Branding materials, academic resources, links, and shared assets —
              all in one place.
            </p>

            {/* Auth CTA for guests */}
            {!isAuthenticated && (
              <div className="mt-8 inline-flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 backdrop-blur rounded-2xl text-white/80 text-sm font-medium">
                <FaLock className="text-emerald-400 shrink-0" />
                <span>
                  <Link
                    to="/login"
                    className="text-emerald-400 font-black hover:underline"
                  >
                    Log in
                  </Link>{" "}
                  to access member-only and exclusive resources.
                </span>
              </div>
            )}

            {/* Search */}
            <div className="mt-8 max-w-lg mx-auto relative">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search resources, tags, subjects..."
                className="w-full pl-14 pr-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/30 font-medium text-sm outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── FILTERS ── */}
        <section className="sticky top-0 bg-white border-b border-slate-100 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
              <FaFilter size={9} /> Category
            </span>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${activeCategory === cat ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {cat === "all" ? "All" : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
            <div className="w-px h-5 bg-slate-200 shrink-0" />
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${activeType === type ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"}`}
              >
                {type === "all" ? "All Types" : type.replace("-", " ")}
              </button>
            ))}
          </div>
        </section>

        {/* ── REGION PALETTE (always visible, hardcoded) ── */}
        <RegionPalette />

        <div className="max-w-7xl mx-auto px-4 pb-2">
          <div className="border-t border-slate-100" />
        </div>

        {/* ── CONTENT ── */}
        <main className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-black text-slate-400 mb-2">
                No resources found
              </h3>
              <p className="text-slate-300 text-sm font-medium">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="text-emerald-600 font-black hover:underline"
                    >
                      Log in
                    </Link>{" "}
                    to access member resources.
                  </>
                ) : (
                  "Try adjusting your search or filters."
                )}
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <section key={cat} className="mb-14">
                <div className="flex items-end gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-primary tracking-tight">
                      {CATEGORY_LABELS[cat] || cat}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">
                      {CATEGORY_DESCRIPTIONS[cat] || ""}
                    </p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {items.map((r) => (
                    <ResourceCard
                      key={r._id}
                      resource={r}
                      userRole={userRole}
                    />
                  ))}
                </div>
              </section>
            ))
          )}

          {/* Teaser for locked content */}
          {!isAuthenticated && resources.length > 0 && (
            <div className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mx-auto mb-4">
                <FaLock className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                Members-only Resources
              </h3>
              <p className="text-slate-400 text-sm font-medium mb-6">
                Log in to access branding kits, internal docs, and exclusive
                materials.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
              >
                Log In to Access
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
