import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
  FaCloudUploadAlt,
  FaExternalLinkAlt,
  FaUserTie,
  FaLightbulb,
  FaGift,
  FaClock,
  FaMapPin,
  FaLink,
  FaFileCsv,
  FaFilePdf,
  FaFileWord,
  FaDownload,
  FaDownload as FaImport,
} from "react-icons/fa";
import {
  BsThreeDotsVertical,
  BsPencil,
  BsTrash,
  BsEye,
  BsArrowRepeat,
} from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import DebouncedSearchInput from "../../Components/UI/DebouncedSearchInput";
import { compressImage } from "../../utils/imageCompressor";
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
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all shadow-sm"
        value={value}
        onChange={onChange}
      />
    </div>
  ),
);

const TextAreaField = React.memo(
  ({ label, value, onChange, rows = 3, required = false, placeholder }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <textarea
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all resize-none shadow-sm"
        value={value}
        onChange={onChange}
      />
    </div>
  ),
);

function AdminEvents() {
  const { hasPermission } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any dropdown menu or trigger button
      if (
        event.target.closest("[data-menu-dropdown]") ||
        event.target.closest("[data-menu-trigger]")
      ) {
        return;
      }
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const REGIONS = [
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
    date: "",
    startDate: "",
    endDate: "",
    location: "",
    venue: "",
    status: "Draft",
    description: "",
    fullDescription: "",
    organizer: "Code for Change",
    type: "workshop",
    region: "",
    registrationLink: "",
    registrationDeadline: "",
    speakers: [],
    highlights: [],
    benefits: [],
    contactInfo: [],
    isNational: false,
    imageFile: null,
    imagePreview: "",
  });

  const [currentSpeaker, setCurrentSpeaker] = useState({
    name: "",
    role: "",
    organization: "",
    linkedin: "",
  });

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setPage(1);
      fetchEvents(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    filterType,
    filterStatus,
    filterProvince,
    filterStartDate,
    filterEndDate,
  ]);

  const fetchEvents = async (currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType) params.append("type", filterType);
      if (filterStatus) params.append("status", filterStatus);
      if (filterProvince) params.append("province", filterProvince);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);
      params.append("limit", "10");
      params.append("page", String(currentPage));

      const { data } = await API.get(`/events?${params.toString()}`);
      const newEvents = data.data?.events || [];
      const pagination = data.pagination || data.data?.pagination || null;

      if (currentPage === 1) {
        setEvents(newEvents);
      } else {
        setEvents((prev) => [...prev, ...newEvents]);
      }

      if (pagination && pagination.page < pagination.totalPages) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage);
  };

  const handleFile = async (file) => {
    if (file && file.type.startsWith("image/")) {
      const { file: compressedFile } = await compressImage(file);
      const fileToUse = compressedFile || file;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: fileToUse,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(fileToUse);
    } else {
      alert("Please upload a valid image file.");
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

  const safeParseArr = (arr) => {
    if (!arr) return [];
    if (typeof arr === "string") {
      try {
        const parsed = JSON.parse(arr);
        return Array.isArray(parsed) ? parsed : [arr];
      } catch (e) {
        return arr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
          
      }
    }
    if (Array.isArray(arr)) {
      if (
        arr.length === 1 &&
        typeof arr[0] === "string" &&
        arr[0].startsWith("[")
      ) {
        try {
          const parsed = JSON.parse(arr[0]);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return arr;
    }
    return [];
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || "",
        date: event.date
          ? new Date(event.date).toISOString().split("T")[0]
          : "",
        startDate: event.startDate
          ? new Date(event.startDate).toISOString().split("T")[0]
          : "",
        endDate: event.endDate
          ? new Date(event.endDate).toISOString().split("T")[0]
          : "",
        location: event.location || "",
        venue: event.venue || "",
        status: event.status || "Draft",
        description: event.description || "",
        fullDescription: event.fullDescription || "",
        organizer: event.organizer || "Code for Change",
        type: event.type || "workshop",
        region: event.region || "",
        registrationLink: event.registrationLink || "",
        registrationDeadline: event.registrationDeadline
          ? new Date(event.registrationDeadline).toISOString().split("T")[0]
          : "",
        speakers: event.speakers || [],
        highlights: safeParseArr(event.highlights),
        benefits: safeParseArr(event.benefits),
        contactInfo: event.contactInfo || [],
        isNational: event.isNational || false,
        imageFile: null,
        imagePreview: event.image || "",
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        date: "",
        startDate: "",
        endDate: "",
        location: "",
        venue: "",
        status: "Draft",
        description: "",
        fullDescription: "",
        organizer: "Code for Change",
        type: "workshop",
        registrationLink: "",
        registrationDeadline: "",
        speakers: [],
        highlights: [],
        benefits: [],
        contactInfo: [],
        isNational: false,
        region: "",
        imageFile: null,
        imagePreview: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await API.delete(`/events/${eventToDelete._id || eventToDelete.id}`);
      setEvents(
        events.filter(
          (e) => (e._id || e.id) !== (eventToDelete._id || eventToDelete.id),
        ),
      );
      setEventToDelete(null);
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("date", formData.date);
    if (formData.startDate) data.append("startDate", formData.startDate);
    if (formData.endDate) data.append("endDate", formData.endDate);
    data.append("location", formData.location);
    if (formData.venue) data.append("venue", formData.venue);
    data.append("status", formData.status);
    data.append("description", formData.description);
    if (formData.fullDescription)
      data.append("fullDescription", formData.fullDescription);
    data.append("organizer", formData.organizer);
    data.append("type", formData.type);
    if (formData.region) data.append("region", formData.region);
    if (formData.registrationLink)
      data.append("registrationLink", formData.registrationLink);
    if (formData.registrationDeadline)
      data.append("registrationDeadline", formData.registrationDeadline);
    if (formData.speakers.length)
      data.append("speakers", JSON.stringify(formData.speakers));
    if (formData.highlights.length)
      data.append("highlights", JSON.stringify(formData.highlights));
    if (formData.benefits.length)
      data.append("benefits", JSON.stringify(formData.benefits));
    if (formData.contactInfo.length)
      data.append("contactInfo", JSON.stringify(formData.contactInfo));
    data.append("isNational", String(formData.isNational));
    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    try {
      if (editingEvent) {
        const { data: response } = await API.put(
          `/events/${editingEvent._id || editingEvent.id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        // Admin update might just return the single updated event under data.data
        // We handle that differently from a list
        setEvents(
          events.map((e) =>
            (e._id || e.id) === (editingEvent._id || editingEvent.id)
              ? response.data
              : e,
          ),
        );
      } else {
        const { data: response } = await API.post("/events", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Create endpoint also returns single event in data.data
        setEvents([response.data, ...events]);
      }
      setIsModalOpen(false);
      setPage(1);
      fetchEvents(1);
    } catch (error) {
      console.error("Failed to save event", error);
      alert(error.response?.data?.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  const addSpeaker = () => {
    if (currentSpeaker.name && currentSpeaker.role) {
      setFormData((prev) => ({
        ...prev,
        speakers: [...prev.speakers, currentSpeaker],
      }));
      setCurrentSpeaker({ name: "", role: "", organization: "", linkedin: "" });
    }
  };

  const removeSpeaker = (index) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index),
    }));
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

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const exportToCSV = () => {
    const csv = Papa.unparse(
      filteredEvents.map((e) => ({
        Title: e.title,
        Date: new Date(e.date).toLocaleDateString(),
        Province: e.province || "N/A",
        Location: e.location,
        Venue: e.venue || "N/A",
        Status: e.status,
        Type: e.type,
        Organizer: e.organizer,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CFC_Events_${Date.now()}.csv`);
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
    doc.text("Event Management Ledger", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    const tableColumn = [
      "Date",
      "Event Title",
      "Province",
      "Location",
      "Status",
      "Type",
    ];
    const tableRows = filteredEvents.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.title,
      e.province || "N/A",
      e.location,
      e.status,
      e.type,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], fontWeight: "bold" },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`CFC_Events_Report_${Date.now()}.pdf`);
    toast.success("PDF Exported successfully");
  };

  const exportToWord = () => {
    let content = "CODE FOR CHANGE\nEVENT MANAGEMENT REPORT\n\n";
    content += `Report Date: ${new Date().toLocaleString()}\n`;
    content += "==========================================\n\n";

    filteredEvents.forEach((e, index) => {
      content += `${index + 1}. EVENT PROFILE\n`;
      content += `   Title: ${e.title}\n`;
      content += `   Date: ${new Date(e.date).toLocaleDateString()}\n`;
      content += `   Province: ${e.province || "N/A"}\n`;
      content += `   Location: ${e.location}\n`;
      content += `   Status: ${e.status}\n`;
      content += `   Type: ${e.type}\n`;
      content += "------------------------------------------\n";
    });

    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CFC_Events_Report_${Date.now()}.doc`;
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
              date: row.Date || row.date,
              province: row.Province || row.province,
              location: row.Location || row.location,
              status: row.Status || row.status || "Draft",
              type: row.Type || row.type || "workshop",
              organizer: row.Organizer || row.organizer || "Code for Change",
              description:
                row.Description || row.description || "Imported event",
            };
            if (payload.title && payload.date) {
              await API.post("/events", payload);
              count++;
            }
          }
          toast.success(`Successfully imported ${count} events`);
          setPage(1);
          fetchEvents(1);
        } catch (error) {
          toast.error("Import failed: One or more records are invalid",error);
        }
      },
    });
  };

  if (loading && events.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Event Management
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            Organize Community Events
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-bold text-xs cursor-pointer group flex-1 md:flex-none">
            <FaImport className="text-emerald-600" />{" "}
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
          </label>

          <div className="relative group/export flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-bold text-xs">
              <FaDownload className="text-emerald-600" />{" "}
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-2 overflow-hidden">
              <button
                onClick={exportToCSV}
                className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <FaFileCsv className="text-emerald-600" /> CSV Schema
              </button>
              <button
                onClick={exportToPDF}
                className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <FaFilePdf className="text-rose-600" /> PDF Document
              </button>
              <button
                onClick={exportToWord}
                className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <FaFileWord className="text-blue-600" /> MS Word Doc
              </button>
            </div>
          </div>

          {hasPermission("event_create") && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 font-bold text-xs flex-1 md:flex-none whitespace-nowrap"
            >
              <FaPlus /> <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4" role="search" aria-label="Filter events">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <label htmlFor="event-search" className="sr-only">Search events</label>
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="event-search"
              type="search"
              aria-label="Search events by title"
              placeholder="Search events by title..."
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-700 font-medium text-sm focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>

          {/* Type / Status / Region selects */}
          <fieldset className="grid grid-cols-2 md:flex gap-3 md:gap-4 w-full md:w-auto border-0 p-0 m-0">
            <legend className="sr-only">Filter by type, status, and region</legend>

            <div className="space-y-1">
              <label htmlFor="event-filter-type" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type</label>
              <select
                id="event-filter-type"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {["workshop", "hackathon", "webinar", "conference", "social_impact"].map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="event-filter-status" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select
                id="event-filter-status"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {["Draft", "Published", "Upcoming", "Live", "Completed"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="event-filter-region" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Region</label>
              <select
                id="event-filter-region"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
              >
                <option value="">All Regions</option>
                {REGIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </fieldset>
        </div>

        {/* Date range row */}
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between border-t border-gray-100 pt-4">
          <fieldset className="flex items-center gap-4 w-full md:w-auto border-0 p-0 m-0">
            <legend className="sr-only">Filter by date range</legend>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label htmlFor="event-date-from" className="text-xs font-bold text-gray-500 whitespace-nowrap">From:</label>
              <input
                id="event-date-from"
                type="date"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-300 rounded-lg text-xs font-semibold text-gray-700 outline-none transition-all"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label htmlFor="event-date-to" className="text-xs font-bold text-gray-500 whitespace-nowrap">To:</label>
              <input
                id="event-date-to"
                type="date"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-300 rounded-lg text-xs font-semibold text-gray-700 outline-none transition-all"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </fieldset>

          {/* Result count + clear */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end" aria-live="polite">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{filteredEvents.length}</span> events
            </p>
            {(searchTerm || filterType || filterStatus || filterProvince || filterStartDate || filterEndDate) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("");
                  setFilterStatus("");
                  setFilterProvince("");
                  setFilterStartDate("");
                  setFilterEndDate("");
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                title="Reset all filters to default"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events Content - Responsive Table/Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">Date & Location</th>
                <th className="px-8 py-5">Status & Type</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">
                    No events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, index) => (
                  <tr
                    key={event._id || event.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-gray-50 transition-all`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {event.image && (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                          />
                        )}
                        <div>
                          <div className="font-extrabold text-gray-900 leading-tight text-base mb-1">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-500 font-medium line-clamp-1">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <FaCalendarAlt className="text-emerald-500" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <FaMapPin className="text-amber-500" />
                          {event.province || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <FaMapMarkerAlt className="text-blue-500" />
                          {event.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            event.status === "Published" ||
                            event.status === "Live"
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200/50"
                              : event.status === "Completed"
                                ? "bg-gray-100 text-gray-600 ring-1 ring-gray-200/50"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"
                          }`}
                        >
                          {event.status || "Draft"}
                        </span>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {event.type}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button
                        data-menu-trigger
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === event._id ? null : event._id,
                          );
                        }}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm"
                      >
                        <BsThreeDotsVertical size={14} />
                      </button>
                      {openMenuId === event._id && (
                        <div
                          data-menu-dropdown
                          className="absolute right-20 top-6 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in duration-200"
                        >
                          <Link
                            to={`/events/${event.slug || event._id || event.id}`}
                            target="_blank"
                            className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            <BsEye className="text-blue-500" /> View
                          </Link>
                          {hasPermission("event_update") && (
                            <button
                              onClick={() => {
                                handleOpenModal(event);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                              <BsPencil className="text-amber-500" /> Edit
                            </button>
                          )}
                          {hasPermission("event_delete") && (
                            <button
                              onClick={() => {
                                setEventToDelete(event);
                                setDeleteModalOpen(true);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                            >
                              <BsTrash /> Delete
                            </button>
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
          {loading && events.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-medium">
              Loading events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-medium">
              No events found.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event._id || event.id}
                className="bg-white rounded-2xl p-5 space-y-4 border border-gray-100 shadow-sm relative overflow-hidden group"
              >
                {/* Header with Menu */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 rounded-xl object-cover shadow-sm"
                      />
                    )}
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm leading-tight">
                        {event.title}
                      </h3>
                      <span
                        className={`inline-flex mt-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          event.status === "Published" ||
                          event.status === "Live"
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200/50"
                            : event.status === "Completed"
                              ? "bg-gray-100 text-gray-600 ring-1 ring-gray-200/50"
                              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"
                        }`}
                      >
                        {event.status || "Draft"}
                      </span>
                    </div>
                  </div>
                  <button
                    data-menu-trigger
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === event._id ? null : event._id,
                      );
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <BsThreeDotsVertical size={14} />
                  </button>
                </div>

                {/* Mobile Dropdown */}
                {openMenuId === event._id && (
                  <div
                    data-menu-dropdown
                    className="absolute top-14 right-4 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in duration-200"
                  >
                    <Link
                      to={`/events/${event.slug || event._id}`}
                      className="w-full px-5 py-2.5 text-left block text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <BsEye className="text-blue-500" /> View
                    </Link>
                    {hasPermission("event_update") && (
                      <button
                        onClick={() => handleOpenModal(event)}
                        className="w-full px-5 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <BsPencil className="text-amber-500" /> Edit
                      </button>
                    )}
                    {hasPermission("event_delete") && (
                      <button
                        onClick={() => {
                          setEventToDelete(event);
                          setDeleteModalOpen(true);
                        }}
                        className="w-full px-5 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                      >
                        <BsTrash className="text-rose-500" /> Delete
                      </button>
                    )}
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-gray-600 font-semibold">
                    <FaCalendarAlt className="text-emerald-500 shrink-0" />{" "}
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-gray-600 font-semibold truncate">
                    <FaMapMarkerAlt className="text-blue-500 shrink-0" />{" "}
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center p-6 border-t border-gray-100 mt-auto">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 hover:bg-gray-100 transition-all shadow-sm flex items-center gap-2"
            >
              {loading ? "Loading..." : "Load More Events"}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[95vh] flex flex-col border border-gray-100">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 flex-shrink-0 bg-white">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingEvent ? "Update Event" : "Create New Event"}
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Event Details Configuration
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all border border-transparent"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto custom-scrollbar flex flex-col"
            >
              <div className="p-8 space-y-12 flex-1">
                {/* Basic Info */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest shrink-0">
                      Basic Information
                    </h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <InputField
                    label="Event Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Tech Innovation Summit 2026"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <TextAreaField
                      label="Short Description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                      placeholder="Brief overview for listings"
                    />
                    <TextAreaField
                      label="Full Description"
                      value={formData.fullDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullDescription: e.target.value,
                        })
                      }
                      placeholder="Detailed event information"
                    />
                  </div>
                </div>

                {/* Date & Location */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-75">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest shrink-0">
                      Date & Location
                    </h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <InputField
                      label="Main Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                    <InputField
                      label="Start Date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                    <InputField
                      label="End Date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Location (City)"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      required
                      placeholder="e.g., Kathmandu, Nepal"
                    />
                    <InputField
                      label="Venue Name"
                      value={formData.venue}
                      onChange={(e) =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                      placeholder="e.g., Hotel Yak & Yeti"
                    />
                  </div>
                </div>

                {/* Event Details */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-150">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest shrink-0">
                      Event Configuration
                    </h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">
                        Type
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all appearance-none cursor-pointer shadow-sm"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                      >
                        <option value="workshop">Workshop</option>
                        <option value="hackathon">Hackathon</option>
                        <option value="webinar">Webinar</option>
                        <option value="conference">Conference</option>
                        <option value="social_impact">Social Impact</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all appearance-none cursor-pointer shadow-sm"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Live">Live</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <InputField
                      label="Organizer"
                      value={formData.organizer}
                      onChange={(e) =>
                        setFormData({ ...formData, organizer: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InputField
                      label="Registration Link"
                      type="url"
                      value={formData.registrationLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationLink: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">
                        Region
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all appearance-none cursor-pointer shadow-sm"
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                      >
                        <option value="">Select Region</option>
                        {REGIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* isNational Toggle */}
                  <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">National Event</p>
                      <p className="text-xs text-gray-400 mt-0.5">Enable if this event is held at a national level across CFC regions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isNational: !formData.isNational })}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${formData.isNational ? 'bg-amber-500' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${formData.isNational ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1">
                    <InputField
                      label="Registration Deadline"
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationDeadline: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Speakers */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 shrink-0">
                      <FaUserTie className="text-emerald-500" /> Speakers &
                      Facilitators
                    </h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all shadow-sm"
                      value={currentSpeaker.name}
                      onChange={(e) =>
                        setCurrentSpeaker({
                          ...currentSpeaker,
                          name: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all shadow-sm"
                      value={currentSpeaker.role}
                      onChange={(e) =>
                        setCurrentSpeaker({
                          ...currentSpeaker,
                          role: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Organization"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all shadow-sm"
                      value={currentSpeaker.organization}
                      onChange={(e) =>
                        setCurrentSpeaker({
                          ...currentSpeaker,
                          organization: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={addSpeaker}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all focus:ring-4 focus:ring-emerald-500/20"
                    >
                      Add Speaker
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.speakers.map((speaker, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-medium flex items-center gap-2 text-emerald-800 shadow-sm"
                      >
                        <span>
                          <span className="font-bold">{speaker.name}</span> -{" "}
                          {speaker.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSpeaker(i)}
                          className="text-emerald-500 hover:text-rose-600 transition-colors ml-1"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-250">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 shrink-0">
                      <FaLink className="text-emerald-500" /> Contact Information
                    </h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="space-y-3">
                    {formData.contactInfo.map((contact, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <select
                          className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs font-bold text-gray-600 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all appearance-none shadow-sm"
                          value={contact.type}
                          onChange={(e) => {
                            const updated = [...formData.contactInfo];
                            updated[i] = { ...updated[i], type: e.target.value };
                            setFormData({ ...formData, contactInfo: updated });
                          }}
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="text"
                          placeholder={contact.type === 'email' ? 'email@cfc.org' : contact.type === 'phone' ? '+977-...' : 'Contact value'}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all shadow-sm"
                          value={contact.value}
                          onChange={(e) => {
                            const updated = [...formData.contactInfo];
                            updated[i] = { ...updated[i], value: e.target.value };
                            setFormData({ ...formData, contactInfo: updated });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.contactInfo.filter((_, idx) => idx !== i);
                            setFormData({ ...formData, contactInfo: updated });
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, contactInfo: [...formData.contactInfo, { type: 'email', value: '' }] })}
                      className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors py-1"
                    >
                      <FaPlus size={10} /> Add Contact
                    </button>
                  </div>
                </div>

                {/* Highlights & Benefits */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 shrink-0">
                          <FaLightbulb className="text-emerald-500" />{" "}
                          Highlights
                        </h4>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="highlight-input"
                          placeholder="Add highlight..."
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all shadow-sm"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addToList("highlights", e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input =
                              document.getElementById("highlight-input");
                            addToList("highlights", input.value);
                            input.value = "";
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.highlights.map((h, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs flex justify-between items-center text-gray-700 shadow-sm"
                          >
                            <span>{h}</span>
                            <button
                              type="button"
                              onClick={() => removeFromList("highlights", i)}
                              className="text-gray-400 hover:text-rose-500 transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 shrink-0">
                          <FaGift className="text-emerald-500" /> Benefits
                        </h4>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="benefit-input"
                          placeholder="Add benefit..."
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-medium text-sm transition-all shadow-sm"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addToList("benefits", e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input =
                              document.getElementById("benefit-input");
                            addToList("benefits", input.value);
                            input.value = "";
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.benefits.map((b, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs flex justify-between items-center text-gray-700 shadow-sm"
                          >
                            <span>{b}</span>
                            <button
                              type="button"
                              onClick={() => removeFromList("benefits", i)}
                              className="text-gray-400 hover:text-rose-500 transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-500">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 shrink-0">
                      <FaImage className="text-emerald-500" /> Event Poster
                    </h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current.click()}
                    className={`relative border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden min-h-[250px] ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"}`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFile(e.target.files[0])}
                    />
                    {formData.imagePreview ? (
                      <>
                        <img
                          src={formData.imagePreview}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-bold gap-2">
                          <FaCloudUploadAlt className="text-2xl" /> Replace
                          Poster Image
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8 text-gray-400">
                        <FaCloudUploadAlt
                          className={`text-5xl mx-auto mb-4 ${isDragging ? "text-emerald-500 animate-bounce" : "text-gray-300"}`}
                        />
                        <p className="text-sm font-bold text-gray-600">
                          Drop your event poster image here
                        </p>
                        <p className="text-xs mt-1">
                          or click to browse from files
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100 flex gap-4 mt-auto bg-gray-50/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-white hover:text-gray-700 transition-all shadow-sm focus:ring-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed text-white shadow-none"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 focus:ring-4 focus:ring-emerald-500/20"
                  }`}
                >
                  {submitting && (
                    <BsArrowRepeat className="animate-spin text-lg" />
                  )}
                  {submitting
                    ? "Processing..."
                    : editingEvent
                      ? "Update Event"
                      : "Create Event"}
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
          setEventToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Event"
        itemName="event"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? This action will permanently remove the event from the database.`}
      />
    </div>
  );
}

export default AdminEvents;
