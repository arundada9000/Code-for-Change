import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus, FaSearch, FaTimes, FaCloudUploadAlt,
  FaFileCsv, FaFilePdf, FaFileWord, FaDownload, FaFileAlt, FaTrash,
} from "react-icons/fa";
import { BsPencil, BsThreeDotsVertical } from "react-icons/bs";
import { FaRegTrashAlt } from "react-icons/fa";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import { useAuth } from "../../Context/AuthContext";

const PROVINCES = [
  "Kathmandu","Pokhara","Rupandehi","Dang","Birgunj","Farwest","Koshi","Chitwan","LB Karnali",
];

const InputField = React.memo(({ label, value, onChange, type = "text", required = false, placeholder }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-semibold text-sm transition-all text-slate-700 shadow-sm"
      value={value}
      onChange={onChange}
    />
  </div>
));

const TextAreaField = React.memo(({ label, value, onChange, rows = 3, required = false, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea
      rows={rows}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-semibold text-sm transition-all text-slate-700 shadow-sm resize-none"
      value={value}
      onChange={onChange}
    />
  </div>
));

function AdminPeriodicals() {
  const { hasPermission } = useAuth();
  const [periodicals, setPeriodicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const [filterProvince, setFilterProvince] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [formData, setFormData] = useState({
    title: "", description: "", province: "", category: "", tags: "",
    files: [], existingFiles: [], isPublished: false,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchPeriodicals(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterProvince, filterStartDate, filterEndDate]);

  const fetchPeriodicals = async (currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterProvince) params.append("province", filterProvince);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);
      params.append("limit", "10");
      params.append("page", String(currentPage));

      const { data } = await API.get(`/periodicals?${params.toString()}`);
      const items = data.data?.periodicals || [];
      const pagination = data.data?.pagination || null;

      if (currentPage === 1) setPeriodicals(items);
      else setPeriodicals((prev) => [...prev, ...items]);

      setHasMore(pagination && pagination.page < pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch periodicals", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => { const next = page + 1; setPage(next); fetchPeriodicals(next); };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title, description: item.description,
        province: item.province || "", category: item.category || "",
        tags: item.tags ? item.tags.join(", ") : "",
        files: [], existingFiles: item.files || [], isPublished: item.isPublished || false,
      });
    } else {
      setEditingItem(null);
      setFormData({ title: "", description: "", province: "", category: "", tags: "", files: [], existingFiles: [], isPublished: false });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
  };

  const removeNewFile = (index) => {
    setFormData((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const removeExistingFile = async (fileUrl) => {
    if (!editingItem) return;
    try {
      await API.patch(`/periodicals/${editingItem._id}/remove-file`, { fileUrl });
      setFormData((prev) => ({ ...prev, existingFiles: prev.existingFiles.filter((f) => f !== fileUrl) }));
      toast.success("File removed");
    } catch (err) {
      toast.error("Failed to remove file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.province) data.append("province", formData.province);
    if (formData.category) data.append("category", formData.category);
    data.append("isPublished", formData.isPublished);

    const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter((t) => t);
    tagsArray.forEach((tag) => data.append("tags", tag));

    formData.files.forEach((file) => data.append("files", file));

    try {
      if (editingItem) {
        await API.put(`/periodicals/${editingItem._id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Periodical updated successfully");
      } else {
        await API.post("/periodicals", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Periodical created successfully");
      }
      setIsModalOpen(false);
      setPage(1);
      fetchPeriodicals(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save periodical");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/periodicals/${itemToDelete._id}`);
      setPeriodicals(periodicals.filter((p) => p._id !== itemToDelete._id));
      setItemToDelete(null);
      toast.success("Periodical deleted");
    } catch (error) {
      toast.error("Failed to delete periodical");
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(periodicals.map((p) => ({
      Title: p.title, Province: p.province || "N/A", Status: p.isPublished ? "Published" : "Draft",
      Files: p.files?.length || 0, Date: new Date(p.createdAt).toLocaleDateString(),
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CFC_Periodicals_${Date.now()}.csv`;
    link.click();
    toast.success("CSV exported");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(16, 185, 129); doc.text("Code For Change", 14, 20);
    doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.text("Periodicals Report", 14, 30);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    const rows = periodicals.map((p) => [
      new Date(p.createdAt).toLocaleDateString(), p.title, p.province || "N/A",
      p.isPublished ? "Published" : "Draft", p.files?.length || 0,
    ]);
    doc.autoTable({ head: [["Date", "Title", "Province", "Status", "Files"]], body: rows, startY: 45,
      theme: "grid", headStyles: { fillColor: [16, 185, 129] }, styles: { fontSize: 8, cellPadding: 3 } });
    doc.save(`CFC_Periodicals_${Date.now()}.pdf`);
    toast.success("PDF exported");
  };

  if (loading && periodicals.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Periodical Management</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage Publications & Reports</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group/export">
            <button className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest">
              <FaFileCsv className="text-sm text-emerald-500" /> Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-2 overflow-hidden transform origin-top-right scale-95 group-hover/export:scale-100">
              <button onClick={exportToCSV} className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                <FaFileCsv className="text-emerald-500 text-sm" /> CSV
              </button>
              <button onClick={exportToPDF} className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                <FaFilePdf className="text-rose-500 text-sm" /> PDF
              </button>
            </div>
          </div>
          {hasPermission("periodical_create") && (
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 font-bold text-[10px] uppercase tracking-widest">
              <FaPlus className="text-sm" /> Add Periodical
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search periodicals..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="w-full md:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-semibold text-xs cursor-pointer" value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)}>
            <option value="">All Provinces</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">From</label>
              <input type="date" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">To</label>
              <input type="date" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
            </div>
          </div>
          {(searchTerm || filterProvince || filterStartDate || filterEndDate) && (
            <button onClick={() => { setSearchTerm(""); setFilterProvince(""); setFilterStartDate(""); setFilterEndDate(""); }} className="text-[10px] font-bold text-slate-500 hover:text-rose-500 uppercase tracking-widest transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50">Clear Filters</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
        {periodicals.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">No periodicals found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Periodical</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Province</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Files</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodicals.map((item) => (
                  <tr key={item._id} className="bg-white hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{item.province || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-600">{item.files?.length || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${item.isPublished ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white text-slate-400 hover:bg-slate-50 hover:text-emerald-600 border border-slate-200 shadow-sm transition-all">
                        <BsThreeDotsVertical className="text-sm" />
                      </button>
                      {openMenuId === item._id && (
                        <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200">
                          {hasPermission("periodical_update") && (
                            <button onClick={() => { handleOpenModal(item); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                              <BsPencil /> Edit
                            </button>
                          )}
                          {hasPermission("periodical_delete") && (
                            <button onClick={() => { setItemToDelete(item); setDeleteModalOpen(true); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all">
                              <FaRegTrashAlt /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && (
          <div className="flex justify-center py-6 border-t border-slate-100">
            <button onClick={loadMore} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all">{loading ? "Loading..." : "Load More"}</button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center rounded-t-3xl z-10">
              <h3 className="text-xl font-black text-slate-800">{editingItem ? "Edit Periodical" : "Add Periodical"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-all"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <InputField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Periodical title" />
              <TextAreaField label="Description *" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={4} placeholder="Describe this periodical..." />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Province</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-sm text-slate-700" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })}>
                    <option value="">Select Province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <InputField label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Report" />
              </div>
              <InputField label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. annual, report, 2024" />

              {/* Existing Files */}
              {formData.existingFiles.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Files</label>
                  <div className="space-y-2">
                    {formData.existingFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg text-sm">
                        <FaFileAlt className="text-slate-400" />
                        <span className="truncate flex-1 text-xs font-semibold text-slate-600">{f.split("/").pop()}</span>
                        <button type="button" onClick={() => removeExistingFile(f)} className="text-rose-400 hover:text-rose-600 transition-colors"><FaTrash className="text-xs" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New File Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Files</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <FaCloudUploadAlt className="text-3xl text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">Click to upload files</p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, DOC, DOCX, Images • Max 5 MB each</p>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" />
                </div>
                {formData.files.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-emerald-50 rounded-lg text-sm">
                        <FaFileAlt className="text-emerald-500" />
                        <span className="truncate flex-1 text-xs font-semibold text-slate-600">{file.name}</span>
                        <button type="button" onClick={() => removeNewFile(idx)} className="text-rose-400 hover:text-rose-600 transition-colors"><FaTimes className="text-xs" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })} className={`relative w-12 h-6 rounded-full transition-colors ${formData.isPublished ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${formData.isPublished ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm font-bold text-slate-600">{formData.isPublished ? "Published" : "Draft"}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50">
                  {submitting ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }} onConfirm={handleDelete} title="Delete Periodical" message={`Are you sure you want to delete "${itemToDelete?.title}"?`} />
    </div>
  );
}

export default AdminPeriodicals;
