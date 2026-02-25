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

const AVAILABLE_PERMISSIONS = {
  "Member Management": ["member:create", "member:update", "member:view", "member:delete", "member:verify"],
  "Event Management": ["event:create", "event:update", "event:view", "event:delete"],
  "Content Management": ["blog:create", "blog:update", "blog:view", "blog:delete", "impact:create", "impact:update", "impact:view", "impact:delete", "gallery:create", "gallery:update", "gallery:view", "gallery:delete"],
  "System Access": ["settings:manage", "log:view", "report:view", "certificate:issue", "internship:create"]
};

const TIER_STYLE = {
  executive: "bg-emerald-100 text-emerald-600",
  representative: "bg-blue-100 text-blue-600",
  general: "bg-slate-100 text-slate-600"
};

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
    role: "",
    position: "",
    tenure: "2025-2026",
    bio: "",
    email: "",
    type: "volunteer",
    tier: "general",
    province: "Kathmandu",
    socialLinks: {
      linkedin: "",
      github: "",
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
      // Fetch only active/verified users
      // Fetch users from the correct endpoint
      const { data } = await API.get("/users/list-user");
      const mapped = (data.data || []).map(m => ({
        id: m?._id || m?.id,
        name: m?.name || "Unknown Member",
        role: m?.role || "volunteer",
        position: m?.executiveDetails?.position || m?.position || "Member",
        province: m?.province || m?.location || "National",
        tenure: m?.tenure || "2025-2026",
        status: m?.isVerified ? "Verified" : "Pending",
        tier: m?.membership?.membershipStatus || m?.tier || "general",
        type: m?.role === 'admin' ? 'executive' : 'volunteer',
        bio: m?.bio || "",
        email: m?.email || "",
        socialLinks: {
          linkedin: m?.linkedin || m?.socialLinks?.linkedin || "",
          github: m?.github || m?.socialLinks?.github || "",
          twitter: m?.twitter || m?.socialLinks?.twitter || "",
          facebook: m?.facebook || m?.socialLinks?.facebook || "",
          instagram: m?.instagram || m?.socialLinks?.instagram || "",
          tiktok: m?.tiktok || m?.socialLinks?.tiktok || "",
          youtube: m?.youtube || m?.socialLinks?.youtube || ""
        },
        image: m?.profileImage || m?.image,
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
        position: member.position,
        tenure: member.tenure,
        bio: member.bio,
        email: member.email,
        type: member.type,
        tier: member.tier,
        province: member.province,
        socialLinks: {
          linkedin: member.socialLinks?.linkedin || "",
          github: member.socialLinks?.github || "",
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
        role: "",
        position: "",
        tenure: "2025-2026",
        bio: "",
        email: "",
        type: "volunteer",
        tier: "general",
        province: "Kathmandu",
        socialLinks: {
          linkedin: "",
          github: "",
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "socialLinks") {
        // Map social links to root level for User model
        Object.entries(formData[key]).forEach(([sKey, sVal]) => {
          data.append(sKey, sVal);
        });
      } else if (key === "image") {
        if (selectedFile) data.append("profileImage", selectedFile);
      } else {
        data.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      data.append("image", selectedFile);
    }

    try {
      if (isEditing) {
        await API.patch(`/admin/users/${currentMemberId}`, data);
        toast.success("Member updated successfully");
      } else {
        await API.post("/admin/users", data);
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
      Province: m.province,
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
    
    const tableColumn = ["Name", "Role", "Province", "Tenure", "Status"];
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
      content += `   Province: ${m.province}\n`;
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
              province: row.Province || row.province || "Kathmandu",
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
        } catch (error) {
          toast.error("Import failed: One or more records are invalid");
        }
      }
    });
  };

  // --- Logic: Toggle Verification ---
  const toggleVerification = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const newStatus = member.status === "Verified" ? "Pending" : "Verified";
    
    // Optimistic update
    setMembers(members.map(m => 
      m.id === id ? { ...m, status: newStatus } : m
    ));

    try {
      // API call to update status
      await API.patch(`/admin/users/${id}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert if failed
      setMembers(members.map(m => 
        m.id === id ? { ...m, status: member.status } : m
      ));
    }
  };

  // --- Logic: Multi-Filter (Tabs + Dropdowns + Search) ---
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    
    // 1. Filter
    const filtered = members.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase()) ||
        m.position.toLowerCase().includes(search.toLowerCase());
        
      const matchesProvince = filterProvince === "All" || m.province === filterProvince;
      const matchesTenure = filterTenure === "All" || m.tenure === filterTenure;
      const matchesTier = activeFilter === "all" || m.tier === activeFilter;
      const matchesStatus = filterStatus === "All" || m.status === filterStatus;
      
      return matchesSearch && matchesProvince && matchesTenure && matchesTier && matchesStatus;
    });

    // 2. Sort by latest added (createdAt desc)
    return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [search, filterProvince, filterTenure, activeFilter, filterStatus, members]);

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

      {/* 2. Tier Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'executive', 'representative', 'general'].map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveFilter(tier)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeFilter === tier 
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
              : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* 3. Operational Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              placeholder="Search member by name..."
              className="w-full pl-16 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white transition-all appearance-none border-r-[16px] border-r-transparent"
            onChange={(e) => setFilterProvince(e.target.value)}
          >
            <option value="All">All Provinces</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Pokhara">Pokhara</option>
            <option value="Rupandehi">Rupandehi</option>
            <option value="Dang">Dang</option>
            <option value="Birgunj">Birgunj</option>
            <option value="Farwest">Farwest</option>
            <option value="Koshi">Koshi</option>
            <option value="Chitwan">Chitwan</option>
            <option value="LB Karnali">LB Karnali</option>
          </select>

          <select 
            className="px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white transition-all appearance-none border-r-[16px] border-r-transparent"
            onChange={(e) => setFilterTenure(e.target.value)}
          >
            <option value="All">All Tenures</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>

          <select 
            className="px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white transition-all appearance-none border-r-[16px] border-r-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* 4. Member Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <table className="min-w-full w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-8 py-5">Member Identity</th>
              <th className="px-8 py-5">Province / Tenure</th>
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
                      <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{member.role?.replace('-', ' ')}</div>
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
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    member.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
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
                            className={`w-full px-5 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                              member.status === 'Verified' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
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
                      <option value="">Select Role</option>
                      {/* Standard Roles Hierarchy */}
                      {(useAuth().user?.role === 'superadmin' || useAuth().user?.role === 'admin') && (
                        <>
                          <option value="superadmin">Super Admin</option>
                          <option value="admin">Admin</option>
                        </>
                      )}
                      <option value="tech-lead">Tech Lead</option>
                      <option value="cr">CR</option>
                      <option value="project-lead">Project Lead</option>
                      <option value="general-member">General Member</option>
                      <option value="cr-eb">CR EB</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Position</label>
                    <input 
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g. Tech Lead"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-bold text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email</label>
                    <input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. bipsay@codeforchange.org"
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

              {/* Classification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Member Type</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="executive">Executive</option>
                    <option value="advisor">Advisor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Member Tier</label>
                  <select 
                    name="tier"
                    value={formData.tier}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                  >
                    <option value="general">General</option>
                    <option value="representative">Representative</option>
                    <option value="executive">Board / Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Province</label>
                  <select 
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all appearance-none"
                  >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Rupandehi">Rupandehi</option>
                    <option value="Dang">Dang</option>
                    <option value="Birgunj">Birgunj</option>
                    <option value="Farwest">Farwest</option>
                    <option value="Koshi">Koshi</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="LB Karnali">LB Karnali</option>
                  </select>
                </div>
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
                  {['linkedin', 'github', 'facebook', 'instagram', 'tiktok', 'youtube'].map((social) => (
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
              {(hasPermission('settings_manage') || useAuth().user?.role === 'tech-lead') && (
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
                              className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                formData.permissions?.includes(perm)
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