import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import logo from "../../assets/logo.png";
import { provinces } from "../../Pages/Provinces";

const CertificatePreview = ({ data, activeProvince }) => {
  const [hexColor, setHexColor] = useState("#0f172a");
  const [resolvedProvince, setResolvedProvince] = useState(activeProvince);
  const {
    recipientName = "Arun Neupane",
    courseName = "MERN Stack Development",
    certificateType = "Training",
    certificateId = "CFC-2026-001",
    hours = "135 Hours",
    regdNo = "64498-066-067",
    startDate = "2024-11-26",
    endDate = "2025-02-26",
    issueDate = new Date().toISOString(),
    signatureName = "",
    signaturePosition = "",
    signatureImage = "",
    awardedTo = "",
    province = "",
  } = data || {};




  // Fallback defaults for old certificates that don't have these fields
  const displaySignatureName = signatureName || "Krishna Pokhrel";
  const displaySignaturePosition = signaturePosition || "Project Lead CFC";
  const displayAwardedTo = awardedTo || "Cordially Awarded To";

  const qrValue = `${window.location.origin}/certificate-verification/${certificateId}`;

  // Responsive QR code size
  const [qrSize, setQrSize] = useState(55);

  useEffect(() => {

    const resolvedProvince = activeProvince || provinces.find(
      (p) => p.name.toLowerCase() === province?.toLowerCase()
    );
    setResolvedProvince(resolvedProvince);
    const hexColor = resolvedProvince?.colorCode || "#0f172a";
    setHexColor(hexColor);

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
      className={`w-full aspect-100/99 sm:aspect-4/3 bg-white border-[4px] sm:border-[6px] md:border-[8px] lg:border-[12px] p-2 sm:p-4 md:p-6 lg:p-10 shadow-2xl relative overflow-hidden font-sans text-slate-900 select-none flex flex-col justify-between`}
      style={{ borderColor: "#0076B4" }}
    >
      {/* Decorative Overlays */}
      {/* Province color background tint */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundColor: `${hexColor}0A` }}></div>
      {/* Giant Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0 mix-blend-multiply">
        <img src={logo} alt="Watermark" className="w-[70%] sm:w-[60%] object-contain grayscale" />
      </div>
      <div style={{ borderColor: hexColor }} className={`absolute inset-[1px] sm:inset-1 md:inset-4 border pointer-events-none z-0`}></div>
      <div style={{ borderColor: hexColor }} className={`absolute inset-[2px] sm:inset-2 md:inset-5 border-2 md:border-4 pointer-events-none z-0`}></div>

      {/* Heavy Geometric Corner Blocks */}
      <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[30px] border-r-[30px] sm:border-t-[60px] sm:border-r-[60px] md:border-t-[80px] md:border-r-[80px] border-r-transparent pointer-events-none z-0" style={{ borderTopColor: "#0076B4" }}></div>
      <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-[30px] border-l-[30px] sm:border-b-[60px] sm:border-l-[60px] md:border-b-[80px] md:border-l-[80px] border-l-transparent pointer-events-none z-0" style={{ borderBottomColor: "#0076B4" }}></div>

      <div style={{ borderColor: hexColor }} className={`absolute hidden md:block -bottom-24 -right-24 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-white/30 backdrop-blur-3xl rounded-full border-[20px] sm:border-[30px] md:border-[40px] z-0 opacity-40`}></div>

      {/* Header Section */}
      <div className="flex justify-between items-start relative z-10 shrink-0">
        {" "}
        <div className="flex items-center gap-4">
          {" "}
          <img src={logo} alt="Logo" className="w-10 sm:w-14 md:w-20" />{" "}
          <div style={{ borderColor: hexColor }} className={`border-l-2 pl-2`}>
            {" "}
            <h1 className="text-[12px] sm:text-lg md:text-xl font-bold -md:font-black  text-slate-800">
              {" "}
              CODE FOR CHANGE{" "}
            </h1>{" "}
            <p className="text-[8px] font-bold text-slate-500 uppercase leading-none">
              {" "}
              Let Code Lead the Change
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
        <div className="sm:mb-4 md:mb-6 relative z-10">
          <h2
            style={{ color: hexColor }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black  leading-none uppercase drop-shadow-sm"
          >
            {config.header}
          </h2>
          <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-black text-slate-600 uppercase mt-1 sm:mt-2">
            {config.subHeader}
          </h3>
        </div>

        {/* Awarded To */}
        <div className="mb-2 md:mb-8 relative z-10">
          <div
            style={{ backgroundColor: hexColor, boxShadow: `0 10px 25px -5px ${hexColor}60, 0 8px 10px -6px ${hexColor}60` }}
            className="text-white px-6 sm:px-10 md:px-12 py-2 sm:py-3 md:py-4 rounded-full text-[9px] sm:text-xs md:text-sm font-black uppercase italic inline-block"
          >
            {displayAwardedTo}
          </div>
        </div>

        {/* Recipient Name */}
        <div className="md:mb-6 w-full relative z-10">
          <h4
            style={{ color: hexColor }}
            className={`${getRecipientFontSize(recipientName)} font-serif italic font-bold  capitalize break-words leading-tight`}
          >
            {recipientName}
          </h4>
          <div className="h-px w-3/4 max-w-lg mx-auto my-2 md:my-4 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          <p className="text-[7px] sm:text-[9px] md:text-xs font-bold text-slate-500 uppercase">
            {config.tagline}
          </p>
        </div>

        {/* Course Details */}
        <div className="w-full max-w-3xl relative z-10">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b md:border-b-2 border-slate-200 pb-2 sm:pb-4">
            <span className="text-[8px] sm:text-xs md:text-sm font-bold text-slate-500 uppercase  shrink-0">
              {config.primaryDetail}
            </span>
            <span
              className={`${getCourseFontSize(courseName)} font-black text-slate-800 uppercase break-words bg-slate-50/80 px-3 py-1 rounded-lg border border-slate-100`}
            >
              {courseName}
            </span>
          </div>

          {startDate && endDate && (
            <div className="mt-2 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[7px] sm:text-xs md:text-sm font-bold text-slate-500 uppercase">
              <span>conducted from</span>
              <span style={{ color: hexColor }} className="bg-white px-3 sm:px-4 md:py-2 rounded-xl border-2 border-slate-100 font-black shadow-sm">
                {getDayWithSuffix(startDate)}
              </span>
              <span>to</span>
              <span style={{ color: hexColor }} className="bg-white px-3 sm:px-4 md:py-2 rounded-xl border-2 border-slate-100 font-black shadow-sm">
                {getDayWithSuffix(endDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex justify-between items-center sm:items-center gap-4 sm:gap-0">
        {/* QR */}
        <div className="flex items-center gap-0 sm:gap-4">
          <div className="p-0.5 sm:p-1.5 bg-white border border-slate-200 md:rounded-lg shadow-sm">
            <QRCode value={qrValue} size={qrSize} level="M" />
          </div>
          <div className="md:space-y-0.5 text-center sm:text-left">
            <p className="text-[6px] sm:text-[8px] md:font-bold font-black text-slate-400 uppercase">
              Certificate Verification
            </p>
            <p className="text-[8px] sm:text-[10px] md:font-bold font-black text-slate-900 border-b border-slate-900/20 pb-0.5">
              codeforchangenepal.com/certificate-verification
            </p>
          </div>
        </div>

        {/* Signature */}
        <div className="text-center w-24 sm:w-40 md:w-48 relative z-10 sm:-top-10">
          {signatureImage && (
            <img
              src={signatureImage}
              alt="Signature"
              className="h-8 sm:h-12 md:h-16 object-contain mx-auto mb-1 drop-shadow-md"
            />
          )}
          <div
            className={`${signatureImage ? "" : "h-8 sm:h-12 md:h-16"} border-b-2 border-slate-300 md:mb-3 italic font-serif text-[8px] sm:text-lg md:text-2xl flex items-end justify-center md:pb-2`}
          >
            {!signatureImage && <span className="text-slate-700/80">{displaySignatureName}</span>}
          </div>
          <p className="text-[7px] sm:text-[9px] md:text-[11px] font-black text-slate-900 uppercase  mt-2">
            {displaySignatureName}
          </p>
          <p className="text-[6px] sm:text-[8px] md:text-[9px] font-bold text-slate-500 uppercase  mt-1">
            {displaySignaturePosition}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
