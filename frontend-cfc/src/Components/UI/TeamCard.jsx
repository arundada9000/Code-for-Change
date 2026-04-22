import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FiAward, FiExternalLink } from "react-icons/fi";

// TeamCard remains the same
export const TeamCard = ({ member, variant, onSelect }) => {
  const socialIcons = {
    linkedin: <FaLinkedinIn />,
    facebook: <FaFacebookF />,
    instagram: <FaInstagram />,
    github: <FaGithub />,
    youtube: <FaYoutube />,

    twitter: <FaTwitter />,
  };
  const isGlass = variant === "glass";

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
