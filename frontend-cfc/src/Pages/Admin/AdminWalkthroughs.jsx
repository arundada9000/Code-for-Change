import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaPlus, FaSearch, FaTimes, FaCloudUploadAlt,
  FaFileCsv, FaFilePdf, FaFileAlt, FaTrash, FaRegTrashAlt,
} from "react-icons/fa";
import { BsPencil, BsEye, BsThreeDotsVertical } from "react-icons/bs";
import { Link } from "react-router-dom";
import JoditEditor from "jodit-react";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import { useAuth } from "../../Context/AuthContext";
import DebouncedSearchInput from "../../Components/UI/DebouncedSearchInput";
import { compressImage } from "../../utils/imageCompressor";

const PROVINCES = [
  "Kathmandu","Pokhara","Rupandehi","Dang","Birgunj","Farwest","Koshi","Chitwan","LB Karnali",
];

const InputField = React.memo(({ label, value, onChange, type = "text", required = false, placeholder }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} required={required} placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-semibold text-sm transition-all text-slate-700 shadow-sm"
      value={value} onChange={onChange} />
  </div>
));

const TextAreaField = React.memo(({ label, value, onChange, rows = 3, required = false, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea rows={rows} required={required} placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-semibold text-sm transition-all text-slate-700 shadow-sm resize-none"
      value={value} onChange={onChange} />
  </div>
));

function AdminWalkthroughs() {
  const { hasPermission } = useAuth();
  const [walkthroughs, setWalkthroughs] = useState([]);
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
  const imageInputRef = useRef(null);
  const editorRef = useRef(null);

  const [filterProvince, setFilterProvince] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [formData, setFormData] = useState({
    title: "", description: "", content: "", province: "", category: "", tags: "",
    imageFile: null, imagePreview: "",
    files: [], existingFiles: [], isPublished: false,
  });

  // Jodit editor config
  const editorConfig = useMemo(() => ({
    readonly: false,
    height: 400,
    placeholder: "Write your walkthrough content here...",
    buttons: [
      "bold", "italic", "underline", "strikethrough", "|",
      "ul", "ol", "|",
      "font", "fontsize", "brush", "paragraph", "|",
      "image", "table", "link", "|",
      "align", "undo", "redo", "|",
      "hr", "eraser", "fullsize", "|",
      "source",
    ],
    uploader: { insertImageAsBase64URI: true },
    removeButtons: ["about"],
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: false,
    toolbarAdaptive: true,
  }), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchWalkthroughs(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterProvince, filterStartDate, filterEndDate]);

  const fetchWalkthroughs = async (currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterProvince) params.append("province", filterProvince);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);
      params.append("limit", "10");
      params.append("page", String(currentPage));

      const { data } = await API.get(`/walkthroughs?${params.toString()}`);
      const items = data.data?.walkthroughs || [];
      const pagination = data.data?.pagination || null;

      if (currentPage === 1) setWalkthroughs(items);
      else setWalkthroughs((prev) => [...prev, ...items]);

      setHasMore(pagination && pagination.page < pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch walkthroughs", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => { const next = page + 1; setPage(next); fetchWalkthroughs(next); };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title, description: item.description || "",
        content: item.content || "", province: item.province || "",
        category: item.category || "", tags: item.tags ? item.tags.join(", ") : "",
        imageFile: null, imagePreview: item.image || "",
        files: [], existingFiles: item.files || [], isPublished: item.isPublished || false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "", description: "", content: "", province: "", category: "", tags: "",
        imageFile: null, imagePreview: "",
        files: [], existingFiles: [], isPublished: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const { file: compressedFile } = await compressImage(file);
      const fileToUse = compressedFile || file;
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, imageFile: fileToUse, imagePreview: reader.result }));
      reader.readAsDataURL(fileToUse);
    } else {
      toast.error("Please select a valid image file.");
    }
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
      await API.patch(`/walkthroughs/${editingItem._id}/remove-file`, { fileUrl });
      setFormData((prev) => ({ ...prev, existingFiles: prev.existingFiles.filter((f) => f !== fileUrl) }));
      toast.success("File removed");
    } catch (err) {
      toast.error("Failed to remove file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!editingItem && !formData.imageFile) {
      toast.error("Cover image is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    setSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("content", formData.content);
    if (formData.province) data.append("province", formData.province);
    if (formData.category) data.append("category", formData.category);
    data.append("isPublished", formData.isPublished);

    const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter((t) => t);
    tagsArray.forEach((tag) => data.append("tags", tag));

    if (formData.imageFile) data.append("image", formData.imageFile);
    formData.files.forEach((file) => data.append("files", file));

    try {
      if (editingItem) {
        await API.put(`/walkthroughs/${editingItem._id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Walkthrough updated successfully");
      } else {
        await API.post("/walkthroughs", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Walkthrough created successfully");
      }
      setIsModalOpen(false);
      setPage(1);
      fetchWalkthroughs(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save walkthrough");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/walkthroughs/${itemToDelete._id}`);
      setWalkthroughs(walkthroughs.filter((w) => w._id !== itemToDelete._id));
      setItemToDelete(null);
      toast.success("Walkthrough deleted");
    } catch (error) {
      toast.error("Failed to delete walkthrough");
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(walkthroughs.map((w) => ({
      Title: w.title, Province: w.province || "N/A", Status: w.isPublished ? "Published" : "Draft",
      ReadTime: w.readTime || "N/A", Date: new Date(w.createdAt).toLocaleDateString(),
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CFC_Walkthroughs_${Date.now()}.csv`;
    link.click();
    toast.success("CSV exported");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(16, 185, 129); doc.text("Code For Change", 14, 20);
    doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.text("Walkthroughs Report", 14, 30);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    const rows = walkthroughs.map((w) => [
      new Date(w.createdAt).toLocaleDateString(), w.title, w.province || "N/A",
      w.isPublished ? "Published" : "Draft", w.readTime || "N/A",
    ]);
    doc.autoTable({ head: [["Date", "Title", "Province", "Status", "Read Time"]], body: rows, startY: 45,
      theme: "grid", headStyles: { fillColor: [16, 185, 129] }, styles: { fontSize: 8, cellPadding: 3 } });
    doc.save(`CFC_Walkthroughs_${Date.now()}.pdf`);
    toast.success("PDF exported");
  };

  if (loading && walkthroughs.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Walkthrough Management</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage Guides & Tutorials</p>
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
          {hasPermission("walkthrough_create") && (
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 font-bold text-[10px] uppercase tracking-widest">
              <FaPlus className="text-sm" /> Write Walkthrough
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <DebouncedSearchInput placeholder="Search walkthroughs..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all text-sm" value={searchTerm} onSearch={setSearchTerm} />
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
        {walkthroughs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">No walkthroughs found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Walkthrough</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Province</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Read Time</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {walkthroughs.map((item) => (
                  <tr key={item._id} className="bg-white hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image || "https://via.placeholder.com/150"} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" alt="thumb" />
                        <div>
                          <div className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{item.title}</div>
                          <div className="text-[10px] text-slate-500 font-bold">{new Date(item.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{item.province || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{item.readTime || "N/A"}</td>
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
                          <Link to={`/creative/walkthrough/${item._id}-${item.slug}`} target="_blank" className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            <BsEye /> Preview
                          </Link>
                          {hasPermission("walkthrough_update") && (
                            <button onClick={() => { handleOpenModal(item); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                              <BsPencil /> Edit
                            </button>
                          )}
                          {hasPermission("walkthrough_delete") && (
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center rounded-t-3xl z-10">
              <h3 className="text-xl font-black text-slate-800">{editingItem ? "Edit Walkthrough" : "Write Walkthrough"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-all"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <InputField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Walkthrough title" />
              <TextAreaField label="Short Description *" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} placeholder="Brief summary shown on cards..." />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Province</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-sm text-slate-700" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })}>
                    <option value="">Select Province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <InputField label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Tutorial" />
              </div>
              <InputField label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. react, javascript, guide" />

              {/* Cover Image */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image {!editingItem && "*"}</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-bold">Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <FaCloudUploadAlt className="text-3xl text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-500">Click to upload cover image</p>
                      <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, WEBP • Max 5 MB</p>
                    </div>
                  )}
                  <input ref={imageInputRef} type="file" className="hidden" onChange={handleImageFile} accept="image/*" />
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content *</label>
                <JoditEditor
                  ref={editorRef}
                  value={formData.content}
                  config={editorConfig}
                  onBlur={(newContent) => setFormData((prev) => ({ ...prev, content: newContent }))}
                />
              </div>

              {/* Existing Files */}
              {formData.existingFiles.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Attachments</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attach Files</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <FaCloudUploadAlt className="text-3xl text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">Click to upload attachments</p>
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
                  {submitting ? "Saving..." : editingItem ? "Update" : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }} onConfirm={handleDelete} title="Delete Walkthrough" message={`Are you sure you want to delete "${itemToDelete?.title}"?`} />
    </div>
  );
}

export default AdminWalkthroughs;
