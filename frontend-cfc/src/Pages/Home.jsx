import React from "react";
import HeroSection from "../Components/PageComponents/Home/HeroSection";
import AboutSection from "../Components/PageComponents/About/AboutSection";
import Supporters from "../Components/PageComponents/Supporters";
// import Event from "../Components/PageComponents/Events/Event";
// works
import CurrentEvent from "../Components/PageComponents/Events/CurrentEvent";
import Testimonials from "../Components/PageComponents/Testimonials";
import SEO from "../Components/Common/SEO";

import { FaChalkboardTeacher } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { FaUserGraduate } from "react-icons/fa";
import { FaRegHandshake } from "react-icons/fa";

function Home() {
  const Works = [
    {
      icon: <FaChalkboardTeacher />,
      title: "Workshops",
      shortDisc:
        "We organize hands-on technical and professional workshops throughout the year to equip students with industry-relevant skills, practical knowledge, and career readiness.",
    },
    {
      icon: <FaCode />,
      title: "Hackathons",
      shortDisc:
        "Our nationwide hackathons bring students together to solve real-world problems, foster innovation, and promote teamwork under the guidance of industry mentors.",
    },
    {
      icon: <FaUserGraduate />,
      title: "Internships",
      shortDisc:
        "We create internship opportunities by connecting talented students with organizations, helping them gain real-world experience and professional exposure.",
    },
    {
      icon: <FaRegHandshake />,
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
            <div className="flex gap-2 items-center group cursor-pointer">
              <div className="w-10 h-0.5 bg-primary transition-all duration-300 ease-in "></div>
              <h4 className="uppercase text-base font-medium">What we do</h4>
            </div>
            {/* Main Heading */}
            <div className=" py-4">
              <h2 className="md:text-4xl text-3xl font-bold text-primary">
                Empowering learners and professionals through innovation
              </h2>
            </div>
            <p className="max-w-3xl text-gray-600">
              We bridge the gap between education and industry by providing
              hands-on learning experiences, skill-based training, and
              collaborative platforms that prepare individuals for real-world
              challenges.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 py-10 px-4">
          {Works.map((val, i) => (
            <div
              key={i}
              className="flex flex-col group hover:shadow-md items-center text-center bg-white rounded-xl p-8 shadow-secondary/20 transition-all duration-200 ease-in cursor-pointer hover:-translate-y-2"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-secondary/20 text-secondary text-3xl rounded-full mb-5 group-hover:text-white group-hover:bg-secondary">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{val.title}</h3>
              <p className="text-gray-600 text-sm ">{val.shortDisc}</p>
            </div>
          ))}
        </div>
      </div>
      <CurrentEvent />
      {/* <div className="bg-secondary/10">
        <Event />
      </div> */}
      <Testimonials />
    </>
  );
}

export default Home;
