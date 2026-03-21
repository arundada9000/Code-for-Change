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
  FaUpload
} from "react-icons/fa";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import API from "../Services/api";
import SEO from "../Components/Common/SEO";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import Banner from "../Components/UI/Banner";
import CertificatePreview from "../Components/UI/CertificatePreview";
import { CertificateResultSkeleton } from "../Components/Loading/Skeleton";

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

  const initScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      });

      scanner.render((decodedText) => {
        // Sanitize extracted URL/Token
        const extractedToken = decodedText.split("/").filter(Boolean).pop();
        handleVerify(extractedToken);
        stopScanner(scanner);
      }, (err) => {
        // scan err
      });
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = (scannerInstance) => {
    const s = scannerInstance || scannerRef.current;
    if (s) {
      s.clear().catch(err => console.error("Failed to clear scanner", err));
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

  return (
    <div className="min-h-screen bg-slate-50/30">
      <SEO 
        title="Certificate Verification"
        description="Audit and verify digital credentials issued by Code for Change Nepal through our secure verification portal."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Verify Certificate", path: "/certificate-verification" }]}
      />
      {/* Conditionally show banner */}
      {!token && <Banner title="Registry Audit Portal Certificate Verification" />}
      
      {/* {!token && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <Breadcrumbs crumbs={[{ name: "Verify Certificate", path: "/certificate-verification" }]} />
        </div>
      )} */}
      
      <div className={`max-w-7xl mx-auto px-6 ${token ? 'py-12' : 'py-20'}`}>
        {/* Verification Card - Simplistic & Clean */}
        {(!token || !result || result.status !== 'success') && (
          <div className="max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-[#01152E] tracking-tight mb-3">Certificate Verification</h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                Securely verify credentials and academic records issued by <span className="text-[#0076B4] font-bold">Code for Change Nepal</span> through our digital ledger.
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Enter Certificate No. (e.g., CFC-20260224-XXXXX)" 
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#0076B4]/20 transition-all font-mono text-sm uppercase text-[#01152E] placeholder:text-slate-400"
                      value={searchQuery}
                      onChange={(e) => {
                        // Strict validation: Allow only Alphanumeric and Hyphen
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                        setSearchQuery(val);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleVerify(searchQuery)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleVerify(searchQuery)}
                      className="flex-1 md:flex-none bg-[#0076B4] hover:bg-[#005a8b] text-white px-12 py-5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#0076B4]/20 active:scale-95"
                    >
                      Verify
                    </button>
                    <button 
                      onClick={initScanner}
                      className="p-5 bg-slate-100 text-[#01152E] rounded-2xl hover:bg-[#0076B4] hover:text-white transition-all active:scale-95"
                    >
                      <FaQrcode size={22} />
                    </button>
                </div>
            </div>
          </div>
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
                 <h3 className="text-2xl font-black text-[#01152E] uppercase italic tracking-tighter mb-2">Scan QR Code</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select an option to scan</p>
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
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            {result.status === 'success' ? (
              <div className="space-y-10">
                {/* Sleek Integrated Status Bar */}
                <div className="max-w-4xl mx-auto bg-white border border-secondary/10 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-secondary/5">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20">
                         <FaCheckCircle className="text-xl" />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-slate-900 leading-none">Verified Authentic</h3>
                         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Registry ID: {result.data.certificateId}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                      <button 
                        onClick={() => {
                            window.history.pushState({}, '', '/certificate-verification');
                            setResult(null);
                            setSearchQuery("");
                        }}
                        className="text-[#0076B4] hover:text-[#01152E] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
                      >
                        Verify Another <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>

                {/* Maximized Certificate View */}
                <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-1 shadow-2xl shadow-slate-200/30 border border-slate-100/50">
                   <CertificatePreview data={result.data} />
                </div>

                {/* Audit Footer */}
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] pt-6">
                   <span className="flex items-center gap-2">
                      <FaShieldAlt className="text-secondary" /> Secure Protocol v2.4
                   </span>
                   <span className="hidden md:block opacity-20">•</span>
                   <span className="flex items-center gap-2">
                       {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                    Check the authenticity of any digital certificate using the ID printed on the document. Please ensure you've entered the Registry Number correctly or try scanning the original QR code.
                 </p>
                 <button 
                  onClick={() => {
                    window.history.pushState({}, '', '/certificate-verification');
                    setResult(null);
                    setSearchQuery("");
                  }}
                  className="bg-[#01152E] text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#0076B4] transition-all flex items-center gap-3 mx-auto shadow-lg shadow-slate-200 active:scale-95"
                 >
                   Try New Lookup <FaArrowRight />
                 </button>
              </div>
            )}
          </div>
        )}

        {/* Support Strip - Simplified */}
        {(!token || !result) && (
          <div className="mt-32 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="flex items-start gap-6 group">
                <div className="p-4 bg-slate-50 text-[#01152E] rounded-2xl group-hover:bg-[#0076B4] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <FaShieldAlt size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-[#01152E] mb-2 uppercase text-sm tracking-wider">Digital Ledger Protection</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Cryptographic hashing ensures every credential remains immutable and authentic from the moment of issuance.</p>
                </div>
            </div>
            <div className="flex items-start gap-6 group">
                <div className="p-4 bg-slate-50 text-[#01152E] rounded-2xl group-hover:bg-[#0076B4] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <FaHistory size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-[#01152E] mb-2 uppercase text-sm tracking-wider">Global Verification</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Empower employers and institutions to verify your achievements instantly through our mobile-optimized audit portal.</p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CertificateVerification;
