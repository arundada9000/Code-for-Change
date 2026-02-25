import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
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

import useFetch from "../Hooks/useFetch";
import { ADVISORS, CORE_TEAM, ALUMNI } from "../Data/teamData";

const Provinces = () => {
  const { data: apiTeam, loading } = useFetch("/team", []);
  const { data: provincialStats } = useFetch("/province-stats", {});
  const { data: publicUsers } = useFetch("/users/public-users", []);

  const [activeTab, setActiveTab] = useState("Kathmandu");

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
        position: u.ebBody || u.role,
        image: u.profileImage, // Map profileImage to image
        college: u.education?.collegeName,
        bio: u.bio,
        type: u.role === "member" ? "volunteer" : "executive", // Categorize for filtering below
        isPublicUser: true,
      })) || [];

  const allProvincialMembers = [
    ...provincialMembersFromTeam,
    ...provincialMembersFromUsers,
  ];

  const provincialVolunteers =
    allProvincialMembers?.filter(
      (m) => m.type === "volunteer" || m.role === "member",
    ) || [];
  const provincialExecutives =
    allProvincialMembers?.filter(
      (m) =>
        m.type === "executive" ||
        m.tier === "representative" ||
        m.role !== "member",
    ) || [];

  const currentTeam = {
    advisors: advisorsData,
    core: coreData,
    alumni: alumniData,
    provincial: allProvincialMembers, // Consolidated list (volunteers + executives)
    stats: {
      total:
        (provincialStats && provincialStats[activeTab]) ||
        allProvincialMembers.length,
      executives: provincialExecutives.length,
      volunteers: provincialVolunteers.length,
    },
  };

  const activeProvince = provinces.find(
    (province) => province.name === activeTab,
  );

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
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 overflow-hidden">
          {/* Ambient Background Glows - Subtlety is key for premium feel */}
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />

          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Text Content Area (Column Span 7) */}
            <div className="lg:col-span-7 relative z-10">
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
                bridging the critical divide between theoretical curriculum and
                global industrial standards.
              </p>

              {/* Social Proof & CTA */}
              <div className="flex flex-wrap gap-8 items-center">
                <Link
                  to="/register"
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-primary transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                >
                  Join the Movement
                </Link>

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
                </div>
              </div>
            </div>

            {/* Visual Image Block (Column Span 5) */}
            <div className="lg:col-span-5 relative group">
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
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {/* Section: Alumni */}
          {currentTeam.alumni.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-primary mb-10 flex items-center gap-4">
                Our Alumni{" "}
                <div className="h-1 flex-1 bg-slate-200 rounded-full" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {currentTeam.alumni.map((member, i) => (
                  <TeamCard key={i} member={member} variant="glass" />
                ))}
              </div>
            </section>
          )}

          {/* Section: Advisors */}
          {currentTeam.advisors.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-primary mb-10 flex items-center gap-4 text-right">
                <div className="h-1 flex-1 bg-slate-200 rounded-full" /> Our
                Advisors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {currentTeam.advisors.map((member, i) => (
                  <TeamCard key={i} member={member} variant="glass" />
                ))}
              </div>
            </section>
          )}

          {/* Section: Core Team */}
          {currentTeam.core.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-primary mb-10 flex items-center gap-4">
                Core Team Members{" "}
                <div className="h-1 flex-1 bg-slate-200 rounded-full" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentTeam.core.map((member, i) => (
                  <TeamCard key={i} member={member} variant="standard" />
                ))}
              </div>
            </section>
          )}

          {/* Province Navigation */}
          <section className="pt-20 pb-32 px-4 max-w-7xl mx-auto">
            {/* 1. Premium Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
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

            <div className="grid lg:grid-cols-[380px_1fr] gap-12 items-start">
              {/* 2. Province Feature Card (Sticky Side) */}
              <div className="lg:sticky lg:top-10">
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
                      <div className="flex gap-10 mb-10">
                        <div className="flex flex-col">
                          <span className="text-3xl font-black ">
                            {currentTeam.stats.executives}
                          </span>
                          <span className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">
                            Executives
                          </span>
                        </div>
                        <div className="w-[1px] bg-white/20 h-10 self-center"></div>
                        <div className="flex flex-col">
                          <span className="text-3xl font-black">
                            {currentTeam.stats.total}+
                          </span>
                          <span className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">
                            Members
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
              </div>

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
                    <FiUsers size={16} /> {currentTeam.stats.volunteers} Active
                    Leads
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-7">
                  {currentTeam.provincial.length > 0 ? (
                    currentTeam.provincial.map((member, i) => (
                      <div
                        key={member._id || i}
                        className="relative group rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl"
                      >
                        {/* Neumorphic background */}
                        <div
                          className="relative rounded-3xl md:p-6 p-4 shadow-xl transition-all duration-500 overflow-hidden border-b-4 hover:shadow-2xl"
                          style={{
                            backgroundColor: `${activeProvince?.colorCode}10`,
                            borderColor: activeProvince?.colorCode,
                            boxShadow: `0 20px 40px -20px ${activeProvince?.colorCode}40`,
                          }}
                        >
                          {/* Image container */}
                          <div className="aspect-4/5 rounded-2xl overflow-hidden relative mb-5">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            />

                            {/* Soft colored overlay on hover */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl flex flex-col justify-end p-4"
                              style={{
                                background: `linear-gradient(to top, ${activeProvince?.colorCode}55, transparent)`,
                              }}
                            ></div>
                          </div>

                          {/* Text */}
                          <div className="text-center">
                            <p
                              style={{ color: activeProvince?.colorCode }}
                              className="font-black text-base group-hover:text-primary transition-colors tracking-tight"
                            >
                              {member.name}
                            </p>
                            <p
                              className="text-[11px] uppercase font-black mt-1.5 tracking-[0.15em] opacity-80"
                              style={{ color: activeProvince?.colorCode }}
                            >
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No impact team members in {activeTab} yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

// TeamCard remains the same

const TeamCard = ({ member, variant }) => {
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
  console.log(availableSocials);

  return (
    <div
      className={`group relative rounded-[2.5rem] p-4 transition-all duration-700 
      ${isGlass ? "bg-white/40 backdrop-blur-2xl border border-white/50 shadow-xl" : "bg-white border border-slate-100 shadow-md"}
      hover:-translate-y-4 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]`}
    >
      <div className="aspect-[4/5] rounded-[2rem] relative overflow-hidden bg-slate-100">
        {/* Social Overlay */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
          {availableSocials.map(([platform, url], idx) => (
            <a
              key={platform}
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md flex items-center justify-center text-primary 
              opacity-0 -translate-x-12 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hover:bg-primary hover:text-white shadow-lg"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {socialIcons[platform] || <FiExternalLink />}
            </a>
          ))}
        </div>

        <img
          src={member.image}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt={member.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>

      <div className="absolute bottom-14 left-10 right-10 px-6 py-2 bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-lg translate-y-6 group-hover:translate-y-0 transition-all duration-500">
        <h4 className="font-black text-slate-900 tracking-tight text-lg">
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
