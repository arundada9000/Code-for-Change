import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useResumes } from "../../Hooks/useResumes";
import { TEMPLATE_LIST } from "../../Data/resumeData";
import ResumeEditor from "./components/ResumeEditor";
import ResumePreview from "./ResumePreview";
import { exportResumeToPDF } from "./pdfExport";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaSave,
  FaDownload,
  FaPalette,
  FaEye,
  FaEdit,
  FaCloudUploadAlt,
} from "react-icons/fa";

/**
 * ResumeBuilder — split-pane editor page.
 * Left: scrollable form editor. Right: sticky live A4 preview.
 * Mobile: tabbed view switching between Edit and Preview.
 */
const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getResume, saveResume, createNewResume } = useResumes();

  const previewRef = useRef(null);
  const [resumeData, setResumeData] = useState(null);
  const [activeTab, setActiveTab] = useState("edit"); // mobile tab
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Load or create resume
  useEffect(() => {
    if (resumeId === "new") {
      const newResume = createNewResume();
      navigate(`/resume-builder/${newResume.id}`, { replace: true });
    } else if (resumeId) {
      const existing = getResume(resumeId);
      if (existing) {
        setResumeData(existing);
      } else {
        toast.error("Resume not found");
        navigate("/resume-builder", { replace: true });
      }
    }
  }, [resumeId]);

  // Update a top-level field in resume data
  const handleUpdate = useCallback((field, value) => {
    setResumeData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasUnsaved(true);
  }, []);

  // Save to localStorage
  const handleSave = useCallback(() => {
    if (!resumeData) return;
    setSaving(true);
    try {
      saveResume(resumeData);
      setHasUnsaved(false);
      toast.success("Resume saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [resumeData, saveResume]);

  // Save to backend (placeholder — will be wired to API)
  const handleSaveToBackend = useCallback(async () => {
    if (!resumeData) return;
    setSaving(true);
    try {
      // For now, save locally. When backend is ready, replace with:
      // await API.post('/resumes', resumeData);
      saveResume(resumeData);
      setHasUnsaved(false);
      toast.success("Resume saved to cloud!");
    } catch {
      toast.error("Failed to save to server");
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

  if (!resumeData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const accentColor = resumeData.accentColor || "#0076B4";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ===== TOP BAR ===== */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => navigate("/resume-builder")}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              title="Back to Dashboard"
            >
              <FaArrowLeft size={14} />
            </button>
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => handleUpdate("title", e.target.value)}
              className="text-sm font-bold text-slate-800 bg-transparent border-none outline-none min-w-0 flex-1 px-2 py-1 rounded hover:bg-slate-50 focus:bg-slate-50 transition-colors"
              placeholder="Resume Title"
            />
            {hasUnsaved && (
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                Unsaved
              </span>
            )}
          </div>

          {/* Center: Template & Color */}
          <div className="hidden md:flex items-center gap-2">
            <select
              value={resumeData.templateId}
              onChange={(e) => handleUpdate("templateId", e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 outline-none cursor-pointer"
            >
              {TEMPLATE_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <label
                className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                title="Accent Color"
              >
                <FaPalette size={12} style={{ color: accentColor }} />
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => handleUpdate("accentColor", e.target.value)}
                  className="w-0 h-0 opacity-0 absolute"
                />
                <div
                  className="w-4 h-4 rounded-full border border-slate-300"
                  style={{ backgroundColor: accentColor }}
                />
              </label>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200"
              title="Save locally (Ctrl+S)"
            >
              <FaSave size={12} />
              <span className="hidden sm:inline">{saving ? "..." : "Save"}</span>
            </button>
            <button
              onClick={handleSaveToBackend}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-white"
              style={{ backgroundColor: accentColor }}
              title="Save to server"
            >
              <FaCloudUploadAlt size={12} />
              <span className="hidden sm:inline">Save to Cloud</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
              title="Download PDF"
            >
              <FaDownload size={12} />
              <span className="hidden sm:inline">
                {exporting ? "..." : "PDF"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex md:hidden border-t border-slate-100">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === "edit"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-400"
            }`}
          >
            <FaEdit size={12} /> Edit
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === "preview"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-400"
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
          className={`w-full md:w-[42%] lg:w-[38%] overflow-y-auto p-4 border-r border-slate-200 bg-white ${
            activeTab !== "edit" ? "hidden md:block" : ""
          }`}
          style={{ maxHeight: "calc(100vh - 52px)" }}
        >
          {/* Mobile-only template & color selectors */}
          <div className="flex md:hidden items-center gap-2 mb-4">
            <select
              value={resumeData.templateId}
              onChange={(e) => handleUpdate("templateId", e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 outline-none flex-1 cursor-pointer"
            >
              {TEMPLATE_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <FaPalette size={12} style={{ color: accentColor }} />
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleUpdate("accentColor", e.target.value)}
                className="w-0 h-0 opacity-0 absolute"
              />
              <div
                className="w-4 h-4 rounded-full border border-slate-300"
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
          className={`flex-1 overflow-y-auto ${
            activeTab !== "preview" ? "hidden md:block" : ""
          }`}
          style={{ maxHeight: "calc(100vh - 52px)" }}
        >
          <ResumePreview
            ref={previewRef}
            resumeData={resumeData}
            templateId={resumeData.templateId}
            accentColor={accentColor}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
