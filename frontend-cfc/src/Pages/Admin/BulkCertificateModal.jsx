import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import API from "../../Services/api";
import CertificatePreview from "../../Components/UI/CertificatePreview";

const PROVINCES = [
  "Kathmandu", "Pokhara", "Rupandehi", "Dang", "Birgunj", "Farwest", "Koshi", "Chitwan", "LB Karnali"
];

const PROVINCE_REGIONS = {
  Kathmandu: "KA", Pokhara: "PO", Rupandehi: "RU", Dang: "DA",
  Birgunj: "BI", Farwest: "FW", Koshi: "KO", Chitwan: "CH", "LB Karnali": "LB",
};

const TEMPLATE_DEFAULTS = {
  Training: { header: "Certificate", subHeader: "OF ACHIEVEMENT", tagline: "on successfully completing", primaryDetail: "professional" },
  Bootcamp: { header: "Certificate", subHeader: "OF ACHIEVEMENT", tagline: "on successfully completing", primaryDetail: "professional" },
  Workshop: { header: "Certificate", subHeader: "OF ACHIEVEMENT", tagline: "on successfully completing", primaryDetail: "professional" },
  Internship: { header: "Experience", subHeader: "CREDENTIAL", tagline: "has successfully completed an internship in", primaryDetail: "as a Trainee / Intern in" },
  Event: { header: "Participation", subHeader: "CERTIFICATE", tagline: "for active participation and achievement in", primaryDetail: "during the grand event of" },
  Hackathon: { header: "Participation", subHeader: "CERTIFICATE", tagline: "for active participation and achievement in", primaryDetail: "during the grand event of" },
};

const labelClass = "block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1";
const inputClass = "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:bg-white transition-all shadow-sm placeholder:text-slate-400";

