import { Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { navItems } from "../../Data/navItems";

function Footer() {
  const importantLinks = navItems.filter((item)=>!["More"].includes(item.title))
  const socialMediaItems = [
    {
      icon: <FaFacebookF />,
      link: "https://www.facebook.com/CodeForChangeNepal",
    },
    {
      icon: <FaInstagram />,
      link: "https://www.instagram.com/codeforchangeofficial/",
    },
    {
      icon: <FaYoutube />,
      link: "https://www.youtube.com/channel/UC9x8pdE8UWErO6hW2mJSVLQ",
    },
    {
      icon: <FaLinkedinIn />,
      link: "https://www.linkedin.com/company/codeforchangenepal/",
    },
    {
      icon: <FaTwitter />,
      link: "https://x.com/CodeforChange2",
    },
  ];
  const services = [
    {
      title: "Hackathons",
      path: "/",
    },
    {
      title: "Internship",
      path: "/",
    },
    {
      title: "Workshops",
      path: "/",
    },
    {
      title: "Entrance Preparation",
      path: "/",
    },
    {
      title: "Job Placement",
      path: "/",
    },
  ];

  return (
    <footer className="bg-primary px-5 text-white">
      <div className="max-w-7xl py-10 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.7fr_1fr_1fr_1fr] py-10  gap-14">
          <div>
            <Link to="/">
              <img src="/logo.png" alt="logo" className="w-30" />
            </Link>
            <p className="text-white pt-10">
              We are Open platform for the learners to learn and trainers to
              transfer their learning to learners. We are the group of Young
              people uniting all the IT students and professionals under the
              same roof for the technological revolutions.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg">
              Important Links
            </h3>
            <div className="flex flex-col gap-1 mt-8 text-white">
              {importantLinks.map((val, i) => (
                <Link
                  key={i}
                  to={val.path}
                  className="hover:text-secondary transition"
                >
                  {val.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white text-lg">Services</h3>
            <div className="flex flex-col gap-1 mt-8 text-white ">
              {services.map((val, i) => (
                <Link key={i} to={val.path} className="hover:text-secondary transition">{val.title}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white text-lg">Newsletter</h3>
            <div className="flex relative flex-col mt-10 text-white ">
              <input
                type="email"
                className="py-3 px-4 border border-secondary rounded focus:ring focus:ring-secondary outline-none "
                placeholder="Enter your email"
              />
              <FiSend className="text-secondary text-xl absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        <hr className="w-full" />
        <div className="flex max-md:flex-col gap-5 justify-between items-center mt-10">
          <p className="">
            &copy; 2025 Code for Change. All right reserved. Developed by Sajilo
            Digital&trade;
          </p>
          <div className="flex gap-5">
            {socialMediaItems.map((val, i) => (
              <Link
                key={i}
                to={val.link}
                target="_blank"
                className="bg-secondary p-3 rounded-full hover:bg-primary cursor-pointer transition-all ease-in duration-300"
              >
                {val.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
