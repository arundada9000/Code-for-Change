import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaWallet, 
  FaHandHoldingHeart, 
  FaCheckCircle, 
  FaClock, 
  FaFileCsv, 
  FaTimes, 
  FaEye, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaInfoCircle,
  FaArrowRight,
  FaUniversity,
  FaShieldAlt,
  FaDownload,
  FaPlus,
  FaEdit,
  FaFilePdf,
  FaFileWord,
  FaTags,
  FaCloudUploadAlt,
  FaFileImage
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { useAuth } from "../../Context/AuthContext";

function AdminDonations() {
  const { hasPermission } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalAmount: 0, pendingCount: 0, verifiedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [filterProvince, setFilterProvince] = useState("All");
  const PROVINCES = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];
  
  const [formData, setFormData] = useState({
    donorName: "",
    amount: "",
    paymentMethod: "eSewa",
    category: "General",
    transactionId: "",
    receiverAccount: "",
    remarks: "",
    isAnonymous: false,
    province: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, [filterMethod, filterProvince]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterMethod !== "All") params.append("paymentMethod", filterMethod);
      if (filterProvince !== "All") params.append("province", filterProvince);
      
      const res = await API.get(`/admin/donations?${params.toString()}`);
      setDonations(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch donations");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/donations/stats");
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/admin/donations/${id}/status`, { status });
      toast.success(`Donation marked as ${status}`);
      fetchDonations();
      fetchStats();
      setOpenMenuId(null);
      if (selectedDonation && selectedDonation._id === id) {
        setSelectedDonation({ ...selectedDonation, status });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (receiptFile) {
        data.append("receipt", receiptFile);
      }

      if (isEditing) {
        await API.put(`/admin/donations/${selectedDonation._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Record updated successfully");
      } else {
        await API.post("/donations", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Manual record added");
      }
      fetchDonations();
      fetchStats();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      donorName: "",
      amount: "",
      paymentMethod: "eSewa",
      category: "General",
      transactionId: "",
      receiverAccount: "",
      remarks: "",
      isAnonymous: false,
      province: "",
      email: "",
      phone: ""
    });
    setReceiptFile(null);
    setReceiptPreview("");
    setShowAddModal(false);
    setIsEditing(false);
    setSelectedDonation(null);
  };

  const handleEdit = (donation) => {
    setFormData({
      donorName: donation.donorName,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod,
      category: donation.category || "General",
      transactionId: donation.transactionId,
      receiverAccount: donation.receiverAccount,
      remarks: donation.remarks || "",
      isAnonymous: donation.isAnonymous,
      province: donation.province || "",
      email: donation.email || "",
      phone: donation.phone || ""
    });
    setReceiptPreview(donation.receipt || "");
    setSelectedDonation(donation);
    setIsEditing(true);
    setShowAddModal(true);
    setOpenMenuId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredDonations.map(d => ({
      Donor: d.donorName,
      Amount: d.amount,
      Method: d.paymentMethod,
      Category: d.category || "General",
      "Transaction ID": d.transactionId,
      Receiver: d.receiverAccount,
      Province: d.province || "N/A",
      Status: d.status,
      Date: new Date(d.createdAt).toLocaleDateString()
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CFC_Donations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text("Code For Change", 14, 20);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Donation Financial Ledger", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    
    const tableColumn = ["Date", "Donor", "Province", "Amount", "Method", "Category", "Trx ID", "Status"];
    const tableRows = filteredDonations.map(d => [
      new Date(d.createdAt).toLocaleDateString(),
      d.donorName,
      d.province || "N/A",
      `Rs. ${d.amount}`,
      d.paymentMethod,
      d.category || "General",
      d.transactionId,
      d.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontWeight: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`CFC_Financial_Report_${Date.now()}.pdf`);
    toast.success("PDF Exported successfully");
  };

  const exportToWord = () => {
    let content = "CODE FOR CHANGE\nDONATION FINANCIAL REPORT\n\n";
    content += `Report Date: ${new Date().toLocaleString()}\n`;
    content += "==========================================\n\n";
    
    filteredDonations.forEach((d, index) => {
      content += `${index + 1}. CONTRIBUTOR PROFILE\n`;
      content += `   Name: ${d.donorName}\n`;
      content += `   Province: ${d.province || "N/A"}\n`;
      content += `   Amount: Rs. ${d.amount}\n`;
      content += `   Protocol: ${d.paymentMethod}\n`;
      content += `   Registry: ${d.category || "General"}\n`;
      content += `   Dossier ID: ${d.transactionId}\n`;
      content += `   Status: ${d.status}\n`;
      content += `   Timestamp: ${new Date(d.createdAt).toLocaleString()}\n`;
      content += "------------------------------------------\n";
    });
    
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CFC_Donation_Report_${Date.now()}.doc`;
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
              donorName: row.Donor || row.donorName || "Imported Record",
              amount: Number(row.Amount || row.amount || 0),
              paymentMethod: row.Method || row.paymentMethod || "Other",
              category: row.Category || row.category || "General",
              transactionId: row["Transaction ID"] || row.transactionId || `IMP-${Date.now()}-${Math.random()}`,
              receiverAccount: row.Receiver || row.receiverAccount || "CFC Main",
              province: row.Province || row.province || "",
              isAnonymous: row.isAnonymous === 'true' || row.isAnonymous === true
            };
            if (payload.amount > 0) {
              await API.post("/donations", payload);
              count++;
            }
          }
          toast.success(`Successfully imported ${count} records`);
          fetchDonations();
          fetchStats();
        } catch (error) {
          toast.error("Import failed: Some records may have duplicate Transaction IDs");
        }
      }
    });
  };

  const filteredDonations = donations.filter(d => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = d.donorName.toLowerCase().includes(searchLow) || 
                          d.transactionId.toLowerCase().includes(searchLow) ||
                          (d.category && d.category.toLowerCase().includes(searchLow));
    const matchesMethod = filterMethod === "All" || d.paymentMethod === filterMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">Financial Ledger</h2>
          <p className="text-gray-500 font-medium mt-1">Audit contributions and manage verification workflows with precision.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Ghost UI Style for Import */}
          <label className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest cursor-pointer group">
            <FaDownload className="text-emerald-500 group-hover:bounce" /> Import Record
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          
          <div className="relative group/export">
            <button className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest">
              <FaFileCsv className="text-lg text-emerald-500" /> Export Data
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

          {hasPermission('donation_create') && (
            <button 
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center justify-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest"
            >
              <FaPlus className="text-lg" /> Create Manual Entry
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="bg-emerald-50 p-5 rounded-3xl text-emerald-600 text-3xl group-hover:scale-110 transition-transform">
            <FaHandHoldingHeart />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Total Verified</p>
            <h3 className="text-3xl font-black text-gray-900 leading-none">Rs. {stats.totalAmount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="bg-amber-50 p-5 rounded-3xl text-amber-600 text-3xl group-hover:scale-110 transition-transform">
            <FaClock />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Awaiting Audit</p>
            <h3 className="text-3xl font-black text-gray-900 leading-none">{stats.pendingCount} <span className="text-sm text-gray-400 font-bold uppercase ml-1">Entries</span></h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="bg-blue-50 p-5 rounded-3xl text-blue-600 text-3xl group-hover:scale-110 transition-transform">
            <FaShieldAlt />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Verified records</p>
            <h3 className="text-3xl font-black text-gray-900 leading-none">{stats.verifiedCount} <span className="text-sm text-gray-400 font-bold uppercase ml-1">Records</span></h3>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full max-w-xl group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by donor, transaction ID, or category..."
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl w-full">
            <FaWallet className="text-gray-400" />
            <select 
              className="bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer w-full"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="All">All Gateways</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="ConnectIPS">ConnectIPS</option>
              <option value="Cash">Cash Ledger</option>
              <option value="Card">Direct Card Payment</option>
              <option value="Other">External Gateway</option>
            </select>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl w-full">
            <select 
              className="bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer w-full"
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
            >
              <option value="All">All Provinces</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contributor</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Retrieving Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center text-gray-400 italic">No records found matching your criteria.</td>
                </tr>
              ) : filteredDonations.map((d) => (
                <tr key={d._id} className="hover:bg-emerald-50/30 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-xs shadow-lg group-hover:scale-110 transition-transform italic">
                        {d.donorName[0]}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 block tracking-tight uppercase">{d.donorName}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()} • {d.province || "All Provinces"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="font-black text-gray-900 text-lg">Rs. {d.amount.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">#{d.transactionId}</div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="flex items-center gap-2 text-[10px] font-black text-gray-500 bg-gray-100 px-4 py-2 rounded-xl w-fit uppercase tracking-tighter shadow-sm">
                      <FaTags className="text-emerald-500" /> {d.category || "General"}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      d.status === 'Verified' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : d.status === 'Rejected'
                      ? 'bg-rose-50 text-rose-500 border-rose-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                    }`}>
                      {d.status === 'Verified' ? <FaCheckCircle /> : d.status === 'Rejected' ? <FaTimes /> : <FaClock />}
                      {d.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === d._id ? null : d._id)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      <BsThreeDotsVertical />
                    </button>

                    {openMenuId === d._id && (
                      <div className="absolute right-10 top-16 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-3 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={() => { setSelectedDonation(d); setOpenMenuId(null); }}
                          className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          <FaEye className="text-blue-500" /> Quick View
                        </button>
                        <button
                          onClick={() => handleEdit(d)}
                          className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-all"
                        >
                          <FaEdit /> Modify Record
                        </button>
                        {hasPermission('donation_verify') && d.status !== 'Verified' && (
                          <button
                            onClick={() => handleUpdateStatus(d._id, 'Verified')}
                            className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-all"
                          >
                            <FaCheckCircle /> Authorize Payment
                          </button>
                        )}
                        {hasPermission('donation_verify') && d.status !== 'Rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(d._id, 'Rejected')}
                            className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <FaTimes /> Reject Entry
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
          {loading ? (
             <div className="p-10 text-center text-slate-400">Loading records...</div>
          ) : filteredDonations.length === 0 ? (
             <div className="p-10 text-center text-slate-400">No records found.</div>
          ) : (
            filteredDonations.map((d) => (
              <div key={d._id} className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 shadow-sm relative overflow-visible">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-xs shadow-md">
                          {d.donorName[0]}
                       </div>
                       <div>
                          <h3 className="font-black text-slate-900 text-sm leading-tight">{d.donorName}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">#{d.transactionId}</p>
                       </div>
                    </div>
                    <button 
                       onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === d._id ? null : d._id);
                       }}
                       className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shadow-sm"
                    >
                       <BsThreeDotsVertical />
                    </button>
                 </div>

                 {/* Mobile Dropdown */}
                 {openMenuId === d._id && (
                    <div className="absolute top-14 right-4 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in">
                       <button onClick={() => { setSelectedDonation(d); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50">Quick View</button>
                       <button onClick={() => { handleEdit(d); }} className="w-full px-4 py-2 text-left text-xs font-bold text-amber-600 hover:bg-amber-50">Modify</button>
                       {hasPermission('donation_verify') && d.status !== 'Verified' && (
                          <button onClick={() => handleUpdateStatus(d._id, 'Verified')} className="w-full px-4 py-2 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50">Authorize</button>
                       )}
                       {hasPermission('donation_verify') && d.status !== 'Rejected' && (
                          <button onClick={() => handleUpdateStatus(d._id, 'Rejected')} className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50">Reject</button>
                       )}
                     </div>
                 )}

                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Amount</p>
                       <p className="text-sm font-black text-emerald-600">Rs. {d.amount.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocol</p>
                       <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">{d.paymentMethod}</p>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      d.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 
                      d.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {d.status === 'Verified' ? <FaCheckCircle /> : <FaClock />} {d.status}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Record / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-2 block">{isEditing ? "Modify Entry" : "New Entry"}</span>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{isEditing ? "Update donation" : "Create Donation Record"}</h3>
              </div>
              <button onClick={resetForm} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all relative z-10 group">
                <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 custom-scrollbar overflow-y-auto max-h-[75vh]">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Donor Full Name</label>
                  <input 
                    required 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight"
                    value={formData.donorName}
                    onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (NPR)</label>
                  <input 
                    required 
                    type="number"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method (Nepal)</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-black text-[10px] tracking-widest uppercase cursor-pointer"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="eSewa">eSewa Mobile Wallet</option>
                    <option value="Khalti">Khalti Digital Wallet</option>
                    <option value="Bank Transfer">Direct Bank Transfer</option>
                    <option value="ConnectIPS">ConnectIPS Protocol</option>
                    <option value="Cash">Cash / Offline Ledger</option>
                    <option value="Card">Direct Card Payment</option>
                    <option value="Other">External Gateway</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category / Purpose</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-black text-[10px] tracking-widest uppercase cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="General">General Contribution</option>
                    <option value="Project">Specific Project Aid</option>
                    <option value="Event">Event Sponsorship</option>
                    <option value="Charity">Special Charity Drive</option>
                    <option value="Emergency">Emergency Relief Fund</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Province</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-black text-[10px] tracking-widest uppercase cursor-pointer"
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                  >
                    <option value="">Select Province</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction Dossier ID</label>
                  <input 
                    required 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Receiver Account</label>
                  <input 
                    required 
                    placeholder="e.g. CFC Central Bank AC"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight"
                    value={formData.receiverAccount}
                    onChange={(e) => setFormData({...formData, receiverAccount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                  <input 
                    type="email"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone (Optional)</label>
                  <input 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Audit Remarks / History</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight h-32"
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox"
                      hidden
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                    />
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${formData.isAnonymous ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200 group-hover:border-emerald-500'}`}>
                      {formData.isAnonymous && <FaCheckCircle className="text-white text-xs" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Confidential / Anonymous Entry</span>
                  </label>
                </div>
                
                {/* Receipt Upload */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Receipt (Optional Image)</label>
                  <div 
                    onClick={() => document.getElementById('receipt-upload').click()}
                    className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${receiptPreview ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-500'}`}
                  >
                    <input 
                      id="receipt-upload"
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={handleFileChange} 
                    />
                    {receiptPreview ? (
                      <div className="relative group">
                        <img src={receiptPreview} alt="Receipt Preview" className="h-40 w-auto rounded-2xl shadow-lg object-cover" />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaCloudUploadAlt className="text-white text-2xl" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="text-gray-300 text-4xl" />
                        <div className="text-center">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Click to upload receipt photo</p>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase">Supports JPEG, PNG, WEBP (Max 5MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                 <button type="submit" disabled={submitting} className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all disabled:opacity-50">
                  {submitting ? "Processing..." : (isEditing ? "Synchronize Updates" : "Confirm Physical Record")}
                </button>
                <button type="button" onClick={resetForm} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedDonation && !showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-white/20">
            {/* Modal Header */}
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-2 block">Dossier ID: {selectedDonation.transactionId}</span>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Dossier Profile</h3>
              </div>
              <button 
                onClick={() => setSelectedDonation(null)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all relative z-10 group"
              >
                <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-10 space-y-10 custom-scrollbar overflow-y-auto max-h-[70vh]">
              {/* Contributor Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-[2px] w-8 bg-emerald-500"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Contributor Info</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Full Name</p>
                    <p className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                      <FaUser className="text-emerald-500 text-xs" /> {selectedDonation.donorName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact Identity</p>
                    <p className="text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                      <FaPhone className="text-emerald-500 text-xs" /> {selectedDonation.phone || "No Contact Provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Record</p>
                    <p className="text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                      <FaEnvelope className="text-emerald-500 text-xs" /> {selectedDonation.email || "Private Ledger"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Privacy level</p>
                    <p className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                      <FaShieldAlt className="text-emerald-500 text-xs" /> {selectedDonation.isAnonymous ? "ANONYMOUS" : "PUBLIC RECORD"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Financial Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-[2px] w-8 bg-emerald-500"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Transaction Dossier</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Contribution Sum</p>
                    <p className="text-4xl font-black italic tracking-tighter">Rs. {selectedDonation.amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Gateway Protocol</p>
                    <p className="text-2xl font-black text-emerald-800 flex items-center gap-3">
                      <FaWallet /> {selectedDonation.paymentMethod}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Receiver Registry</p>
                    <p className="text-sm font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter italic">
                      <FaUniversity className="text-slate-400" /> {selectedDonation.receiverAccount}
                    </p>
                  </div>
                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Transaction ID</p>
                    <p className="text-sm font-black text-blue-600 font-mono tracking-widest">
                      #{selectedDonation.transactionId}
                    </p>
                  </div>
                </div>

                {/* Verification Audit Log */}
                <div className="mt-6 flex flex-col gap-6">
                  {selectedDonation.receipt && (
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FaFileImage className="text-emerald-500" /> Digital Receipt Record
                      </p>
                      <a 
                        href={selectedDonation.receipt} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="relative group overflow-hidden rounded-2xl"
                      >
                        <img 
                          src={selectedDonation.receipt} 
                          alt="Donation Receipt" 
                          className="w-full h-auto max-h-60 object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-black text-xs uppercase tracking-widest">Open Full Resolution</span>
                        </div>
                      </a>
                    </div>
                  )}

                  {selectedDonation.status === 'Verified' && (
                    <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                          <FaCheckCircle className="text-xl" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Authorized By</p>
                          <p className="text-sm font-black text-slate-900 uppercase">{selectedDonation.verifiedBy || 'System Administrator'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verification Time</p>
                        <p className="text-sm font-black text-gray-600">{new Date(selectedDonation.verifiedAt || selectedDonation.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Remarks Section */}
              <section className="bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <FaInfoCircle className="text-emerald-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Audit Remarks</h4>
                </div>
                <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                  "{selectedDonation.remarks || "No additional audit remarks provided for this transaction."}"
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-gray-50 border-t flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => handleEdit(selectedDonation)}
                className="px-8 py-5 bg-white text-amber-600 border border-amber-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-50 transition-all flex items-center justify-center gap-3"
              >
                <FaEdit /> Modify Profile
              </button>
              {selectedDonation.status === 'Pending' ? (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedDonation._id, 'Verified')}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                  >
                    <FaCheckCircle /> Authorize Payment
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedDonation._id, 'Rejected')}
                    className="flex-1 py-5 bg-white text-rose-500 border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 transition-all flex items-center justify-center gap-3"
                  >
                    <FaTimes /> Reject Entry
                  </button>
                </>
              ) : (
                <div className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 border ${
                  selectedDonation.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                }`}>
                  {selectedDonation.status === 'Verified' ? <><FaCheckCircle /> Verified Record</> : <><FaTimes /> Entry Rejected</>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDonations;