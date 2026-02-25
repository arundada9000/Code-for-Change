import React from "react";
import QRCode from "react-qr-code";
import logo from "../../assets/logo.png";

const CertificatePreview = ({ data }) => {
  const {
    recipientName = "Bal Gobind Chaudhary",
    courseName = "MERN Stack Development",
    certificateType = "Training",
    certificateId = "CFC-2026-001",
    hours = "135 Hours",
    regdNo = "64498-066-067",
    startDate = "2024-11-26",
    endDate = "2025-02-26",
    issueDate = new Date().toISOString(),
    tokenHash = "preview-only"
  } = data;

  const qrValue = `${window.location.origin}/certificate-verification/${certificateId}`;

  const getTemplateConfig = (type) => {
    switch(type) {
      case "Training":
      case "Bootcamp":
      case "Workshop":
        return {
          header: "Certificate",
          subHeader: "OF ACHIEVEMENT",
          tagline: "on successfully completing",
          primaryDetail: hours ? `${hours} of professional` : "professional"
        };
      case "Internship":
        return {
          header: "Experience",
          subHeader: "CREDENTIAL",
          tagline: "has successfully completed an internship in",
          primaryDetail: "as a Trainee / Intern in"
        };
      case "Event":
      case "Hackathon":
        return {
          header: "Participation",
          subHeader: "CERTIFICATE",
          tagline: "for active participation and achievement in",
          primaryDetail: "during the grand event of"
        };
      default:
        return {
          header: "Certificate",
          subHeader: "OF ACHIEVEMENT",
          tagline: "on successfully completing",
          primaryDetail: "professional"
        };
    }
  };

  const config = getTemplateConfig(certificateType);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options).replace(/ /g, ' ');
  };

  const getDayWithSuffix = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const suffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    return `${day}${suffix(day)} ${new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
  };

  // Dynamic Font Scaling Logic
  const getRecipientFontSize = (name) => {
    if (name.length > 35) return "text-2xl";
    if (name.length > 25) return "text-3xl";
    return "text-4xl md:text-5xl";
  };

  const getCourseFontSize = (course) => {
    if (course.length > 60) return "text-xs";
    if (course.length > 40) return "text-sm";
    return "text-lg";
  };

  return (
    <div className="w-full aspect-[1.414/1] bg-white border-[12px] border-slate-900 p-10 shadow-2xl relative overflow-hidden font-sans text-slate-900 select-none flex flex-col justify-between">
      {/* Decorative Overlays */}
      <div className="absolute inset-4 border border-slate-300 pointer-events-none z-0"></div>
      <div className="absolute inset-5 border-[3px] border-slate-900 pointer-events-none z-0"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-50 rounded-full border-[40px] border-white z-0 opacity-50"></div>

      {/* Header Section */}
      <div className="flex justify-between items-start relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-20" />
          <div className="border-l-2 border-slate-200 pl-4">
            <h1 className="text-xl font-black tracking-tight text-slate-800">CODE FOR CHANGE</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Nepal • Since 2024</p>
          </div>
        </div>
        <div className="text-right text-[9px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
          <p className="flex justify-end gap-2">REGD NO.: <span className="text-slate-900">{regdNo}</span></p>
          <p className="flex justify-end gap-2">CERTIFICATE NO.: <span className="text-slate-900">{certificateId}</span></p>
          <p className="flex justify-end gap-2">ISSUED DATE: <span className="text-slate-900">{formatDate(issueDate)}</span></p>
        </div>
      </div>

      {/* Main Body - Centered Flex Area */}
      <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 px-8 py-4 overflow-hidden">
        {/* Title Group */}
        <div className="mb-6">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">{config.header}</h2>
          <h3 className="text-xl font-black text-slate-600 mt-2 uppercase tracking-[0.2em]">{config.subHeader}</h3>
        </div>

        {/* Awarded To Pill */}
        <div className="mb-6">
            <div className="bg-slate-900 text-white px-8 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase italic inline-block">
                Cordially Awarded To
            </div>
        </div>

        {/* Recipient Name - Dynamically Scaled */}
        <div className="mb-4 w-full">
            <h4 className={`${getRecipientFontSize(recipientName)} font-black text-slate-900 tracking-tighter italic uppercase break-words leading-tight`}>
                {recipientName}
            </h4>
            <p className="text-xs font-bold text-slate-500 mt-3 tracking-widest uppercase">{config.tagline}</p>
        </div>

        {/* Course Detail - Dynamically Scaled */}
        <div className="w-full max-w-3xl">
           <div className="inline-flex items-center justify-center gap-3 border-b-2 border-slate-100 pb-2 w-full">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">{config.primaryDetail}</span>
              <span className={`${getCourseFontSize(courseName)} font-black text-slate-900 italic tracking-tight break-words`}>{courseName}</span>
           </div>
           
           {startDate && endDate && (
             <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>conducted from</span>
                <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-slate-900 lowercase font-black tracking-normal">{getDayWithSuffix(startDate)}</span>
                <span>to</span>
                <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-slate-900 lowercase font-black tracking-normal">{getDayWithSuffix(endDate)}</span>
             </div>
           )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-end relative z-10 shrink-0 mt-4">
        {/* Left Side: QR and Link */}
        <div className="flex items-center gap-4">
           <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <QRCode 
                value={qrValue} 
                size={55} 
                level="M"
              />
           </div>
           <div className="space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vault Registry Access</p>
              <p className="text-[10px] font-black text-slate-900 border-b border-slate-900/20 pb-0.5">verify.codeforchange.org.np</p>
           </div>
        </div>

        {/* Middle: ISO Stamp */}
        <div className="text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center text-slate-200 mb-1 relative">
                <div className="absolute inset-0 bg-slate-50/50 rounded-full animate-pulse"></div>
                <p className="relative text-[5px] font-black leading-none">CERTIFIED</p>
                <p className="relative text-xs font-black leading-none my-0.5 text-slate-300">ISO</p>
                <p className="relative text-[5px] font-black leading-none">9001:2015</p>
            </div>
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Accreditation</p>
        </div>

        {/* Right: Signature */}
        <div className="text-center w-48">
            <div className="h-10 border-b border-slate-200 mb-2 italic font-serif text-slate-800 text-xl flex items-end justify-center pb-1">
                Balgovind Chaudhary
            </div>
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
