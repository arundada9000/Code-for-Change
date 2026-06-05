import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useFetch from "../Hooks/useFetch";
import SEO from "../Components/Common/SEO";
import { FaCalendarAlt, FaArrowLeft, FaMapPin, FaArrowRight } from "react-icons/fa";
import { ArticleDetailSkeleton } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp } from "../Components/Common/Animations";
import { FaUsers } from "react-icons/fa";
import { GoProjectSymlink } from "react-icons/go";
import { GrNotes } from "react-icons/gr";

/**
 * Sub-component: Sidebar Info Card
 */
const InfoSidebar = ({ location, dates }) => (
  <aside className="lg:col-span-1 space-y-8">
    <div className="sticky top-32">
      
      {/* Logistics Card */}
      <div className="bg-white border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
        
        <h4 className="text-sm font-black text-secondary mb-8 relative z-10">
          Project Logistics
        </h4>

        <div className="space-y-8 relative z-10">
          <div className="flex gap-5 items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-secondary shadow-sm">
              <FaMapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                Location
              </p>
              <p className="text-slate-900 font-black text-lg leading-tight">
                {location}
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-secondary shadow-sm">
              <FaCalendarAlt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                Timeline
              </p>
              <p className="text-slate-900 font-black text-lg leading-tight">{dates}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
        {/* Abstract background shape */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-secondary/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />

        <h4 className="text-2xl font-black mb-4 relative z-10 tracking-tight leading-tight">
          Scale this <span className="text-secondary">Impact</span>
        </h4>
        <p className="text-slate-300 text-base mb-8 leading-relaxed relative z-10">
          Your support directly funds digital literacy programs in 80+ schools across Nepal. Help us bridge the divide.
        </p>
        <Link
          to="/donate-us"
          className="flex items-center justify-between w-full p-5 rounded-2xl bg-white text-slate-900 font-black hover:bg-secondary hover:text-white transition-all duration-300 relative z-10 shadow-lg group/btn"
        >
          <span>Partner with Us</span>
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-secondary transition-colors">
            <FaArrowRight className="-rotate-45 group-hover/btn:rotate-0 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  </aside>
);

function ImpactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: apiImpact, loading } = useFetch(`/impacts/${id}`);
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (apiImpact) {
      // Map backend to frontend
      const mappedMetrics = apiImpact.metrics
        ? [
            { label: "Participants", value: apiImpact.metrics.participants },
            { label: "Projects", value: apiImpact.metrics.projects },
            { label: "Impact Note", value: apiImpact.metrics.impact },
          ].filter((m) => m.value !== undefined)
        : [];

      setItem({
        ...apiImpact,
        location: apiImpact.location || "National",
        dates: apiImpact.dates,
        fullStory: apiImpact.details || apiImpact.description,
        metrics: mappedMetrics,
      });
    }
  }, [apiImpact, id]);

  if (loading) return <ArticleDetailSkeleton />;

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-xl mb-6">
          🔍
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Detail Missing
        </h2>
        <button
          onClick={() => navigate("/our-impact")}
          className="mt-6 px-8 py-3 bg-secondary text-white rounded-full font-bold shadow-lg hover:shadow-blue-200 transition-all"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  return (
    <article className="bg-slate-50 min-h-screen">
      <SEO
        title={item.title}
        description={item.description?.substring(0, 160)}
        image={item.image}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Our Impact", path: "/our-impact" },
          { name: item.title, path: `/our-impact/${id}` },
        ]}
      />
      
      {/* Header Navigation */}
      <header className="sticky top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
          <Link
            to="/our-impact"
            className="group flex items-center gap-4 text-sm font-bold text-slate-500 hover:text-secondary transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-secondary/30 group-hover:bg-blue-50 transition-all">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to Initiatives
          </Link>
          <div className="hidden sm:block text-xs font-black text-slate-400 uppercase">
            Impact Narrative
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 lg:pt-24 lg:pb-16 px-5 md:px-8">
        <FadeIn className="max-w-7xl mx-auto">
          <div className="mb-10 max-w-4xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none mb-6">
              {item.title}
            </h1>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-blue-300 rounded-full" />
              <p className="text-sm font-bold text-secondary uppercase">
                Project Narrative & Impact Report
              </p>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/9] md:aspect-[21/9] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] border-4 border-white bg-slate-100 group">
            <img
              src={item.image || "https://via.placeholder.com/1200x600"}
              alt={item.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[3s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-80" />
            
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center gap-3 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                <span className="text-xs font-black text-white uppercase shadow-sm">
                  {item.location}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 pb-20 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Main Narrative */}
          <SlideUp
            delay={0.1}
            className="lg:col-span-2 space-y-16"
          >
            <section>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">
                Executive Summary
              </h3>
              <div className="prose prose-lg prose-slate max-w-none">
                <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                  {item.fullStory || item.description}
                </p>
              </div>
            </section>

            {item.metrics && item.metrics.length > 0 && (
              <section className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  Measured Impact
                </h3>

                {/* Metrics Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Primary Metrics */}
                  {item.metrics.slice(0, 2).map((metric, index) => (
                    <div
                      key={index}
                      className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-secondary/20 transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors mb-6">
                        {metric.label === "Participants" ? (
                          <FaUsers className="w-6 h-6" />
                        ) : metric.label === "Projects" ? (
                          <GoProjectSymlink className="w-6 h-6" />
                        ) : (
                          <GrNotes className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight mb-2">
                        {metric.value}
                      </div>
                      <div className="text-sm font-bold text-slate-400 uppercase">
                        {metric.label}
                      </div>
                    </div>
                  ))}

                  {/* Impact Note (Spans Full Width) */}
                  {item.metrics.slice(2, 3).map((metric, index) => (
                    <div
                      key={index}
                      className="md:col-span-2 bg-gradient-to-br from-secondary to-blue-600 rounded-[2rem] p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,118,180,0.4)] text-white relative overflow-hidden group"
                    >
                      <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                          <GrNotes className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-blue-200 uppercase mb-2">
                            {metric.label}
                          </div>
                          <div className="text-2xl md:text-3xl font-black leading-tight">
                            {metric.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </SlideUp>

          {/* Sidebar */}
          <SlideUp delay={0.2}>
            <InfoSidebar location={item.location} dates={item.dates} />
          </SlideUp>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white py-24 lg:py-32 px-5 md:px-8 overflow-hidden relative border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-slate-900 leading-tight">
            Join the <span className="text-secondary">Digital</span> <br />
            Revolution.
          </h3>
          <p className="text-slate-500 text-xl mb-12 max-w-2xl mx-auto">
            Connect with our network and contribute to the next phase of tech development in Nepal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/our-impact"
              className="w-full sm:w-auto px-10 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm uppercase hover:bg-slate-200 transition-all"
            >
              All Initiatives
            </Link>
            <Link
              to="/contact-us"
              className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase hover:bg-secondary transition-all shadow-xl hover:shadow-secondary/30 hover:-translate-y-1"
            >
              Collaborate With Us
            </Link>
          </div>
        </div>
      </footer>
    </article>
  );
}

export default ImpactDetail;