export default function BulkCertificateModal({ onClose, onSuccess }) {
  const [bulkStep, setBulkStep] = useState(1);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const currentYear = String(new Date().getFullYear() % 100).padStart(2, "0");

  const defaultBulkShared = {
    courseName: "", certificateType: "Event", province: "",
    startDate: today, endDate: today, hours: "", grade: "",
    issueDate: today,
    template: { ...TEMPLATE_DEFAULTS["Event"] },
    signatureName: "", signaturePosition: "", signatureImage: "", awardedTo: "",
  };
  const [sharedData, setSharedData] = useState(defaultBulkShared);
  const [recipientCount, setRecipientCount] = useState(5);
  const [recipients, setRecipients] = useState(
    Array.from({ length: 5 }, () => ({ recipientName: "", recipientEmail: "", prefix1: "", prefix2: "" }))
  );

  const sanitizePrefix = (val) => val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

  const buildPreviewId = (recipient) => {
    const region = PROVINCE_REGIONS[sharedData.province] || "??";
    const p1 = sanitizePrefix(recipient.prefix1 || "");
    const p2 = sanitizePrefix(recipient.prefix2 || "");
    const parts = [p1, region, currentYear, p2, "####"].filter(Boolean);
    return parts.join("-");
  };

  const initRecipients = (count) => {
    setRecipients(Array.from({ length: count }, (_, i) =>
      recipients[i] || { recipientName: "", recipientEmail: "", prefix1: "", prefix2: "" }
    ));
  };

  const handleTypeChange = (type) => {
    setSharedData(prev => ({ ...prev, certificateType: type, template: { ...TEMPLATE_DEFAULTS[type] } }));
  };

  const handleBulkSubmit = async () => {
    if (!sharedData.province) { toast.error("Please select a province."); return; }
    if (!sharedData.courseName.trim()) { toast.error("Course/Event name is required."); return; }
    const validRecipients = recipients.filter(r => r.recipientName.trim());
    if (validRecipients.length === 0) { toast.error("At least one recipient name is required."); return; }

    setBulkSubmitting(true);
    setBulkProgress(`Issuing ${validRecipients.length} certificates...`);
    try {
      const payload = {
        sharedData: {
          courseName: sharedData.courseName,
          certificateType: sharedData.certificateType,
          province: sharedData.province,
          startDate: sharedData.startDate || null,
          endDate: sharedData.endDate || null,
          hours: sharedData.hours || null,
          grade: sharedData.grade || null,
          issueDate: sharedData.issueDate,
          metadata: { template: sharedData.template },
          signatureName: sharedData.signatureName || undefined,
          signaturePosition: sharedData.signaturePosition || undefined,
          signatureImage: sharedData.signatureImage || undefined,
          awardedTo: sharedData.awardedTo || undefined,
        },
        recipients: validRecipients.map(r => ({
          recipientName: r.recipientName.trim(),
          recipientEmail: r.recipientEmail?.trim() || undefined,
          prefix1: sanitizePrefix(r.prefix1 || ""),
          prefix2: sanitizePrefix(r.prefix2 || ""),
        })),
      };

      const { data } = await API.post("/certificates/bulk-issue", payload);
      const issued = data.data;
      onSuccess(issued);
      toast.success(`✅ ${issued.length} certificates issued!`);

      setBulkProgress("Packaging QR codes into ZIP...");
      const JSZipLib = await import("jszip");
      const JSZip = JSZipLib.default || JSZipLib;
      const zip = new JSZip();
      const qrFolder = zip.folder(sharedData.courseName.replace(/\s+/g, "_"));
      for (const cert of issued) {
        if (cert.qrCode) {
          const base64 = cert.qrCode.replace(/^data:image\/png;base64,/, "");
          const safeName = cert.recipientName.replace(/[^a-zA-Z0-9 _-]/g, "").replace(/\s+/g, "_");
          qrFolder.file(`${safeName}_${cert.certificateId}_QR.png`, base64, { base64: true });
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR_${sharedData.courseName.replace(/\s+/g, "_")}_${today}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Bulk Issue Error:", error);
      toast.error(error.response?.data?.message || "Bulk issuance failed.");
    } finally {
      setBulkSubmitting(false);
      setBulkProgress("");
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-white max-h-[92vh] overflow-y-auto rounded-4xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-10 pt-8 pb-5 border-b border-slate-50">
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-primary uppercase">
              Bulk Certificate Generation
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${bulkStep >= s ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
                  {s < 2 && <div className={`h-px w-8 transition-all ${bulkStep >= 2 ? "bg-primary" : "bg-slate-100"}`} />}
                </div>
              ))}
              <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {bulkStep === 1 ? "Shared Configuration" : "Recipient Entry"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="px-10 py-8">
          <div className="flex gap-4 mb-8 flex-col md:flex-row border-b border-slate-100 pb-6">
            <button
              onClick={() => setShowBulkPreview(false)}
              className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${!showBulkPreview ? "bg-primary text-white" : "bg-slate-50 text-slate-400 hover:text-primary"}`}
            >
              Configure Details ({bulkStep === 1 ? "Shared" : "Recipients"})
            </button>
            <button
              onClick={() => setShowBulkPreview(true)}
              className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${showBulkPreview ? "bg-primary text-white" : "bg-slate-50 text-slate-400 hover:text-primary"}`}
            >
              Live Preview (First Recipient)
            </button>
          </div>

          {showBulkPreview && (
            <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-xl mb-6">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Live Certificate Preview</span>
              </div>
              <div className="p-2">
                <CertificatePreview data={{
                  recipientName: recipients[0]?.recipientName || "Sample Student Name",
                  courseName: sharedData.courseName || "Event / Course Name",
                  certificateType: sharedData.certificateType,
                  certificateId: buildPreviewId(recipients[0] || {}),
                  hours: sharedData.hours,
                  startDate: sharedData.startDate,
                  endDate: sharedData.endDate,
                  issueDate: sharedData.issueDate || today,
                  grade: sharedData.grade,
                  province: sharedData.province,
                  signatureName: sharedData.signatureName,
                  signaturePosition: sharedData.signaturePosition,
                  signatureImage: sharedData.signatureImage,
                  awardedTo: sharedData.awardedTo,
                  tokenHash: "preview-only"
                }} />
              </div>
            </div>
          )}

          {!showBulkPreview && bulkStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>No. of Certificates</label>
                  <input
                    type="number" min="1" max="500"
                    className={inputClass}
                    value={recipientCount}
                    onChange={e => setRecipientCount(Math.max(1, Math.min(500, Number(e.target.value))))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Province <span className="text-rose-400">*</span></label>
                  <select
                    className={inputClass}
                    value={sharedData.province}
                    onChange={e => setSharedData(p => ({ ...p, province: e.target.value }))}
                  >
                    <option value="">Select Province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p} ({PROVINCE_REGIONS[p]})</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Certificate Type</label>
                  <select className={inputClass} value={sharedData.certificateType} onChange={e => handleTypeChange(e.target.value)}>
                    {["Training", "Bootcamp", "Hackathon", "Event", "Internship", "Workshop"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Event / Course Name <span className="text-rose-400">*</span></label>
                <input className={inputClass} placeholder="e.g. Code for Change Kathmandu Hackathon 2026" value={sharedData.courseName} onChange={e => setSharedData(p => ({ ...p, courseName: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" className={inputClass} value={sharedData.startDate} onChange={e => setSharedData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input type="date" className={inputClass} value={sharedData.endDate} onChange={e => setSharedData(p => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Issue Date</label>
                  <input type="date" className={inputClass} value={sharedData.issueDate} onChange={e => setSharedData(p => ({ ...p, issueDate: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Accredited Hours <span className="text-slate-400 font-bold">(optional)</span></label>
                  <input className={inputClass} placeholder="e.g. 48 Hours" value={sharedData.hours} onChange={e => setSharedData(p => ({ ...p, hours: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Achievement / Grade <span className="text-slate-400 font-bold">(optional)</span></label>
                  <input className={inputClass} placeholder="e.g. Winner, Participation, Mentorship" value={sharedData.grade} onChange={e => setSharedData(p => ({ ...p, grade: e.target.value }))} />
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Certificate Display Text — Pre-filled from type, fully editable
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "header", label: "Main Header" },
                    { key: "subHeader", label: "Sub-Header" },
                    { key: "tagline", label: "Tagline (below name)" },
                    { key: "primaryDetail", label: "Primary Detail (before course)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelClass}>{label}</label>
                      <input
                        className={inputClass}
                        value={sharedData.template?.[key] ?? ""}
                        onChange={e => setSharedData(p => ({ ...p, template: { ...p.template, [key]: e.target.value } }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Signatory & Award Label — defaults to Krishna Pokhrel / Project Lead CFC
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Award Label <span className="text-slate-400 font-bold">(default: Cordially Awarded To)</span></label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Proudly Presented To"
                      value={sharedData.awardedTo}
                      onChange={e => setSharedData(p => ({ ...p, awardedTo: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Signatory Name</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Krishna Pokhrel"
                      value={sharedData.signatureName}
                      onChange={e => setSharedData(p => ({ ...p, signatureName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Signatory Position</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Project Lead CFC"
                      value={sharedData.signaturePosition}
                      onChange={e => setSharedData(p => ({ ...p, signaturePosition: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Signature Image <span className="text-slate-400 font-bold">(optional – PNG/JPG with transparent background recommended)</span></label>
                    <div className="mt-1 relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="sig-img-upload"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => setSharedData(p => ({ ...p, signatureImage: reader.result }));
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label
                        htmlFor="sig-img-upload"
                        className="flex items-center gap-3 cursor-pointer w-full p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:border-secondary transition-all group"
                      >
                        {sharedData.signatureImage ? (
                          <>
                            <img src={sharedData.signatureImage} alt="Signature preview" className="h-10 object-contain" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Signature Loaded ✓ — Click to replace</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-all">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-secondary transition-all">Click to upload signature image</span>
                          </>
                        )}
                        {sharedData.signatureImage && (
                          <button
                            type="button"
                            onClick={e => { e.preventDefault(); e.stopPropagation(); setSharedData(p => ({ ...p, signatureImage: "" })); }}
                            className="ml-auto text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest"
                          >✕ Remove</button>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Year Suffix (auto)</span>
                <span className="font-mono font-black text-primary">{currentYear}</span>
                <span className="text-[10px] text-blue-400 ml-auto">Region: {PROVINCE_REGIONS[sharedData.province] || "select province →"}</span>
              </div>

              <button
                onClick={() => { initRecipients(recipientCount); setBulkStep(2); }}
                disabled={!sharedData.province || !sharedData.courseName.trim()}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white hover:bg-secondary transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xl"
              >
                Next → Enter Recipients ({recipientCount} students)
              </button>
            </div>
          )}

          {!showBulkPreview && bulkStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setBulkStep(1)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center gap-2">
                  ← Back to Config
                </button>
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                  {sharedData.courseName} · {sharedData.province} · ID Preview: {buildPreviewId(recipients[0] || {})}
                </span>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-2 pb-2 text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Recipient Name *</div>
                <div className="col-span-2">Email (opt.)</div>
                <div className="col-span-2">Prefix 1 (E/C/M)</div>
                <div className="col-span-2">Prefix 2 (LE/TC)</div>
                <div className="col-span-2">ID Preview</div>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {recipients.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-[10px] font-black text-slate-400 text-center">{i + 1}</div>
                    <div className="col-span-12 md:col-span-3">
                      <input
                        className={inputClass}
                        placeholder="Full Name"
                        value={r.recipientName}
                        onChange={e => {
                          const upd = [...recipients];
                          upd[i] = { ...upd[i], recipientName: e.target.value };
                          setRecipients(upd);
                        }}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <input
                        className={inputClass}
                        placeholder="Email"
                        type="email"
                        value={r.recipientEmail}
                        onChange={e => {
                          const upd = [...recipients];
                          upd[i] = { ...upd[i], recipientEmail: e.target.value };
                          setRecipients(upd);
                        }}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <input
                        className={`${inputClass} font-mono uppercase`}
                        placeholder="e.g. E"
                        maxLength={4}
                        value={r.prefix1}
                        onChange={e => {
                          const upd = [...recipients];
                          upd[i] = { ...upd[i], prefix1: sanitizePrefix(e.target.value) };
                          setRecipients(upd);
                        }}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <input
                        className={`${inputClass} font-mono uppercase`}
                        placeholder="e.g. LE"
                        maxLength={4}
                        value={r.prefix2}
                        onChange={e => {
                          const upd = [...recipients];
                          upd[i] = { ...upd[i], prefix2: sanitizePrefix(e.target.value) };
                          setRecipients(upd);
                        }}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <span className="font-mono text-[9px] font-black text-secondary bg-secondary/5 px-2 py-1.5 rounded-lg border border-secondary/10 block text-center truncate">
                        {buildPreviewId(r)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {bulkProgress && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-sm font-bold text-blue-600 animate-pulse">
                  {bulkProgress}
                </div>
              )}

              <button
                onClick={handleBulkSubmit}
                disabled={bulkSubmitting}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all bg-secondary text-white hover:bg-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {bulkSubmitting ? bulkProgress || "Generating..." : `🚀 Generate & Download ${recipients.filter(r => r.recipientName.trim()).length} Certificates`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
