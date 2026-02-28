import React from "react";
import {
  FaGlobe,
  FaMobileAlt,
  FaDraftingCompass,
  FaSearchDollar,
  FaShoppingCart,
  FaCode,
  FaExternalLinkAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const SajiloDigital = () => {
  const services = [
    {
      title: "Web Development",
      desc: "Custom web applications and e-commerce solutions built for scale and performance.",
      icon: <FaGlobe className="text-emerald-600 text-xl" />,
    },
    {
      title: "Mobile App Development",
      desc: "Cross-platform and native mobile experiences that feel seamless and intuitive.",
      icon: <FaMobileAlt className="text-blue-600 text-xl" />,
    },
    {
      title: "UI/UX Design",
      desc: "Human-centric interfaces optimized for user engagement and smooth workflows.",
      icon: <FaDraftingCompass className="text-purple-600 text-xl" />,
    },
    {
      title: "SEO & Marketing",
      desc: "Data-driven strategies to amplify your brand signal and dominate search rankings.",
      icon: <FaSearchDollar className="text-amber-600 text-xl" />,
    },
    {
      title: "Digital Transformation",
      desc: "Modernizing legacy systems to high-performance digital ecosystems.",
      icon: <FaCode className="text-rose-600 text-xl" />,
    },
    {
      title: "E-Commerce Logic",
      desc: "Building frictionless global storefronts that maximize conversion throughput.",
      icon: <FaShoppingCart className="text-indigo-600 text-xl" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 z-10 text-center md:text-left">
          <div className="w-24 h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-3 shrink-0 shadow-sm group hover:border-emerald-200 transition-colors">
            <img
              src="/sajilodigital.png"
              alt="Sajilo Digital Logo"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              Official Technology Partner
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Sajilo Digital
            </h1>
            <p className="text-gray-500 font-medium text-sm md:text-base max-w-lg">
              Your Vision, Our Innovation. We partner with visionaries to
              architecture scalable, high-performance digital ecosystems.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto z-10">
          <a
            href="https://sajilodigital.com.np"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95 text-sm"
          >
            Visit Our Website <FaExternalLinkAlt size={12} />
          </a>
          <a
            href="mailto:info@sajilodigital.com.np"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold transition-all shadow-sm hover:border-gray-300 active:scale-95 text-sm"
          >
            <FaEnvelope size={14} className="text-emerald-600" /> Contact Us
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Grid occupying 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-gray-900">
                What We Offer
              </h2>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                Explore our core technical capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex gap-4 group cursor-pointer hover:bg-gray-50 p-4 -m-4 rounded-2xl transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm shrink-0 group-hover:bg-white group-hover:border-emerald-100 group-hover:shadow-md transition-all">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      {service.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Info occupying 1/3 */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col h-full">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-gray-900">
                Connect With Us
              </h2>
              <p className="text-gray-500 text-sm mt-1 font-medium">
                Reach out for collaborations.
              </p>
            </div>

            <div className="space-y-8 flex-1">
              <div className="flex gap-4 group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                  <FaMapMarkerAlt size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                    HQ Location
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-relaxed">
                    Horizon Chowk, Butwal-11
                    <br />
                    Rupandehi, Nepal
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                  <FaEnvelope size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                    Email Address
                  </p>
                  <a
                    href="mailto:info@sajilodigital.com.np"
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 break-all"
                  >
                    info@sajilodigital.com.np
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-inner">
              <p className="text-xs font-semibold text-gray-500 leading-relaxed text-center">
                The Code for Change web infrastructure is proudly maintained and
                scaled by the engineering team at Sajilo Digital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SajiloDigital;
