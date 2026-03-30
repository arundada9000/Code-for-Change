import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import logo from "../../assets/logo.png";

const CertificatePreview = ({ data, activeProvince }) => {
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
    tokenHash = "preview-only",
    signatureName = "",
    signaturePosition = "",
    signatureImage = "",
    awardedTo = "",
  } = data;

  // Fallback defaults for old certificates that don't have these fields
  const displaySignatureName = signatureName || "Krishna Pokhrel";
  const displaySignaturePosition = signaturePosition || "Project Lead CFC";
  const displayAwardedTo = awardedTo || "Cordially Awarded To";

  const qrValue = `${window.location.origin}/certificate-verification/${certificateId}`;

  // Responsive QR code size
  const [qrSize, setQrSize] = useState(55);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640)
        setQrSize(25); // mobile
      else if (width < 768)
        setQrSize(35); // small tablet
      else if (width < 1024)
        setQrSize(40); // tablet
      else setQrSize(45); // desktop
    };

    handleResize(); // set initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTemplateConfig = (type) => {
    // Dynamic: if admin set custom text during bulk generation, use it directly
    const t = data?.metadata?.template;
    if (t?.header)
      return {
        header: t.header,
        subHeader: t.subHeader || "",
        tagline: t.tagline || "",
        primaryDetail: t.primaryDetail || "",
      };

    // Fallback: hardcoded per-type defaults (keeps all old certificates working)
    switch (type) {
      case "Training":
      case "Bootcamp":
      case "Workshop":
        return {
          header: "Certificate",
          subHeader: "OF ACHIEVEMENT",
          tagline: "on successfully completing",
          primaryDetail: hours ? `${hours} of professional` : "professional",
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

  const config = getTemplateConfig(certificateType);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateStr)
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, " ");
  };

  const getDayWithSuffix = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const suffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${day}${suffix(day)} ${new Date(dateStr).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
  };

  // Dynamic Font Scaling Logic
  const getRecipientFontSize = (name) => {
    if (name.length > 35) return "text-lg sm:text-xl md:text-2xl lg:text-3xl";
    if (name.length > 25) return "text-xl sm:text-2xl md:text-3xl lg:text-4xl";
    return "text-xl sm:text-3xl md:text-4xl lg:text-5xl";
  };

  const getCourseFontSize = (course) => {
    if (course.length > 60) return "text-[10px] sm:text-xs md:text-sm";
    if (course.length > 40) return "text-xs sm:text-sm md:text-base";
    return "text-[10px] sm:text-base md:text-lg";
  };


  return (
    <div
      id="certificate-preview-node"
      className="w-full aspect-4/3 bg-white border-[4px] sm:border-[6px] md:border-[8px] lg:border-[12px] border-secondary p-2 sm:p-4 md:p-6 lg:p-10 shadow-2xl relative overflow-hidden font-sans text-slate-900 select-none flex flex-col justify-between"
    >
      {/* Decorative Overlays */}
      <div className="absolute inset-[1px] sm:inset-1 md:inset-4 border border-slate-300 pointer-events-none z-0"></div>
      <div className="absolute inset-[2px] sm:inset-2 md:inset-5 border-2 md:border-3 border-slate-900 pointer-events-none z-0"></div>
      <div className="absolute hidden md:block -bottom-24 -right-24 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-slate-50 rounded-full border-[20px] sm:border-[30px] md:border-[40px] border-white z-0 opacity-50"></div>

      {/* Header Section */}
      <div className="flex justify-between items-start relative z-10 shrink-0">
        {" "}
        <div className="flex items-center gap-4">
          {" "}
          <img src={logo} alt="Logo" className="w-10 sm:w-14 md:w-20" />
          <div className="border-l-2 border-slate-200 pl-2">
            {" "}
            <h1 className="text-[12px] sm:text-lg md:text-xl font-bold -md:font-black tracking-tight text-slate-800">
              {" "}
              CODE FOR CHANGE{" "}
            </h1>{" "}
            <p className="text-[8px] font-bold text-slate-500 uppercase leading-none">
              {" "}
              Nepal • Since 2024{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="text-right text-[8px] font-bold uppercase text-slate-400 leading-relaxed">
          {" "}
          <p className="flex justify-end gap-1">
            {" "}
            REGD NO.: <span className="text-slate-900">{regdNo}</span>{" "}
          </p>{" "}
          <p className="flex justify-end gap-1">
            {" "}
            CERTIFICATE NO.:{" "}
            <span className="text-slate-900">{certificateId}</span>{" "}
          </p>{" "}
          <p className="flex justify-end gap-1">
            {" "}
            ISSUED DATE:{" "}
            <span className="text-slate-900">{formatDate(issueDate)}</span>{" "}
          </p>{" "}
        </div>{" "}
      </div>
      {/* Main Body */}
      <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-4 md:py-6">
        {/* Title */}
        <div className="sm:mb-4 md:mb-6">
          <h2
            style={{ color: activeProvince?.colorCode }}
            className="text-base sm:text-2xl md:text-3xl lg:text-5xl font-black tracking-tighter leading-none"
          >
            {config.header}
          </h2>
          <h3 className="text-[10px] sm:text-sm md:text-lg font-black text-slate-600 uppercase tracking-wider">
            {config.subHeader}
          </h3>
        </div>

        {/* Awarded To */}
        <div className="mb-1 md:mb-6">
         
          <div
           style={{ background: activeProvince?.colorCode }}
          className=" text-white px-4 sm:px-6 md:px-8 py-1 sm:py-2 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase italic inline-block">
            {displayAwardedTo}
          </div>
        </div>

        {/* Recipient Name */}
        <div className="md:mb-4 w-full">
          <h4
            style={{ color: activeProvince?.colorCode }}
            className={`${getRecipientFontSize(recipientName)} font-semibold italic text-slate-900 tracking-tighter uppercase break-words leading-tight`}
          >
            {recipientName}
          </h4>
          <p className="text-[7px] sm:text-[8px] md:text-[10px] font-bold text-slate-500 sm:mt-2 tracking-widest uppercase">
            {config.tagline}
          </p>
        </div>

        {/* Course Details */}
        <div className="w-full max-w-3xl">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b md:border-b-2 border-slate-100 pb-1 sm:pb-2">
            <span className="text-[8px] sm:text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {config.primaryDetail}
            </span>
            <span
              className={`${getCourseFontSize(courseName)} font-bold md:font-black text-slate-900 italic tracking-tight break-words`}
            >
              {courseName}
            </span>
          </div>

          {startDate && endDate && (
            <div className=" sm:mt-4 flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-[7px] sm:text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">
              <span>conducted from</span>
              <span className="bg-slate-50 px-2 sm:px-3 md:py-1 rounded-lg border border-slate-100 text-slate-900 lowercase font-black tracking-normal">
                {getDayWithSuffix(startDate)}
              </span>
              <span>to</span>
              <span className="bg-slate-50 px-2 sm:px-3 md:py-1 rounded-lg border border-slate-100 text-slate-900 lowercase font-black tracking-normal">
                {getDayWithSuffix(endDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end sm:items-end gap-4 sm:gap-0 md:mt-4">
        {/* QR */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="p-0.5 sm:p-1.5 bg-white border border-slate-200 md:rounded-lg shadow-sm">
            <QRCode value={qrValue} size={qrSize} level="M" />
          </div>
          <div className="md:space-y-0.5 text-center sm:text-left">
            <p className="text-[6px] sm:text-[8px] md:font-bold font-black text-slate-400 uppercase tracking-widest">
              Vault Registry Access
            </p>
            <p className="text-[8px] sm:text-[10px] md:font-bold font-black text-slate-900 border-b border-slate-900/20 pb-0.5">
              verify.codeforchange.org.np
            </p>
          </div>
        </div>

        {/* ISO Stamp */}
        <div className="text-center flex flex-col items-center">
          <div className="w-6 h-6 sm:w-14 sm:h-14 rounded-full border-3 sm:border-4 border-slate-100 flex flex-col items-center justify-center text-slate-200 mb-1 relative">
            <div className="absolute inset-0 bg-slate-50/50 rounded-full animate-pulse"></div>
            <p className="relative text-[2px] sm:text-[5px] font-black leading-none">
              CERTIFIED
            </p>
            <p className="relative text-[4px] sm:text-xs font-black leading-none my-0.5 text-slate-300">
              ISO
            </p>
            <p className="relative text-[2px] sm:text-[5px] font-black leading-none">
              9001:2015
            </p>
          </div>
          <p className="text-[5px] sm:text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none">
            Global Accreditation
          </p>
        </div>

        {/* Signature */}
        <div className="text-center w-full sm:w-40 md:w-48">
          {signatureImage && (
            <img
              src={signatureImage}
              alt="Signature"
              className="h-8 sm:h-10 md:h-12 object-contain mx-auto mb-1"
            />
          )}
          <div
            className={`${signatureImage ? "" : "h-8 sm:h-10 md:h-12"} border-b border-slate-200 md:mb-2 italic font-serif text-[8px] sm:text-lg md:text-xl flex items-end justify-center md:pb-1`}
          >
            {!signatureImage && displaySignatureName}
          </div>
          <p className="text-[7px] sm:text-[9px] md:text-[10px] font-bold md:font-black text-slate-900 uppercase md:tracking-widest">
            {displaySignatureName}
          </p>
          <p className="text-[6px] sm:text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {displaySignaturePosition}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
