import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useResumes } from "../../Hooks/useResumes";
import { exportResumeToPDF } from "./pdfExport";
import { getTemplateComponent } from "./templates/templateRegistry";
import { FadeIn, SlideUp } from "../../Components/Common/Animations";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaCopy,
  FaTrash,
  FaDownload,
  FaFileAlt,
  FaEllipsisV,
} from "react-icons/fa";

/**
 * ResumeDashboard — list/manage resumes page.
 * Shows a grid of resume cards with actions.
 */
const ResumeDashboard = () => {
  const navigate = useNavigate();
  const { resumes, loading, deleteResume, duplicateResume } = useResumes();
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleCreate = () => {
    navigate("/resume-builder/new");
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteResume(id);
      toast.success("Resume deleted");
    }
  };

  const handleDuplicate = (id) => {
    const copy = duplicateResume(id);
    if (copy) toast.success("Resume duplicated");
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Resumes
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Create, edit, and download your professional resumes
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all cursor-pointer"
            >
              <FaPlus size={12} />
              Create New Resume
            </button>
          </div>
        </FadeIn>

        {/* Empty State */}
        {resumes.length === 0 && (
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <FaFileAlt size={32} className="text-slate-300" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 mb-2">
                No resumes yet
              </h2>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                Create your first professional resume with our builder. Your
                profile data will be pre-filled automatically!
              </p>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FaPlus size={12} />
                Create First Resume
              </button>
            </div>
          </FadeIn>
        )}

        {/* Resume Grid */}
        {resumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume, index) => (
              <SlideUp key={resume.id} delay={index * 0.05}>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group">
                  {/* Mini preview */}
                  <div
                    className="h-48 bg-slate-50 overflow-hidden relative cursor-pointer"
                    onClick={() =>
                      navigate(`/resume-builder/${resume.id}`)
                    }
                  >
                    <div
                      className="origin-top-left"
                      style={{
                        transform: "scale(0.22)",
                        width: "210mm",
                        minHeight: "297mm",
                        pointerEvents: "none",
                      }}
                    >
                      {React.createElement(
                        getTemplateComponent(resume.templateId),
                        {
                          data: resume,
                          accentColor: resume.accentColor,
                        },
                      )}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 shadow-sm transition-opacity">
                        <FaEdit className="inline mr-1.5" size={11} />
                        Edit Resume
                      </span>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-800 truncate">
                          {resume.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Updated{" "}
                          {new Date(resume.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      {/* Actions dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(resume.id)}
                          className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaEllipsisV size={12} />
                        </button>

                        {openMenuId === resume.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 min-w-[160px] py-1 overflow-hidden">
                              <button
                                onClick={() => {
                                  navigate(
                                    `/resume-builder/${resume.id}`,
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                <FaEdit size={11} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDuplicate(resume.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                <FaCopy size={11} /> Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  navigate(
                                    `/resume-builder/${resume.id}`,
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                              >
                                <FaDownload size={11} /> Download
                                PDF
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => {
                                  handleDelete(
                                    resume.id,
                                    resume.title,
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 cursor-pointer"
                              >
                                <FaTrash size={11} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Template badge */}
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${resume.accentColor || "#0076B4"}15`,
                          color: resume.accentColor || "#0076B4",
                        }}
                      >
                        {resume.templateId
                          ?.replace(/-/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDashboard;
