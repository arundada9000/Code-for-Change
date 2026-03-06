import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
  FaCloudUploadAlt,
  FaExternalLinkAlt,
  FaMoneyBillWave,
  FaClock,
  FaLink,
  FaFileCsv,
  FaFilePdf,
  FaFileWord,
  FaDownload,
  FaDownload as FaImport,
  FaRegCalendarAlt,
  FaChevronRight,
  FaUserTie,
} from "react-icons/fa";
import { BsThreeDotsVertical, BsPencil, BsTrash, BsEye } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { useAuth } from "../../Context/AuthContext";

const InputField = React.memo(
  ({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder,
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
        {label}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
        value={value}
        onChange={onChange}
      />
    </div>
  ),
);

const TextAreaField = React.memo(
  ({ label, value, onChange, rows = 3, required = false, placeholder }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
        {label}
      </label>
      <textarea
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all resize-none"
        value={value}
        onChange={onChange}
      />
    </div>
  ),
);

function AdminInternships() {
  const { hasPermission } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDeadlineStart, setFilterDeadlineStart] = useState("");
  const [filterDeadlineEnd, setFilterDeadlineEnd] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const PROVINCES = [
    "Kathmandu",
    "Pokhara",
    "Rupandehi",
    "Dang",
    "Birgunj",
    "Farwest",
    "Koshi",
    "Chitwan",
    "LB Karnali",
  ];

  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    type: "Internship",
    category: "",
    description: "",
    requirements: [],
    responsibilities: [],
    salaryRange: "",
    applicationDeadline: "",
    applyLink: "",
    status: "Draft",
    postedBy: "Code for Change",
    province: "",
    logoFile: null,
    logoPreview: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInternships();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    filterType,
    filterStatus,
    filterDeadlineStart,
    filterDeadlineEnd,
    filterProvince,
  ]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType) params.append("type", filterType);
      if (filterStatus) params.append("status", filterStatus);
      if (filterDeadlineStart)
        params.append("deadlineStart", filterDeadlineStart);
      if (filterDeadlineEnd) params.append("deadlineEnd", filterDeadlineEnd);
      if (filterProvince) params.append("province", filterProvince);

      const { data } = await API.get(`/internships?${params.toString()}`);
      setInternships(data.data || []);
    } catch (error) {
      console.error("Failed to fetch internships", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          logoFile: file,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleOpenModal = (internship = null) => {
    if (internship) {
      setEditingInternship(internship);
      setFormData({
        title: internship.title || "",
        companyName: internship.companyName || "",
        location: internship.location || "",
        type: internship.type || "Internship",
        category: internship.category || "",
        description: internship.description || "",
        requirements: internship.requirements || [],
        responsibilities: internship.responsibilities || [],
        salaryRange: internship.salaryRange || "",
        applicationDeadline: internship.applicationDeadline
          ? new Date(internship.applicationDeadline).toISOString().split("T")[0]
          : "",
        applyLink: internship.applyLink || "",
        status: internship.status || "Draft",
        postedBy: internship.postedBy || "Code for Change",
        province: internship.province || "",
        logoFile: null,
        logoPreview: internship.companyLogo || "",
      });
    } else {
      setEditingInternship(null);
      setFormData({
        title: "",
        companyName: "",
        location: "",
        type: "Internship",
        category: "",
        description: "",
        requirements: [],
        responsibilities: [],
        salaryRange: "",
        applicationDeadline: "",
        applyLink: "",
        status: "Draft",
        postedBy: "Code for Change",
        province: "",
        logoFile: null,
        logoPreview: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDetail = (internship) => {
    setSelectedInternship(internship);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async () => {
    if (!internshipToDelete) return;
    try {
      await API.delete(
        `/internships/${internshipToDelete._id || internshipToDelete.id}`,
      );
      setInternships(
        internships.filter(
          (i) =>
            (i._id || i.id) !==
            (internshipToDelete._id || internshipToDelete.id),
        ),
      );
      setDeleteModalOpen(false);
      setInternshipToDelete(null);
      toast.success("Vacancy deleted successfully");
    } catch (error) {
      console.error("Failed to delete vacancy", error);
      toast.error("Failed to delete vacancy");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "logoFile" && formData[key]) {
        data.append("companyLogo", formData[key]);
      } else if (["requirements", "responsibilities"].includes(key)) {
        data.append(key, JSON.stringify(formData[key]));
      } else if (
        formData[key] !== null &&
        key !== "logoPreview" &&
        key !== "logoFile"
      ) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editingInternship) {
        await API.put(
          `/internships/${editingInternship._id || editingInternship.id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Vacancy updated successfully");
      } else {
        await API.post("/internships", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Vacancy created successfully");
      }
      setIsModalOpen(false);
      fetchInternships();
    } catch (error) {
      console.error("Failed to save vacancy", error);
      toast.error(error.response?.data?.message || "Failed to save vacancy");
    } finally {
      setSubmitting(false);
    }
  };

  const addToList = (field, value) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeFromList = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(
      internships.map((i) => ({
        Title: i.title,
        Company: i.companyName,
        Location: i.location,
        Type: i.type,
        Category: i.category,
        Region: i.province || "N/A",
        Status: i.status,
        Deadline: i.applicationDeadline
          ? new Date(i.applicationDeadline).toLocaleDateString()
          : "N/A",
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CFC_Internships_${Date.now()}.csv`);
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
    doc.text("Vacancy Management Ledger", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    const tableColumn = [
      "Company",
      "Position",
      "Region",
      "Type",
      "Status",
      "Deadline",
    ];
    const tableRows = internships.map((i) => [
      i.companyName,
      i.title,
      i.province || "N/A",
      i.type,
      i.status,
      i.applicationDeadline
        ? new Date(i.applicationDeadline).toLocaleDateString()
        : "N/A",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], fontWeight: "bold" },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`CFC_Vacancies_Report_${Date.now()}.pdf`);
    toast.success("PDF Exported successfully");
  };

  const exportToWord = () => {
    let content = "CODE FOR CHANGE\nVACANCY MANAGEMENT REPORT\n\n";
    content += `Report Date: ${new Date().toLocaleString()}\n`;
    content += "==========================================\n\n";

    internships.forEach((i, index) => {
      content += `${index + 1}. VACANCY PROFILE\n`;
      content += `   Title: ${i.title}\n`;
      content += `   Company: ${i.companyName}\n`;
      content += `   Location: ${i.location}\n`;
      content += `   Type: ${i.type}\n`;
      content += `   Region: ${i.province || "N/A"}\n`;
      content += `   Category: ${i.category}\n`;
      content += `   Status: ${i.status}\n`;
      content += "------------------------------------------\n";
    });

    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CFC_Vacancies_Report_${Date.now()}.doc`;
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
              companyName: row.Company || row.companyName || row.company,
              location: row.Location || row.location,
              type: row.Type || row.type || "Internship",
              category: row.Category || row.category,
              description:
                row.Description || row.description || "Bulk imported vacancy",
              applyLink:
                row.ApplyLink ||
                row.applyLink ||
                "https://codeforchange.org.np",
              status: row.Status || row.status || "Draft",
              province: row.Region || row.province || "",
              postedBy: "Bulk Import",
            };
            if (payload.title && payload.companyName) {
              await API.post("/internships", payload);
              count++;
            }
          }
          toast.success(`Successfully imported ${count} vacancies`);
          fetchInternships();
        } catch (error) {
          toast.error("Import failed: Check CSV format");
        }
      },
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterStatus("");
    setFilterDeadlineStart("");
    setFilterDeadlineEnd("");
    setFilterProvince("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Vacancy Management
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Jobs & Internships Registry
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasPermission("internship_create") && (
            <label className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest cursor-pointer group">
              <FaDownload className="text-emerald-500 group-hover:bounce" />{" "}
              Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          )}

          <div className="relative group/export">
            <button className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest">
              <FaFileCsv className="text-lg text-emerald-500" /> Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-3 overflow-hidden">
              {hasPermission("internship_export_csv") && (
                <button
                  onClick={exportToCSV}
                  className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50"
                >
                  <FaFileCsv className="text-emerald-500" /> CSV Schema
                </button>
              )}
              {hasPermission("internship_export_pdf") && (
                <button
                  onClick={exportToPDF}
                  className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50"
                >
                  <FaFilePdf className="text-rose-500" /> PDF Document
                </button>
              )}
              {hasPermission("internship_export_word") && (
                <button
                  onClick={exportToWord}
                  className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                >
                  <FaFileWord className="text-blue-500" /> MS Word Doc
                </button>
              )}
            </div>
          </div>

          {hasPermission("internship_create") && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest"
            >
              <FaPlus className="text-lg" /> Add Vacancy
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search by title or company..."
              className="w-full pl-16 pr-8 py-4 bg-slate-50 rounded-xl outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 w-full md:w-auto">
            <select
              className="w-full px-4 md:px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {[
                "Full-time",
                "Internship",
                "Contract",
                "Part-time",
                "Remote",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="w-full px-4 md:px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              {["Open", "Closed", "Draft"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="w-full px-4 md:px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
            >
              <option value="">All Regions</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[80px]">
              Deadline From:
            </label>
            <input
              type="date"
              className="flex-1 px-4 py-3 md:py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all"
              value={filterDeadlineStart}
              onChange={(e) => setFilterDeadlineStart(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[40px]">
              To:
            </label>
            <input
              type="date"
              className="flex-1 px-4 py-3 md:py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all"
              value={filterDeadlineEnd}
              onChange={(e) => setFilterDeadlineEnd(e.target.value)}
            />
          </div>
          <div className="flex-1 text-right w-full md:w-auto">
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center gap-2 ml-auto"
            >
              <FaTimes /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Company & Position</th>
                <th className="px-8 py-5">Location & Meta</th>
                <th className="px-8 py-5">Deadline</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    Loading vacancies...
                  </td>
                </tr>
              ) : internships.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    No vacancies found.
                  </td>
                </tr>
              ) : (
                internships.map((item, index) => (
                  <tr
                    key={item._id || item.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100/50 transition-all`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100 italic font-black text-slate-400 text-xl shadow-sm">
                          {item.companyLogo ? (
                            <img
                              src={item.companyLogo}
                              alt={item.companyName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            item.companyName[0]
                          )}
                        </div>
                        <div>
                          <div
                            className="font-black text-slate-900 leading-tight text-base mb-1 hover:text-emerald-600 transition-colors cursor-pointer"
                            onClick={() => handleOpenDetail(item)}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                            <FaBuilding size={10} /> {item.companyName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <FaMapMarkerAlt className="text-rose-400" size={12} />{" "}
                          {item.province || "National"} • {item.location}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                          <FaClock className="text-slate-300" /> {item.type} •{" "}
                          {item.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <FaRegCalendarAlt
                          className="text-emerald-500"
                          size={12}
                        />
                        {item.applicationDeadline
                          ? new Date(
                              item.applicationDeadline,
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.status === "Open"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === item._id ? null : item._id,
                          )
                        }
                        className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all underline-none outline-none shadow-sm"
                      >
                        <BsThreeDotsVertical />
                      </button>
                      {openMenuId === item._id && (
                        <div className="absolute right-20 top-6 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in slide-in-from-right-5 duration-200">
                          <button
                            onClick={() => {
                              handleOpenDetail(item);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                          >
                            <BsEye className="text-emerald-500" /> View Detail
                          </button>
                          {hasPermission("internship_update") && (
                            <>
                              <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                              <button
                                onClick={() => {
                                  handleOpenModal(item);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                              >
                                <BsPencil className="text-amber-500" /> Edit
                                Vacancy
                              </button>
                            </>
                          )}
                          {hasPermission("internship_delete") && (
                            <>
                              <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                              <button
                                onClick={() => {
                                  setInternshipToDelete(item);
                                  setDeleteModalOpen(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                              >
                                <BsTrash /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading vacancies...
            </div>
          ) : internships.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No vacancies found.
            </div>
          ) : (
            internships.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 shadow-sm relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100 italic font-black text-slate-400 text-sm shadow-sm">
                      {item.companyLogo ? (
                        <img
                          src={item.companyLogo}
                          alt={item.companyName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.companyName[0]
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <FaBuilding size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {item.companyName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === item._id ? null : item._id);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shadow-sm"
                  >
                    <BsThreeDotsVertical />
                  </button>
                </div>

                {/* Mobile Dropdown */}
                {openMenuId === item._id && (
                  <div className="absolute top-14 right-4 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in">
                    <button
                      onClick={() => {
                        handleOpenDetail(item);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      View Detail
                    </button>
                    {hasPermission("internship_update") && (
                      <button
                        onClick={() => {
                          handleOpenModal(item);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-amber-600 hover:bg-amber-50"
                      >
                        Edit Vacancy
                      </button>
                    )}
                    <div className="h-[1px] bg-slate-50 my-1"></div>
                    {hasPermission("internship_delete") && (
                      <button
                        onClick={() => {
                          setInternshipToDelete(item);
                          setDeleteModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Type
                    </p>
                    <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">
                      {item.type}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Deadline
                    </p>
                    <p className="text-xs font-bold text-slate-700 uppercase mt-0.5 truncate">
                      {item.applicationDeadline
                        ? new Date(
                            item.applicationDeadline,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      item.status === "Open"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${item.status === "Open" ? "bg-emerald-500" : "bg-amber-500"}`}
                    ></span>{" "}
                    {item.status}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <FaMapMarkerAlt size={10} /> {item.province || "N/A"} •{" "}
                    {item.location}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedInternship && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 lg:p-12 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2 border border-slate-100 overflow-hidden">
                  {selectedInternship.companyLogo ? (
                    <img
                      src={selectedInternship.companyLogo}
                      className="w-full h-full object-contain"
                      alt="Logo"
                    />
                  ) : (
                    <FaBuilding className="text-slate-200" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedInternship.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                      {selectedInternship.companyName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] border-l pl-3">
                      {selectedInternship.type}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all border border-slate-100 group"
              >
                <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-5 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Location
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedInternship.province || "N/A"} •{" "}
                      {selectedInternship.location}
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-5 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-slate-100">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Salary range
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedInternship.salaryRange || "Not Specified"}
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-5 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-slate-100">
                    <FaRegCalendarAlt />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Deadline
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedInternship.applicationDeadline
                        ? new Date(
                            selectedInternship.applicationDeadline,
                          ).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No Deadline Set"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 bg-emerald-500 h-6 rounded-full"></div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Role Description
                  </h4>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedInternship.description}
                  </p>
                </div>
              </section>

              {/* Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 bg-blue-500 h-6 rounded-full"></div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Key Requirements
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {selectedInternship.requirements?.length > 0 ? (
                      selectedInternship.requirements.map((req, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-100/30"
                        >
                          <FaChevronRight
                            className="mt-1 text-blue-400 flex-shrink-0"
                            size={10}
                          />
                          <span className="text-sm text-slate-700 font-medium">
                            {req}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-sm">
                        No specific requirements listed.
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 bg-purple-500 h-6 rounded-full"></div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Core Responsibilities
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {selectedInternship.responsibilities?.length > 0 ? (
                      selectedInternship.responsibilities.map((res, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 bg-purple-50/30 rounded-2xl border border-purple-100/30"
                        >
                          <FaChevronRight
                            className="mt-1 text-purple-400 flex-shrink-0"
                            size={10}
                          />
                          <span className="text-sm text-slate-700 font-medium">
                            {res}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-sm">
                        No specific responsibilities listed.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-8">
                <a
                  href={selectedInternship.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-5 bg-slate-900 text-white rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all border border-transparent"
                >
                  <FaExternalLinkAlt /> Digital Application Portal
                </a>
                <button
                  onClick={clearFilters}
                  className="flex-1 py-5 bg-white text-slate-400 border border-slate-100 rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                >
                  <FaUserTie /> Posted By:{" "}
                  {selectedInternship.postedBy || "CFC Admin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight">
                  {editingInternship ? "Update Vacancy" : "Post New Vacancy"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Registry Management
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-10 space-y-8 overflow-y-auto scrollbar-hide"
            >
              <div className="space-y-6">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                  Base Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Position Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Full Stack Developer"
                  />
                  <InputField
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    required
                    placeholder="e.g., Tesla"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <InputField
                    label="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    placeholder="e.g., Kathmandu / Remote"
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                      Region
                    </label>
                    <select
                      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium hover:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                    >
                      <option value="">Select Region</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField
                    label="Category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    placeholder="e.g., Tech / Design"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Salary Range"
                    value={formData.salaryRange}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryRange: e.target.value })
                    }
                    placeholder="e.g., Negotiable / 20k - 30k"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                  Job Specifications
                </h4>
                <TextAreaField
                  label="Role Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Detailed overview of the role..."
                />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                      Requirements
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="req-input"
                        placeholder="Add requirement..."
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white transition-all"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addToList("requirements", e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("req-input");
                          addToList("requirements", input.value);
                          input.value = "";
                        }}
                        className="bg-emerald-500 text-white px-6 rounded-2xl font-black text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {formData.requirements.map((r, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-slate-50 p-3 px-4 rounded-xl text-xs font-bold text-slate-600 border border-slate-100"
                        >
                          <span>{r}</span>
                          <button
                            type="button"
                            onClick={() => removeFromList("requirements", i)}
                            className="text-rose-400 hover:text-rose-600 transition-colors"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                      Responsibilities
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="res-input"
                        placeholder="Add responsibility..."
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white transition-all"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addToList("responsibilities", e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("res-input");
                          addToList("responsibilities", input.value);
                          input.value = "";
                        }}
                        className="bg-emerald-500 text-white px-6 rounded-2xl font-black text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {formData.responsibilities.map((r, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-slate-50 p-3 px-4 rounded-xl text-xs font-bold text-slate-600 border border-slate-100"
                        >
                          <span>{r}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeFromList("responsibilities", i)
                            }
                            className="text-rose-400 hover:text-rose-600 transition-colors"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                    Type
                  </label>
                  <select
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium hover:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    {[
                      "Internship",
                      "Full-time",
                      "Part-time",
                      "Contract",
                      "Remote",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                    Status
                  </label>
                  <select
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium hover:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <InputField
                    label="Application Deadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicationDeadline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <InputField
                label="Apply Link"
                value={formData.applyLink}
                onChange={(e) =>
                  setFormData({ ...formData, applyLink: e.target.value })
                }
                required
                placeholder="https://external-job-portal.com"
              />

              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                  Company Logo
                </h4>
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={`relative border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden min-h-[200px] ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-500"}`}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {formData.logoPreview ? (
                    <>
                      <img
                        src={formData.logoPreview}
                        className="max-h-full max-w-full object-contain p-4"
                        alt="Preview"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-bold gap-2">
                        <FaCloudUploadAlt /> Replace Logo
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <FaCloudUploadAlt className="text-4xl mx-auto mb-2 text-slate-200" />
                      <p className="text-sm font-bold text-slate-600">
                        Click or Drag Company Logo
                      </p>
                      <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-50">
                        PNG, JPG, SVG are supported
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-70 transition-all active:scale-[0.98]"
                >
                  {submitting
                    ? "Processing..."
                    : editingInternship
                      ? "Save Changes"
                      : "Post Vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Vacancy"
        itemName="vacancy"
        message={`Are you sure you want to delete "${internshipToDelete?.title}" at "${internshipToDelete?.companyName}"?`}
      />
    </div>
  );
}

export default AdminInternships;
