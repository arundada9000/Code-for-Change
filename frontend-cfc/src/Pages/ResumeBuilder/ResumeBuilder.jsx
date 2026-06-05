import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useResumes } from "../../Hooks/useResumes";
import { TEMPLATE_LIST } from "../../Data/resumeData";
import ResumeEditor from "./components/ResumeEditor";
import ResumePreview from "./ResumePreview";
import { exportResumeToPDF } from "./pdfExport";
import toast from "react-hot-toast";
import GlobalLoader from "../../Components/Loading/GlobalLoader";
import {
  FaArrowLeft,
  FaSave,
  FaDownload,
  FaPalette,
  FaEye,
  FaEdit,
} from "react-icons/fa";

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getResume, fetchResume, saveResume, createNewResume } = useResumes();

  const previewRef = useRef(null);
  const isCreating = useRef(false);
  const [resumeData, setResumeData] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Load or create resume
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setInitializing(true);

      if (resumeId === "new") {
        if (isCreating.current) return;
        isCreating.current = true;
        try {
          const newResume = await createNewResume();
          if (!cancelled) {
            navigate(`/resume-builder/${newResume.id || newResume._id}`, {
              replace: true,
            });
          }
        } catch (err) {
          if (!cancelled) {
            toast.error("Failed to create resume");
            navigate("/resume-builder", { replace: true });
          }
          isCreating.current = false;
        }
        return;
      }

      if (resumeId) {
        // Try local state first, then API
        let existing = getResume(resumeId);
        if (!existing) {
          existing = await fetchResume(resumeId);
        }
        if (!cancelled) {
          if (existing) {
            setResumeData(existing);
          } else {
            toast.error("Resume not found");
            navigate("/resume-builder", { replace: true });
          }
          setInitializing(false);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  // Update a top-level field in resume data
  const handleUpdate = useCallback((field, value) => {
    setResumeData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasUnsaved(true);
  }, []);

  // Save to backend
  const handleSave = useCallback(async () => {
    if (!resumeData) return;
    setSaving(true);
    try {
      const updated = await saveResume(resumeData);
      setResumeData(updated);
      setHasUnsaved(false);
      toast.success("Resume saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [resumeData, saveResume]);

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const fileName = (resumeData?.title || "resume")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      await exportResumeToPDF(previewRef.current, fileName);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  }, [resumeData]);

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  if (initializing || !resumeData) {
    return <GlobalLoader />;
  }

  const accentColor = resumeData.accentColor || "#0076B4";

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* ===== TOP BAR ===== */}
      <div className="relative z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between px-5 py-3 gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              onClick={() => navigate("/resume-builder")}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer flex-shrink-0 border border-slate-200"
              title="Back to Dashboard"
            >
              <FaArrowLeft size={14} />
            </button>
            <div className="flex flex-col flex-1 min-w-0">
              <input
                type="text"
                value={resumeData.title}
                onChange={(e) => handleUpdate("title", e.target.value)}
                className="text-lg font-black text-slate-900 bg-transparent border-none outline-none min-w-0 flex-1 px-1 py-0.5 rounded focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all tracking-tight"
                placeholder="Untitled Resume"
              />
              {hasUnsaved && (
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-1">
                  Unsaved Changes
                </span>
              )}
            </div>
          </div>

          {/* Center: Template & Color */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <select
                value={resumeData.templateId}
                onChange={(e) => handleUpdate("templateId", e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent appearance-none rounded-xl px-4 py-2.5 outline-none cursor-pointer pr-10 uppercase tracking-wider"
              >
                {TEMPLATE_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} Template
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
            
            <label
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              title="Accent Color"
            >
              <FaPalette size={12} className="text-slate-400" />
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleUpdate("accentColor", e.target.value)}
                className="w-0 h-0 opacity-0 absolute"
              />
              <div
                className="w-5 h-5 rounded-full shadow-sm ring-1 ring-black/10"
                style={{ backgroundColor: accentColor }}
              />
            </label>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ backgroundColor: accentColor, opacity: saving ? 0.7 : 1 }}
              title="Save (Ctrl+S)"
            >
              <FaSave size={12} />
              <span className="hidden sm:inline">
                {saving ? "Saving..." : "Save"}
              </span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              title="Download PDF"
            >
              <FaDownload size={12} />
              <span className="hidden sm:inline">
                {exporting ? "Wait..." : "Export"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex md:hidden border-t border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors ${
              activeTab === "edit"
                ? "text-secondary border-b-2 border-secondary bg-blue-50/50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FaEdit size={12} /> Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors ${
              activeTab === "preview"
                ? "text-secondary border-b-2 border-secondary bg-blue-50/50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FaEye size={12} /> Preview
          </button>
        </div>
      </div>

      {/* ===== SPLIT PANE ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor pane */}
        <div
          className={`w-full md:w-[45%] lg:w-[40%] overflow-y-auto p-5 border-r border-slate-100 bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 ${
            activeTab !== "edit" ? "hidden md:block" : ""
          }`}
        >
          {/* Mobile-only template & color selectors */}
          <div className="flex md:hidden items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="relative flex-1">
              <select
                value={resumeData.templateId}
                onChange={(e) => handleUpdate("templateId", e.target.value)}
                className="w-full text-xs font-bold text-slate-700 bg-transparent appearance-none px-3 py-2 outline-none cursor-pointer uppercase tracking-wider"
              >
                {TEMPLATE_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <label className="flex items-center gap-2 px-2 py-1 cursor-pointer">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleUpdate("accentColor", e.target.value)}
                className="w-0 h-0 opacity-0 absolute"
              />
              <div
                className="w-6 h-6 rounded-full shadow-sm ring-2 ring-white"
                style={{ backgroundColor: accentColor }}
              />
            </label>
          </div>

          <ResumeEditor
            resumeData={resumeData}
            onUpdate={handleUpdate}
            accentColor={accentColor}
          />
        </div>

        {/* Preview pane */}
        <div
          className={`flex-1 overflow-y-auto bg-slate-50/50 relative ${
            activeTab !== "preview" ? "hidden md:flex" : "flex"
          } justify-center py-8`}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          
          <div className="relative z-10 w-full max-w-[210mm] mx-auto px-4 md:px-8 drop-shadow-2xl">
            <ResumePreview
              ref={previewRef}
              resumeData={resumeData}
              templateId={resumeData.templateId}
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
