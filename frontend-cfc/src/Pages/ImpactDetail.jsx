import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useFetch from "../Hooks/useFetch";
import SEO from "../Components/Common/SEO";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import { FaCalendarAlt, FaChevronLeft, FaMapPin } from "react-icons/fa";
import { ArticleDetailSkeleton } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp } from "../Components/Common/Animations";
import { FaUsers } from "react-icons/fa";
import { GoProjectSymlink } from "react-icons/go";
import { GrNotes } from "react-icons/gr";

/**
 * Sub-component: Sidebar Info Card
 * Refactored with better iconography and vertical spacing
 */
const InfoSidebar = ({ location, dates }) => (
  <aside className="lg:col-span-1 space-y-6">
    <div className="sticky top-24">
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
          Project Logistics
        </h4>

        <div className="space-y-8">
          <div className="flex gap-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <FaMapPin className="text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Location
              </p>
              <p className="text-slate-900 font-bold leading-tight">
                {location}
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <FaCalendarAlt className="text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Timeline
              </p>
              <p className="text-slate-900 font-bold leading-tight">{dates}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-3xl p-8 text-white relative overflow-hidden group">
        {/* Abstract background shape */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

        <h4 className="text-2xl font-bold mb-4 relative z-10">
          Scale this Impact
        </h4>
        <p className="text-blue-100 text-sm mb-8 leading-relaxed relative z-10">
          Your support directly funds digital literacy programs in 80+ schools
          across Nepal.
        </p>
        <Link
          to="/donate-us"
          className="block w-full text-center py-4 rounded-xl bg-white text-secondary font-bold hover:bg-blue-50 transition-colors relative z-10 shadow-lg shadow-blue-900/20"
        >
          Partner with Us
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
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
          Detail Missing
        </h2>
        <button
          onClick={() => navigate("/our-impact")}
          className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:shadow-blue-200 transition-all"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  return (
    <article className="bg-[#FCFDFF] min-h-screen">
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
      <header className=" w-full bg-secondary/10 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/our-impact"
            className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors tracking-widest flex items-center gap-2"
          >
            <span className="flex items-center justify-center p-2">
              <FaChevronLeft /> <FaChevronLeft />
            </span>{" "}
            Back IMPACT
          </Link>
          <div className="text-xs font-black tracking-widest text-slate-900 uppercase">
            Impact of Code For Change
          </div>
        </div>
      </header>
      {/* <div className="max-w-7xl mx-auto px-6 mt-8">
        <Breadcrumbs crumbs={[
          { name: "Our Impact", path: "/our-impact" },
          { name: item.title, path: `/our-impact/${id}` }
        ]} />
      </div> */}

      {/* Hero Section */}
      <section className="py-12 lg:py-16 px-6">
        <FadeIn className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-primary tracking-tightest uppercase leading-none">
              {item.title}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">
              Project Narrative & Impact Report
            </p>
          </div>

          <div className="relative rounded-[2rem] overflow-hidden aspect-[21/9] shadow-2xl border border-slate-100">
            <img
              src={item.image || "https://via.placeholder.com/1200x600"}
              alt={item.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[3s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-8 left-8 flex items-center gap-4">
              <div className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {item.location}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-20 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
          {/* Main Narrative */}
          <SlideUp
            delay={0.1}
            className="lg:col-span-2 space-y-12 lg:space-y-16"
          >
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[2px] w-12 bg-secondary"></div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                  The Story
                </h2>
              </div>
              <h3 className="text-3xl font-black text-primary mb-8 tracking-tight">
                Executive Summary
              </h3>
              <p className="text-slate-600 text-lg lg:text-xl leading-relaxed font-medium">
                {item.fullStory || item.description}
              </p>
            </section>

            {item.metrics && item.metrics.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-[2px] w-12 bg-secondary"></div>
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                    Impact Report Table
                  </h2>
                </div>

                <div className="bg-white rounded-2xl  border-slate-100 overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-50">
                    {/* Header */}
                    <div className="flex px-8 py-5 bg-secondary/10 border-b border-slate-100 font-black uppercase text-slate-400 text-[10px] tracking-widest">
                      <div className="flex-1">Metric Category</div>
                      <div className="w-32 text-right">Achieved Value</div>
                    </div>

                    {/* Metrics */}
                    {item.metrics.slice(0, 2).map((metric, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 md:px-8 py-5 gap-4 md:gap-0 hover:bg-slate-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            {metric.label === "Participants" ? (
                              <FaUsers className="text-secondary" />
                            ) : metric.label === "Projects" ? (
                              <GoProjectSymlink className="text-secondary" />
                            ) : (
                              <GrNotes className="text-secondary" />
                            )}
                          </div>
                          <span className="font-bold text-slate-700 tracking-tight">
                            {metric.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-base md:text-xl font-semibold text-secondary tabular-nums `}
                          >
                            {metric.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-9 shadow-sm rounded-2xl border border-slate-100">
                  {item.metrics.slice(2, 3).map((metric, index) => (
                    <div
                      key={index}
                      className="flex flex-col px-4 md:px-8 py-5 gap-2 hover:bg-slate-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          {metric.label === "Participants" ? (
                            <FaUsers className="text-secondary" />
                          ) : metric.label === "Projects" ? (
                            <GoProjectSymlink className="text-secondary" />
                          ) : (
                            <GrNotes className="text-secondary" />
                          )}
                        </div>
                        <span className="font-bold text-slate-700 tracking-tight">
                          {metric.label}
                        </span>
                      </div>
                      <div className="ml-11">
                        <span
                          className={`text-base font-semibold text-secondary tabular-nums `}
                        >
                          {metric.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </SlideUp>

          {/* Sidebar */}
          <SlideUp delay={0.2} className="space-y-8">
            <InfoSidebar location={item.location} dates={item.dates} />

            {/* Additional Quick Info */}
            {/* <div className="bg-white border text-center border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Status</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-xs font-medium ">
                   <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Verified Impact
                </div>
             </div> */}
          </SlideUp>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-slate-900 py-20 lg:py-32 px-6 text-white overflow-hidden relative border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tightest mb-8 uppercase leading-none">
            Join the <span className="text-secondary">Digital</span> <br />
            Revolution.
          </h3>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-medium">
            Connect with our network and contribute to the next phase of tech
            development in Nepal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/our-impact"
              className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-secondary hover:text-white transition-all transform hover:-translate-y-1"
            >
              All Impact
            </Link>
            <Link
              to="/contact-us"
              className="w-full sm:w-auto px-12 py-5 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-700 transition-all border border-slate-700"
            >
              Collaborate
            </Link>
          </div>
        </div>
        {/* Design Element */}
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-secondary/20 rounded-full blur-[120px] -mr-48 -mb-48" />
        <div className="absolute top-0 left-0 w-125 h-125 bg-blue-600/5 rounded-full blur-[120px] -ml-48 -mt-48" />
      </footer>
    </article>
  );
}

export default ImpactDetail;
