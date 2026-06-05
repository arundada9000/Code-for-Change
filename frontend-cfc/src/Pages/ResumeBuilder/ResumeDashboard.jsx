import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useResumes } from "../../Hooks/useResumes";
import { exportResumeToPDF } from "./pdfExport";
import { getTemplateComponent } from "./templates/templateRegistry";
import { FadeIn, SlideUp } from "../../Components/Common/Animations";
import { ResumeCardSkeleton } from "../../Components/Loading/Skeleton";
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

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteResume(id);
        toast.success("Resume deleted");
      } catch {
        toast.error("Failed to delete resume");
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateResume(id);
      toast.success("Resume duplicated");
    } catch {
      toast.error("Failed to duplicate resume");
    }
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                My Resumes
              </h1>
              <p className="text-base text-slate-400 mt-2">
                Loading your resumes...
              </p>
            </div>
          </div>
          <ResumeCardSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-5 md:px-8 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">
                My Resumes
              </h1>
              <p className="text-base text-slate-500">
                Create, edit, and download your professional resumes
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-blue-600 text-white text-sm font-black uppercase tracking-wide rounded-full hover:shadow-[0_15px_30px_-10px_rgba(0,118,180,0.4)] hover:-translate-y-1 transition-all cursor-pointer"
            >
              <FaPlus size={14} />
              Create New Resume
            </button>
          </div>
        </FadeIn>

        {/* Empty State */}
        {resumes.length === 0 && (
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm mt-8">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <FaFileAlt size={36} className="text-secondary" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">
                No resumes yet
              </h2>
              <p className="text-base text-slate-500 max-w-md mb-8 leading-relaxed">
                Create your first professional resume with our builder. Your
                profile data will be pre-filled automatically to save you time!
              </p>
              <button
                onClick={handleCreate}
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-sm font-black uppercase tracking-wide rounded-full hover:bg-secondary hover:shadow-[0_15px_30px_-10px_rgba(0,118,180,0.4)] hover:-translate-y-1 transition-all cursor-pointer"
              >
                <FaPlus size={14} />
                Create First Resume
              </button>
            </div>
          </FadeIn>
        )}

        {/* Resume Grid */}
        {resumes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resumes.map((resume, index) => (
              <SlideUp key={resume.id} delay={index * 0.1}>
                <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.15)] hover:border-blue-100 hover:-translate-y-2 transition-all duration-500 group relative ${openMenuId === resume.id ? 'z-30' : 'z-10'}`}>
                  
                  {/* Mini preview */}
                  <div
                    className="h-56 bg-slate-100 overflow-hidden rounded-t-[2rem] relative cursor-pointer group-hover:bg-blue-50/30 transition-colors"
                    onClick={() =>
                      navigate(`/resume-builder/${resume.id}`)
                    }
                  >
                    <div
                      className="origin-top-left absolute top-4 left-4 right-4 bg-white rounded-xl shadow-sm border border-slate-200/50 overflow-hidden transition-transform duration-700 group-hover:scale-105"
                      style={{
                        transform: "scale(0.24)",
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
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/95 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-800 shadow-xl transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center gap-2">
                        <FaEdit size={12} className="text-secondary" />
                        Edit Resume
                      </span>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1 pr-4">
                        <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-secondary transition-colors tracking-tight">
                          {resume.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
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
                          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer border ${openMenuId === resume.id ? 'bg-blue-50 text-secondary border-blue-100' : 'text-slate-400 border-transparent hover:text-secondary hover:bg-blue-50 hover:border-blue-100'}`}
                        >
                          <FaEllipsisV size={14} />
                        </button>

                        {openMenuId === resume.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-[calc(100%+8px)] bg-white/95 backdrop-blur-xl border border-slate-100/80 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] z-50 min-w-[200px] p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                              <button
                                onClick={() => {
                                  navigate(
                                    `/resume-builder/${resume.id}`,
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-pointer group/item"
                              >
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-secondary flex items-center justify-center group-hover/item:bg-white group-hover/item:shadow-sm transition-all"><FaEdit size={12} /></div>
                                Edit Resume
                              </button>
                              <button
                                onClick={() => {
                                  handleDuplicate(resume.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-pointer group/item"
                              >
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-secondary flex items-center justify-center group-hover/item:bg-white group-hover/item:shadow-sm transition-all"><FaCopy size={12} /></div>
                                Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  navigate(
                                    `/resume-builder/${resume.id}`,
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors cursor-pointer group/item"
                              >
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/item:bg-white group-hover/item:shadow-sm transition-all"><FaDownload size={12} /></div>
                                Export PDF
                              </button>
                              <div className="h-px bg-slate-100 my-1 mx-2" />
                              <button
                                onClick={() => {
                                  handleDelete(
                                    resume.id,
                                    resume.title,
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer group/item"
                              >
                                <div className="w-7 h-7 rounded-lg bg-red-50/50 text-red-500 flex items-center justify-center group-hover/item:bg-white group-hover/item:shadow-sm transition-all"><FaTrash size={12} /></div>
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Template badge */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: resume.accentColor || "#0076B4" }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {resume.templateId
                            ?.replace(/-/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
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
