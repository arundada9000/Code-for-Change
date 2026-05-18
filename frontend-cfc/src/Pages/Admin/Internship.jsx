import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaTimes,
  FaExternalLinkAlt,
  FaPhone,
  FaEnvelope,
  FaLayerGroup,
  FaCheckCircle,
  FaClock,
  FaFileWord,
  FaEye,
  FaFileAlt,
  FaFilePdf,
  FaFileCsv,
  FaDownload,
  FaRegCalendarAlt,
  FaTrash,
  FaChevronRight,
  FaUniversity,
} from "react-icons/fa";
import { BsThreeDotsVertical, BsTrash, BsEye } from "react-icons/bs";
import DocxViewer from "../../Components/Common/DocxViewer";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import DebouncedSearchInput from "../../Components/UI/DebouncedSearchInput";

const TRACKS = [
  "Frontend",
  "Backend",
  "UI/UX Design",
  "Fullstack",
  "Mobile App",
  "Digital Marketing",
  "Content Writing",
  "Project Management",
  "Others"
];

const STATUS_OPTIONS = ["Pending", "Verified", "Rejected"];

function Internship() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTrack, setActiveTrack] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [search, activeTrack, activeStatus, startDate, endDate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeTrack !== "All") params.append("track", activeTrack);
      if (activeStatus !== "All") params.append("status", activeStatus);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const { data } = await API.get(`/internships/applications?${params.toString()}`);
      setApplications(data.data || []);
    } catch (error) {
      console.error("Failed to fetch applications", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/internships/applications/${id}/status`, { status });
      setApplications((apps) =>
        apps.map((app) => (app._id === id ? { ...app, status } : app)),
      );
      if (selectedApp?._id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
      toast.success(`Application ${status.toLowerCase()} successfully`);
      setOpenMenuId(null);
    } catch (error) {
        console.error("Status Update Error:", error);
        toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    try {
      await API.delete(`/internships/applications/${appToDelete._id}`);
      setApplications(applications.filter(a => a._id !== appToDelete._id));
      setDeleteModalOpen(false);
      setAppToDelete(null);
      toast.success("Application removed successfully");
    } catch (error) {
      console.error("Deletion Error:", error);
      toast.error("Failed to delete application");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setActiveTrack("All");
    setActiveStatus("All");
    setStartDate("");
    setEndDate("");
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(applications.map(a => ({
      Name: a.fullName,
      Email: a.email,
      Phone: a.contactNumber,
      College: a.college,
      Track: a.track,
      Status: a.status,
      AppliedAt: new Date(a.createdAt).toLocaleDateString()
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CFC_Applications_${Date.now()}.csv`);
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
    doc.text("Internship Applications List", 14, 30);
    
    const tableColumn = ["Name", "Track", "College", "Status", "Date"];
    const tableRows = applications.map(a => [
      a.fullName,
      a.track,
      a.college,
      a.status,
      new Date(a.createdAt).toLocaleDateString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`CFC_Applications_${Date.now()}.pdf`);
    toast.success("PDF Exported successfully");
  };

  if (loading && applications.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Internship Applications</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Candidate Review & Onboarding</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 mr-4">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl text-center border border-emerald-100">
               <p className="text-[9px] font-black text-emerald-600 uppercase">Verified</p>
               <p className="text-lg font-black text-emerald-700 leading-none">{applications.filter(a => a.status === 'Verified').length}</p>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-xl text-center border border-amber-100">
               <p className="text-[9px] font-black text-amber-600 uppercase">Pending</p>
               <p className="text-lg font-black text-amber-700 leading-none">{applications.filter(a => a.status === 'Pending').length}</p>
            </div>
          </div>

          <div className="relative group/export">
            <button className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest">
              <FaDownload className="text-lg text-emerald-500" /> Export Records
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 py-3 overflow-hidden">
              <button onClick={exportToCSV} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border-b border-gray-50">
                <FaFileCsv className="text-emerald-500" /> CSV Spreadsheet
              </button>
              <button onClick={exportToPDF} className="w-full px-6 py-3 text-left flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                <FaFilePdf className="text-rose-500" /> PDF Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search and Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <DebouncedSearchInput
              placeholder="Search by candidate name or email..."
              className="w-full pl-16 pr-8 py-4 bg-slate-50 rounded-xl outline-none text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={search}
              onSearch={setSearch}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={activeTrack}
              onChange={(e) => setActiveTrack(e.target.value)}
            >
              <option value="All">All Tracks</option>
              {TRACKS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              className="px-6 py-4 bg-slate-50 rounded-xl outline-none text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent"
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
            >
              <option value="All">Any Status</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center border-t border-slate-50 pt-4">
            <div className="flex items-center gap-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applied From:</label>
                 <input 
                    type="date" 
                    className="px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all"
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                 />
            </div>
            <div className="flex items-center gap-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">To:</label>
                 <input 
                    type="date" 
                    className="px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 outline-none hover:bg-slate-100 transition-all"
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                 />
            </div>
            <div className="flex-1 text-right">
                <button 
                    onClick={clearFilters}
                    className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center gap-2 ml-auto"
                >
                    <FaTimes /> Reset Filters
                </button>
            </div>
        </div>
      </div>

      {/* 3. Applications Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-6">Applicant</th>
                <th className="px-8 py-6">Discipline</th>
                <th className="px-8 py-6">Applied For</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Loading Applications...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-black uppercase tracking-widest">No matching applications</td></tr>
              ) : applications.map((app, index) => (
                <tr key={app._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-100/50 transition-all group`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black italic shadow-lg group-hover:scale-110 transition-transform">
                        {app.fullName[0]}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{app.fullName}</div>
                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{app.college || "Independent Candidate"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      {app.track}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      {app.internshipId?.title || "General Application"}
                    </div>
                    {app.internshipId?.companyName && (
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                        @ {app.internshipId.companyName}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] ${
                      app.status === 'Verified' ? 'text-emerald-500' : 
                      app.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                      {app.status === 'Verified' ? <FaCheckCircle /> : 
                       app.status === 'Rejected' ? <FaTimes /> : <FaClock />}
                      {app.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === app._id ? null : app._id)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {openMenuId === app._id && (
                      <div className="absolute right-20 top-6 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in slide-in-from-right-5 duration-200">
                         <button 
                          onClick={() => {
                            setSelectedApp(app);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                        >
                          <BsEye className="text-emerald-500" /> View Details
                        </button>
                         <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                         {app.status === 'Pending' && (
                           <>
                             <button 
                              onClick={() => handleUpdateStatus(app._id, 'Verified')}
                              className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-emerald-600 hover:bg-emerald-50 transition-all uppercase tracking-widest"
                            >
                              <FaCheckCircle /> Verify Candidate
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                              className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                            >
                              <FaTimes /> Reject Entry
                            </button>
                            <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                           </>
                         )}
                        <button 
                          onClick={() => { 
                              setAppToDelete(app);
                              setDeleteModalOpen(true);
                              setOpenMenuId(null); 
                          }}
                          className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                        >
                          <BsTrash /> Remove Record
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Detailed Dossier Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
          <div className="bg-white w-full max-w-7xl h-full md:h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* --- Sticky Header --- */}
            <div className="px-6 py-5 md:px-10 md:py-8 border-b flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden sm:flex w-12 h-12 md:w-16 md:h-16 bg-slate-900 text-white rounded-2xl items-center justify-center text-xl md:text-2xl font-black italic shadow-lg">
                  {selectedApp.fullName[0]}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter uppercase">
                    {selectedApp.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="hidden xs:block text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l pl-2">
                       {selectedApp.internshipId ? `APPLIED FOR: ${selectedApp.internshipId.title} @ ${selectedApp.internshipId.companyName}` : `TRACK: ${selectedApp.track}`}
                    </span>
                    <span className="hidden xs:block text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l pl-2">
                       SUBMITTED: {new Date(selectedApp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedApp(null);
                  setShowViewer(false);
                }}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 hover:bg-slate-900 hover:text-white rounded-2xl transition-all group"
              >
                <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50">
              {/* Left Side: Candidate Dossier */}
              <div className="w-full md:w-[350px] lg:w-[400px] border-r bg-white overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-10">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <a href={`mailto:${selectedApp.email}`} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:text-emerald-500"><FaEnvelope size={12} /></div>
                      <span className="text-xs font-bold text-gray-600 truncate">{selectedApp.email}</span>
                    </a>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-transparent">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><FaPhone size={12} /></div>
                      <span className="text-xs font-bold text-gray-600">{selectedApp.contactNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-transparent">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><FaUniversity size={12} /></div>
                      <span className="text-xs font-bold text-gray-600">{selectedApp.college || "N/A"}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Application Summary</h4>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 border-dashed italic">
                    <p className="text-xs md:text-sm leading-relaxed text-gray-500 font-medium whitespace-pre-wrap">
                      "{selectedApp.coverLetter || "No summary provided."}"
                    </p>
                  </div>
                </section>

                <section className="pt-6 border-t space-y-3">
                  {selectedApp.status === "Pending" ? (
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => handleUpdateStatus(selectedApp._id, "Verified")} className="py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                            <FaCheckCircle /> Verify
                        </button>
                        <button onClick={() => handleUpdateStatus(selectedApp._id, "Rejected")} className="py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
                            <FaTimes /> Reject
                        </button>
                    </div>
                  ) : (
                    <div className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border ${
                        selectedApp.status === "Verified" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    }`}>
                      {selectedApp.status === "Verified" ? <FaCheckCircle /> : <FaTimes />} Entry: {selectedApp.status}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Side: Document Engine */}
              <div className="flex-1 flex flex-col bg-gray-100">
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      {selectedApp.resumeUrl?.includes('.pdf') ? <FaFilePdf className="text-rose-400" /> : <FaFileWord className="text-blue-400" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden sm:block">CREDENTIAL_VAULT_BETA</span>
                  </div>
                  {!showViewer && (
                    <button onClick={() => setShowViewer(true)} className="px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg">
                      <FaEye /> Initialize Render
                    </button>
                  )}
                </div>

                <div className="flex-1 relative bg-slate-700 overflow-hidden">
                  {showViewer ? (
                    <div className="w-full h-full animate-in fade-in slide-in-from-right-5 duration-500">
                      {selectedApp.resumeUrl?.includes('.pdf') ? (
                        <iframe src={`${selectedApp.resumeUrl}#toolbar=0`} className="w-full h-full border-none shadow-2xl" title="PDF Resume" />
                      ) : (
                        <div className="h-full overflow-y-auto bg-gray-200 p-4 md:p-8">
                          <div className="max-w-4xl mx-auto bg-white shadow-2xl min-h-full rounded-sm"><DocxViewer url={selectedApp.resumeUrl} /></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-800">
                      <div className="w-24 h-24 bg-slate-700 rounded-[2rem] flex items-center justify-center mb-6 border-4 border-slate-600 shadow-2xl animate-pulse"><FaFileAlt size={30} className="text-slate-500" /></div>
                      <h5 className="text-white font-black text-xl tracking-tight uppercase italic">Secure Document Preview</h5>
                      <p className="mt-2 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] max-w-xs">Credentials ready for verification. Decrypt viewer to proceed.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Application"
        message={`Are you sure you want to permanently remove ${appToDelete?.fullName}'s record? This action cannot be reversed.`}
      />
    </div>
  );
}

export default Internship;
