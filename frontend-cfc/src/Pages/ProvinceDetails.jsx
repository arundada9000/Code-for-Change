import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiAward,
  FiArrowLeft,
  FiMapPin,
  FiActivity,
} from "react-icons/fi";
import API from "../Services/api";
import SEO from "../Components/Common/SEO";
import { provinces } from "./Provinces";
import { ADVISORS, CORE_TEAM, ALUMNI } from "../Data/teamData";
import EventCard from "../Components/UI/EventCard";
import { Pulse } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "../Components/Common/Animations";

const TeamMemberCard = ({ member, themeColor }) => (
  <StaggerItem
    className="group relative p-4 backdrop-blur rounded-3xl"
    style={{ backgroundColor: `${themeColor}30` }}
  >
    <div
      className="relative overflow-hidden rounded-2xl aspect-4/5 mb-4 transition-all duration-500"
      style={{
        border: `1px solid ${themeColor}20`,
        boxShadow: `0 10px 30px -15px ${themeColor}30`,
      }}
    >
      <img
        src={
          member.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`
        }
        alt={member.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Dynamic Themed Overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6"
        style={{
          background: `linear-gradient(to top, ${themeColor}55, transparent)`,
        }}
      >
        {/* <p className="text-white font-black text-base tracking-tight mb-1">{member.name}</p> */}
        {/* <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">{member.role}</p> */}
      </div>
    </div>
    <div className="text-center">
      <h4
        className="font-bold tracking-tight text-primary text-base group-hover:text-primary transition-colors"
        style={{ color: themeColor }}
      >
        {member.name}
      </h4>
      <p
        className="text-[11px] font-black uppercase tracking-[0.15em] mt-1.5 opacity-80"
        style={{ color: themeColor }}
      >
        {member.role}
      </p>
    </div>
  </StaggerItem>
);

const ProvinceDetails = () => {
  const { provinceName } = useParams();
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = provinceName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const activeProvince = provinces.find(
    (p) => p.name.toLowerCase() === displayName.toLowerCase(),
  );

  const themeColor = activeProvince?.colorCode;

  // Dynamic Hero Image Map (Fallback Defaults)
  const provinceHeroImages = {
    Kathmandu:
      "https://images.unsplash.com/photo-1544216717-3bbf52512659?q=80&w=2000",
    Pokhara:
      "https://images.unsplash.com/photo-1583002622765-b77271971778?q=80&w=2000",
    Rupandehi:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000",
    Dang: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000",
    Birgunj:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000",
    Farwest:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000",
    Koshi:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000",
    Chitwan:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000",
    "LB Karnali":
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2000",
  };

  const [heroImage, setHeroImage] = useState(
    provinceHeroImages[displayName] ||
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000"
  );

  // Fetch background resource from admin-uploaded assets (with fallback)
  useEffect(() => {
    API.get(`/resources?category=background&subject=${encodeURIComponent(displayName)}`)
      .then(res => {
        const items = res.data?.data;
        if (Array.isArray(items) && items.length > 0 && items[0].fileUrl) {
          setHeroImage(items[0].fileUrl);
        }
      })
      .catch(() => {}); // Silently fall back to default on error
  }, [displayName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, teamRes, usersRes] = await Promise.allSettled([
          API.get("/events"),
          API.get("/team"),
          API.get("/users/public-users"),
        ]);

        const allEvents =
          eventsRes.status === "fulfilled" ? eventsRes.value.data.data : [];
        const allTeam =
          teamRes.status === "fulfilled" ? teamRes.value.data.data : [];
        const allPublicUsers =
          usersRes.status === "fulfilled" ? usersRes.value.data.data : [];

        // Filter events by province (Assuming backend doesn't filter by province yet, or we need to add 'location' or 'province' field to Event model)
        // The Event model has 'location' string. We might need to fuzzy match or just show all for now if location isn't structured.
        // For now, let's filter if location includes province name.
        const filteredEvents = allEvents.filter((e) =>
          e.location?.toLowerCase().includes(displayName.toLowerCase()),
        );

        // Filter team by province (check new field 'province' first, then 'region')
        const filteredTeamMembers = allTeam.filter(
          (m) =>
            m.province?.toLowerCase() === displayName.toLowerCase() ||
            (!m.province &&
              m.region?.toLowerCase() === displayName.toLowerCase()) ||
            m.region === "All",
        );

        // Filter and map public users
        const provincialPublicUsers =
          allPublicUsers
            ?.filter(
              (u) => u.province?.toLowerCase() === displayName.toLowerCase(),
            )
            .map((u) => ({
              _id: u._id,
              name: u.name,
              role: u.role,
              position: u.executiveDetails?.position || u.role,
              image: u.profileImage,
              isPublicUser: true,
            })) || [];

        // Combine both sources
        const combinedTeam = [...filteredTeamMembers, ...provincialPublicUsers];

        setEvents(filteredEvents);
        setTeam(combinedTeam);
      } catch (error) {
        console.error("Failed to fetch province data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [displayName]);

  // Generate Person JSON-LD for team members (helps Google index members without individual pages)
  const teamJsonLd = team.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": `Code for Change Nepal - ${displayName}`,
    "url": `${window.location.origin}/provinces/${provinceName}`,
    "member": team.map(member => ({
      "@type": "Person",
      "name": member.name,
      ...(member.role && { "jobTitle": member.position || member.role }),
      ...(member.image && { "image": member.image }),
    }))
  } : null;

  return (
    <div key={provinceName} className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-100">
      <SEO
        title={`${displayName} Chapter`}
        description={`Empowering technology students in ${displayName} through youth initiative and digital projects by Code for Change Nepal.`}
        image={heroImage}
        jsonLd={teamJsonLd}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Provinces", path: "/provinces" },
          { name: displayName, path: `/provinces/${provinceName}` },
        ]}
      />
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            className="w-full h-full object-cover opacity-60 transition-all duration-1000 animate-subtle-zoom"
            alt={`${displayName} Hero`}
          />
          {/* Dynamic Gradient Overlay */}
          <div
            className="absolute inset-0 mix-blend-multiply opacity-70"
            style={{ backgroundColor: themeColor }}
          />
        </div>

        <FadeIn className="relative z-10 text-center px-4 md:px-6 max-w-4xl">
          <Link
            to="/provinces"
            className="inline-flex items-center gap-2 mb-4 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 hover:bg-white/20 transition-all active:scale-95"
          >
            <FiArrowLeft /> Back
          </Link>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white mb-2 uppercase tracking-tightest leading-[0.8]">
            {displayName}
            <span className="block text-2xl md:text-4xl lg:text-5xl font-light opacity-80 tracking-tight mt-4 italic font-serif lowercase">
              Chapter
            </span>
          </h1>
        </FadeIn>

        {/* Floating Watermark */}
        <div className="absolute -bottom-10 -right-10 text-[20rem] font-black text-white/[0.03] select-none pointer-events-none leading-none">
          {displayName[0]}
        </div>
      </section>

      {/* <div className="max-w-7xl mx-auto px-4 mt-8">
        <Breadcrumbs crumbs={[
          { name: "Provinces", path: "/provinces" },
          { name: displayName, path: `/provinces/${provinceName}` }
        ]} />
      </div> */}

      {/* 2. Floating Stats Glass-morphism */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 md:-mt-24 relative z-30">
        <SlideUp delay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            icon={<FiUsers />}
            label="Province Reach"
            value={`${team.length * 5}+`} // Estimation based on team size
            accent={themeColor}
          />
          <StatCard
            icon={<FiCalendar />}
            label="Initiatives"
            value={events.length.toString()}
            accent={themeColor}
          />
          <StatCard
            icon={<FiAward />}
            label="Active Cycle"
            value={`${new Date().getFullYear()}/${(new Date().getFullYear() + 1).toString().slice(-2)}`}
            accent={themeColor}
          />
          <StatCard
            icon={<FiActivity />}
            label="Core Team"
            value={team.length.toString()}
            accent={themeColor}
          />
        </SlideUp>
      </section>

      {/* 3. Narrative & Visual Split */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
        <SlideUp className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-4">
            <FiMapPin style={{ color: themeColor }} /> Regional Presence
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tighter leading-[1.1]">
            Bridging the gap in <br />
            <span style={{ color: themeColor }}>Digital Excellence.</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed mb-6 font-medium">
            The {displayName} chapter is more than a team; it’s a high-velocity
            incubator. We bridge the critical divide between theoretical
            curriculum and global industrial standards for IT students.
          </p>

          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex gap-6 items-center group hover:border-slate-200 transition-colors">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shrink-0 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: themeColor }}
            >
              CR
            </div>
            <div>
              <h4 className="font-bold text-primary text-lg">
                Class Representatives
              </h4>
              <p className="text-slate-500 text-sm font-medium">
                Connecting 15+ premium institutions to our core mission.
              </p>
            </div>
          </div>
        </SlideUp>

        <SlideUp delay={0.2} className="order-1 lg:order-2 relative">
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500"
              className="rounded-[2.5rem] shadow-2xl translate-y-12"
              alt="Collab"
            />
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=500"
              className="rounded-[2.5rem] shadow-2xl"
              alt="Code"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-slate-100 -rotate-6 rounded-[3rem] -z-10" />
        </SlideUp>
      </section>

      {/* 4. Strategic Roadmap - Clean & Managed */}
      {/* <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
              Strategic <span style={{ color: themeColor }}>Roadmap</span>
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              Milestones & Goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {["Awareness", "Skill Building", "Placement"].map((goal, i) => (
              <div
                key={i}
                className="p-8 rounded-[2rem] bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-black text-primary tracking-tight">{goal}</h4>
                  <span 
                    className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
                    style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                  >
                    Phase 0{i + 1}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${80 - i * 20}%`,
                        backgroundColor: themeColor,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Target Reach
                    </p>
                    <p className="text-sm font-black text-primary" style={{ color: themeColor }}>
                      {80 - i * 20}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 5. Team - Dynamic */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
            Executive <span style={{ color: themeColor }}>Panel</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Executive Board of Members
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-3xl" style={{ backgroundColor: `${themeColor}20` }}>
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter(m => m.role === 'eb').length > 0 ? (
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team.filter(m => m.role === 'eb').map((member, i) => (
              <TeamMemberCard
                key={member._id || i}
                member={member}
                themeColor={themeColor}
              />
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center text-gray-400 italic">
            No executive board members found for this region.
          </div>
        )}
      </section>
      {/* College representative */}
      <section className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            College <span style={{ color: themeColor }}>Representatives</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Board of CR
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-3xl" style={{ backgroundColor: `${themeColor}20` }}>
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter(m => m.role === 'cr').length > 0 ? (
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team.filter(m => m.role === 'cr').map((member, i) => (
              <TeamMemberCard
                key={member._id || i}
                member={member}
                themeColor={themeColor}
              />
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center text-gray-400 italic">
            No college representatives found for this region.
          </div>
        )}
      </section>

      {/* General member */}
      <section className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            General <span style={{ color: themeColor }}>Member</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Board of GM
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-3xl" style={{ backgroundColor: `${themeColor}20` }}>
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter(m => m.role === 'gm').length > 0 ? (
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team.filter(m => m.role === 'gm').map((member, i) => (
              <TeamMemberCard
                key={member._id || i}
                member={member}
                themeColor={themeColor}
              />
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center text-gray-400 italic">
            No general members found for this region.
          </div>
        )}
      </section>
      {/* 5.1 Central Advice & Leadership - Static */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          {/* National Alumni */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                National <span style={{ color: themeColor }}>Alumni</span>
              </h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                National Alumni Members
              </p>
            </div>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
              {ALUMNI.map((member, i) => (
                <TeamMemberCard
                  key={i}
                  member={member}
                  themeColor={themeColor}
                />
              ))}
            </StaggerContainer>
          </div>

          {/* Central Advisors */}
          <div>
            <div className="flex flex-col md:flex-row-reverse justify-between items-end mb-8 gap-4 md:text-right">
              <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                Central <span style={{ color: themeColor }}>Advisors</span>
              </h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                Strategic Guidance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {ADVISORS.map((advisor, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: themeColor }}
                  />
                  <div className="flex items-center gap-6 mb-6">
                    <img
                      src={advisor.image}
                      className="w-20 h-20 rounded-2xl object-cover transition-all duration-500 shadow-md transform group-hover:scale-110"
                      alt={advisor.name}
                    />
                    <div>
                      <h4 className="font-black text-primary text-xl leading-tight">
                        {advisor.name}
                      </h4>
                      <p
                        className="text-[11px] font-black uppercase tracking-widest mt-1.5"
                        style={{ color: themeColor }}
                      >
                        {advisor.role}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {advisor.organization}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 italic font-medium leading-relaxed relative z-10">
                    "{advisor.quote}"
                  </p>
                  <div
                    className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5 transition-transform duration-700 group-hover:scale-150"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* National Leadership */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                National <span style={{ color: themeColor }}>Leadership</span>
              </h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                Core Members
              </p>
            </div>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
              {CORE_TEAM.map((member, i) => (
                <TeamMemberCard
                  key={i}
                  member={member}
                  themeColor={themeColor}
                />
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* 6. Gallery - Dynamic Events */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 border-t">
        <div className="mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight line-clamp-1">
              Events in <span style={{ color: themeColor }}>{displayName}</span>
            </h2>
            <span className="bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest text-[10px] md:text-xs font-black text-slate-500 whitespace-nowrap">
              {events.length} {events.length > 1 ? "Events" : "Event"}
            </span>
          </div>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Impactful sessions conducted by this chapter.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <Pulse className="w-full h-48 rounded-none" />
                <div className="p-6 space-y-3">
                  <Pulse className="h-5 w-full rounded" />
                  <Pulse className="h-4 w-3/4 rounded" />
                  <div className="flex gap-3 mt-2">
                    <Pulse className="h-4 w-20 rounded" />
                    <Pulse className="h-4 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <StaggerItem key={event._id || i}>
                <EventCard event={event} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center text-gray-400 italic">
            No events found in this region.
          </div>
        )}
      </section>
    </div>
  );
};

// Premium Stat Card
const StatCard = ({ icon, label, value, accent }) => (
  <div
    className="bg-white/90 backdrop-blur-xl p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center border-t-4 group hover:-translate-y-2 active:scale-95 transition-all duration-500"
    style={{
      borderColor: accent,
      boxShadow: `0 15px 30px -15px ${accent}40`,
    }}
  >
    <div
      className="text-2xl md:text-3xl mb-3 md:mb-4 transition-transform duration-500 group-hover:scale-125"
      style={{ color: accent }}
    >
      {icon}
    </div>
    <p className="text-3xl md:text-5xl font-black mb-1 md:mb-2 text-primary tracking-tightest italic leading-none">
      {value}
    </p>
    <p className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em] md:tracking-[0.25em] text-slate-400 group-hover:text-primary transition-colors">
      {label}
    </p>
  </div>
);

export default ProvinceDetails;
