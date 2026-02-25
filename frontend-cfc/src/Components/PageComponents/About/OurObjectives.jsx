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
          <div className="flex items-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-primary"></span>
            <h4 className="uppercase tracking-wider text-base font-semibold text-primary">
              Our Objectives
            </h4>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
            Driving excellence through purpose,
            <span className="text-secondary"> innovation</span>, and commitment
          </h2>

          <p className="mt-4 text-gray-600">
            Our objectives define our direction, guide our decisions, and push
            us toward delivering meaningful impact.
          </p>
        </div>

        {/* Objectives Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {objectivesList.map((objective, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 shadow-sm
                         hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-4
                              group-hover:bg-secondary group-hover:text-white transition-colors duration-300"
              >
                <FaRegCheckCircle className="w-6 h-6 text-primary group-hover:text-white" />
              </div>

              {/* Text */}
              <p className="text-gray-700 text-lg leading-relaxed">
                {objective}
              </p>

              {/* Hover Accent */}
              <span
                className="absolute bottom-0 left-0 h-1 w-0 bg-secondary rounded-b-2xl
                               group-hover:w-full transition-all duration-300"
              ></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurObjectives;
