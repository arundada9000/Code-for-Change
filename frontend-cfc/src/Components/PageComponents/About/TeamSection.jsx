import React from "react";
import { ADVISORS, CORE_TEAM, ALUMNI } from "../../../Data/teamData";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const TeamMemberCard = ({ member, type }) => {
  const accentColor =
    type === "alumni" ? "#D97706" : type === "advisor" ? "#059669" : "#0076B4";
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

  return (
    <div className="group relative">
      <div
        className="relative overflow-hidden rounded-[1.5rem] aspect-[4/5] mb-6 transition-all duration-500 group-hover:-translate-y-2 border-b-4"
        style={{
          backgroundColor: `${accentColor}05`,
          borderColor: accentColor,
          boxShadow: `0 15px 35px -15px ${accentColor}20`,
        }}
      >
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6"
          style={{
            background: `linear-gradient(to top, ${accentColor}55, transparent)`,
          }}
        >
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
          {member.quote && (
            <p className="text-white text-sm italic font-black leading-relaxed mb-4">
              "{member.quote}"
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1.5 px-2">
        <h4 className="text-xl font-black text-primary tracking-tight group-hover:text-primary transition-colors">
          {member.name}
        </h4>
        <p
          className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
          style={{ color: accentColor }}
        >
          {member.role}
        </p>
        {member.organization && (
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {member.organization}
          </p>
        )}
      </div>
    </div>
  );
};

const TeamSection = () => {
  return (
    <div className="space-y-15 md:space-y-32 py-10 md:pb-24">
      {/* Alumni Section */}
      {/* <section className="space-y-5 md:space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-6">
              Our <span className="text-amber-600">Alumni</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Celebrating the journey of our past members who continue to inspire and support the community.
            </p>
          </div>
          <div className="hidden md:block h-0.5 flex-1 bg-slate-100 mx-12 mb-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {ALUMNI.map((alumni, index) => (
            <TeamMemberCard key={index} member={alumni} type="alumni" />
          ))}
        </div>
      </section> */}

      {/* Advisors Section */}
      {/* <section className="space-y-16">
        <div className="">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-6">
              Our <span className="text-emerald-600">Advisors</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Guidance from industry leaders and visionaries who help us navigate the complex landscape of technology and community impact.
            </p>
          </div>
          <div className="hidden md:block h-[1px] flex-1 bg-slate-100 mx-12 mb-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {ADVISORS.map((advisor, index) => (
            <TeamMemberCard key={index} member={advisor} type="advisor" />
          ))}
        </div>
      </section> */}

      {/* Core Team Section */}
      <section className="space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-6">
              Core Team <span className="text-secondary">Members</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              The driving force behind Code for Change - a dedicated group of
              professionals working to bridge the digital gap.
            </p>
          </div>
          <div className="hidden md:block h-0.5 flex-1 bg-slate-100 mx-12 mb-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {CORE_TEAM.map((member, index) => (
            <TeamMemberCard key={index} member={member} type="core" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeamSection;
