import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiAward,
  FiArrowLeft,
  FiMapPin,
  FiActivity,
  FiGlobe,
} from "react-icons/fi";
import { FaSearch, FaFilter, FaStar, FaTiktok } from "react-icons/fa";
import API from "../Services/api";
import SEO from "../Components/Common/SEO";
import { provinces } from "./Provinces";
import { ALUMNI } from "../Data/teamData";
import EventCard from "../Components/UI/EventCard";
import { Pulse } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp } from "../Components/Common/Animations";
import { motion } from "framer-motion";
import TeamMemberModal from "../Components/UI/Modal/TeamMemberModal";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const socialIcons = {
  linkedin: <FaLinkedinIn />,
  facebook: <FaFacebookF />,
  instagram: <FaInstagram />,
  github: <FaGithub />,
  youtube: <FaYoutube />,
  twitter: <FaTwitter />,
  website: <FiGlobe />,
  tiktok: <FaTiktok />,
};

const TeamMemberCard = ({ member, themeColor, index = 0, onClick }) => {
  // Filter social links that exist
  const availableSocials = Object.entries(member.socialLinks || {}).filter(
    ([_, url]) => url,
  );

  return (
    <motion.div
      onClick={() => onClick(member)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.1 * index,
        type: "spring",
        stiffness: 80,
        damping: 20,
      }}
      style={{ "--theme-color": themeColor }}
      className={`group relative hover:shadow-xl hover:-translate-y-2 transition-all ease-in duration-300 cursor-pointer hover:bg-(--theme-color)`}
    >
      <div
        className="relative overflow-hidden w-full h-60 mb-2 transition-all duration-500"
        style={{
          border: `1px solid ${themeColor}20`,
          boxShadow: `0 10px 30px -15px ${themeColor}30`,
        }}
      >
        <img
          src={
            member.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              member.name,
            )}&background=random&color=fff`
          }
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Social Media Icons Overlay */}
        {availableSocials.length > 0 && (
          <>
            {/* Left Column (first 3 icons) */}
            <div className="absolute top-3 left-5 md:right-3 flex flex-col gap-2 z-20">
              {availableSocials.slice(0, 4).map(([platform, url], idx) => (
                <a
                  key={platform}
                  href={url.startsWith("http") ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-linear-to-tl from-white/20 to-transparent backdrop-blur-md border-t border-t-white text-primary shadow-md
                  transform translate-x-[-10px] md:opacity-0
                  group-hover:translate-x-0 md:group-hover:opacity-100
                  transition-all duration-500`}
                  style={{ transitionDelay: `${idx * 75}ms` }}
                >
                  {socialIcons[platform] || <FiExternalLink />}
                </a>
              ))}
            </div>

            {/* Right Column (next 3 icons) */}
            <div className="absolute top-3 right-5 md:right-3 flex flex-col gap-2 z-20">
              {availableSocials.slice(4, 7).map(([platform, url], idx) => (
                <a
                  key={platform}
                  href={url.startsWith("http") ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-linear-to-tl from-white/20 to-transparent backdrop-blur-md border-t border-t-white text-primary shadow-md
                  transform translate-x-[10px] md:opacity-0
                  group-hover:translate-x-0 md:group-hover:opacity-100
                  transition-all duration-500`}
                  style={{ transitionDelay: `${idx * 75}ms` }}
                >
                  {socialIcons[platform] || <FiExternalLink />}
                </a>
              ))}
            </div>
          </>
        )}

        {/* Dynamic Themed Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6"
          style={{
            background: `linear-gradient(to top, ${themeColor}30, transparent)`,
          }}
        ></div>
      </div>

      <div className="text-center  pb-2">
        <h4
          className="font-bold tracking-tight text-(--theme-color) text-base group-hover:text-white transition-colors"
          style={{ "--theme-color": themeColor }}
        >
          {member.name}
        </h4>
        <p
          className="text-[11px] font-semibold uppercase text-(--theme-color) group-hover:text-white  tracking-[0.15em] mt-1.5 opacity-80"
          style={{ "--theme-color": themeColor }}
        >
          {member.position}
        </p>
      </div>
    </motion.div>
  );
};

const ProvinceDetails = () => {
  const { provinceName } = useParams();
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  // Events filter + pagination state
  const [eventSearch, setEventSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventNational, setEventNational] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

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
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000",
  );

  // Fetch background resource from admin-uploaded assets (with fallback)
  useEffect(() => {
    API.get(
      `/resources?category=background&subject=${encodeURIComponent(displayName)}`,
    )
      .then((res) => {
        const items = res.data?.data;
        if (Array.isArray(items) && items.length > 0 && items[0].fileUrl) {
          setHeroImage(items[0].fileUrl);
        }
      })
      .catch(() => {}); // Silently fall back to default on error
  }, [displayName]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, teamRes, usersRes] = await Promise.allSettled([
          // Use region query param directly — fixes the province/location mismatch bug
          API.get(
            `/events?region=${encodeURIComponent(displayName)}&limit=100`,
          ),
          API.get("/team"),
          API.get("/users/public-users"),
        ]);

        const allEvents =
          eventsRes.status === "fulfilled"
            ? eventsRes.value.data.data?.events ||
              eventsRes.value.data.data ||
              []
            : [];
        const allTeam =
          teamRes.status === "fulfilled" ? teamRes.value.data.data : [];
        const allPublicUsers =
          usersRes.status === "fulfilled" ? usersRes.value.data.data : [];

        // No client-side filtering needed for events — backend already matches by region
        const filteredTeamMembers = allTeam.filter(
          (m) =>
            m.province?.toLowerCase() === displayName.toLowerCase() ||
            (!m.province &&
              m.region?.toLowerCase() === displayName.toLowerCase()) ||
            m.region === "All",
        );

        // console.log(allPublicUsers);

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
              college: u.education?.collegeName,
              bio: u.bio,
              type: ["eb"].includes(u.role) ? "executive" : "member",
              socialLinks: {
                linkedin: u.linkedin,
                github: u.github,
                facebook: u.facebook,
                twitter: u.twitter,
                website: u.website,
              },
              isPublicUser: true,
            })) || [];

        const combinedTeam = [...filteredTeamMembers, ...provincialPublicUsers];
        const centralAdvisors = allTeam.filter((m) => m.type === "Advisor");
        const boardMembersData = allTeam.filter(
          (m) => m.type === "Board Member",
        );

        // console.log(centralAdvisors);

        setEvents(allEvents);
        setTeam(combinedTeam);
        setAdvisors(centralAdvisors);
        setBoardMembers(boardMembersData);
      } catch (error) {
        console.error("Failed to fetch province data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [displayName]);

  console.log(advisors);

  // Filter social links that exist

  // Generate Person JSON-LD for team members (helps Google index members without individual pages)
  const teamJsonLd =
    team.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: `Code for Change Nepal - ${displayName}`,
          url: `${window.location.origin}/provinces/${provinceName}`,
          member: team.map((member) => ({
            "@type": "Person",
            name: member.name,
            ...(member.role && { jobTitle: member.position || member.role }),
            ...(member.image && { image: member.image }),
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-100">
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
        <SlideUp
          delay={0.1}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <StatCard
            icon={<FiUsers />}
            label="Executive Board"
            value={team.filter((m) => m.role === "eb").length.toString()}
            accent={themeColor}
          />
          <StatCard
            icon={<FiAward />}
            label="College Reps"
            value={team.filter((m) => m.role === "cr").length.toString()}
            accent={themeColor}
          />
          <StatCard
            icon={<FiActivity />}
            label="General Members"
            value={team.filter((m) => m.role === "gm").length.toString()}
            accent={themeColor}
          />
          <StatCard
            icon={<FiCalendar />}
            label="Initiatives"
            value={events.length.toString()}
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
                College Representatives
              </h4>
              <p className="text-slate-500 text-sm font-medium">
                Connecting 15+ institutions to our core mission.
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

      {/* Central Advisors */}
      <div className="max-w-7xl mx-auto pb-14 md:py-14 px-6">
        <div className="flex justify-between mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
            Central <span style={{ color: themeColor }}>Advisors</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Strategic Guidance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {advisors.map((advisor, i) => {
            const availableSocials = Object.entries(
              advisor.socialLinks || {},
            ).filter(([_, url]) => !!url);
            return (
              <div
                onClick={() =>
                  setSelectedMember({
                    ...advisor,
                    name: advisor.name,
                    role: advisor.designation || advisor.role,
                    image: advisor.image,
                    bio: advisor.quote,
                    socialLinks: advisor.socialLinks || {},
                  })
                }
                key={i}
                className="bg-white p-8 rounded-3xl cursor-pointer border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group relative overflow-hidden"
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
                    <h4 className=" text-primary text-xl leading-tight">
                      {advisor.name}
                    </h4>
                    <p
                      className="text-[11px] mt-1.5"
                      style={{ color: themeColor }}
                    >
                      {advisor.designation}
                    </p>
                    <p className="text-[10px]  text-slate-400  mt-1">
                      {advisor.organization}
                    </p>
                  </div>
                </div>
                {/* Social Links - Positioned at bottom */}

                <div className="mt-4 flex flex-wrap gap-2">
                  {availableSocials.map(([platform, url], idx) => (
                    <a
                      key={platform}
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white group-hover:translate-y-0 translate-y-2 opacity-100"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        transitionDelay: `${idx * 50}ms`,
                      }}
                    >
                      {socialIcons[platform] || <FiExternalLink size={12} />}
                    </a>
                  ))}
                </div>
                <div
                  className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5 transition-transform duration-700 group-hover:scale-150"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Immediate past project lead (IPPL pannel) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
            Immediate Past{" "}
            <span style={{ color: themeColor }}>Project Lead</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            IPPL Panel
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter((m) => m.role === "ippl").length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team
              .filter((m) => m.role === "ippl")
              .map((member, i) => (
                <TeamMemberCard
                  key={member._id || i}
                  member={member}
                  themeColor={themeColor}
                  index={i}
                  onClick={setSelectedMember}
                />
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 italic">
            No IPPL members found for this region.
          </div>
        )}
      </section>

      {/* Regional Advisors */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
            Regional <span style={{ color: themeColor }}>Advisors</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Advisors
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter((m) => m.role === "advisor").length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team
              .filter((m) => m.role === "advisor")
              .map((member, i) => (
                <TeamMemberCard
                  key={member._id || i}
                  member={member}
                  themeColor={themeColor}
                  index={i}
                  onClick={setSelectedMember}
                />
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 italic">
            No regional advisors found for this region.
          </div>
        )}
      </section>

      {/* Executive Member */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
            Executive <span style={{ color: themeColor }}>Body</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Executive Members
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter((m) => m.role === "eb").length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team
              .filter((m) => m.role === "eb")
              .map((member, i) => (
                <TeamMemberCard
                  key={member._id || i}
                  member={member}
                  themeColor={themeColor}
                  index={i}
                  onClick={setSelectedMember}
                />
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 italic">
            No executive members found for this region.
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
            CR
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter((m) => m.role === "cr").length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team
              .filter((m) => m.role === "cr")
              .map((member, i) => (
                <TeamMemberCard
                  key={member._id || i}
                  member={member}
                  themeColor={themeColor}
                  index={i}
                  onClick={setSelectedMember}
                />
              ))}
          </div>
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
            GM
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Pulse className="w-full aspect-4/5 rounded-2xl" />
                <Pulse className="h-4 w-24 rounded mx-auto" />
                <Pulse className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : team.filter((m) => m.role === "gm").length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {team
              .filter((m) => m.role === "gm")
              .map((member, i) => (
                <TeamMemberCard
                  key={member._id || i}
                  member={member}
                  themeColor={themeColor}
                  index={i}
                  onClick={setSelectedMember}
                />
              ))}
          </div>
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
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                Provincial <span style={{ color: themeColor }}>Alumni</span>
              </h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                Regional Alumni Members
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 p-4 rounded-3xl"
                    style={{ backgroundColor: `${themeColor}20` }}
                  >
                    <Pulse className="w-full aspect-4/5 rounded-2xl" />
                    <Pulse className="h-4 w-24 rounded mx-auto" />
                    <Pulse className="h-3 w-16 rounded mx-auto" />
                  </div>
                ))}
              </div>
            ) : team.filter((m) => m.role === "alumni").length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                {team
                  .filter((m) => m.role === "alumni")
                  .map((member, i) => (
                    <TeamMemberCard
                      key={member._id || i}
                      member={member}
                      themeColor={themeColor}
                      index={i}
                      onClick={setSelectedMember}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 italic">
                No provincial alumni found for this region.
              </div>
            )}

            {/* Board Members Section */}
            {boardMembers.length > 0 && (
              <div className="mt-20">
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                  <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                    Board <span style={{ color: themeColor }}>Members</span>
                  </h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                    Strategic Leadership
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                  {boardMembers.map((member, i) => (
                    <TeamMemberCard
                      key={member._id || i}
                      member={{
                        ...member,
                        position: member.designation || member.position,
                      }}
                      themeColor={themeColor}
                      index={i}
                      onClick={setSelectedMember}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Events Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 border-t">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left mb-3">
            <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
              Events in <span style={{ color: themeColor }}>{displayName}</span>
            </h2>
            <span className="bg-slate-100 px-4 py-2 rounded-full uppercase text-[10px] md:text-xs font-semibold text-primary/70 whitespace-nowrap">
              {events.length} {events.length !== 1 ? "Events" : "Event"}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Impactful sessions conducted by this chapter.
          </p>

          {/* Events Filter Bar */}
          {events.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventSearch}
                  onChange={(e) => {
                    setEventSearch(e.target.value);
                    setVisibleCount(6);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-400 rounded-full text-sm outline-none focus:ring focus:ring-secondary focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <select
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value);
                  setVisibleCount(6);
                }}
                className="px-4 py-3 border border-slate-400 rounded-full text-sm font-medium outline-none focus:ring focus:ring-secondary focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {[
                  "hackathon",
                  "workshop",
                  "webinar",
                  "conference",
                  "social_impact",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
              <select
                value={eventNational}
                onChange={(e) => {
                  setEventNational(e.target.value);
                  setVisibleCount(6);
                }}
                className="px-4 py-3 border border-slate-400 rounded-full text-sm font-medium outline-none focus:ring focus:ring-secondary focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">All Scope</option>
                <option value="national">National</option>
                <option value="local">Local</option>
              </select>
            </div>
          )}
        </div>

        {(() => {
          // Client-side filter on already-fetched region events
          const filtered = events.filter((e) => {
            const matchSearch =
              !eventSearch ||
              e.title?.toLowerCase().includes(eventSearch.toLowerCase());
            const matchType = !eventType || e.type === eventType;
            const matchNational =
              !eventNational ||
              (eventNational === "national" ? e.isNational : !e.isNational);
            return matchSearch && matchType && matchNational;
          });
          const visible = filtered.slice(0, visibleCount);
          const hasMore = filtered.length > visibleCount;

          if (loading)
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
                  >
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
            );

          if (filtered.length === 0)
            return (
              <div className="text-center text-gray-400 italic py-12">
                No events found matching the current filters.
              </div>
            );

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visible.map((event, i) => (
                  <motion.div
                    key={event._id || i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.05 * i,
                      type: "spring",
                      stiffness: 80,
                      damping: 20,
                    }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount((v) => v + 6)}
                    className="px-8 py-3 rounded-full font-bold text-sm text-white shadow-lg transition-all hover:scale-105"
                    style={{ backgroundColor: themeColor }}
                  >
                    Load More ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </section>

      <TeamMemberModal
        isOpen={!!selectedMember}
        member={selectedMember}
        links={selectedMember?.socialLinks}
        onClose={() => setSelectedMember(null)}
      />
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
