import React from 'react';
import { Link } from 'react-router-dom';
import Banner from '../Components/UI/Banner';
import Breadcrumbs from '../Components/UI/Breadcrumbs';
import SEO from '../Components/Common/SEO';
import useFetch from '../Hooks/useFetch';
import { ImpactCardSkeleton } from '../Components/Loading/Skeleton';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '../Components/Common/Animations';

export function OurImpact() {
  const { data: apiImpacts, loading } = useFetch("/impacts");

  const impacts = Array.isArray(apiImpacts) ? apiImpacts : [];
  
  const currentImpacts = impacts.filter(item => item.category === "Current");
  const historyData = impacts.filter(item => item.category === "History");

  if (loading) return (
    <div className="bg-[#fbfcff] min-h-screen font-sans">
      <Banner title="Harnessing the Power of Youth" />
      <ImpactCardSkeleton />
    </div>
  );

  return (
    <div className="bg-[#fbfcff] min-h-screen font-sans">
      <SEO 
        title="Our Impact"
        description="Discover how Code for Change Nepal is transforming the digital landscape through youth-led initiatives and technology programs."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Our Impact", path: "/our-impact" }]}
      />
      <Banner title="Harnessing the Power of Youth" />
      
      {/* Featured Impact Section */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-12 lg:py-20">
        <SlideUp className="mb-10">
          <p className="text-sm font-semibold text-secondary tracking-wide mb-2">Our Work</p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Featured Initiatives</h2>
          <p className="text-base text-slate-500 mt-2 max-w-xl">Direct social impact through youth-led technology programs across Nepal.</p>
        </SlideUp>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {currentImpacts.map((item, index) => {
            const id = item._id || item.id;
            return (
              <StaggerItem key={index} className={item.isLarge ? 'md:col-span-2 lg:col-span-2' : ''}>
                <Link 
                  to={`/our-impact/${id}`} 
                  className="block h-full group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300"
                >
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium rounded-full">
                        {item.location || "National"}
                      </span>
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium rounded-full">
                        {item.dates}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 lg:p-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-primary mb-2 group-hover:text-secondary transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-secondary text-sm font-medium group-hover:gap-3 transition-all">
                      Read more
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* History / Activities Section */}
      <section className="bg-white py-12 lg:py-20 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <SlideUp className="text-center mb-10 lg:mb-14">
            <p className="text-sm font-semibold text-secondary tracking-wide mb-2">Past Programs</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Our Activities</h2>
            <p className="text-base text-slate-500 mt-2 max-w-md mx-auto">Archived impact reports, webinars, and community events.</p>
          </SlideUp>

          <StaggerContainer className="space-y-3">
            {historyData.map((item, idx) => {
              const id = item._id || item.id;
              return (
                <StaggerItem key={idx}>
                  <Link 
                    to={`/our-impact/${id}`} 
                    className="flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-xl border border-slate-100 hover:border-secondary/20 hover:bg-secondary/[0.02] transition-all group"
                  >
                    {/* Thumbnail */}
                    {item.image && (
                      <div className="hidden sm:block w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-semibold text-primary group-hover:text-secondary transition-colors leading-snug truncate">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-1 mt-0.5">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {item.platform || item.location || "National"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {item.dates}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-secondary group-hover:text-white transition-all flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}


