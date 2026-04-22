
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
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import { useAuth } from "../../Context/AuthContext";

const FilterSelect = React.memo(({ label, options, value, onChange }) => (
  <div className="bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
    {/* Desktop View */}
    <div className="hidden md:flex items-center">
      <div className="px-3 py-2 text-xs font-bold text-gray-400 border-r border-gray-200 mr-1 uppercase tracking-widest">{label}</div>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt === value ? 'all' : opt)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${value === opt
              ? 'bg-white text-secondary shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            {opt}
          </button>
        ))}
        <button
          onClick={() => onChange('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${value === 'all'
            ? 'bg-white text-secondary shadow-sm border border-gray-200'
            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
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
        className="w-full bg-transparent text-[10px] font-bold text-gray-600 outline-none py-2 uppercase tracking-widest"
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
      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-secondary/5 focus:border-emerald-200 font-medium text-sm transition-all"
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
    bio: "",
    role: "gm",
    tenure: "",
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
    website: "",
    facebook: "",
    twitter: "",
    instagram: "",
    tiktok: "",
    youtube: "",
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
        bio: user.bio || "",
        role: user.role || "gm",
        tenure: user.tenure || "",
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
        website: user.website || "",
        facebook: user.facebook || "",
        twitter: user.twitter || "",
        instagram: user.instagram || "",
        tiktok: user.tiktok || "",
        youtube: user.youtube || "",
        profileImage: null,
        profileImagePreview: user.profileImage || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "", email: "", secondaryEmail: "", password: "", phone: "", address: "", province: "", dateOfBirth: "", bio: "",
        role: "gm", tenure: "", status: "Active", gender: "",
        code: "", membershipStatus: "active",
        collegeName: "", university: "", faculty: "", semester: "", graduationYear: "",
        ebBody: "", department: "", termStart: "", termEnd: "",
        linkedin: "", github: "", website: "", facebook: "", twitter: "", instagram: "", tiktok: "", youtube: "",
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
        secondaryEmail: formData.secondaryEmail,
        phone: formData.phone,
        address: formData.address,
        province: formData.province,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio,
        role: formData.role,
        tenure: formData.tenure,
        gender: formData.gender,
        isActive: formData.status === "Active",
        linkedin: formData.linkedin,
        github: formData.github,
        website: formData.website,
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        youtube: formData.youtube,
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
          position: formData.ebBody || "",
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
              role: row.Role || row.role || "gm",
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
  const uniqueYears = [...new Set(users.map(u => u.createdAt ? new Date(u.createdAt).getFullYear() : null).filter(Boolean))].sort((a, b) => b - a);

  if (loading && users.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">CFC Members</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Association Directory</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {hasPermission('user_create') && (
            <label className="flex items-center group justify-center gap-2 bg-white text-gray-600 border border-gray-200 px-5 py-3 rounded-xl hover:bg-secondary  hover:text-white transition-all shadow-sm font-bold text-[11px] uppercase tracking-widest cursor-pointer group flex-1 md:flex-none">
              <FaDownload className="text-secondary group-hover:text-white group-hover:bounce" /> <span className="hidden sm:inline">Import CSV</span><span className="sm:hidden">Import</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
            </label>
          )}

          <div className="relative group/export flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-200 px-5 py-3 rounded-xl  hover:bg-secondary  hover:text-white cursor-pointer group transition-all shadow-sm font-bold text-[11px] uppercase tracking-widest">
              <FaFileCsv className="text-lg text-secondary group-hover:text-white" /> <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-2 overflow-hidden">
              {hasPermission('user_export_csv') && (
                <button onClick={exportToCSV} className="w-full px-6 py-3 text-left flex items-center gap-3 text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all border-b border-gray-50">
                  <FaFileCsv className="text-secondary" /> CSV Schema
                </button>
              )}
              {hasPermission('user_export_pdf') && (
                <button onClick={exportToPDF} className="w-full px-6 py-3 text-left flex items-center gap-3 text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all border-b border-gray-50">
                  <FaFilePdf className="text-rose-500" /> PDF Document
                </button>
              )}
              {hasPermission('user_export_word') && (
                <button onClick={exportToWord} className="w-full px-6 py-3 text-left flex items-center gap-3 text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                  <FaFileWord className="text-blue-500" /> MS Word Doc
                </button>
              )}
            </div>
          </div>

          {hasPermission('user_create') && (
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none flex cursor-pointer items-center justify-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md shadow-secondary/20 font-bold text-[11px] uppercase tracking-widest whitespace-nowrap"
            >
              <FaUserPlus className="text-lg" /> <span className="hidden sm:inline">New Member</span><span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Advanced Filters */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ID, or college..."
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 focus:bg-white outline-none font-medium text-sm transition-all text-gray-900"
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 pt-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Location</p>
            <select
              value={activeProvince}
              onChange={(e) => setActiveProvince(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="all">All Regions</option>
              {['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">College</p>
            <select
              value={activeCollege}
              onChange={(e) => setActiveCollege(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="all">All Colleges</option>
              {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Faculty</p>
            <select
              value={activeFaculty}
              onChange={(e) => setActiveFaculty(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="all">All Faculties</option>
              {uniqueFaculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Joined Year</p>
            <select
              value={activeJoinedYear}
              onChange={(e) => setActiveJoinedYear(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white transition-all focus:border-emerald-300"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 text-gray-500 mr-2 shrink-0">
            <FaFilter size={12} />
            <span className="text-xs font-bold uppercase tracking-widest">Role</span>
          </div>
          <div className="flex gap-2 w-full overflow-x-auto scrollbar-hide py-1">
            {['all', 'admin', 'eb', 'cr', 'gm', 'guest'].map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${activeRole === role
                  ? 'bg-secondary text-white border-secondary shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:text-secondary hover:border-emerald-200'
                  }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - Responsive Table/Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Role & Membership</th>
                <th className="px-8 py-5">Academic Detail</th>
                <th className="px-8 py-5">Position</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user, index) => (
                <tr key={user._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50 transition-all group`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm transition-transform group-hover:scale-105"
                        />
                        {user.isVerified && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary rounded-full border-2 border-white flex items-center justify-center">
                            <FaCheckCircle className="text-white text-[8px]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900 leading-tight mb-1">{user.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{user.email?.toLowerCase()}</div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                            <FaClock size={10} className="text-secondary" /> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member ID</p>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <FaIdCard className="text-secondary" /> {user.membership?.membershipId || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Role</p>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded inline-block uppercase tracking-wider">{user.role?.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">College</p>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <FaUniversity className="text-gray-400" /> {user.education?.collegeName || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Faculty</p>
                        <span className="text-xs font-semibold text-gray-500 ml-4 inline-block">
                          {user.education?.faculty || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Position</p>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded inline-block">
                        {user.executiveDetails?.position || 'REGULAR'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200/50"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.isVerified ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200/50" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50"}`}>
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === user._id ? null : user._id);
                      }}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 bg-white hover:bg-emerald-50 hover:text-secondary hover:border-emerald-200 transition-all duration-300"
                    >
                      <BsThreeDotsVertical size={14} />
                    </button>
                    {openMenuId === user._id && (
                      <div
                        ref={menuRef}
                        className="absolute right-16 top-5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in duration-200"
                      >
                        <button
                          onClick={() => { navigate(`/admin/user/${user._id}`); setOpenMenuId(null); }}
                          className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all uppercase tracking-wider"
                        >
                          <BsEye className="text-secondary" /> View Detail
                        </button>
                        <div className="h-[1px] bg-gray-50 my-1 mx-4"></div>
                        {hasPermission('user_update') && (
                          <>
                            <button
                              onClick={() => { handleOpenModal(user); setOpenMenuId(null); }}
                              className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all uppercase tracking-wider"
                            >
                              <BsPencil className="text-blue-500" /> Edit Member
                            </button>
                            <button
                              onClick={() => { handleToggleVerification(user); setOpenMenuId(null); }}
                              className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all uppercase tracking-wider"
                            >
                              <FaCheckCircle className={user.isVerified ? "text-rose-500" : "text-secondary"} /> {user.isVerified ? "Unverify Member" : "Verify Member"}
                            </button>
                            <div className="h-[1px] bg-gray-50 my-1 mx-4"></div>
                          </>
                        )}
                        {hasPermission('user_delete') && (
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteModalOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-5 py-2.5 text-left flex items-center gap-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-wider"
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

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredUsers.map((user) => (
            <div key={user._id} className="p-5 space-y-4 hover:bg-gray-50/50 transition-all relative">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                    alt={user.name}
                  />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{user.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === user._id ? null : user._id);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200"
                >
                  <BsThreeDotsVertical size={14} className="text-gray-400" />
                </button>
              </div>

              {/* Mobile Dropdown */}
              {openMenuId === user._id && (
                <div className="absolute top-14 right-4 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in">
                  <button onClick={() => navigate(`/admin/user/${user._id}`)} className="w-full px-5 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">View Detail</button>
                  <button onClick={() => handleOpenModal(user)} className="w-full px-5 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">Edit</button>
                  <button onClick={() => { handleToggleVerification(user); setOpenMenuId(null); }} className="w-full px-5 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">{user.isVerified ? "Unverify" : "Verify"}</button>
                  <button onClick={() => { setUserToDelete(user); setDeleteModalOpen(true); }} className="w-full px-5 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</p>
                  <p className="text-xs font-semibold text-gray-700 uppercase mt-0.5">{user.role}</p>
                </div>
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Batch</p>
                  <p className="text-xs font-semibold text-gray-700 uppercase mt-0.5">{user.education?.semester || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200/50"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.isVerified ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200/50" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50"}`}>
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                  <FaUniversity /> {user.education?.collegeName?.substring(0, 15) || 'N/A'}...
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && <div className="p-10 text-center font-bold text-gray-400 italic">Processing directory...</div>}
        {!loading && filteredUsers.length === 0 && (
          <div className="p-10 text-center font-bold text-gray-400 italic">No members found matching criteria.</div>
        )}
      </div>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[95vh] flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 flex-shrink-0 bg-white">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingUser ? "Update Member" : "Enroll New Member"}
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  System Directory Update
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all border border-transparent"
              >
                <FaTimes />
              </button>
            </div>

            {/* Tab Navigation - REMOVED for single form */}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-8 space-y-12 flex-1">

                {/* 1. Account & Profile Section */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest shrink-0">Account & Profile</h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                    <div className="space-y-3 shrink-0">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">Member Avatar</label>
                      <div className="relative group/avatar cursor-pointer">
                        <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover/avatar:border-secondary group-hover/avatar:bg-emerald-50 shadow-inner">
                          {formData.profileImagePreview ? (
                            <img src={formData.profileImagePreview} className="w-full h-full object-cover" alt="Profile" />
                          ) : (
                            <FaUserPlus className="text-gray-300 text-3xl group-hover/avatar:text-emerald-400" />
                          )}
                          <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                            <BsPencil className="text-white text-xl" />
                          </div>
                        </div>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setFormData({ ...formData, profileImage: e.target.files[0], profileImagePreview: URL.createObjectURL(e.target.files[0]) });
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
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">Gender</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all appearance-none cursor-pointer"
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
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">Region</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all appearance-none cursor-pointer"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        required
                      >
                        <option value="">Select Region</option>
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

                  <div className="mt-6">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Professional Bio</label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all resize-none h-32 text-sm font-medium leading-relaxed text-gray-900"
                      placeholder="Brief summary of expertise and background..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                {/* 2. Academic Roadmap */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest shrink-0">Academic Roadmap</h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest shrink-0">Organizational Role</h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">System Access Role</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all appearance-none cursor-pointer"
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
                        <option value="eb">Executive Board (EB)</option>
                        <option value="cr">CR</option>
                        <option value="gm">General Member</option>
                        <option value="ippl">IPPL</option>
                        <option value="advisor">Advisor</option>
                        <option value="alumni">Alumni</option>
                        <option value="guest">Guest</option>
                      </select>
                    </div>
                    {formData.role === 'eb' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">EB Position</label>
                        <select
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all appearance-none cursor-pointer"
                          value={formData.ebBody}
                          onChange={(e) => setFormData({ ...formData, ebBody: e.target.value })}
                          required
                        >
                          <option value="">Select Position</option>
                          <option value="tech-lead">Tech Lead</option>
                          <option value="project-lead">Project Lead</option>
                          <option value="vice-project-lead">Vice Project Lead</option>
                          <option value="operation-lead">Operation Lead</option>
                          <option value="admin-lead">Admin Lead</option>
                          <option value="hr-lead">HR Lead</option>
                          <option value="pr-lead">PR Lead</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="vice-treasurer">Vice Treasurer</option>
                          <option value="executive-member">Executive Member</option>
                          <option value="secretary">Secretary</option>
                          <option value="vice-secretary">Vice Secretary</option>
                        </select>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">Directory Status</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all cursor-pointer"
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
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">ID Status</label>
                        <select
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all cursor-pointer"
                          value={formData.membershipStatus}
                          onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value })}
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="revoked">Revoked</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">Tenure</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-900 focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-emerald-300 transition-all cursor-pointer"
                        value={formData.tenure}
                        onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                      >
                        <option value="">Select Tenure</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2022-2023">2022-2023</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Digital Connections */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest shrink-0">Digital Connections</h4>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput label="LinkedIn Profile" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                    <ModalInput label="GitHub Handle" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
                    <ModalInput label="Facebook URL" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
                    <ModalInput label="Portfolio Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                    <ModalInput label="Twitter / X" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} />
                    <ModalInput label="Instagram" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
                    <ModalInput label="TikTok" value={formData.tiktok} onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })} />
                    <ModalInput label="YouTube" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex gap-4 mt-auto bg-gray-50/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-white hover:text-gray-700 transition-all shadow-sm focus:ring-2 focus:ring-gray-200"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-secondary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all focus:ring-4 focus:ring-secondary/20 flex items-center justify-center gap-2"
                >
                  <FaCheckCircle className="text-sm" />
                  {editingUser ? "Save Updates" : "Enroll Member"}
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }
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
    </div >
  );
}


export default AdminUsers;
