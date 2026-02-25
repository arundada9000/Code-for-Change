import React from "react";
import { 
  FaRocket, FaMobileAlt, FaDraftingCompass, FaSearchDollar, 
  FaShoppingCart, FaChartLine, FaEnvelope, FaMapMarkerAlt,
  FaGlobe, FaCode, FaCertificate, FaShieldAlt
} from "react-icons/fa";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { BsTerminal } from "react-icons/bs";

const SajiloDigital = () => {
  const capabilities = [
    {
      title: "Web Ecosystems",
      desc: "Architecting scalable full-stack applications with sub-second latency.",
      icon: <FaGlobe className="text-emerald-500" />,
    },
    {
      title: "Mobile Interface",
      desc: "Developing cross-platform experiences that feel native to the core.",
      icon: <FaMobileAlt className="text-blue-500" />,
    },
    {
      title: "Neural UX/UI",
      desc: "Designing human-centric interfaces optimized for subconscious flow.",
      icon: <FaDraftingCompass className="text-purple-500" />,
    },
    {
      title: "Index Mastery",
      desc: "Dominating search rankings through algorithmic precision and optimization.",
      icon: <FaSearchDollar className="text-amber-500" />,
    },
    {
      title: "Commerce Logic",
      desc: "Building frictionless global storefronts that maximize conversion throughput.",
      icon: <FaShoppingCart className="text-rose-500" />,
    },
    {
      title: "Market Intelligence",
      desc: "Data-driven marketing strategies to amplify brand signal globally.",
      icon: <FaChartLine className="text-indigo-500" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <FaRocket /> Official Developer Identity
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">
                Sajilo Digital
              </h1>
              <p className="text-xl md:text-2xl font-medium text-emerald-500 italic tracking-tighter">
                Your Vision, Our Innovation
              </p>
            </div>

            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl italic border-l-2 border-emerald-500/30 pl-6">
              "We build technologies that lasts forever."
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
             <div className="w-24 h-24 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FaCode size={40} className="text-white" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Verified Agency</p>
                <p className="text-white font-black text-sm mt-1 tracking-tight">SD ARCHITECTURE</p>
             </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-16 shadow-sm hover:shadow-xl transition-all duration-700">
         <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-slate-100 flex items-center justify-center border-4 border-slate-50 shadow-inner overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Arun Neupane" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  onError={(e) => e.target.style.display='none'}
                />
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Arun Neupane</h2>
                <p className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-1">Chief Technology Officer & Lead Designer</p>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed font-medium italic">
                The architect behind the visual identity and technological framework of this application. Focused on blending aesthetic excellence with high-performance ecosystem architecture.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                    <FaCertificate className="text-emerald-500" /> Lead Architect
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                    <HiOutlineStatusOnline className="text-emerald-500" /> Digital Pioneer
                 </div>
              </div>
            </div>
         </div>
      </section>

      {/* Capabilities Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
           <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em]">Strategic Assets</h3>
           <h2 className="text-3xl font-black text-slate-900">Core Capabilities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => (
            <div key={cap.title} className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {cap.icon}
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">{cap.title}</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Terminal Footer */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-emerald-500 font-mono text-xs space-y-4 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-20 transition-opacity group-hover:opacity-100">
                <BsTerminal size={100} />
            </div>
            <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-4 text-emerald-500/50 font-sans font-black tracking-widest uppercase text-[9px]">Sajilo Terminal</span>
            </div>
            <p className="text-slate-500">$ whoami</p>
            <p className="text-white">SajiloDigital Pvt. Ltd</p>
            <p className="text-slate-500">$ status</p>
            <p className="animate-pulse">&gt;&gt; OPTIMIZED</p>
            <p className="text-slate-500">$ architecture</p>
            <p className="text-white">verified_valid</p>
            <div className="pt-8">
                <a href="https://sajilodigital.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-emerald-600 text-slate-900 px-8 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-emerald-400 transition-all uppercase font-sans">
                    Visit Official Website
                </a>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-center gap-6 shadow-sm">
            <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect with Us</div>
                <div className="flex items-start gap-4">
                    <FaMapMarkerAlt className="text-emerald-500 mt-1 shrink-0" />
                    <p className="text-xs font-bold text-slate-600 leading-relaxed">Horizon Chowk, Butwal-11 Rupandehi, Nepal</p>
                </div>
                <div className="flex items-center gap-4">
                    <FaEnvelope className="text-emerald-500 shrink-0" />
                    <p className="text-xs font-bold text-slate-600">hello@sajilodigital.com</p>
                </div>
            </div>
            <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Copyright & License</p>
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <FaShieldAlt className="text-emerald-500" /> MIT License (c) 2026
                </div>
            </div>
         </div>
      </section>

      {/* License Overlay */}
      <section className="bg-slate-50/50 rounded-3xl p-10 border border-slate-100">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-4 flex items-center gap-2">
            <FaCertificate /> Legal Attribution & Terms
         </h3>
         <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-inner font-mono text-[10px] text-slate-500 leading-relaxed max-h-[200px] overflow-y-auto no-scrollbar">
            MIT License<br/>
            Copyright (c) 2026 Sajilo Digital Team<br/><br/>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:<br/><br/>
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.<br/><br/>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
         </div>
      </section>

      <footer className="py-12 text-center space-y-4">
          <div className="text-2xl font-black text-slate-200 uppercase tracking-[1em] mb-4">Sajilo Digital</div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-3">
             Designed and Developed with <span className="text-rose-500 animate-pulse text-lg">❤️</span> in Butwal, Nepal.
          </p>
      </footer>
    </div>
  );
};

export default SajiloDigital;
