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
    <section className="py-20 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-primary"></span>
            <h4 className="uppercase tracking-wider text-base font-semibold text-primary">
              Our Values
            </h4>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            The principles that define who we are and how we work
          </h2>

          <p className="mt-4 text-gray-600">
            Our values shape our culture, guide our decisions, and inspire us to
            deliver meaningful impact every day.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6
                         shadow-sm hover:shadow-xl hover:-translate-y-1
                         transition-all duration-300"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl 
                           bg-secondary/10 text-primary text-xl mb-5
                           group-hover:bg-secondary group-hover:text-white
                           transition-colors duration-300"
              >
                {value.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-primary mb-2">
                {value.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {value.description}
              </p>

              {/* Bottom Accent */}
              <span
                className="absolute bottom-0 left-0 h-1 w-0 bg-secondary 
                           group-hover:w-full transition-all duration-300 rounded-b-2xl"
              ></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurValues;
