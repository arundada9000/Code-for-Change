import React, { useState, useEffect } from "react";
import { FaRegTrashAlt, FaEye, FaFileAlt, FaSearch } from "react-icons/fa";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import DebouncedSearchInput from "../../Components/UI/DebouncedSearchInput";

function AdminResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewResume, setViewResume] = useState(null);

  const fetchResumes = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await API.get("/resumes/admin/all", {
        params: { page, limit: 20, search: search || undefined },
      });
      setResumes(data.data?.resumes || []);
      setPagination(data.data?.pagination || pagination);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(1);
  }, [search]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(
        `/resumes/admin/${itemToDelete._id || itemToDelete.id}`,
      );
      setResumes((prev) =>
        prev.filter(
          (r) =>
            (r._id || r.id) !== (itemToDelete._id || itemToDelete.id),
        ),
      );
      toast.success("Resume deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  if (loading && resumes.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Resume Management
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            View and manage all user resumes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <FaFileAlt className="text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {pagination.total}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Resumes
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <DebouncedSearchInput
            placeholder="Search by name, title, or email..."
            value={search}
            onSearch={setSearch}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            Loading...
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-300">
            <FaFileAlt className="text-6xl mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">
              No resumes found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    User
                  </th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Resume Title
                  </th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Template
                  </th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Sections
                  </th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Updated
                  </th>
                  <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => {
                  const user = resume.userId;
                  const sectionCount = [
                    resume.experience?.length,
                    resume.education?.length,
                    resume.skills?.length,
                    resume.projects?.length,
                    resume.certifications?.length,
                  ].filter(Boolean).length;

                  return (
                    <tr
                      key={resume._id || resume.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          {user?.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                              {user?.name?.[0] || "?"}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-bold text-slate-700 block">
                              {user?.name || "Unknown"}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              {user?.email || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          {resume.title}
                        </span>
                        {resume.personalInfo?.fullName && (
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {resume.personalInfo.fullName}
                            {resume.personalInfo.title &&
                              ` — ${resume.personalInfo.title}`}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                          style={{
                            backgroundColor: `${resume.accentColor || "#0076B4"}15`,
                            color: resume.accentColor || "#0076B4",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                resume.accentColor || "#0076B4",
                            }}
                          />
                          {resume.templateId
                            ?.replace(/-/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500 font-medium">
                        {sectionCount} sections filled
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                        {new Date(resume.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewResume(resume)}
                            title="View Details"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 border border-blue-100 hover:bg-blue-500 hover:text-white transition-all text-sm"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(resume);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all text-sm"
                          >
                            <FaRegTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 px-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchResumes(i + 1)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                pagination.page === i + 1
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-white text-slate-500 border border-slate-100 hover:border-slate-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setViewResume(null)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {viewResume.title}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-1">
                    by{" "}
                    {viewResume.userId?.name || "Unknown User"} (
                    {viewResume.userId?.email})
                  </p>
                </div>
                <button
                  onClick={() => setViewResume(null)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Personal Info */}
                {viewResume.personalInfo?.fullName && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Personal Info
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {viewResume.personalInfo.fullName}
                      {viewResume.personalInfo.title &&
                        ` — ${viewResume.personalInfo.title}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {[
                        viewResume.personalInfo.email,
                        viewResume.personalInfo.phone,
                        viewResume.personalInfo.address,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                )}

                {/* Section summary */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Experience",
                      count: viewResume.experience?.length || 0,
                    },
                    {
                      label: "Education",
                      count: viewResume.education?.length || 0,
                    },
                    {
                      label: "Skills",
                      count: viewResume.skills?.length || 0,
                    },
                    {
                      label: "Projects",
                      count: viewResume.projects?.length || 0,
                    },
                    {
                      label: "Certifications",
                      count: viewResume.certifications?.length || 0,
                    },
                    {
                      label: "Languages",
                      count: viewResume.languages?.length || 0,
                    },
                  ].map(({ label, count }) => (
                    <div
                      key={label}
                      className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {count}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex gap-4 text-xs font-semibold text-slate-400">
                  <span>
                    Template:{" "}
                    {viewResume.templateId
                      ?.replace(/-/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <span>
                    Created:{" "}
                    {new Date(
                      viewResume.createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewResume(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to permanently delete this resume? This action cannot be undone."
      />
    </div>
  );
}

export default AdminResumes;
