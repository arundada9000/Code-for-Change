import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "../Components/Common/Animations";
// import TeamMemberModal from "../Components/UI/Modal/TeamMemberModal";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import {
  FiArrowRight,
  FiUsers,
  FiStar,
  FiAward,
  FiExternalLink,
  FiGlobe,
} from "react-icons/fi"; // Example icons

// Updated Information
const provinces = [
  { name: "Kathmandu", colorCode: "#CA163A" },
  { name: "Pokhara", colorCode: "#F2CA50" },
  { name: "Rupandehi", colorCode: "#880696" },
  { name: "Dang", colorCode: "#6C757D" },
  { name: "Birgunj", colorCode: "#00A155" },
  { name: "Farwest", colorCode: "#FF914C" },
  { name: "Koshi", colorCode: "#EF7B97" },
  { name: "Chitwan", colorCode: "#964A01" },
  { name: "LB Karnali", colorCode: "#bbd704" },
];

// Position hierarchy
const positionOrder = [
  "project-lead",
  "vice-project-lead",
  "secretary",
  "treasurer",
  "vice-secretary",
  "vice-treasurer",
  "pr-lead",
  "hr-lead",
  "operation-lead",
  "tech-lead",
  "admin-lead",
  "executive-member",
];

import useFetch from "../Hooks/useFetch";
import { ADVISORS, CORE_TEAM, ALUMNI } from "../Data/teamData";
import TeamMemberModal from "../Components/UI/Modal/TeamMemberModal";

