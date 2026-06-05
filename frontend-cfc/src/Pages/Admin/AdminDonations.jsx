import React, { useState } from "react";
import { FaDownload, FaFileCsv, FaFilePdf, FaFileWord, FaPlus, FaSearch, FaWallet, FaTags } from "react-icons/fa";
import Papa from "papaparse";
import { useAuth } from "../../Context/AuthContext";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import DebouncedSearchInput from "../../Components/UI/DebouncedSearchInput";
import { compressImage } from "../../utils/imageCompressor";

// Custom Hooks and Utils
import { useDonations, PROVINCES, INITIAL_FORM_DATA } from "../../Hooks/useDonations";
import {
  exportDonationsToCSV,
  exportDonationsToPDF,
  exportDonationsToWord,
} from "../../utils/donationExportUtils";

// Components
import DonationStats from "../../Components/Admin/Donations/DonationStats";
import DonationTable from "../../Components/Admin/Donations/DonationTable";
import DonationDetailModal from "../../Components/Admin/Donations/DonationDetailModal";
import DonationFormModal from "../../Components/Admin/Donations/DonationFormModal";

function AdminDonations() {
  const { hasPermission } = useAuth();
  
  // Custom Hook
  const {
    filteredDonations,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterMethod,
    setFilterMethod,
    filterProvince,
    setFilterProvince,
    updateStatus,
    submitDonation,
    importDonationsFromCSV,
  } = useDonations();

  // Local UI State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Handlers
  const handleEdit = (d) => {
    setIsEditing(true);
    setFormData({
      donorName: d.donorName || "",
      amount: d.amount || "",
      paymentMethod: d.paymentMethod || "eSewa",
      category: d.category || "General",
      transactionId: d.transactionId || "",
      receiverAccount: d.receiverAccount || "",
      remarks: d.remarks || "",
      isAnonymous: d.isAnonymous || false,
      province: d.province || "",
      email: d.email || "",
      phone: d.phone || "",
    });
    setReceiptPreview(d.receipt || "");
    setSelectedDonation(d);
    setShowAddModal(true);
    setOpenMenuId(null);
  };

  const handleUpdateStatus = async (id, status) => {
    const success = await updateStatus(id, status);
    if (success) {
      setOpenMenuId(null);
      if (selectedDonation && selectedDonation._id === id) {
        setSelectedDonation({ ...selectedDonation, status });
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file: compressedFile } = await compressImage(file);
      const fileToUse = compressedFile || file;
      setReceiptFile(fileToUse);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(fileToUse);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setReceiptFile(null);
    setReceiptPreview("");
    setShowAddModal(false);
    setIsEditing(false);
    setSelectedDonation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await submitDonation(
      formData,
      receiptFile,
      isEditing,
      selectedDonation?._id
    );
    if (success) resetForm();
    setSubmitting(false);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await importDonationsFromCSV(results.data);
      },
    });
  };

  if (loading && filteredDonations.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Financial Ledger
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Audit contributions and manage verification workflows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 px-5 py-3 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest cursor-pointer">
            <FaDownload className="text-emerald-500" /> Import
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
          </label>

          <div className="relative group/export">
            <button className="flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 px-5 py-3 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest">
              <FaFileCsv className="text-emerald-500" /> Export
            </button>
            <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 translate-y-2 group-hover/export:translate-y-0">
              <button
                onClick={() => exportDonationsToCSV(filteredDonations)}
                className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 uppercase tracking-widest"
              >
                <FaFileCsv className="text-emerald-500 text-sm" /> CSV File
              </button>
              <button
                onClick={() => exportDonationsToPDF(filteredDonations)}
                className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 uppercase tracking-widest border-t border-slate-100"
              >
                <FaFilePdf className="text-rose-500 text-sm" /> PDF Document
              </button>
              <button
                onClick={() => exportDonationsToWord(filteredDonations)}
                className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 uppercase tracking-widest border-t border-slate-100"
              >
                <FaFileWord className="text-blue-500 text-sm" /> MS Word
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 font-bold text-[10px] uppercase tracking-widest"
          >
            <FaPlus /> Manual Entry
          </button>
        </div>
      </div>

      <DonationStats stats={stats} />

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-2/5 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <FaSearch />
          </div>
          <DebouncedSearchInput
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Search by Donor, Txn ID, or Category..."
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-emerald-500">
              <FaWallet />
            </div>
            <select
              className="w-full sm:w-48 pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[10px] font-bold uppercase tracking-widest cursor-pointer text-slate-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all shadow-sm appearance-none"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="All">All Methods</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Bank Transfer">Bank</option>
              <option value="ConnectIPS">ConnectIPS</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-blue-500">
              <FaTags />
            </div>
            <select
              className="w-full sm:w-48 pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[10px] font-bold uppercase tracking-widest cursor-pointer text-slate-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm appearance-none"
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
            >
              <option value="All">All Provinces</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <DonationTable
        loading={loading}
        filteredDonations={filteredDonations}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        setSelectedDonation={setSelectedDonation}
        handleEdit={handleEdit}
        handleUpdateStatus={handleUpdateStatus}
        hasPermission={hasPermission}
      />

      <DonationFormModal
        showAddModal={showAddModal}
        isEditing={isEditing}
        resetForm={resetForm}
        formData={formData}
        setFormData={setFormData}
        handleFileChange={handleFileChange}
        receiptPreview={receiptPreview}
        handleSubmit={handleSubmit}
        submitting={submitting}
        PROVINCES={PROVINCES}
      />

      <DonationDetailModal
        selectedDonation={selectedDonation}
        setSelectedDonation={setSelectedDonation}
        handleEdit={handleEdit}
        handleUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default AdminDonations;
