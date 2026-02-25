
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaRegTrashAlt, FaUserEdit, FaUserPlus, FaTimes, 
  FaUniversity, FaGraduationCap, FaIdCard, FaFilter, FaPhoneAlt, FaClock,
  FaFileCsv, FaFilePdf, FaFileWord, FaDownload, FaCheckCircle
} from "react-icons/fa";
import { BsPencil, BsThreeDotsVertical, BsTrash, BsEye } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { useAuth } from "../../Context/AuthContext";

const FilterSelect = React.memo(({ label, options, value, onChange }) => (
  <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
    {/* Desktop View */}
    <div className="hidden md:flex items-center">
        <div className="px-3 py-2 text-xs font-black text-slate-400 border-r border-slate-200 mr-1 uppercase tracking-widest">{label}</div>
        <div className="flex gap-1">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => onChange(opt === value ? 'all' : opt)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                value === opt 
                ? 'bg-white text-slate-900 shadow-md border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {opt}
            </button>
          ))}
          <button
            onClick={() => onChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              value === 'all' 
              ? 'bg-white text-slate-900 shadow-md border border-slate-100' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            All
          </button>
        </div>
    </div>

    {/* Mobile View */}
    <div className="md:hidden px-2">
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-[10px] font-black text-slate-600 outline-none py-2 uppercase tracking-widest"
        >
            <option value="all">All {label}</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
  </div>
));

const ModalInput = React.memo(({ label, value, onChange, type = "text", required = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <input
      type={type}
      required={required}
      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
      value={value}
      onChange={onChange}
    />
  </div>
));

function AdminUsers() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    secondaryEmail: "",
    password: "",
    phone: "",
    address: "",
    province: "",
    dateOfBirth: "",
    region: "",
    bio: "",
    role: "member",
    status: "Active",
    gender: "",
    code: "",
    membershipStatus: "active",
    collegeName: "",
    university: "",
    faculty: "",
    semester: "",
    graduationYear: "",
    ebBody: "",
    department: "",
    termStart: "",
    termEnd: "",
    linkedin: "",
    github: "",
    facebook: "",
    website: "",
    profileImage: null,
    profileImagePreview: "",
  });

  const [activeRole, setActiveRole] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeMembershipStatus, setActiveMembershipStatus] = useState("all");
  const [activeCollege, setActiveCollege] = useState("all");
  const [activeFaculty, setActiveFaculty] = useState("all");
  const [activeProvince, setActiveProvince] = useState("all");
  const [activeJoinedYear, setActiveJoinedYear] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/content?type=users");
      if (res.data.success) {
        const validUsers = (res.data.data || []).filter(u => u.email !== "sajhilodigital@gmail.com.np");
        setUsers(validUsers);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        secondaryEmail: user.secondaryEmail || "",
        password: "",
        phone: user.phone || "",
        address: user.address || "",
        province: user.province || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        region: user.region || "",
        bio: user.bio || "",
        role: user.role === "student" ? "member" : (user.role || "member"),
        status: user.isActive ? "Active" : "Inactive",
        gender: user.gender || "",
        code: user.membership?.membershipId || "",
        membershipStatus: user.membership?.membershipStatus || "active",
        collegeName: user.education?.collegeName || "",
        university: user.education?.university || "",
        faculty: user.education?.faculty || "",
        semester: user.education?.semester || "",
        graduationYear: user.education?.graduationYear || "",
        ebBody: user.executiveDetails?.position || "",
        department: user.executiveDetails?.department || "",
        termStart: user.executiveDetails?.termStart ? new Date(user.executiveDetails.termStart).toISOString().split('T')[0] : "",
        termEnd: user.executiveDetails?.termEnd ? new Date(user.executiveDetails.termEnd).toISOString().split('T')[0] : "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        facebook: user.facebook || "",
        website: user.website || "",
        profileImage: null,
        profileImagePreview: user.profileImage || "",
      });
    } else {
      setEditingUser(null);
      setFormData({ 
      name: "", email: "", password: "", phone: "", address: "", province: "", dateOfBirth: "", region: "", bio: "",
      role: "member", status: "Active", gender: "",
        code: "", membershipStatus: "active",
        collegeName: "", university: "", faculty: "", semester: "", graduationYear: "",
        ebBody: "", department: "", termStart: "", termEnd: "",
        linkedin: "", github: "", facebook: "", website: "",
        profileImage: null, profileImagePreview: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await API.delete(`/admin/users/${userToDelete._id}`);
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setUserToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete user");
    }
  };

  const handleToggleVerification = async (user) => {
    try {
      const newStatus = !user.isVerified;
      const res = await API.patch(`/admin/users/${user._id}`, { isVerified: newStatus });
      if (res.data.success) {
        setUsers(users.map(u => u._id === user._id ? { ...u, isVerified: newStatus } : u));
        toast.success(`User ${newStatus ? 'Verified' : 'Unverified'} successfully`);
      }
    } catch (error) {
      console.error("Toggle verification error:", error);
      toast.error("Failed to update verification status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        province: formData.province,
        dateOfBirth: formData.dateOfBirth,
        region: formData.region,
        bio: formData.bio,
        role: formData.role,
        gender: formData.gender,
        isActive: formData.status === "Active",
        linkedin: formData.linkedin,
        github: formData.github,
        facebook: formData.facebook,
        website: formData.website,
        membership: {
          membershipId: formData.code,
          membershipStatus: formData.membershipStatus,
        },
        education: {
          collegeName: formData.collegeName,
          university: formData.university,
          faculty: formData.faculty,
          semester: formData.semester,
          graduationYear: formData.graduationYear,
        },
        executiveDetails: {
          position: formData.role.toUpperCase(),
          department: formData.department,
          termStart: formData.termStart,
          termEnd: formData.termEnd,
        },
      };

      if (!editingUser && !formData.password) {
        payload.password = `CFC@${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (formData.password) {
        payload.password = formData.password;
      }

      const data = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (typeof value === "object") {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value);
        }
      });

      if (formData.profileImage) {
        data.append("profileImage", formData.profileImage);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (editingUser) {
        await API.put(`/admin/users/update-user/${editingUser._id}`, data, config);
        toast.success("User updated successfully");
      } else {
        await API.post("/admin/users/create-user", data, config);
        toast.success("User created successfully");
      }
      
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Failed to save user");
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredUsers.map(u => ({
      Name: u.name,
      Email: u.email,
      Phone: u.phone || "N/A",
      Role: u.role,
      Account: u.isActive ? "Active" : "Inactive",
      Verified: u.isVerified ? "Yes" : "No",
      "Member ID": u.membership?.membershipId || "N/A",
      College: u.education?.collegeName || "N/A",
      Faculty: u.education?.faculty || "N/A"
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CFC_Members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text("Code For Change", 14, 20);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Membership Registry Ledger", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    
    const tableColumn = [
      "ID", 
      "Name", 
      "Email", 
      "Phone", 
      "Role", 
      "College", 
      "Faculty", 
      "Status"
    ];
    
    const tableRows = filteredUsers.map(u => [
      u.membership?.membershipId || "N/A",
      u.name,
      u.email,
      u.phone || "N/A",
      u.role,
      u.education?.collegeName || "N/A",
      u.education?.faculty || "N/A",
      `${u.isActive ? "Active" : "Inactive"}${u.isVerified ? " (V)" : ""}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontWeight: 'bold' },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 35 }, // Name
        2: { cellWidth: 45 }, // Email
        3: { cellWidth: 25 }, // Phone
        4: { cellWidth: 25 }, // Role
        5: { cellWidth: 45 }, // College
        6: { cellWidth: 35 }, // Faculty
        7: { cellWidth: 25 }, // Status
      }
    });

    doc.save(`CFC_Members_Report_${Date.now()}.pdf`);
    toast.success("PDF Exported successfully");
  };

  const exportToWord = () => {
    let content = "CODE FOR CHANGE\nMEMBERSHIP REGISTRY REPORT\n\n";
    content += `Report Date: ${new Date().toLocaleString()}\n`;
    content += "==========================================\n\n";
    
    filteredUsers.forEach((u, index) => {
      content += `${index + 1}. MEMBER PROFILE\n`;
      content += `   Name: ${u.name}\n`;
      content += `   Email: ${u.email}\n`;
      content += `   Member ID: ${u.membership?.membershipId || "N/A"}\n`;
      content += `   Role: ${u.role}\n`;
      content += `   College: ${u.education?.collegeName || "N/A"}\n`;
      content += `   Account: ${u.isActive ? "Active" : "Inactive"}\n`;
      content += `   Verified: ${u.isVerified ? "Yes" : "No"}\n`;
      content += "------------------------------------------\n";
    });
    
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CFC_Members_Report_${Date.now()}.doc`;
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
              email: row.Email || row.email,
              phone: row.Phone || row.phone,
              role: row.Role || row.role || "student",
              isActive: row.Status === 'Active' || row.isActive === 'true',
              password: `CFC@${Math.floor(1000 + Math.random() * 9000)}`
            };
            if (payload.name && payload.email) {
              await API.post("/admin/users", payload);
              count++;
            }
          }
          toast.success(`Successfully enrolled ${count} members`);
          fetchUsers();
        } catch (error) {
          toast.error("Import failed: One or more records are invalid");
        }
      }
    });
  };

  const filteredUsers = users.filter((user) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name?.toLowerCase().includes(s) ||
      user.email?.toLowerCase().includes(s) ||
      user.phone?.toLowerCase().includes(s) ||
      user.membership?.membershipId?.toLowerCase().includes(s) ||
      user.education?.collegeName?.toLowerCase().includes(s);

    // Filter out superadmin from being displayed or searched
    const isSuperAdmin = user.email === "sajhilodigital@gmail.com" || user.role === "superadmin";
    if (isSuperAdmin) return false;

    const matchesRole = activeRole === "all" || user.role === activeRole;
    const matchesStatus = activeStatus === "all" || (activeStatus === "verified" ? user.isVerified : !user.isVerified);
    const matchesMemb = activeMembershipStatus === "all" || user.membership?.membershipStatus === activeMembershipStatus;
    const matchesCollege = activeCollege === "all" || user.education?.collegeName === activeCollege;
    const matchesFaculty = activeFaculty === "all" || user.education?.faculty === activeFaculty;
    const matchesProvince = activeProvince === "all" || user.province === activeProvince;
    const matchesYear = activeJoinedYear === "all" || new Date(user.createdAt).getFullYear().toString() === activeJoinedYear;

    return matchesSearch && matchesRole && matchesStatus && matchesMemb && matchesCollege && matchesFaculty && matchesProvince && matchesYear;
  });

  // Unique values for filters
  const uniqueColleges = [...new Set(users.map(u => u.education?.collegeName).filter(Boolean))].sort();
  const uniqueFaculties = [...new Set(users.map(u => u.education?.faculty).filter(Boolean))].sort();
  const uniqueYears = [...new Set(users.map(u => u.createdAt ? new Date(u.createdAt).getFullYear() : null).filter(Boolean))].sort((a,b) => b-a);

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header - Reponsive */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CFC Members</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Association Directory</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {hasPermission('user_create') && (
            <label className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-4 py-3 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest cursor-pointer group flex-1 md:flex-none">
              <FaDownload className="text-emerald-500 group-hover:bounce" /> <span className="hidden sm:inline">Import CSV</span><span className="sm:hidden">Import</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
            </label>
          )}
          
          <div className="relative group/export flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-4 py-3 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest">
              <FaFileCsv className="text-lg text-emerald-500" /> <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-3 overflow-hidden">
              {hasPermission('user_export_csv') && (
                <button onClick={exportToCSV} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50">
                  <FaFileCsv className="text-emerald-500" /> CSV Schema
                </button>
              )}
              {hasPermission('user_export_pdf') && (
                <button onClick={exportToPDF} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50">
                  <FaFilePdf className="text-rose-500" /> PDF Document
                </button>
              )}
              {hasPermission('user_export_word') && (
                <button onClick={exportToWord} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <FaFileWord className="text-blue-500" /> MS Word Doc
                </button>
              )}
            </div>
          </div>

          {hasPermission('user_create') && (
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
            >
              <FaUserPlus className="text-lg" /> <span className="hidden sm:inline">New Member</span><span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Advanced Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ID, or college..."
              className="w-full pl-16 pr-8 py-4.5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:bg-white outline-none font-bold text-sm tracking-tight transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 md:flex items-center gap-3 w-full lg:w-auto">
            <FilterSelect 
              label="Verification" 
              options={['verified', 'unverified']} 
              value={activeStatus} 
              onChange={setActiveStatus} 
            />
            <FilterSelect 
              label="Membership" 
              options={['active', 'expired', 'revoked']} 
              value={activeMembershipStatus} 
              onChange={setActiveMembershipStatus} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-50 pt-8">
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Filter by Province</p>
            <select 
              value={activeProvince} 
              onChange={(e) => setActiveProvince(e.target.value)}
              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-white transition-all"
            >
              <option value="all">All Provinces</option>
              {['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Filter by College</p>
            <select 
              value={activeCollege} 
              onChange={(e) => setActiveCollege(e.target.value)}
              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-white transition-all"
            >
              <option value="all">All Colleges</option>
              {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Filter by Faculty</p>
            <select 
              value={activeFaculty} 
              onChange={(e) => setActiveFaculty(e.target.value)}
              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-white transition-all"
            >
              <option value="all">All Faculties</option>
              {uniqueFaculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Joined Year</p>
            <select 
              value={activeJoinedYear} 
              onChange={(e) => setActiveJoinedYear(e.target.value)}
              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold appearance-none cursor-pointer hover:bg-white transition-all"
            >
              <option value="all">All Joined Years</option>
              {uniqueYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-50 pt-8">
          <div className="flex items-center gap-2 text-slate-400 mr-2">
            <FaFilter size={10} />
            <span className="text-xs font-black uppercase tracking-widest">Role</span>
          </div>
          <div className="flex gap-2 w-full overflow-x-auto scrollbar-hide py-1">
            {['all', 'superadmin', 'admin', 'tech-lead', 'cr', 'project-lead', 'general-member', 'cr-eb', 'guest'].map(role => (
              <button 
                key={role} 
                onClick={() => setActiveRole(role)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeRole === role 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                  : 'bg-slate-50 text-slate-400 border-transparent hover:text-emerald-600 hover:bg-white hover:border-slate-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - Responsive Table/Cards */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Role & Membership</th>
                <th className="px-8 py-5">Academic Detail</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user, index) => (
                <tr key={user._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100/50 transition-all group`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img 
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                          alt={user.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-110"
                        />
                        {user.isVerified && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <FaCheckCircle className="text-white text-[8px]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 leading-tight text-base mb-1">{user.name}</div>
                        <div className="text-xs text-slate-400 font-bold mt-1 tracking-wider">{user.email?.toLowerCase()}</div>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="text-xs text-emerald-600/70 font-bold uppercase tracking-tighter flex items-center gap-1">
                              <FaClock size={12} /> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                           </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Member ID</p>
                        <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                          <FaIdCard className="text-emerald-500" /> {user.membership?.membershipId || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Role</p>
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest">{user.role?.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">College</p>
                        <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                          <FaUniversity className="text-slate-300" /> {user.education?.collegeName || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Faculty</p>
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                           {user.education?.faculty || 'N/A'}
                         </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Position</p>
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg inline-block">
                        {user.executiveDetails?.position || 'REGULAR'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Account</p>
                        <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Verify</p>
                         <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isVerified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                           {user.isVerified ? "Verified" : "Not"}
                         </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === user._id ? null : user._id);
                      }}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300"
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {openMenuId === user._id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-20 top-6 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200"
                      >
                         <button 
                           onClick={() => { navigate(`/admin/user/${user._id}`); setOpenMenuId(null); }}
                           className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                         >
                           <BsEye className="text-emerald-500" /> View Detail
                         </button>
                         <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                         {hasPermission('user_update') && (
                           <>
                            <button 
                              onClick={() => { handleOpenModal(user); setOpenMenuId(null); }}
                              className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                            >
                              <BsPencil className="text-amber-500" /> Edit Member
                            </button>
                            <button 
                              onClick={() => { handleToggleVerification(user); setOpenMenuId(null); }}
                              className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                            >
                              <FaCheckCircle className={user.isVerified ? "text-rose-500" : "text-emerald-500"} /> {user.isVerified ? "Unverify Member" : "Verify Member"}
                            </button>
                            <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                           </>
                         )}
                         {hasPermission('user_delete') && (
                           <button 
                             onClick={() => { 
                                 setUserToDelete(user);
                                 setDeleteModalOpen(true);
                                 setOpenMenuId(null); 
                             }}
                             className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                           >
                             <BsTrash /> Delete
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

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {filteredUsers.map((user) => (
              <div key={user._id} className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <img 
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                      className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm"
                      alt=""
                    />
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{user.name}</h3>
                      <p className="text-xs text-slate-400 font-bold">{user.email}</p>
                    </div>
                  </div>
                 <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === user._id ? null : user._id);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100"
                  >
                      <BsThreeDotsVertical size={14} className="text-slate-400" />
                  </button>
               </div>

               {/* Mobile Dropdown */}
               {openMenuId === user._id && (
                  <div className="absolute top-14 right-4 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in">
                    <button onClick={() => navigate(`/admin/user/${user._id}`)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50">View Detail</button>
                    <button onClick={() => handleOpenModal(user)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50">Edit</button>
                    <button onClick={() => { handleToggleVerification(user); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50">{user.isVerified ? "Unverify" : "Verify"}</button>
                    <button onClick={() => { setUserToDelete(user); setDeleteModalOpen(true); }} className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50">Delete</button>
                  </div>
               )}
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Role</p>
                    <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">{user.role}</p>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Batch</p>
                    <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">{user.education?.semester || 'N/A'}</p>
                 </div>
               </div>
               
               <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                     <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                     </span>
                     <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${user.isVerified ? "border-emerald-200 text-emerald-600" : "border-slate-200 text-slate-400"}`}>
                        {user.isVerified ? "Verified" : "Unverified"}
                     </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <FaUniversity /> {user.education?.collegeName?.substring(0, 15) || 'N/A'}...
                  </div>
               </div>
             </div>
          ))}
        </div>

        {loading && <div className="p-10 text-center font-bold text-slate-400 italic">Processing directory...</div>}
        {!loading && filteredUsers.length === 0 && (
          <div className="p-10 text-center font-bold text-slate-400 italic">No members found matching criteria.</div>
        )}
      </div>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden max-h-[95vh] flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50 flex-shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                  {editingUser ? "Update Member" : "Enroll New Member"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Directory Update
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all duration-300 border border-slate-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* Tab Navigation - REMOVED for single form */}
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-10 space-y-12 flex-1">
                
                {/* 1. Account & Profile Section */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-px bg-slate-100 flex-1"></div>
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Account & Profile</h4>
                     <div className="h-px bg-slate-100 flex-1"></div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-10 items-start mb-10">
                    <div className="space-y-3 shrink-0">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Member Avatar</label>
                      <div className="relative group/avatar cursor-pointer">
                         <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover/avatar:border-emerald-500 shadow-inner">
                            {formData.profileImagePreview ? (
                              <img src={formData.profileImagePreview} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                              <FaUserPlus className="text-slate-300 text-3xl" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                               <BsPencil className="text-white text-xl" />
                            </div>
                         </div>
                         <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                setFormData({...formData, profileImage: e.target.files[0], profileImagePreview: URL.createObjectURL(e.target.files[0])});
                              }
                            }}
                         />
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                       <ModalInput label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <ModalInput 
                             label="Email Address" 
                             type="email" 
                             value={formData.email} 
                             onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })} 
                             required 
                             disabled={!!editingUser}
                           />
                           <ModalInput 
                             label="Secondary Email (Optional)" 
                             type="email" 
                             value={formData.secondaryEmail} 
                             onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value.toLowerCase() })} 
                           />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                           <ModalInput label="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {!editingUser && (
                      <ModalInput 
                        label="System Password" 
                        type="password" 
                        value={formData.password} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        required 
                      />
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gender</label>
                      <select
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none cursor-pointer"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <ModalInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                    <ModalInput label="Home Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Province</label>
                      <select
                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none cursor-pointer"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        required
                      >
                        <option value="">Select Province</option>
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
                    <ModalInput label="District/Region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
                  </div>
                  
                  <div className="mt-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Professional Bio</label>
                    <textarea
                      className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:bg-white focus:ring-8 focus:ring-emerald-500/5 transition-all resize-none h-40 text-sm font-medium leading-relaxed"
                      placeholder="Brief summary of expertise and background..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                {/* 2. Academic Roadmap */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-px bg-slate-100 flex-1"></div>
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Academic Roadmap</h4>
                     <div className="h-px bg-slate-100 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <ModalInput label="University" value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} required />
                     <ModalInput label="College / Institution" value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} required />
                     <ModalInput label="Academic Faculty" value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} required />
                     <div className="grid grid-cols-2 gap-4">
                        <ModalInput label="Semester / Year" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} />
                        <ModalInput label="Graduation Year" type="number" value={formData.graduationYear} onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })} />
                     </div>
                  </div>
                </div>

                {/* 3. Organizational Role */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-px bg-slate-100 flex-1"></div>
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Organizational Role</h4>
                     <div className="h-px bg-slate-100 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">System Access Role</label>
                        <select
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold focus:bg-white transition-all appearance-none cursor-pointer"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                           <option value="">Select Role</option>
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
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Directory Status</label>
                        <select
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold focus:bg-white transition-all"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <ModalInput label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                      <div className="grid grid-cols-2 gap-4">
                         <ModalInput label="Term Start" type="date" value={formData.termStart} onChange={(e) => setFormData({ ...formData, termStart: e.target.value })} />
                         <ModalInput label="Term End" type="date" value={formData.termEnd} onChange={(e) => setFormData({ ...formData, termEnd: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <ModalInput label="Membership ID" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ID Status</label>
                            <select
                              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold focus:bg-white transition-all"
                              value={formData.membershipStatus}
                              onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value })}
                            >
                              <option value="active">Active</option>
                              <option value="expired">Expired</option>
                              <option value="revoked">Revoked</option>
                            </select>
                          </div>
                      </div>
                  </div>
                </div>

                {/* 4. Digital Connections */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-px bg-slate-100 flex-1"></div>
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Digital Connections</h4>
                     <div className="h-px bg-slate-100 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <ModalInput label="LinkedIn Profile" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                     <ModalInput label="GitHub Handle" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
                     <ModalInput label="Facebook URL" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
                     <ModalInput label="Portfolio Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-slate-100 flex gap-6 mt-auto bg-slate-50/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 border border-slate-200 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-300 active:scale-95"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-2 py-5 bg-slate-950 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-2xl shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 px-12"
                >
                  <FaCheckCircle className="text-lg" />
                  {editingUser ? "Push Record Updates" : "Commit Member to Registry"}
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
            setUserToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Member"
        itemName="member"
        message={`Are you sure you want to delete "${userToDelete?.name}"? All membership data and association records for this member will be permanently removed.`}
      />
    </div>
  );
}


export default AdminUsers;
