import React, { useState, useEffect, useMemo } from 'react';
import {
  FaUserTie, FaUserGraduate, FaUsers, FaSearch,
  FaCheckCircle, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaTimes,
  FaFileCsv, FaFilePdf, FaFileWord, FaDownload, FaPlus, FaCamera
} from 'react-icons/fa';
import { BsThreeDotsVertical, BsEye, BsTrash, BsPencilSquare } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";

import API from "../../Services/api";
import { useAuth } from "../../Context/AuthContext";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import DebouncedSearchInput from "../../Components/UI/DebouncedSearchInput";
import { compressImage } from "../../utils/imageCompressor";

const AVAILABLE_PERMISSIONS = {
  "Member Management": ["member:create", "member:update", "member:view", "member:delete", "member:verify"],
  "Event Management": ["event:create", "event:update", "event:view", "event:delete"],
  "Content Management": ["blog:create", "blog:update", "blog:view", "blog:delete", "impact:create", "impact:update", "impact:view", "impact:delete", "gallery:create", "gallery:update", "gallery:view", "gallery:delete"],
  "System Access": ["settings:manage", "log:view", "report:view", "certificate:issue", "internship:create"]
};

const ROLE_STYLE = {
  superadmin: "bg-purple-100 text-purple-600",
  admin: "bg-emerald-100 text-emerald-600",
  eb: "bg-blue-100 text-blue-600",
  cr: "bg-amber-100 text-amber-600",
  gm: "bg-slate-100 text-slate-600",
  guest: "bg-gray-100 text-gray-600"
};

const EB_POSITIONS = [
  { value: "tech-lead", label: "Tech Lead" },
  { value: "project-lead", label: "Project Lead" },
  { value: "vice-project-lead", label: "Vice Project Lead" },
  { value: "operation-lead", label: "Operation Lead" },
  { value: "admin-lead", label: "Admin Lead" },
  { value: "hr-lead", label: "HR Lead" },
  { value: "pr-lead", label: "PR Lead" },
  { value: "treasurer", label: "Treasurer" },
  { value: "vice-treasurer", label: "Vice Treasurer" },
  { value: "executive-member", label: "Executive Member" },
  { value: "secretary", label: "Secretary" },
  { value: "vice-secretary", label: "Vice Secretary" }
];

const PROVINCES = ['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali'];

