import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaQrcode,
  FaHistory,
  FaArrowRight,
  FaCamera,
  FaImage,
  FaUpload,
  FaDownload,
} from "react-icons/fa";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";
import API from "../Services/api";
import SEO from "../Components/Common/SEO";
import Banner from "../Components/UI/Banner";
import CertificatePreview from "../Components/UI/CertificatePreview";
import { CertificateResultSkeleton } from "../Components/Loading/Skeleton";
import { SlideUp } from "../Components/Common/Animations";
import { provinces } from "./Provinces";

function CertificateVerification() {
  const { token } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = "Certificate Verification";
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (val) => {
    if (!val) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await API.get(`/certificates/verify/${val}`);
      setResult({ status: "success", data: data.data });
    } catch (error) {
      console.error("Verification failed", error);
      setResult({ status: "error", message: "Invalid Certificates" });
    } finally {
      setLoading(false);
    }
  };

  // Extract region from the data
  const region = result?.data?.province;


  const initScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      });

      scanner.render(
        (decodedText) => {
          // Sanitize extracted URL/Token
          const extractedToken = decodedText.split("/").filter(Boolean).pop();
          handleVerify(extractedToken);
          stopScanner(scanner);
        },
        (err) => {
          // scan err
        },
      );
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = (scannerInstance) => {
    const s = scannerInstance || scannerRef.current;
    if (s) {
      s.clear().catch((err) => console.error("Failed to clear scanner", err));
    }
    setShowScanner(false);
    scannerRef.current = null;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("reader-hidden");
    try {
      setLoading(true);
      const decodedText = await html5QrCode.scanFile(file, true);
      // Sanitize extracted URL/Token
      const extractedToken = decodedText.split("/").filter(Boolean).pop();
      handleVerify(extractedToken);
      setShowScanner(false);
    } catch (err) {
      console.error("Image scan failed", err);
      alert("No valid QR code found in the image.");
    } finally {
      setLoading(false);
      html5QrCode.clear();
    }
  };

  const handleDownloadQR = () => {
    if (!result?.data?.qrCode) {
      toast.error("QR Code not available");
      return;
    }
    const tokenParts = result.data.qrCode.split(";base64,");
    if (tokenParts.length !== 2) {
      toast.error("Invalid QR Code format");
      return;
    }
    const bstr = atob(tokenParts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${result.data.certificateId || "Certificate"}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("QR Code downloaded successfully");
  };

  const handleDownloadCertificate = async () => {
    const node = document.getElementById("certificate-preview-node");
    if (!node) {
      toast.error("Certificate preview not loaded");
      return;
    }

    const loadingToast = toast.loading(
      "Generating high-quality certificate image...",
    );
    try {
      // Scale for higher definition print quality
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 4, // Higher resolution
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${result.data.recipientName.replace(/\s+/g, "_")}_Certificate_${result.data.certificateId}.png`;
      a.click();
      toast.success("Certificate downloaded successfully!", {
        id: loadingToast,
      });
    } catch (err) {
      console.error("Failed to generate certificate", err);
      toast.error("Failed to download certificate. Try again.", {
        id: loadingToast,
      });
    }
  };

  // find province color
  const activeProvince = provinces.find(
    (p) =>
       p.name.toLowerCase() === region?.toLowerCase(),
  );
  

  return (
    <div className="min-h-screen bg-slate-50/30">
      <SEO
        title="Certificate Verification"
        description="Audit and verify digital credentials issued by Code for Change Nepal through our secure verification portal."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Verify Certificate", path: "/certificate-verification" },
        ]}
      />
      {/* Conditionally show banner */}
      {!token && (
        <Banner title="Registry Audit Portal Certificate Verification" />
      )}

      <div className={`max-w-7xl mx-auto px-6 ${token ? "py-12" : "py-16"}`}>
        {/* Verification Card - Simplistic & Clean */}
        {(!token || !result || result.status !== "success") && (
          <SlideUp delay={0.1} className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-[#01152E] tracking-tight mb-3">
                Certificate Verification
              </h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                Verify certificates and records issued by{" "}
                <span className="text-[#0076B4] font-bold">
                  Code for Change Nepal
                </span>
              </p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-full p-2 shadow-xl shadow-slate-200/60 border border-slate-300 flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/50" />
                <input
                  type="text"
                  placeholder="Enter Certificate No. (e.g., CFC-20260224-XXXXX)"
                  className="w-full pl-16 pr-8 py-4 bg-slate-200 border-none rounded-full outline-none focus:ring focus:ring-secondary transition-all font-mono text-sm uppercase text-[#01152E] placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => {
                    // Strict validation: Allow only Alphanumeric and Hyphen
                    const val = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9-]/g, "");
                    setSearchQuery(val);
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleVerify(searchQuery)
                  }
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleVerify(searchQuery)}
                  className="flex-1 md:flex-none bg-[#0076B4] cursor-pointer hover:bg-[#005a8b] text-white px-12 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#0076B4]/20 active:scale-95"
                >
                  Verify
                </button>
                <button
                  onClick={initScanner}
                  className="p-4 bg-slate-200 text-secondary rounded-full cursor-pointer hover:bg-[#0076B4] hover:text-white transition-all active:scale-95"
                >
                  <FaQrcode size={20} />
                </button>
              </div>
            </div>
          </SlideUp>
        )}

        {/* Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-[#01152E]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-300">
              <button
                onClick={() => stopScanner()}
                className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <FaTimesCircle size={28} />
              </button>

              <div className="mb-8 text-center pt-4">
                <h3 className="text-2xl font-black text-[#01152E] uppercase italic tracking-tighter mb-2">
                  Scan QR Code
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Select an option to scan
                </p>
              </div>

              {/* Hidden element for file scanning */}
              <div id="reader-hidden" className="hidden"></div>

              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50 relative aspect-square">
                  <div id="reader" className="w-full h-full"></div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-[#0076B4] hover:text-white text-[#01152E] py-4 rounded-xl font-bold transition-all text-sm group"
                  >
                    <FaImage className="text-lg" />
                    Upload QR Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Point camera at QR or upload a clear screenshot
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <CertificateResultSkeleton />}

        {/* Results Section */}
        {result && (
          <SlideUp className="duration-700 mt-12">
            {result.status === "success" ? (
              <div className="space-y-10">
                {/* Sleek Integrated Status Bar */}
                <div className="max-w-4xl mx-auto bg-white border border-secondary/10 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-secondary/5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20">
                      <FaCheckCircle className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-none">
                        Verified Authentic
                      </h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        Registry ID: {result.data.certificateId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                    <button
                      onClick={() => {
                        window.history.pushState(
                          {},
                          "",
                          "/certificate-verification",
                        );
                        setResult(null);
                        setSearchQuery("");
                      }}
                      className="text-[#0076B4] hover:text-[#01152E] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
                    >
                      Verify Another{" "}
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Maximized Certificate View */}
                <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-1 shadow-2xl shadow-slate-200/30 border border-slate-100/50">
                  <CertificatePreview
                    data={result.data}
                    activeProvince={activeProvince}
                  />
                </div>

                {/* Download Actions Panel */}
                <div className="max-w-4xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleDownloadCertificate}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#01152E] hover:bg-[#0076B4] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
                  >
                    <FaDownload className="text-lg" /> Download Certificate
                  </button>
                  <button
                    onClick={handleDownloadQR}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-[#01152E] border-2 border-slate-100 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                  >
                    <FaQrcode className="text-lg text-secondary" /> Save QR Code
                  </button>
                </div>

                {/* Audit Footer */}
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] pt-6">
                  <span className="flex items-center gap-2">
                    <FaShieldAlt className="text-secondary" /> Successfully
                    verified
                  </span>
                  <span className="hidden md:block opacity-20">•</span>
                  <span className="flex items-center gap-2">
                    {new Date().toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto bg-white border border-rose-100 rounded-[3rem] p-16 text-center shadow-xl shadow-rose-50/50">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3">
                  <FaTimesCircle size={40} />
                </div>
                <h2 className="text-4xl font-black text-[#01152E] uppercase italic tracking-tighter mb-4">
                  Registry Audit Portal
                </h2>
                <p className="text-slate-500 text-sm font-medium max-w-md mx-auto leading-relaxed">
                  Check the authenticity of any digital certificate using the ID
                  printed on the document. Please ensure you've entered the
                  Registry Number correctly or try scanning the original QR
                  code.
                </p>
                <button
                  onClick={() => {
                    window.history.pushState(
                      {},
                      "",
                      "/certificate-verification",
                    );
                    setResult(null);
                    setSearchQuery("");
                  }}
                  className="bg-[#01152E] text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#0076B4] transition-all flex items-center gap-3 mx-auto shadow-lg shadow-slate-200 active:scale-95"
                >
                  Try New Lookup <FaArrowRight />
                </button>
              </div>
            )}
          </SlideUp>
        )}

        {/* Support Strip - Simplified */}
        {(!token || !result) && (
          <div className="mt-12 md:mt-32 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-slate-50 text-[#01152E] rounded-2xl group-hover:bg-[#0076B4] group-hover:text-white transition-colors duration-300 shrink-0">
                <FaShieldAlt size={22} />
              </div>
              <div>
                <h4 className="font-bold text-[#01152E] mb-2 uppercase text-sm tracking-wider">
                  Secure, Unchangeable Records
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your credentials are locked with cryptographic hashing,
                  keeping them authentic and tamper-proof.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-slate-50 text-[#01152E] rounded-2xl group-hover:bg-[#0076B4] group-hover:text-white transition-colors duration-300 shrink-0">
                <FaHistory size={22} />
              </div>
              <div>
                <h4 className="font-bold text-[#01152E] mb-2 uppercase text-sm tracking-wider">
                  Verify in Seconds
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Anyone can instantly check your achievements using our easy,
                  mobile-ready verification system.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CertificateVerification;
