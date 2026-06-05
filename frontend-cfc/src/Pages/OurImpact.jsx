import React from 'react';
import { Link } from 'react-router-dom';
import Banner from '../Components/UI/Banner';
import SEO from '../Components/Common/SEO';
import useFetch from '../Hooks/useFetch';
import { ImpactCardSkeleton } from '../Components/Loading/Skeleton';
import { SlideUp, StaggerContainer, StaggerItem } from '../Components/Common/Animations';
import { FaArrowRight } from 'react-icons/fa';

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
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      <SEO 
        title="Our Impact"
        description="Discover how Code for Change Nepal is transforming the digital landscape through youth-led initiatives and technology programs."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Our Impact", path: "/our-impact" }]}
      />
      <Banner title="Harnessing the Power of Youth" />
      
      {/* Featured Impact Section - Editorial Offset Layout */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-20 lg:py-28">
        <SlideUp className="mb-24 flex flex-col items-center text-center">
          <div className="flex gap-3 items-center group cursor-pointer mb-6">
            <div className="w-12 h-0.5 bg-secondary transition-all duration-300 group-hover:w-20" />
            <h4 className="uppercase text-sm font-bold text-secondary">
              Our Work
            </h4>
            <div className="w-12 h-0.5 bg-secondary transition-all duration-300 group-hover:w-20" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
            Featured Initiatives
          </h2>
          <p className="text-lg md:text-xl text-slate-500 mt-6 max-w-2xl">
            Direct social impact through youth-led technology programs across Nepal. We build platforms, empower students, and bridge the digital divide.
          </p>
        </SlideUp>

        <div className="space-y-32 md:space-y-40">
          {currentImpacts.map((item, index) => {
            const id = item._id || item.id;
            const isEven = index % 2 === 0;
            
            return (
              <SlideUp key={id || index} delay={0.1}>
                <Link to={`/our-impact/${id}`} className="group relative block">
                  {/* Premium Background Card */}
                  <div className="absolute top-12 md:top-20 bottom-0 left-0 right-0 bg-white border border-slate-200/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] rounded-[3rem] transition-all duration-500 group-hover:shadow-[0_20px_50px_-12px_rgba(0,118,180,0.15)] group-hover:border-secondary/20" />
                  
                  <div className={`relative flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 p-6 md:p-12`}>
                    
                    {/* Floating Image */}
                    <div className="w-full md:w-5/12 h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-400/40 md:-mt-24 group-hover:-translate-y-4 transition-all duration-500 bg-white ring-8 ring-white">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500" />
                    </div>

                    {/* Content Block */}
                    <div className="w-full md:w-7/12 flex flex-col py-6 md:py-10">
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-secondary text-white shadow-md shadow-secondary/30 rounded-full text-[11px] font-black uppercase">
                          {item.location || "National"}
                        </span>
                        <span className="px-4 py-1.5 bg-blue-50 text-secondary rounded-full text-[11px] font-black uppercase">
                          {item.dates}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6 leading-tight tracking-tight group-hover:from-secondary group-hover:to-blue-600 transition-all duration-300">
                        {item.title}
                      </h3>
                      
                      <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-slate-900 font-bold group-hover:text-secondary transition-colors">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-secondary/30">
                           <FaArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                        </div>
                        <span className="text-sm uppercase font-black">Explore Initiative</span>
                      </div>
                    </div>
                    
                  </div>
                </Link>
              </SlideUp>
            );
          })}
        </div>
      </section>

      {/* History / Activities Section - Minimalist Rows */}
      <section className="py-20 lg:py-28 relative border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <SlideUp className="flex flex-col mb-16 lg:mb-20">
            <h4 className="uppercase text-sm font-bold text-secondary mb-4">
              Past Programs
            </h4>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Our Legacy
            </h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl">
              A comprehensive archive of our completed impact reports, historic webinars, and major community milestones.
            </p>
          </SlideUp>

          <StaggerContainer className="flex flex-col gap-6">
            {historyData.map((item, idx) => {
              const id = item._id || item.id;
              
              return (
                <StaggerItem key={id || idx}>
                  <Link 
                    to={`/our-impact/${id}`} 
                    className="group flex flex-col md:flex-row md:items-center gap-6 p-4 md:p-6 bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.15)] hover:border-secondary/30 hover:-translate-y-2 transition-all duration-400"
                  >
                    {/* Thumbnail Image */}
                    {item.image && (
                      <div className="w-full md:w-32 h-48 md:h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      </div>
                    )}
                    
                    {/* Content Column */}
                    <div className="flex-1 px-2 md:px-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-secondary font-black text-[10px] uppercase bg-secondary/10 px-3 py-1 rounded-full shadow-sm">
                          {item.dates}
                        </span>
                        {item.location && (
                           <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                             • {item.location}
                           </span>
                        )}
                      </div>
                      <h4 className="text-xl md:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent mb-2 group-hover:from-secondary group-hover:to-secondary transition-all leading-tight tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed line-clamp-2 md:pr-10">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Action Icon */}
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-secondary group-hover:text-white transition-all shrink-0 md:mr-4 border border-slate-100 group-hover:border-secondary shadow-sm group-hover:shadow-md">
                      <FaArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
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


