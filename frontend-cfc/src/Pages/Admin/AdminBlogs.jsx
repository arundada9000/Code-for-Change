import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaRegClock, FaRegUser, FaEdit, FaRegTrashAlt , FaTimes, FaFileAlt, FaCloudUploadAlt, FaFileCsv, FaFilePdf, FaFileWord, FaDownload } from "react-icons/fa";
import { BsPencil, BsEye, BsThreeDotsVertical } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";

const InputField = React.memo(({ label, value, onChange, type = "text", required = false, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
      value={value}
      onChange={onChange}
    />
  </div>
));

const TextAreaField = React.memo(({ label, value, onChange, rows = 3, required = false, placeholder, mono = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <textarea
      rows={rows}
      required={required}
      placeholder={placeholder}
      className={`w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all resize-none ${mono ? 'font-mono text-xs' : ''}`}
      value={value}
      onChange={onChange}
    />
  </div>
));

import { useAuth } from "../../Context/AuthContext";

function AdminBlogs() {
  const { hasPermission } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const PROVINCES = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];

  const [formData, setFormData] = useState({
    title: "",
    author: "Admin",
    category: "Technology",
    content: "",
    excerpt: "",
    province: "",
    tags: "",
    imageFile: null,
    imagePreview: "",
    isPublished: false,
    isFeatured: false,
    highlights: [],
    authorDetails: {
        name: "Admin",
        role: "Content Creator",
        linkedin: "",
        facebook: "",
        tiktok: "",
        instagram: "",
        youtube: ""
    },
    metaTitle: "",
    metaDescription: "",
    metaKeywords: ""
  });

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
        fetchBlogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory, filterStatus, filterProvince, filterStartDate, filterEndDate]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory) params.append("category", filterCategory);
      if (filterStatus) {
         if (filterStatus === 'Published') params.append("isPublished", "true");
         if (filterStatus === 'Draft') params.append("isPublished", "false");
      }
      if (filterProvince) params.append("province", filterProvince);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);

      const { data } = await API.get(`/blogs?${params.toString()}`);
      setBlogs(data.data || []);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Image Handling ---
  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // --- CRUD Handlers ---
  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        author: blog.author || "Admin",
        category: blog.category || "Technology",
        content: blog.content,
        excerpt: blog.excerpt || "",
        province: blog.province || "",
        tags: blog.tags ? blog.tags.join(", ") : "",
        imageFile: null,
        imagePreview: blog.image,
        isPublished: blog.isPublished || false,
        isFeatured: blog.isFeatured || false,
        highlights: blog.highlights || [],
        authorDetails: blog.authorDetails || { 
          name: blog.author || "Admin", 
          role: "Author", 
          linkedin: "",
          facebook: "",
          tiktok: "",
          instagram: "",
          youtube: ""
        },
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        metaKeywords: blog.metaKeywords || ""
      });
    } else {
      setEditingBlog(null);
      setFormData({ 
        title: "", author: "Admin", category: "Technology", 
        content: "", excerpt: "", province: "", tags: "",
        imageFile: null, imagePreview: "", isPublished: false,
        isFeatured: false,
        highlights: [],
        authorDetails: { 
          name: "Admin", 
          role: "Content Creator", 
          linkedin: "",
          facebook: "",
          tiktok: "",
          instagram: "",
          youtube: ""
        },
        metaTitle: "", metaDescription: "", metaKeywords: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    try {
      await API.delete(`/blogs/${blogToDelete._id || blogToDelete.id}`);
      setBlogs(blogs.filter(b => (b._id || b.id) !== (blogToDelete._id || blogToDelete.id)));
      setBlogToDelete(null);
    } catch (error) {
      console.error("Failed to delete blog", error);
      alert("Failed to delete blog");
    }
  };

  const addHighlight = (text) => {
    if (text.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, text.trim()]
      }));
    }
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const readTimeCalc = `${Math.ceil(formData.content.split(' ').length / 200)} min`;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("category", formData.category);
    data.append("content", formData.content);
    data.append("excerpt", formData.excerpt || formData.content.substring(0, 150) + "...");
    data.append("readTime", readTimeCalc);
    data.append("isPublished", formData.isPublished);
    data.append("isFeatured", formData.isFeatured);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
    data.append("metaKeywords", formData.metaKeywords);
    if (formData.province) data.append("province", formData.province);
    
    // Handle nested author details
    data.append("authorDetails", JSON.stringify(formData.authorDetails));

    // Handle highlights
    formData.highlights.forEach(h => data.append("highlights", h));
    
    // Handle tags (split by comma)
    const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);
    tagsArray.forEach(tag => data.append("tags", tag));

    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    try {
      if (editingBlog) {
        const { data: response } = await API.put(`/blogs/${editingBlog._id || editingBlog.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setBlogs(blogs.map(b => (b._id || b.id) === (editingBlog._id || editingBlog.id) ? response.data : b));
      } else {
        const { data: response } = await API.post("/blogs", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setBlogs([response.data, ...blogs]);
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to save blog", error);
      alert(error.response?.data?.message || "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(blogs.map(b => ({
      Title: b.title,
      Author: b.author,
      Category: b.category,
      Status: b.isPublished ? "Published" : "Draft",
      "Read Time": b.readTime || "5 min",
      Province: b.province || "N/A",
      Date: new Date(b.createdAt || b.date).toLocaleDateString()
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CFC_Blogs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text("Code For Change", 14, 20);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Article Management Ledger", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    
    const tableColumn = ["Date", "Article Title", "Author", "Province", "Category", "Status"];
    const tableRows = blogs.map(b => [
      new Date(b.createdAt || b.date).toLocaleDateString(),
      b.title,
      b.author,
      b.province || "N/A",
      b.category,
      b.isPublished ? "Published" : "Draft"
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontWeight: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`CFC_Blogs_Report_${Date.now()}.pdf`);
    toast.success("PDF Exported successfully");
  };

  const exportToWord = () => {
    let content = "CODE FOR CHANGE\nBLOG MANAGEMENT REPORT\n\n";
    content += `Report Date: ${new Date().toLocaleString()}\n`;
    content += "==========================================\n\n";
    
    blogs.forEach((b, index) => {
      content += `${index + 1}. ARTICLE PROFILE\n`;
      content += `   Title: ${b.title}\n`;
      content += `   Author: ${b.author}\n`;
      content += `   Province: ${b.province || "N/A"}\n`;
      content += `   Category: ${b.category}\n`;
      content += `   Status: ${b.isPublished ? "Published" : "Draft"}\n`;
      content += `   Read Time: ${b.readTime || "5 min"}\n`;
      content += "------------------------------------------\n";
    });
    
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CFC_Blogs_Report_${Date.now()}.doc`;
    link.click();
    toast.success("Word Document Exported successfully");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          let count = 0;
          for (const row of results.data) {
            const payload = {
              title: row.Title || row.title,
              author: row.Author || row.author || "Admin",
              category: row.Category || row.category || "Technology",
              content: row.Content || row.content || "Imported content...",
              isPublished: row.Status === 'Published' || row.isPublished === 'true',
            };
            if (payload.title) {
              if (row.Province || row.province) payload.province = row.Province || row.province;
              await API.post("/blogs", payload);
              count++;
            }
          }
          toast.success(`Successfully imported ${count} articles`);
          fetchBlogs();
        } catch (error) {
          toast.error("Import failed: One or more records are invalid");
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className=" flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Blog Management</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage News & Articles</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest cursor-pointer group">
            <FaDownload className="text-emerald-500 group-hover:bounce" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          
          <div className="relative group/export">
            <button className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest">
              <FaFileCsv className="text-lg text-emerald-500" /> Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-3 overflow-hidden">
              <button onClick={exportToCSV} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50">
                <FaFileCsv className="text-emerald-500" /> CSV Schema
              </button>
              <button onClick={exportToPDF} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50">
                <FaFilePdf className="text-rose-500" /> PDF Document
              </button>
              <button onClick={exportToWord} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                <FaFileWord className="text-blue-500" /> MS Word Doc
              </button>
            </div>
          </div>

          {hasPermission('blog_create') && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest"
            >
              <FaPlus className="text-lg" /> Write Post
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search articles by title..."
              className="w-full pl-16 pr-8 py-4 bg-slate-50 rounded-xl outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 w-full md:w-auto">
            <select
              className="w-full px-4 md:px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {['Technology', 'Community', 'Education', 'Events', 'Career'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="w-full px-4 md:px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <select
              className="w-full px-4 md:px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
            >
              <option value="">All Provinces</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[40px]">From:</label>
                 <input 
                    type="date" 
                    className="flex-1 px-4 py-3 md:py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all"
                    value={filterStartDate} 
                    onChange={(e) => setFilterStartDate(e.target.value)} 
                 />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[40px]">To:</label>
                 <input 
                    type="date" 
                    className="flex-1 px-4 py-3 md:py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all"
                    value={filterEndDate} 
                    onChange={(e) => setFilterEndDate(e.target.value)} 
                 />
            </div>
            <div className="flex-1 text-right w-full md:w-auto">
                <button 
                    onClick={() => { setSearchTerm(""); setFilterCategory(""); setFilterStatus(""); setFilterProvince(""); setFilterStartDate(""); setFilterEndDate(""); }}
                    className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                >
                    Clear Filters
                </button>
            </div>
        </div>
      </div>

      {/* Blog List/Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">No blogs found.</div>
        ) : (
          <div className="min-h-screen hidden md:block overflow-x-auto">
            <table className="min-w-full w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Article</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Stats</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {blogs.map((blog, index) => (
                  <tr key={blog._id || blog.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100/50 transition-all`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={blog.image || "https://via.placeholder.com/150"} className="w-16 h-16 rounded-xl object-cover border border-slate-100" alt="thumb" />
                        <div>
                          <div className="font-black text-slate-900 leading-tight text-base mb-1 line-clamp-1">{blog.title}</div>
                          <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
                            <FaRegUser className="text-[10px]" /> {blog.author} • {new Date(blog.createdAt || blog.date).toLocaleDateString()}
                             <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${blog.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {blog.isPublished ? 'Published' : 'Draft'}
                             </span>
                             {blog.province && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                    {blog.province}
                                </span>
                             )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <FaRegClock /> {blog.readTime || "5 min"} read
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === blog._id ? null : blog._id)}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                      >
                        <BsThreeDotsVertical />
                      </button>
                      {openMenuId === blog._id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-20 top-6 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200"
                        >
                          <Link 
                            to={`/blog/${blog._id || blog.id}-${blog.slug || blog.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}`} 
                            target="_blank"
                            className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                          >
                            <BsEye className="text-emerald-500" /> View Detail
                          </Link>
                          <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                          {hasPermission('blog_update') && (
                            <button 
                              onClick={() => { handleOpenModal(blog); setOpenMenuId(null); }}
                              className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                            >
                              <BsPencil className="text-amber-500" /> Edit Blog
                            </button>
                          )}
                          <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                          {hasPermission('blog_delete') && (
                            <button 
                              onClick={() => { 
                                  setBlogToDelete(blog);
                                  setDeleteModalOpen(true);
                                  setOpenMenuId(null); 
                              }}
                              className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                            >
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

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {loading ? (
             <div className="p-10 text-center text-slate-400">Loading blogs...</div>
          ) : blogs.length === 0 ? (
             <div className="p-10 text-center text-slate-400">No blogs found.</div>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id || blog.id} className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 shadow-sm relative">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <img src={blog.image || "https://via.placeholder.com/150"} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt="" />
                       <div>
                          <h3 className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{blog.title}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{blog.category}</p>
                       </div>
                    </div>
                    <button 
                       onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === blog._id ? null : blog._id);
                       }}
                       className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shadow-sm"
                    >
                       <BsThreeDotsVertical />
                    </button>
                 </div>

                 {/* Mobile Dropdown */}
                 {openMenuId === blog._id && (
                    <div className="absolute top-14 right-4 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in">
                        <Link 
                             to={`/blog/${blog._id || blog.id}-${blog.slug || blog.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}`} 
                             className="w-full px-4 py-2 text-left block text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            View Detail
                        </Link>
                       {hasPermission('blog_update') && (
                        <button onClick={() => { handleOpenModal(blog); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-xs font-bold text-amber-600 hover:bg-amber-50">Edit Blog</button>
                       )}
                       <div className="h-[1px] bg-slate-50 my-1"></div>
                       {hasPermission('blog_delete') && (
                        <button onClick={() => { setBlogToDelete(blog); setDeleteModalOpen(true); }} className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50">Delete</button>
                       )}
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Author</p>
                       <p className="text-xs font-bold text-slate-700 uppercase mt-0.5 truncate">{blog.author}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Read Time</p>
                       <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">{blog.readTime || "5 min"}</p>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        blog.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${blog.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}></span> {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">{new Date(blog.createdAt || blog.date).toLocaleDateString()}</span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- BLOG MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight">
                  {editingBlog ? "Update Article" : "Create New Post"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Blog Management</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Article Details</h4>
                  <InputField label="Article Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Enter a compelling title..." />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Author Name" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} required />
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                      <select 
                        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium"
                        value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option>Technology</option>
                        <option>Community</option>
                        <option>Education</option>
                        <option>Events</option>
                        <option>Career</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Province</label>
                      <select 
                        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium"
                        value={formData.province} 
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <TextAreaField label="Excerpt (Summary)" rows={3} value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} placeholder="A short hook for the blog listings..." />
                  
                  <InputField label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="e.g. AI, Nepal, Coding" />

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input 
                        type="checkbox" 
                        id="isPublished"
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        checked={formData.isPublished} 
                        onChange={(e) => setFormData({...formData, isPublished: e.target.checked})} 
                    />
                    <label htmlFor="isPublished" className="text-xs font-black text-slate-700 uppercase tracking-widest cursor-pointer">
                        Publish immediately
                    </label>
                  </div>
                </div>

                {/* Right Column: Media & Content */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Featured Media</h4>
                  <div
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current.click()}
                    className={`relative border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden min-h-[200px] ${
                      isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-500"
                    }`}
                  >
                    <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
                    {formData.imagePreview ? (
                      <>
                        <img src={formData.imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-bold gap-2">
                          <FaCloudUploadAlt /> Replace Cover Image
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <FaCloudUploadAlt className={`text-4xl mx-auto mb-2 ${isDragging ? "text-emerald-500 animate-bounce" : ""}`} />
                        <p className="text-xs font-black uppercase tracking-widest">Drop cover image here</p>
                      </div>
                    )}
                  </div>

                  <TextAreaField label="Blog Content (Markdown supported)" rows={12} mono={true} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required placeholder="Write your article content here..." />
                </div>
              </div>

              {/* Enterprise Sections: Highlights & Author */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <FaFileAlt /> Key Highlights
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="highlight-input-blog" 
                      placeholder="Add key takeaway..." 
                      className="flex-1 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 transition-all" 
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(e.target.value); e.target.value = ''; }}} 
                    />
                    <button 
                      type="button" 
                      onClick={() => { const input = document.getElementById('highlight-input-blog'); addHighlight(input.value); input.value = ''; }} 
                      className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.highlights.map((h, i) => (
                      <div key={i} className="px-5 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 flex justify-between items-center border border-slate-100">
                        <span>{h}</span>
                        <button type="button" onClick={() => removeHighlight(i)} className="text-rose-500 hover:text-rose-700 transition-colors">
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <input 
                          type="checkbox" 
                          id="isFeatured"
                          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={formData.isFeatured} 
                          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} 
                      />
                      <label htmlFor="isFeatured" className="text-xs font-black text-slate-700 uppercase tracking-widest cursor-pointer">
                          Mark as Featured Article
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    Detailed Author Information
                  </h4>
                  <div className="space-y-4">
                    <InputField 
                      label="Author Full Name" 
                      value={formData.authorDetails.name} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        authorDetails: { ...formData.authorDetails, name: e.target.value },
                        author: e.target.value // Keep legacy author field in sync
                      })} 
                      required 
                    />
                    <InputField 
                      label="Author Title / Role" 
                      value={formData.authorDetails.role} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        authorDetails: { ...formData.authorDetails, role: e.target.value } 
                      })} 
                      required 
                      placeholder="e.g. Lead Developer, UX Researcher"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField 
                        label="LinkedIn URL" 
                        value={formData.authorDetails.linkedin} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          authorDetails: { ...formData.authorDetails, linkedin: e.target.value } 
                        })} 
                        placeholder="linkedin.com/in/..."
                      />
                      <InputField 
                        label="Facebook URL" 
                        value={formData.authorDetails.facebook} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          authorDetails: { ...formData.authorDetails, facebook: e.target.value } 
                        })} 
                        placeholder="facebook.com/..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField 
                        label="Instagram" 
                        value={formData.authorDetails.instagram} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          authorDetails: { ...formData.authorDetails, instagram: e.target.value } 
                        })} 
                        placeholder="instagram.com/..."
                      />
                      <InputField 
                        label="TikTok" 
                        value={formData.authorDetails.tiktok} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          authorDetails: { ...formData.authorDetails, tiktok: e.target.value } 
                        })} 
                        placeholder="tiktok.com/@..."
                      />
                      <InputField 
                        label="YouTube" 
                        value={formData.authorDetails.youtube} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          authorDetails: { ...formData.authorDetails, youtube: e.target.value } 
                        })} 
                        placeholder="youtube.com/c/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Settings Section */}
              <div className="space-y-6 pt-4">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                   SEO & Metadata (Search Engine Optimization)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-6">
                      <InputField label="SEO Title (Meta Title)" value={formData.metaTitle} onChange={(e) => setFormData({...formData, metaTitle: e.target.value})} placeholder="Optimal: 50-60 characters" />
                      <InputField label="SEO Keywords" value={formData.metaKeywords} onChange={(e) => setFormData({...formData, metaKeywords: e.target.value})} placeholder="e.g. technology, nepal, coding, future" />
                   </div>
                   <TextAreaField label="SEO Description (Meta Description)" rows={4} value={formData.metaDescription} onChange={(e) => setFormData({...formData, metaDescription: e.target.value})} placeholder="Optimal: 150-160 characters" />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className={`px-12 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 ${
                            submitting 
                            ? 'bg-slate-400 cursor-not-allowed text-white' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                        }`}
                      >
                        {submitting ? "Publishing..." : editingBlog ? "Update Article" : "Deploy Post"}
                      </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModalOpen}
        onClose={() => {
            setDeleteModalOpen(false);
            setBlogToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        itemName="blog post"
        message={`Are you sure you want to delete "${blogToDelete?.title}"? This action will permanently remove the article from the website.`}
      />
    </div>
  );
}

export default AdminBlogs;