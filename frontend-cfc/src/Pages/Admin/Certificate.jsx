import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaPlus,
  FaQrcode,
  FaTimes,
  FaFingerprint,
  FaDownload,
  FaCamera,
  FaSearch,
  FaFilter,
  FaTrash,
  FaExternalLinkAlt,
  FaEye,
} from "react-icons/fa";
import { BsThreeDotsVertical, BsTrash, BsDownload } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import JSZip from "jszip";
import CertificatePreview from "../../Components/UI/CertificatePreview";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";
import BulkCertificateModal from "./BulkCertificateModal";
import { useAuth } from "../../Context/AuthContext";
import { useDebounce } from "../../Hooks/useDebounce";
import logo from "../../assets/logo.png";

function Certificate() {
  const { hasPermission } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [provinceFilter, setProvinceFilter] = useState("All");
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

  // Strict 2-letter region codes matching the backend dictionary exactly
  const PROVINCE_REGIONS = {
    Kathmandu: "KA", Pokhara: "PO", Rupandehi: "RU", Dang: "DA",
    Birgunj: "BI", Farwest: "FW", Koshi: "KO", Chitwan: "CH", "LB Karnali": "LB",
  };

  // Template defaults per certificate type — pre-fills the dynamic text fields
  const TEMPLATE_DEFAULTS = {
    Training: { header: "Certificate", subHeader: "OF ACHIEVEMENT", tagline: "on successfully completing", primaryDetail: "professional" },
    Bootcamp: { header: "Certificate", subHeader: "OF ACHIEVEMENT", tagline: "on successfully completing", primaryDetail: "professional" },
    Workshop: { header: "Certificate", subHeader: "OF ACHIEVEMENT", tagline: "on successfully completing", primaryDetail: "professional" },
    Internship: { header: "Experience", subHeader: "CREDENTIAL", tagline: "has successfully completed an internship in", primaryDetail: "as a Trainee / Intern in" },
    Event: { header: "Participation", subHeader: "CERTIFICATE", tagline: "for active participation and achievement in", primaryDetail: "during the grand event of" },
    Hackathon: { header: "Participation", subHeader: "CERTIFICATE", tagline: "for active participation and achievement in", primaryDetail: "during the grand event of" },
  };

  // ── Modal UI Styling Classes ──
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1";
  const inputClass = "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-white transition-all shadow-sm placeholder:text-slate-400";

  // ── Bulk Generation State ─────────────────────────────────────────────────
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [debouncedSearchTerm, statusFilter, typeFilter, provinceFilter]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (typeFilter !== "All") params.append("certificateType", typeFilter);
      if (provinceFilter !== "All") params.append("province", provinceFilter);

      const { data } = await API.get(
        `/certificates/ledger?${params.toString()}`,
      );
      setCertificates(data.data || []);
    } catch (error) {
      console.error("Failed to fetch certificates", error);
      toast.error("Failed to load certificates ledger");
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.patch(`/certificates/${id}/status`, { status: newStatus });
      setCertificates(
        certificates.map((c) =>
          c._id === id ? { ...c, status: newStatus } : c,
        ),
      );
      setOpenMenuId(null);
      toast.success(`Certificate ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Failed to update status");
    }
  };

  const handlePreview = (cert) => {
    setPreviewData(cert);
    setIsPreviewOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!certToDelete) return;
    try {
      await API.delete(`/certificates/${certToDelete._id}`);
      setCertificates(certificates.filter((c) => c._id !== certToDelete._id));
      setDeleteModalOpen(false);
      setCertToDelete(null);
      toast.success("Certificate record removed");
    } catch (error) {
      console.error("Deletion Error:", error);
      toast.error("Failed to delete record");
    }
  };

  const generatePDF = async (cert) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const qrValue = `${window.location.origin}/certificate-verification/${cert.certificateId}`;

    // Generate QR Code as DataURL
    const generateQRCodeDataURL = async (value) => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("QR Generation Error:", e);
        return null;
      }
    };

    const qrCodeDataURL = await generateQRCodeDataURL(qrValue);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Decorative Borders
    doc.setDrawColor(15, 23, 42); // primary
    doc.setLineWidth(4);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // outer

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16); // thin inner

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.5);
    doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19); // medium inner

    // 2. Branding (Top Left)
    doc.addImage(logo, "PNG", 20, 18, 15, 15);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(40, 18, 40, 33);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CODE FOR CHANGE", 45, 25);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("NEPAL • SINCE 2024", 45, 30);

    // 3. Metadata (Top Right)
    const formatDate = (dateStr) => {
      const options = { day: "numeric", month: "short", year: "numeric" };
      return new Date(dateStr)
        .toLocaleDateString("en-GB", options)
        .replace(/ /g, " ");
    };

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(`REGD NO.: ${cert.regdNo || "64498-066-067"}`, 270, 22, {
      align: "right",
    });
    doc.text(`CERTIFICATE NO.: ${cert.certificateId}`, 270, 27, {
      align: "right",
    });
    doc.text(`ISSUED DATE: ${formatDate(cert.issueDate)}`, 270, 32, {
      align: "right",
    });

    // 4. Template Logic
    const getTemplateConfig = (type) => {
      switch (type) {
        case "Training":
        case "Bootcamp":
        case "Workshop":
          return {
            header: "Certificate",
            subHeader: "OF ACHIEVEMENT",
            tagline: "on successfully completing",
            primaryDetail: cert.hours
              ? `${cert.hours} of professional`
              : "professional",
          };
        case "Internship":
          return {
            header: "Experience",
            subHeader: "CREDENTIAL",
            tagline: "has successfully completed an internship in",
            primaryDetail: "as a Trainee / Intern in",
          };
        case "Event":
        case "Hackathon":
          return {
            header: "Participation",
            subHeader: "CERTIFICATE",
            tagline: "for active participation and achievement in",
            primaryDetail: "during the grand event of",
          };
        default:
          return {
            header: "Certificate",
            subHeader: "OF ACHIEVEMENT",
            tagline: "on successfully completing",
            primaryDetail: "professional",
          };
      }
    };
    const config = getTemplateConfig(cert.certificateType);

    // 5. Main Titles
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(48);
    doc.setFont("helvetica", "bolditalic");
    doc.text(config.header, pageWidth / 2, 60, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(config.subHeader, pageWidth / 2, 72, { align: "center" });

    // 6. Awarded To Pill
    const awardedToText = (cert.awardedTo || "Cordially Awarded To").toUpperCase();
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(pageWidth / 2 - 40, 80, 80, 10, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(awardedToText, pageWidth / 2, 86.5, { align: "center" });

    // 7. Recipient Name
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(36);
    doc.setFont("helvetica", "bolditalic");
    doc.text(cert.recipientName.toUpperCase(), pageWidth / 2, 110, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(config.tagline, pageWidth / 2, 120, { align: "center" });

    // 8. Achievement Sentence
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(60, 135, 237, 135);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${config.primaryDetail} ${cert.courseName}`, pageWidth / 2, 134, {
      align: "center",
    });

    if (cert.startDate && cert.endDate) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("conducted from", 95, 148, { align: "right" });
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(new Date(cert.startDate).toLocaleDateString(), 105, 148);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text("to", pageWidth / 2, 148, { align: "center" });
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(new Date(cert.endDate).toLocaleDateString(), 160, 148);
    }

    // 9. Footer Section - Replicating CertificatePreview.jsx exactly
    const footerY = 160;
    const footerX = 20;

    // QR Container Box (p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm)
    const boxSize = 20;
    const padding = 1.5;
    const qrSize = boxSize - padding * 2;

    // Shadow simulation (offset gray box)
    doc.setFillColor(241, 245, 249); // slate-100/shadow color
    doc.roundedRect(footerX + 0.5, footerY + 0.5, boxSize, boxSize, 2, 2, "F");

    // Main Box
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(255, 255, 255); // white
    doc.setLineWidth(0.3);
    doc.roundedRect(footerX, footerY, boxSize, boxSize, 2, 2, "FD"); // rounded-lg approx 2mm radius

    // QR Code Image
    try {
      if (qrCodeDataURL) {
        doc.addImage(
          qrCodeDataURL,
          "PNG",
          footerX + padding,
          footerY + padding,
          qrSize,
          qrSize,
        );
      }
    } catch (e) {
      console.error("Failed to add QR code to PDF", e);
    }

    // Text Group
    const textX = footerX + boxSize + 4; // gap-4 approx 4mm
    const textYStart = footerY + 8;

    // Label: Vault Registry Access
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(6); // text-[8px]
    doc.setFont("helvetica", "bold");
    // Manual tracking-widest simulation not easy in jsPDF without character spacing, but bold small font helps
    doc.text("VAULT REGISTRY ACCESS", textX, textYStart);

    // Link: verify.codeforchange.org.np
    doc.setTextColor(15, 23, 42); // primary
    doc.setFontSize(8); // text-[10px]
    doc.text("verify.codeforchange.org.np", textX, textYStart + 4);

    // Underline/Border-b simulation
    doc.setDrawColor(15, 23, 42); // primary opacity 20% approx
    doc.setDrawColor(203, 213, 225); // slate-300 for lighter border
    doc.setLineWidth(0.2);
    doc.line(textX, textYStart + 5, textX + 38, textYStart + 5);

    // ISO Stamp
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(1);
    doc.circle(pageWidth / 2, 175, 12);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6);
    doc.text("CERTIFIED", pageWidth / 2, 168, { align: "center" });
    doc.setFontSize(10);
    doc.text("ISO", pageWidth / 2, 175, { align: "center" });
    doc.setFontSize(6);
    doc.text("9001:2015", pageWidth / 2, 180, { align: "center" });

    // Signatory
    const sigName = cert.signatureName || "Krishna Pokhrel";
    const sigPosition = cert.signaturePosition || "Project Lead CFC";
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(sigName.toUpperCase(), 240, 182, { align: "right" });
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(sigPosition.toUpperCase(), 240, 187, { align: "right" });
    doc.setDrawColor(203, 213, 225);
    doc.line(190, 178, 240, 178);
    doc.setFont("times", "italic");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(sigName, 215, 175, { align: "center" });

    doc.save(`Certificate_${cert.certificateId}_${cert.recipientName}.pdf`);
    toast.success("High-Fidelity Certificate Exported");
  };

  if (loading && certificates.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      {/* 1. Dashboard Header - Responsive */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Certificate <span className="text-secondary">Registry</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            Management & Distribution Portal
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="hidden md:flex gap-2 mr-4">
            <div className="bg-secondary/10 px-4 py-2 rounded-xl text-center border border-secondary/50">
              <p className="text-[9px] font-black text-secondary uppercase">
                Valid
              </p>
              <p className="text-lg font-black text-secondary leading-none">
                {certificates.filter((c) => c.status === "Valid").length}
              </p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl text-center border border-slate-100">
              <p className="text-[9px] font-black text-slate-600 uppercase">
                Total
              </p>
              <p className="text-lg font-black text-slate-700 leading-none">
                {certificates.length}
              </p>
            </div>
          </div>
          {hasPermission("certificate_issue") && (
            <div className="flex flex-wrap gap-3 flex-1 md:flex-none">

              <button
                onClick={() => { setBulkStep(1); setIsBulkModalOpen(true); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-secondary text-white px-6 py-4 rounded-2xl hover:bg-primary transition-all shadow-xl shadow-secondary/20 font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
              >
                <FaDownload className="text-lg" />{" "}
                <span className="hidden sm:inline">Bulk Generate</span>
                <span className="sm:hidden">Bulk</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Advanced Filters */}
      {/* 2. Advanced Filters - Responsive */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search by ID, Name or Email..."
              className="w-full pl-16 pr-8 py-4 bg-slate-50 rounded-2xl outline-none text-slate-700 font-bold text-xs uppercase tracking-widest focus:ring-4 focus:ring-secondary/10 focus:bg-white transition-all border border-transparent focus:border-secondary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-3">
            <select
              className="px-4 md:px-6 py-4 bg-slate-50 rounded-2xl outline-none text-slate-600 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent shadow-sm shadow-slate-100 w-full md:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Valid">Valid</option>
              <option value="Revoked">Revoked</option>
              <option value="Expired">Expired</option>
            </select>

            <select
              className="px-4 md:px-6 py-4 bg-slate-50 rounded-2xl outline-none text-slate-600 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent shadow-sm shadow-slate-100 w-full md:w-auto"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Training">Training</option>
              <option value="Bootcamp">Bootcamp</option>
              <option value="Internship">Internship</option>
              <option value="Event">Event</option>
              <option value="Workshop">Workshop</option>
            </select>

            <select
              className="px-4 md:px-6 py-4 bg-slate-50 rounded-2xl outline-none text-slate-600 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-all border-r-[16px] border-r-transparent shadow-sm shadow-slate-100 w-full md:w-auto"
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
            >
              <option value="All">All Regions</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button className="col-span-2 md:col-span-1 w-full md:w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl hover:bg-secondary transition-all shadow-lg shadow-slate-100">
              <FaFilter />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Certificate Ledger - Responsive */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-6">Certificate ID</th>
                <th className="px-8 py-6">Recipient</th>
                <th className="px-8 py-6">Program</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse"
                  >
                    Loading certificates...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-20 text-center text-slate-400 font-black uppercase tracking-widest"
                  >
                    No matching credentials found
                  </td>
                </tr>
              ) : (
                certificates.map((cert, index) => (
                  <tr
                    key={cert._id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-slate-100/50 transition-all group`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center p-2">
                          <QRCode
                            value={`${window.location.origin}/certificate-verification/${cert.certificateId}`}
                            size={24}
                          />
                        </div>
                        <span className="font-mono text-xs font-black text-secondary bg-secondary/10 px-2 py-1 rounded">
                          {cert.certificateId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <div className="font-black text-primary group-hover:text-secondary transition-colors uppercase tracking-tight">
                          {cert.recipientName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">
                          {cert.recipientEmail} • {cert.province || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        {cert.courseName}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] ${cert.status === "Valid"
                          ? "text-secondary"
                          : "text-rose-500"
                          }`}
                      >
                        <FaCheckCircle /> {cert.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === cert._id ? null : cert._id,
                          )
                        }
                        className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <BsThreeDotsVertical />
                      </button>
                      {openMenuId === cert._id && (
                        <div className="absolute right-20 top-6 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200">
                          <button
                            onClick={() => generatePDF(cert)}
                            className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                          >
                            <BsDownload className="text-secondary" /> Export
                            PDF
                          </button>
                          <button
                            onClick={() => handlePreview(cert)}
                            className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                          >
                            <FaEye className="text-blue-500" /> Full Preview
                          </button>
                          <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>

                          {hasPermission("certificate_update") && (
                            <>
                              <div className="px-5 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Change Status
                              </div>
                              <div className="flex gap-1 px-4 pb-2">
                                {["Valid", "Revoked", "Expired"].map(
                                  (status) => (
                                    <button
                                      key={status}
                                      onClick={() =>
                                        handleUpdateStatus(cert._id, status)
                                      }
                                      className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${cert.status === status
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-slate-400 border-slate-200 hover:border-primary hover:text-primary"
                                        }`}
                                    >
                                      {status.charAt(0)}
                                    </button>
                                  ),
                                )}
                              </div>
                              <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                            </>
                          )}
                          {hasPermission("certificate_delete") && (
                            <button
                              onClick={() => {
                                setCertToDelete(cert);
                                setDeleteModalOpen(true);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-5 py-3 text-left flex items-center gap-3 text-xs font-black text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                            >
                              <BsTrash /> Delete Record
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
          {loading ? (
            <div className="p-10 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">
              Loading certificates...
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-black uppercase tracking-widest">
              No matching credentials found
            </div>
          ) : (
            certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 shadow-sm relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-2">
                      <QRCode
                        value={`${window.location.origin}/certificate-verification/${cert.certificateId}`}
                        size={32}
                      />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded w-fit mb-1">
                        {cert.certificateId}
                      </p>
                      <h3 className="font-black text-primary uppercase tracking-tight leading-none text-sm">
                        {cert.recipientName}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === cert._id ? null : cert._id)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shadow-sm"
                  >
                    <BsThreeDotsVertical size={14} />
                  </button>
                </div>

                {/* Dropdown for Mobile */}
                {openMenuId === cert._id && (
                  <div className="absolute top-14 right-4 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in">
                    <button
                      onClick={() => generatePDF(cert)}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={() => handlePreview(cert)}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Preview
                    </button>
                    <div className="h-[1px] bg-slate-50 my-1"></div>
                    {hasPermission("certificate_delete") && (
                      <button
                        onClick={() => {
                          setCertToDelete(cert);
                          setDeleteModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}

                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    Course
                  </p>
                  <p className="text-xs font-bold text-slate-700 uppercase mt-0.5 leading-tight">
                    {cert.courseName}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span
                    className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${cert.status === "Valid"
                      ? "bg-emerald-100 text-secondary"
                      : "bg-rose-100 text-rose-700"
                      }`}
                  >
                    <FaCheckCircle /> {cert.status}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {cert.province || "N/A"} •{" "}
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Bulk Issue Modal */}
      {isBulkModalOpen && (
        <BulkCertificateModal
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={(issued) => setCertificates(prev => [...issued, ...prev])}
        />
      )}

      {/* 6. Delete Confirmation */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Revoke Credential"
        message={`Are you sure you want to permanently revoke certificate ${certToDelete?.certificateId}? This record will be expunged from the registry.`}
      />

      {/* 6. Fullscreen Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-[#01152E]/95 backdrop-blur-2xl z-[200] flex flex-col overflow-hidden">

          {/* Top Bar */}
          <div className="shrink-0 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-secondary/30">
                <FaShieldAlt size={16} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase italic tracking-tighter text-base leading-none">Certificate Preview</h3>
                <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.25em] mt-0.5">{previewData?.certificateId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => generatePDF(previewData)}
                className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-white/10"
              >
                <FaDownload size={12} /> Export PDF
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-white hover:bg-rose-500 transition-all border border-white/10"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* Main Content: Sidebar + Certificate */}
          <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">

            {/* Certificate Render Area */}
            <div className="flex-1 overflow-auto flex items-start justify-center p-4 md:p-8">
              <div className="w-full max-w-4xl animate-in zoom-in-95 duration-500">
                {/* Browser chrome bar */}
                <div className="bg-slate-800 rounded-t-2xl px-4 py-2.5 flex items-center gap-2 border border-white/10 border-b-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 opacity-70"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-70"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-70"></div>
                  <div className="flex-1 mx-4 bg-slate-700 rounded-lg py-1 px-3 text-[9px] font-mono text-slate-400 text-center truncate">
                    codeforchangenepal.com/certificate-verification/{previewData?.certificateId}
                  </div>
                </div>
                {/* Certificate */}
                <div className="bg-white rounded-b-2xl overflow-hidden shadow-[0_0_80px_rgba(0,118,180,0.3)] border border-white/20 border-t-0">
                  <CertificatePreview
                    data={{
                      ...previewData,
                      tokenHash: previewData?.tokenHash || "preview-only",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar — Details */}
            <div className="shrink-0 w-full lg:w-72 bg-white/5 border-t lg:border-t-0 lg:border-l border-white/10 p-5 overflow-y-auto">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">Certificate Details</p>
              <div className="space-y-3">
                {[
                  { label: "Recipient", value: previewData?.recipientName },
                  { label: "Program", value: previewData?.courseName },
                  { label: "Type", value: previewData?.certificateType },
                  { label: "Province", value: previewData?.province || "N/A" },
                  { label: "Status", value: previewData?.status },
                  { label: "Issue Date", value: previewData?.issueDate ? new Date(previewData.issueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A" },
                  { label: "Signatory", value: previewData?.signatureName || "Krishna Pokhrel" },
                  { label: "Position", value: previewData?.signaturePosition || "Project Lead CFC" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
                    <p className="text-white text-xs font-bold truncate">{value || "—"}</p>
                  </div>
                ))}
              </div>
              {/* Mobile PDF button */}
              <button
                onClick={() => generatePDF(previewData)}
                className="sm:hidden mt-4 w-full flex items-center justify-center gap-2 bg-secondary text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
              >
                <FaDownload size={12} /> Export PDF
              </button>
              <p className="text-center text-[8px] font-black uppercase tracking-widest text-slate-600 mt-6">
                Code for Change Nepal
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificate;