const Provinces = () => {
  const { data: apiTeam, Loading } = useFetch("/team", []);
  const { data: provincialStats } = useFetch("/province-stats", {});
  const { data: publicUsers } = useFetch("/users/public-users", []);

  // console.log(publicUsers);
  // console.log(provincialStats);
  // console.log(apiTeam);
  // console.log("hello")

  const [activeTab, setActiveTab] = useState("Kathmandu");
  const [selectedMember, setSelectedMember] = useState(null);

  // Map static data instead of filtering from API for advisors and core team as requested
  const advisorsData = ADVISORS;
  const coreData = CORE_TEAM;
  const alumniData = ALUMNI;

  // Refined filtering to check both 'province' (new) and 'region' (old)
  const provincialMembersFromTeam =
    apiTeam?.filter(
      (m) =>
        m.province?.toLowerCase() === activeTab?.toLowerCase() ||
        (!m.province && m.region?.toLowerCase() === activeTab?.toLowerCase()),
    ) || [];

  // Map public users to match team member structure for consistent rendering
  const provincialMembersFromUsers =
    publicUsers
      ?.filter((u) => u.province?.toLowerCase() === activeTab?.toLowerCase())
      .map((u) => ({
        _id: u._id,
        name: u.name,
        role: u.role,
        position: u.executiveDetails?.position || u.role,
        image: u.profileImage, // Map profileImage to image
        college: u.education?.collegeName,
        bio: u.bio,
        type: ["eb"].includes(u.role) ? "executive" : "member", // Categorize for filtering below
        socialLinks: {
          linkedin: u.linkedin,
          github: u.github,
          facebook: u.facebook,
          twitter: u.twitter,
          website: u.website,
        },
        isPublicUser: true,
      })) || [];

  //  console.log(provincialMembersFromUsers)

  const allProvincialMembers = [
    ...provincialMembersFromTeam,
    ...provincialMembersFromUsers,
  ];

  // console.log(allProvincialMembers);

  const provincialEbCount =
    allProvincialMembers?.filter(
      (m) => m.role === "eb" || m.type === "executive",
    ).length || 0;

  const provincialCrCount =
    allProvincialMembers?.filter((m) => m.role === "cr").length || 0;

  const provincialGmCount =
    allProvincialMembers?.filter((m) => m.role === "gm").length || 0;

  const currentTeam = {
    advisors: advisorsData,
    core: coreData,
    alumni: alumniData,
    provincial: allProvincialMembers, // Consolidated list (volunteers + executives)
    stats: {
      eb: provincialEbCount,
      cr: provincialCrCount,
      gm: provincialGmCount,
      executives: provincialEbCount, // Kept for backward compatibility
      volunteers: provincialGmCount,
    },
  };

  //Reusable sort function
  const sortByPosition = (members) => {
    return [...members].sort((a, b) => {
      const posA = a.position?.toLowerCase().replace(/\s+/g, "-");
      const posB = b.position?.toLowerCase().replace(/\s+/g, "-");

      const indexA = positionOrder.indexOf(posA);
      const indexB = positionOrder.indexOf(posB);

      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  };
  console.log(currentTeam);

  const executiveMember = sortByPosition(
    currentTeam?.provincial?.filter((member) =>
      ["eb", "executive"].includes(member.role?.toLowerCase()),
    ) || [],
  );

  // console.log(executiveMember);

  // console.log(currentTeam.provincial)
  // console.log(currentTeam);

  const activeProvince = provinces.find(
    (province) => province.name === activeTab,
  );

  const socialIcons = {
    linkedin: <FaLinkedinIn />,
    facebook: <FaFacebookF />,
    instagram: <FaInstagram />,
    github: <FaGithub />,
    youtube: <FaYoutube />,
    twitter: <FaTwitter />,
    website: <FiGlobe />,
  };

  // console.log(member)
  return (
    <main>
      <SEO
        title="Provincial Chapters"
        description="Explore Code for Change Nepal's impact across various provinces. Connecting IT students nationwide."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Provinces", path: "/provinces" },
        ]}
      />
      <Banner />
      {/* <div className="max-w-7xl mx-auto px-6 mt-8">
        <Breadcrumbs crumbs={[{ name: "Provinces", path: "/provinces" }]} />
      </div> */}
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 py-16 overflow-hidden">
          {/* Ambient Background Glows - Subtlety is key for premium feel */}
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />

          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Text Content Area (Column Span 7) */}
            <div className="lg:col-span-7 relative z-10">
              <SlideUp>
                {/* Premium Badge Label */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-slate-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  Our Community
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-primary mb-8 tracking-tighter leading-[0.9]">
                  The People <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x">
                    Behind the Code.
                  </span>
                </h1>

                <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed mb-10">
                  We are a collective of visionaries, mentors, and builders
                  bridging the critical divide between theoretical curriculum
                  and global industrial standards.
                </p>

                {/* Social Proof & CTA */}
                <div className="flex flex-wrap gap-8 items-center">
                  <Link
                    to="/join-us"
                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-primary transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                  >
                    Join the Movement
                  </Link>
                  {/* 
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <img
                        key={i}
                        className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                        src={`https://i.pravatar.cc/100?u=${i}`}
                        alt="user"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-400">
                    <span className="text-slate-900">750+</span> Volunteers
                  </p>
                </div> */}
                </div>
              </SlideUp>
            </div>

            {/* Visual Image Block (Column Span 5) */}
            <FadeIn delay={0.2} className="lg:col-span-5 relative group">
              {/* Decorative Floating Card - Adds "Depth" */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 z-20 hidden xl:block animate-bounce-slow">
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">
                      <FiStar size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                        Impact
                      </p>
                      <p className="text-lg font-black text-slate-900 leading-none">
                        Nepal Wide
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Image Container */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3.5rem] blur-2xl opacity-50 transition-opacity group-hover:opacity-80" />
                <div className="relative overflow-hidden rounded-[3rem] border-[10px] border-white shadow-2xl aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800"
                    alt="Team Group"
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                  />
                  {/* Subtle Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {/* Province Navigation */}
          <section className="pb-16 px-4 max-w-7xl mx-auto">
            <section className="pb-16 px-4 max-w-7xl mx-auto">
              <ProvinceDropdown
                provinces={provinces}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeProvince={activeProvince}
              />

              <div className="hidden sm:flex flex-wrap justify-center gap-2 mb-16">
                {provinces.map((p) => (
                  <button
                    style={{
                      backgroundColor:
                        activeTab === p.name ? undefined : p.colorCode,
                      color: activeTab === p.name ? p.colorCode : "",
                      border: `2px solid ${p.colorCode}`,
                      boxShadow:
                        activeTab === p.name
                          ? `0px 0px 30px 1px ${p.colorCode}55`
                          : "",
                    }}
                    key={p.name}
                    onClick={() => setActiveTab(p.name)}
                    className={`px-6 py-3 rounded-full tracking-wider cursor-pointer text-sm font-medium uppercase transition-all duration-500 border-2
              ${
                activeTab === p.name
                  ? "bg-white -translate-y-1"
                  : "bg-white-50 text-white hover:bg-gray-100"
              }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </section>

            <div className="grid lg:grid-cols-[380px_1fr] gap-12 items-start">
              {/* 2. Province Feature Card (Sticky Side) */}
              <FadeIn delay={0.1} className="lg:sticky lg:top-10">
                <div
                  className="relative overflow-hidden rounded-[2.5rem] p-1 shadow-2xl transition-all duration-700"
                  style={{ backgroundColor: activeProvince?.colorCode }}
                >
                  <div className="bg-slate-900/10 backdrop-blur-sm rounded-[2.3rem] p-8 md:p-10 text-white h-full">
                    {/* Background Watermark */}
                    <span className="absolute -right-8 -top-8 text-9xl font-black opacity-10 pointer-events-none uppercase">
                      {activeTab[0]}
                    </span>

                    <div className="relative z-10">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-80 mb-6">
                        <FiStar size={16} fill="currentColor" /> Code for Change
                      </h3>

                      <h2 className="text-5xl font-black mb-6 leading-tight">
                        {activeTab} <br />
                        <span className="opacity-60 text-3xl font-light">
                          Chapter
                        </span>
                      </h2>

                      <p className="text-lg text-white/80 mb-10 leading-relaxed font-medium">
                        Empowering the next generation of tech leaders in{" "}
                        {activeTab} through innovation and mentorship.
                      </p>

                      {/* Stats Row */}
                      <div className="flex gap-6 mb-10 overflow-x-auto">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black ">
                            {currentTeam.stats.eb}
                          </span>
                          <span className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">
                            EB
                          </span>
                        </div>
                        <div className="w-[1px] bg-white/20 h-10 self-center"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black">
                            {currentTeam.stats.cr}
                          </span>
                          <span className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">
                            CR
                          </span>
                        </div>
                        <div className="w-[1px] bg-white/20 h-10 self-center"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black">
                            {currentTeam.stats.gm}
                          </span>
                          <span className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">
                            GM
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/provinces/${activeTab.toLowerCase().replace(/\s+/g, "-")}`}
                        className="group flex items-center uppercase tracking-widest justify-between bg-white text-slate-700 p-2 pl-6 rounded-2xl font-bold transition-all hover:pr-4"
                      >
                        Explore chapter
                        <div
                          style={{ backgroundColor: activeProvince?.colorCode }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                        >
                          <FiArrowRight size={20} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* 3. Refined Impact Team Grid */}
              <div>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                  <div>
                    <h2 className="text-4xl font-black text-primary tracking-tight">
                      Impact{" "}
                      <span style={{ color: activeProvince?.colorCode }}>
                        Team
                      </span>
                    </h2>
                    <p className="text-gray-500 mt-2 font-medium">
                      The driving force in {activeTab}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <FiUsers size={16} /> {currentTeam.stats.executives} Active
                    Leads
                  </div>
                </div>

                {Loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 pb-10 gap-5 md:gap-7">
                    {[0, 1, 2, 3].map((i) => (
                      <Pulse key={i} className="aspect-4/5 rounded-3xl" />
                    ))}
                  </div>
                ) : (
                  <StaggerContainer
                    key={activeTab}
                    className="grid grid-cols-2 sm:grid-cols-3 pb-10 gap-5 md:gap-7"
                  >
                    {executiveMember.length > 0 ? (
                      executiveMember.map((member, i) => (
                        <StaggerItem
                          key={member._id || i}
                          className="relative group cursor-pointer rounded-2xl transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl h-full"
                        >
                          {/* {console.log(currentTeam)} */}
                          {/* Neumorphic background */}
                          <div
                            onClick={() => {
                              setSelectedMember(member);
                            }}
                            className="relative shadow-xl rounded-2xl p-3 transition-all duration-500 overflow-hidden hover:shadow-2xl"
                            style={{
                              borderColor: activeProvince?.colorCode,
                              boxShadow: `0 20px 40px -20px ${activeProvince?.colorCode}70`,
                            }}
                          >
                            {/* Image container */}
                            <div className="aspect-4/5 rounded-xl overflow-hidden relative">
                              {Object.entries(member.socialLinks || {})
                                .filter(([_, url]) => url)
                                .map(([platform, url], idx) => (
                                  <div
                                    key={platform}
                                    className={`absolute z-20 ${idx < 3 ? "left-6" : "right-6"}
                                     [--icon-gap:3.5rem] lg:[--icon-gap:2.5rem]`}
                                    style={{
                                      top: `calc(1.5rem + ${idx % 3} * var(--icon-gap))`,
                                    }}
                                  >
                                    <a
                                      href={
                                        url.startsWith("http")
                                          ? url
                                          : `https://${url}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`lg:w-9 w-11 h-11 lg:h-9 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-primary 
                                        opacity-100 md:opacity-0 ${
                                          idx < 3
                                            ? "md:-translate-x-12"
                                            : "md:translate-x-12"
                                        }
                                         group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hover:bg-primary hover:text-white shadow-lg`}
                                      style={{
                                        transitionDelay: `${idx * 100}ms`,
                                      }}
                                    >
                                      {socialIcons[platform] || (
                                        <FiExternalLink />
                                      )}
                                    </a>
                                  </div>
                                ))}

                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                              />

                              {/* Soft colored overlay on hover */}
                              <div className="absolute inset-0 transition-opacity duration-500 flex flex-col justify-end">
                                {/* Text */}
                                <div
                                  style={{
                                    backgroundColor: activeProvince?.colorCode,
                                  }}
                                  className="py-4 px-3 md:px-4"
                                >
                                  <p className="transition-colors flex text-white gap-2 items-baseline tracking-tight">
                                    <span className="capitalize text-[10px] sm:text-sm">
                                      {member.position.replace(/-/g, " ")}
                                    </span>
                                    <span className=" md:text-xl lg:text-2xl font-bold">
                                      {member.name.split(" ")[0]}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </StaggerItem>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                          No impact team members in {activeTab} yet.
                        </p>
                      </div>
                    )}
                  </StaggerContainer>
                )}

                {/* Team member details modal */}
                <TeamMemberModal
                  isOpen={!!selectedMember}
                  member={selectedMember}
                  links={selectedMember?.socialLinks}
                  onClose={() => setSelectedMember(null)}
                />
                {/* Section: Advisors */}
                {currentTeam.advisors.length > 0 && (
                  <section className="pb-7">
                    <h2 className="text-4xl font-black text-primary mb-10 flex items-center gap-4 text-right">
                      Our{" "}
                      <span style={{ color: activeProvince?.colorCode }}>
                        Advisors
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currentTeam.advisors.map((member, i) => (
                        <TeamCard
                          key={i}
                          member={member}
                          onSelect={setSelectedMember}
                          variant="glass"
                        />
                      ))}
                    </div>
                  </section>
                )}
                {/* Section: Alumni */}

                {currentTeam.alumni.length > 0 && (
                  <section className="pt-10">
                    <h2 className="text-4xl font-black text-primary mb-7 flex items-center gap-4">
                      Our{" "}
                      <span style={{ color: activeProvince?.colorCode }}>
                        Alumni
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currentTeam.alumni.map((member, i) => (
                        <TeamCard
                          key={i}
                          member={member}
                          onSelect={setSelectedMember}
                          variant="glass"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

// TeamCard remains the same
const TeamCard = ({ member, variant, onSelect }) => {
  const isGlass = variant === "glass";

  const socialIcons = {
    linkedin: <FaLinkedinIn />,
    facebook: <FaFacebookF />,
    instagram: <FaInstagram />,
    github: <FaGithub />,
    youtube: <FaYoutube />,
    twitter: <FaTwitter />,
  };

  const availableSocials = Object.entries(member.socialLinks || {}).filter(
    ([_, url]) => url,
  );
  // console.log(member.socialLinks);

  return (
    <div
      onClick={() => onSelect(member)}
      className={`group relative rounded-3xl p-3 transition-all duration-700 
      ${isGlass ? "bg-white/40 backdrop-blur-2xl border border-white/50 shadow-xl" : "bg-white border border-slate-100 shadow-md"}
      hover:-translate-y-4 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]`}
    >
      <div className="aspect-4/5 rounded-2xl relative overflow-hidden bg-slate-100">
        {/* Social Overlay */}

        {availableSocials.length > 0 &&
          availableSocials.map(([platform, url], idx) => (
            <div
              key={platform}
              className={`absolute z-20 ${idx < 3 ? "left-6" : "right-6"}
             [--icon-gap:3.5rem] lg:[--icon-gap:2.5rem]`}
              style={{
                top: `calc(1.5rem + ${idx % 3} * var(--icon-gap))`,
              }}
            >
              <a
                href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`lg:w-9 w-11 h-11 lg:h-9 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-primary 
               opacity-100 md:opacity-0 ${
                 idx < 3 ? "md:-translate-x-12" : "md:translate-x-12"
               }
               group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hover:bg-primary hover:text-white shadow-lg`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {socialIcons[platform] || <FiExternalLink />}
              </a>
            </div>
          ))}

        <img
          src={member.image}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt={member.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>

      <div className="absolute lg:bottom-10 bottom-14 lg:left-4 left-8 right-8 lg:right-4 lg:p-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl border border-white shadow-lg translate-y-6 group-hover:translate-y-2 transition-all duration-500">
        <h4 className="font-black text-slate-900 tracking-tight text-lg lg:text-sm">
          {member.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <FiAward className="text-blue-600" />
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">
            {member.role}
          </p>
        </div>
      </div>
    </div>
  );
};

export { Provinces, provinces };

import { FiChevronDown, FiMapPin, FiCheck } from "react-icons/fi";

const ProvinceDropdown = ({
  provinces,
  activeTab,
  setActiveTab,
  activeProvince,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden relative z-50">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border-2 transition-all duration-300 shadow-lg active:scale-95"
        style={{
          borderColor: activeProvince?.colorCode || "#e2e8f0",
          boxShadow: `0 10px 25px -10px ${activeProvince?.colorCode}40`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: activeProvince?.colorCode }}
          />
          <span
            style={{ color: activeProvince?.colorCode }}
            className="font-black text-slate-800 tracking-tight uppercase text-sm"
          >
            {activeTab}
          </span>
        </div>
        <FiChevronDown
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: activeProvince?.colorCode }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 right-0 mt-3 overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-h-64 overflow-y-auto py-2">
              {provinces.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setActiveTab(p.name);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <span
                    style={{ color: p?.colorCode }}
                    className={`text-sm font-bold`}
                  >
                    {p.name}
                  </span>
                  {activeTab === p.name && (
                    <FiCheck style={{ color: activeProvince?.colorCode }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
