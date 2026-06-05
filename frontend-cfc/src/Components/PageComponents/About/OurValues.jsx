import React from "react";
import {
  FaHandshake,
  FaLightbulb,
  FaShieldAlt,
  FaUsers,
  FaLeaf,
} from "react-icons/fa";

function OurValues() {
  const values = [
    {
      title: "Integrity",
      description:
        "We act with honesty, transparency, and accountability in everything we do.",
      icon: <FaShieldAlt />,
    },
    {
      title: "Possibility",
      description:
        "We see opportunities in every problem and consider that nothing is impossible.",
      icon: <FaLightbulb />,
    },
    {
      title: "Collaboration",
      description:
        "We believe great achievements come from teamwork and shared purpose.",
      icon: <FaUsers />,
    },
    {
      title: "Respect",
      description:
        "We are guided by self-respect and responsibility among team members.",
      icon: <FaHandshake />,
    },
    {
      title: "Excellence",
      description:
        "We strive to put 100 percent effort in bringing excellence in our actions and work.",
      icon: <FaLeaf />,
    },
  ];

  return (
    <section className=" py-10 md:py-20 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex gap-2 items-center group cursor-pointer mb-4">
            <div className="w-10 h-0.5 bg-secondary transition-all duration-300 group-hover:w-16" />
            <h4 className="uppercase text-base font-bold tracking-widest text-secondary">
              Our Values
            </h4>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            The principles that define who we are and how we work
          </h2>

          <p className="mt-4 text-slate-600 text-lg">
            Our values shape our culture, guide our decisions, and inspire us to
            deliver meaningful impact every day.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group relative bg-white border border-slate-100 rounded-3xl p-8
                         shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.15)] hover:-translate-y-2
                         transition-all duration-500 overflow-hidden"
            >
              {/* Icon */}
              <div
                className="w-14 h-14 flex items-center justify-center rounded-2xl 
                           bg-secondary/10 text-secondary text-2xl mb-6
                           group-hover:bg-secondary group-hover:text-white
                           transition-colors duration-500"
              >
                {value.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-black text-slate-900 mb-3">
                {value.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {value.description}
              </p>

              {/* Bottom Accent */}
              <span
                className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-secondary to-blue-400
                           group-hover:w-full transition-all duration-500"
              ></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurValues;
