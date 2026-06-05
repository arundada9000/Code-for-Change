import React from "react";
import HeroSection from "../Components/PageComponents/Home/HeroSection";
import AboutSection from "../Components/PageComponents/About/AboutSection";
import Supporters from "../Components/PageComponents/Supporters";
import CurrentEvent from "../Components/PageComponents/Events/CurrentEvent";
import Testimonials from "../Components/PageComponents/Testimonials";
import SEO from "../Components/Common/SEO";

import { FaChalkboardTeacher } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaUserGraduate } from "react-icons/fa";
import { FaRegHandshake } from "react-icons/fa";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "../Components/Common/Animations";

function Home() {
  const Works = [
    {
      icon: <FaChalkboardTeacher aria-hidden="true" />,
      title: "Workshops",
      shortDisc:
        "We organize hands-on technical and professional workshops throughout the year to equip students with industry-relevant skills, practical knowledge, and career readiness.",
    },
    {
      icon: <FaCode aria-hidden="true" />,
      title: "Hackathons",
      shortDisc:
        "Our nationwide hackathons bring students together to solve real-world problems, foster innovation, and promote teamwork under the guidance of industry mentors.",
    },
    {
      icon: <FaUserGraduate aria-hidden="true" />,
      title: "Internships",
      shortDisc:
        "We create internship opportunities by connecting talented students with organizations, helping them gain real-world experience and professional exposure.",
    },
    {
      icon: <FaRegHandshake aria-hidden="true" />,
      title: "Social Impact",
      shortDisc:
        "Through technology-driven initiatives, we work on projects that address social challenges and empower communities, using innovation as a tool for positive change.",
    },
  ];
  return (
    <>
      <SEO
        title="Home - Empowering IT Professionals"
        description="Official home of Code for Change Nepal. We bridge the gap between education and industry through innovation, workshops, and hackathons."
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-5">
        <AboutSection />
        <Supporters />
      </div>
      <div className="bg-secondary/10 py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <SlideUp>
              <div className="flex gap-2 items-center group cursor-pointer">
                <div className="w-10 h-0.5 bg-secondary transition-all duration-300 ease-in group-hover:w-16"></div>
                <h4 className="uppercase text-base font-bold tracking-widest text-secondary">What we do</h4>
              </div>
            </SlideUp>
            {/* Main Heading */}
            <div className="py-4">
              <SlideUp delay={0.1}>
                <h2 className="md:text-4xl text-3xl font-black text-slate-900 leading-tight">
                  Empowering learners and professionals through innovation
                </h2>
              </SlideUp>
            </div>
            <FadeIn delay={0.2}>
              <p className="max-w-3xl text-slate-600 leading-relaxed text-lg">
                We bridge the gap between education and industry by providing
                hands-on learning experiences, skill-based training, and
                collaborative platforms that prepare individuals for real-world
                challenges.
              </p>
            </FadeIn>
          </div>
        </div>
        <StaggerContainer className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-16 px-5">
          {Works.map((val, i) => (
            <StaggerItem key={i}>
              <div className="flex flex-col group items-center text-center bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.25)] transition-all duration-500 ease-out cursor-pointer h-full hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-20 h-20 flex items-center justify-center bg-slate-50 text-secondary text-4xl rounded-2xl mb-6 group-hover:text-white group-hover:bg-secondary group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500 shadow-inner">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-800">{val.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{val.shortDisc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
      <CurrentEvent />
      <Testimonials />
    </>
  );
}

export default Home;
