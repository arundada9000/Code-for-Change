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
      {/* <div className="max-w-7xl mx-auto px-6 mt-8">
        <Breadcrumbs crumbs={[{ name: "Our Impact", path: "/our-impact" }]} />
      </div> */}
      
      {/* Featured Impact Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <SlideUp className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tightest uppercase mb-2">Featured <span className="text-secondary">Initiatives</span></h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Direct social impact across Nepal</p>
        </SlideUp>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {currentImpacts.map((item, index) => {
            const id = item._id || item.id;
            return (
              <StaggerItem key={index} className={item.isLarge ? 'md:col-span-2 lg:col-span-2' : ''}>
                <Link 
                  to={`/our-impact/${id}`} 
                  className={`block h-full group bg-white rounded-4xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500`}
                >
                <div className="relative overflow-hidden aspect-16/10">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-secondary/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      Impact Story
                    </span>
                  </div>
                </div>
                
                <div className="p-8 lg:p-10">
                  <h3 className="text-2xl lg:text-3xl font-black text-primary mb-4 group-hover:text-secondary transition-colors tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                    <span className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> {item.location || "National"}
                    </span>
                    <span className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> {item.dates}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm lg:text-base leading-relaxed mb-8 line-clamp-2 font-medium">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                    READ FULL STORY <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* History Section */}
      <section className="bg-white py-16 lg:py-24 border-t border-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <SlideUp className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tightest uppercase mb-2">Our <span className="text-secondary">Activities</span></h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Archived impact reports & webinars</p>
          </SlideUp>

          <StaggerContainer className="space-y-4">
            {historyData.map((item, idx) => {
              const id = item._id || item.id;
              return (
                <StaggerItem key={idx}>
                  <Link 
                    to={`/our-impact/${id}`} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-4xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group gap-6"
                  >
                    <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <h4 className="text-xl lg:text-2xl font-black text-primary group-hover:text-secondary transition-colors tracking-tight">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-slate-500 text-sm font-medium line-clamp-1 mb-4">{item.description}</p>
                    <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg">{item.platform || item.location || "National"}</span>
                      <span className="px-3 py-1 bg-slate-100 rounded-lg">{item.dates}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-blue-400 group-hover:bg-secondary group-hover:text-white transition-all transform group-hover:rotate-45">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
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

