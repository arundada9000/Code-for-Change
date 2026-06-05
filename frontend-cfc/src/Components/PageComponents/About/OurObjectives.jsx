import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";

function OurObjectives() {
  const objectivesList = [
    "To give students knowledge of real-world IT experts.",
    "To encourage and provide exposure to IT students in the field of Information Technology.",
    "To work as a bridge between the IT industry and IT students.",
    "To motivate students to pursue their career in the IT field.",
    " To prepare the students for professional work.",
  ];

  return (
    <section className="pb-16 md:py-16 bg-secondary/2">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <div className="flex gap-2 items-center group cursor-pointer mb-4">
            <div className="w-10 h-0.5 bg-secondary transition-all duration-300 group-hover:w-16" />
            <h4 className="uppercase text-base font-bold tracking-widest text-secondary">
              Our Objectives
            </h4>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            Driving excellence through purpose,
            <span className="text-secondary"> innovation</span>, and commitment
          </h2>

          <p className="mt-4 text-slate-600 text-lg">
            Our objectives define our direction, guide our decisions, and push
            us toward delivering meaningful impact.
          </p>
        </div>

        {/* Objectives Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {objectivesList.map((objective, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-8 shadow-sm
                         hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.15)] hover:-translate-y-2 transition-all duration-500"
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 mb-6
                              group-hover:bg-secondary text-secondary group-hover:text-white transition-colors duration-500"
              >
                <FaRegCheckCircle className="w-6 h-6" />
              </div>

              {/* Text */}
              <p className="text-slate-600 text-lg leading-relaxed">
                {objective}
              </p>

              {/* Hover Accent */}
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

export default OurObjectives;
