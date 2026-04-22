import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import useFetch from "../../Hooks/useFetch";

function CoreTeam({ onMemberClick }) {
  const { data: teamMembers, loading } = useFetch("/team", []);

  const socialIcons = {
    linkedin: <FaLinkedinIn />,
    facebook: <FaFacebookF />,
    instagram: <FaInstagram />,
    github: <FaGithub />,
    youtube: <FaYoutube />,
    twitter: <FaTwitter />,
    tiktok: <FaTiktok />,
  };

  // Filter for Core Team members
  const coreTeam = teamMembers?.filter((m) => m.type === "Core Team") || [];

  if (loading && coreTeam.length === 0) {
    return (
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="animate-pulse flex flex-col gap-8">
          <div className="h-16 w-1/3 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (coreTeam.length === 0) return null;

  return (
    <>
      {/* Core Team Section */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        {/* Header: More modern, centered-left alignment */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-primary pl-6">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              National <span className="text-secondary">Team</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              The visionaries shaping the future of our national landscape.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {coreTeam.map((member, index) => {
            const availableSocials = Object.entries(
              member.socialLinks || {},
            ).filter(([_, url]) => url);
            // console.log(availableSocials);
            return (
              <div
                key={member._id || index}
                onClick={() => onMemberClick?.(member)}
                className="shadow-sm rounded-2xl overflow-hidden hover:shadow-xl cursor-pointer"
              >
                {/* Main Card Container */}
                <div className="relative group flex h-full min-h-45 items-stretch overflow-hidden bg-white/90 backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-2">
                  {/* Left Side: Image Section */}
                  <div className="relative w-1/3 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Subtle Overlay Gradient */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent to-white/10" />
                  </div>

                  {/* Right Side: Content Section */}
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <div className="mb-auto border-b pb-4">
                      <h4 className="text-lg font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors duration-300">
                        {member.name}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                        {member.designation || member.role}
                      </p>

                      {member.organization && (
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {member.organization}
                        </p>
                      )}
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
                          {socialIcons[platform] || (
                            <FiExternalLink size={12} />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default CoreTeam;