function Member() {
  const { hasPermission } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProvince, setFilterProvince] = useState("All");
  const [filterTenure, setFilterTenure] = useState("All");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterStatus, setFilterStatus] = useState("Verified");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = React.useRef(null);

  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "gm",
    ebBody: "",
    tenure: "2025-2026",
    bio: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    province: "Kathmandu",
    socialLinks: {
      linkedin: "",
      github: "",
      website: "",
      twitter: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: ""
    }
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await API.get("/users/list-user");
      const mapped = (data.data || []).map(m => ({
        id: m?._id || m?.id,
        name: m?.name || "Unknown Member",
        role: m?.role || "gm",
        ebBody: m?.executiveDetails?.position || "",
        province: m?.province || "National",
        tenure: m?.tenure || "2025-2026",
        status: m?.isVerified ? "Verified" : "Pending",
        bio: m?.bio || "",
        email: m?.email || "",
        phone: m?.phone || "",
        gender: m?.gender || "",
        dateOfBirth: m?.dateOfBirth ? m.dateOfBirth.split('T')[0] : "",
        address: m?.address || "",
        socialLinks: {
          linkedin: m?.linkedin || "",
          github: m?.github || "",
          website: m?.website || "",
          twitter: m?.twitter || "",
          facebook: m?.facebook || "",
          instagram: m?.instagram || "",
          tiktok: m?.tiktok || "",
          youtube: m?.youtube || ""
        },
        image: m?.profileImage || m?.image,
        permissions: m?.permissions || [],
        createdAt: m?.createdAt || new Date()
      }));
      setMembers(mapped);
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setIsEditing(true);
      setCurrentMemberId(member.id);
      setFormData({
        name: member.name,
        role: member.role,
        ebBody: member.ebBody || "",
        tenure: member.tenure,
        bio: member.bio,
        email: member.email,
        phone: member.phone || "",
        gender: member.gender || "",
        dateOfBirth: member.dateOfBirth || "",
        address: member.address || "",
        province: member.province,
        socialLinks: {
          linkedin: member.socialLinks?.linkedin || "",
          github: member.socialLinks?.github || "",
          website: member.socialLinks?.website || "",
          twitter: member.socialLinks?.twitter || "",
          facebook: member.socialLinks?.facebook || "",
          instagram: member.socialLinks?.instagram || "",
          tiktok: member.socialLinks?.tiktok || "",
          youtube: member.socialLinks?.youtube || ""
        },
        permissions: member.permissions || []
      });
      setPreviewUrl(member.image);
    } else {
      setIsEditing(false);
      setCurrentMemberId(null);
      setFormData({
        name: "",
        role: "gm",
        ebBody: "",
        tenure: "2025-2026",
        bio: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        province: "Kathmandu",
        socialLinks: {
          linkedin: "",
          github: "",
          website: "",
          twitter: "",
          facebook: "",
          instagram: "",
          tiktok: "",
          youtube: ""
        }
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentMemberId(null);
  };

  const handlePermissionToggle = (perm) => {
    setFormData(prev => {
      const perms = prev.permissions || [];
      const newPerms = perms.includes(perm)
        ? perms.filter(p => p !== perm)
        : [...perms, perm];
      return { ...prev, permissions: newPerms };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file: compressedFile } = await compressImage(file);
      const fileToUse = compressedFile || file;
      setSelectedFile(fileToUse);
      setPreviewUrl(URL.createObjectURL(fileToUse));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const data = new FormData();
    const excludeFields = ['socialLinks', 'permissions'];

    // Append basic fields (skip empty optional ones)
    Object.entries(formData).forEach(([key, value]) => {
      if (excludeFields.includes(key)) return;
      if (typeof value === 'string' && value.trim() !== '') {
        data.append(key, value.trim());
      }
    });

    // Flatten social links to root level (backend stores them as root fields)
    Object.entries(formData.socialLinks || {}).forEach(([sKey, sVal]) => {
      if (sVal && sVal.trim() !== '') {
        data.append(sKey, sVal.trim());
      }
    });

    // Permissions array
    if (formData.permissions?.length) {
      formData.permissions.forEach(p => data.append('permissions[]', p));
    }

    // Profile image
    if (selectedFile) {
      data.append("profileImage", selectedFile);
    }

    try {
      if (isEditing) {
        await API.put(`/admin/users/update-user/${currentMemberId}`, data);
        toast.success("Member updated successfully");
      } else {
        await API.post("/admin/users/create-user", data);
        toast.success("Member added successfully");
      }
      fetchMembers();
      handleCloseModal();
    } catch (error) {
      console.error("Submission failed", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete member");
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredMembers.map(m => ({
      Name: m.name,
      Role: m.role,
      Region: m.province,
      Tenure: m.tenure,
      Status: m.status,
      Tier: m.tier
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CFC_Team_Verification_${Date.now()}.csv`);
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
    doc.text("All Members List", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    const tableColumn = ["Name", "Role", "Region", "Tenure", "Status"];
    const tableRows = filteredMembers.map(m => [
      m.name,
      m.role,
      m.province,
      m.tenure,
      m.status
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontWeight: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`CFC_Team_Verification_${Date.now()}.pdf`);
    toast.success("PDF Exported successfully");
  };

  const exportToWord = () => {
    let content = "CODE FOR CHANGE\nMEMBER VERIFICATION REPORT\n\n";
    content += `Report Date: ${new Date().toLocaleString()}\n`;
    content += "==========================================\n\n";

    filteredMembers.forEach((m, index) => {
      content += `${index + 1}. TEAM MEMBER PROFILE\n`;
      content += `   Name: ${m.name}\n`;
      content += `   Role: ${m.role}\n`;
      content += `   Region: ${m.province}\n`;
      content += `   Tenure: ${m.tenure}\n`;
      content += `   Status: ${m.status}\n`;
      content += `   Tier: ${m.tier}\n`;
      content += "------------------------------------------\n";
    });

    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CFC_Team_Report_${Date.now()}.doc`;
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
              name: row.Name || row.name,
              role: row.Role || row.role,
              province: row.Region || row.province || "Kathmandu",
              tenure: row.Tenure || row.tenure || "2025-2026",
              status: row.Status || row.status || "Pending",
              tier: row.Tier || row.tier || "general"
            };
            if (payload.name) {
              await API.post("/admin/users", payload);
              count++;
            }
          }
          toast.success(`Successfully imported ${count} verification records`);
          fetchMembers();
        } catch {
          toast.error("Import failed: One or more records are invalid");
        }
      }
    });
  };

  // --- Logic: Toggle Verification ---
  const toggleVerification = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    const newIsVerified = member.status !== "Verified";
    const newStatus = newIsVerified ? "Verified" : "Pending";

    // Optimistic update
    setMembers(members.map(m =>
      m.id === id ? { ...m, status: newStatus } : m
    ));

    try {
      // API call: send isVerified boolean — matches backend field
      await API.patch(`/admin/users/${id}`, { isVerified: newIsVerified });
      toast.success(`Member ${newIsVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error("Failed to update verification status", error);
      toast.error("Failed to update verification status");
      // Revert if failed
      setMembers(members.map(m =>
        m.id === id ? { ...m, status: member.status } : m
      ));
    }
  };

  // --- Logic: Multi-Filter (Tabs + Dropdowns + Search) ---
  const filteredMembers = useMemo(() => {
    if (!members) return [];

    const filtered = members.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase()) ||
        (m.ebBody || '').toLowerCase().includes(search.toLowerCase());

      const matchesProvince = filterProvince === "All" || m.province === filterProvince;
      const matchesTenure = filterTenure === "All" || m.tenure === filterTenure;
      const matchesRole = activeFilter === "all" || m.role === activeFilter;
      const matchesStatus = filterStatus === "All" || m.status === filterStatus;

      return matchesSearch && matchesProvince && matchesTenure && matchesRole && matchesStatus;
    });

    return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [search, filterProvince, filterTenure, activeFilter, filterStatus, members]);

  if (loading && members.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="max-w-full mx-auto p-2 space-y-8 animate-in fade-in duration-500">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Member Verification</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Review credentials & CFC community</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasPermission('member_create') && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-3 bg-slate-900 text-white border border-slate-900 px-8 py-4 rounded-2xl hover:bg-primary transition-all shadow-xl shadow-slate-900/20 font-black text-[10px] uppercase tracking-widest cursor-pointer"
            >
              <FaPlus className="text-xs" /> Add Member
            </button>
          )}
          {hasPermission('member_create') && (
            <label className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest cursor-pointer group">
              <FaDownload className="text-emerald-500 group-hover:bounce" /> Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
            </label>
          )}

          <div className="relative group/export">
            <button className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest">
              <FaFileCsv className="text-lg text-emerald-500" /> Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-3 overflow-hidden">
              {hasPermission('member_export_csv') && (
                <button onClick={exportToCSV} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50">
                  <FaFileCsv className="text-emerald-500" /> CSV Schema
                </button>
              )}
              {hasPermission('member_export_pdf') && (
                <button onClick={exportToPDF} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50">
                  <FaFilePdf className="text-rose-500" /> PDF Document
                </button>
              )}
              {hasPermission('member_export_word') && (
                <button onClick={exportToWord} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <FaFileWord className="text-blue-500" /> MS Word Doc
                </button>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/50">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Action Required</p>
            <p className="text-sm font-black text-emerald-900">{members.filter(m => m.status === "Pending").length} Pending Requests</p>
          </div>
        </div>
      </div>

      {/* 2. Search & Filters */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5" role="search" aria-label="Filter members">
        {/* Search bar */}
        <div className="relative">
          <label htmlFor="member-search" className="sr-only">Search members</label>
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" aria-hidden="true" />
          <DebouncedSearchInput
            id="member-search"
            aria-label="Search member by name, role, or position"
            placeholder="Search by name, role, or position..."
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
            value={search}
            onSearch={setSearch}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>

        {/* Filter grid */}
        <fieldset className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-0 p-0 m-0">
          <legend className="sr-only">Filter options</legend>

          {/* Role */}
          <div className="space-y-1">
            <label htmlFor="member-filter-role" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
            <select
              id="member-filter-role"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-semibold text-slate-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="all">All Roles</option>
              {['superadmin', 'admin', 'eb', 'cr', 'gm', 'ippl', 'advisor', 'alumni', 'guest'].map(role => (
                <option key={role} value={role}>{role === 'gm' ? 'General Member' : role.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div className="space-y-1">
            <label htmlFor="member-filter-region" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Region</label>
            <select
              id="member-filter-region"
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-semibold text-slate-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="All">All Regions</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Tenure */}
          <div className="space-y-1">
            <label htmlFor="member-filter-tenure" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tenure</label>
            <select
              id="member-filter-tenure"
              value={filterTenure}
              onChange={(e) => setFilterTenure(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-semibold text-slate-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="All">All Tenures</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label htmlFor="member-filter-status" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <select
              id="member-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-semibold text-slate-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="All">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </fieldset>

        {/* Result count + clear all */}
        <div className="flex items-center justify-between pt-1" aria-live="polite">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-600">{filteredMembers.length}</span> of {members.length} members
          </p>
          {(activeFilter !== 'all' || filterProvince !== 'All' || filterTenure !== 'All' || filterStatus !== 'Verified' || search) && (
            <button
              onClick={() => {
                setActiveFilter('all');
                setFilterProvince('All');
                setFilterTenure('All');
                setFilterStatus('Verified');
                setSearch('');
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
              title="Reset all filters to default"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Member Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <table className="min-w-full w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-8 py-5">Member Identity</th>
              <th className="px-8 py-5">Region / Tenure</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                    />
                    <div>
                      <div className="font-black text-gray-900 leading-none">{member.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{member.role}{member.ebBody ? ` · ${member.ebBody.replace(/-/g, ' ')}` : ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <FaMapMarkerAlt className="text-gray-300" /> {member.province}
                    </span>
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <FaCalendarAlt className="text-gray-300" /> {member.tenure}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${member.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {member.status === 'Verified' ? <FaCheckCircle /> : <FaClock />}
                    {member.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === member.id ? null : member.id);
                    }}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                    <BsThreeDotsVertical />
                  </button>

                  {openMenuId === member.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-20 top-6 w-54 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200"
                    >
                      {hasPermission('member_update') && (
                        <>
                          <button
                            onClick={() => { toggleVerification(member.id); setOpenMenuId(null); }}
                            className={`w-full px-5 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${member.status === 'Verified' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                          >
                            {member.status === 'Verified' ? (
                              <><FaTimes /> Revoke Verification</>
                            ) : (
                              <><FaCheckCircle /> Verify Credentials</>
                            )}
                          </button>
                          <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                          <button
                            onClick={() => { handleOpenModal(member); setOpenMenuId(null); }}
                            className="w-full px-5 py-3 text-left flex items-center gap-3 text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-widest"
                          >
                            <BsPencilSquare className="text-blue-500" /> Edit Member
                          </button>
                        </>
                      )}
                      {hasPermission('member_delete') && (
                        <button
                          onClick={() => { handleDelete(member.id); setOpenMenuId(null); }}
                          className="w-full px-5 py-3 text-left flex items-center gap-3 text-[10px] font-black text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-widest"
                        >
                          <BsTrash className="text-rose-500" /> Delete Member
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && (
          <div className="p-20 text-center font-bold text-gray-400 italic">
            No records found for the selected criteria.
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEditing ? "Edit Team Member" : "Add New Member"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Fill in the credentials for CFC Community
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {/* Image & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4 space-y-4">
                  <div className="relative group aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center transition-all hover:border-emerald-500">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <FaCamera className="mx-auto text-3xl text-slate-300 mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Portrait</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">Recommended: 800x1000px</p>
                </div>

                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Bipsay Shama"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-bold text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                      required
                    >
                      <option value="gm">General Member</option>
                      <option value="eb">Executive Board (EB)</option>
                      <option value="cr">Campus Representative (CR)</option>
                      <option value="ippl">IPPL</option>
                      <option value="advisor">Advisor</option>
                      <option value="alumni">Alumni</option>
                      <option value="guest">Guest</option>
                      {(useAuth().user?.role === 'superadmin' || useAuth().user?.role === 'admin') && (
                        <>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </>
                      )}
                    </select>
                  </div>
                  {formData.role === 'eb' && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">EB Position</label>
                      <select
                        name="ebBody"
                        value={formData.ebBody}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                        required
                      >
                        <option value="">Select Position</option>
                        {EB_POSITIONS.map(pos => (
                          <option key={pos.value} value={pos.value}>{pos.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. member@codeforchange.org"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9841234567"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Tenure</label>
                    <select
                      name="tenure"
                      value={formData.tenure}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                    >
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Date of Birth</label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-bold text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Region</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                  >
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-bold text-sm transition-all"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Biography / Tagline</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all resize-none"
                  placeholder="Tell us about the member's impact..."
                  required
                ></textarea>
              </div>
              {/* Digital Identity */}
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 border-l-4 border-emerald-500 pl-4">Digital Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['linkedin', 'github', 'website', 'facebook', 'instagram', 'tiktok', 'youtube'].map((social) => (
                    <div key={social}>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1 capitalize">{social}</label>
                      <input
                        name={`social.${social}`}
                        value={formData.socialLinks?.[social] || ""}
                        onChange={handleInputChange}
                        placeholder={`https://${social}.com/username`}
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-xs transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Override */}
              {(hasPermission('settings_manage') || ['superadmin', 'admin'].includes(useAuth().user?.role)) && (
                <div className="space-y-6 pt-8 border-t border-slate-100">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 border-l-4 border-amber-500 pl-4">Permission Overrides</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-5">Assign specific capabilities outside of defaults</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-5">
                    {Object.entries(AVAILABLE_PERMISSIONS).map(([group, perms]) => (
                      <div key={group} className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-50">{group}</h5>
                        <div className="flex flex-wrap gap-2">
                          {perms.map(perm => (
                            <button
                              key={perm}
                              type="button"
                              onClick={() => handlePermissionToggle(perm)}
                              className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${formData.permissions?.includes(perm)
                                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-amber-200'
                                }`}
                            >
                              {perm.replace(':', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {btnLoading ? "Processing..." : isEditing ? "Save Transitions" : "Deploy Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Member;