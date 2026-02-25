import React from "react";
import { FaBullseye } from "react-icons/fa";
import { FaEye } from "react-icons/fa";

function Mission() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-primary"></span>
            <h4 className="uppercase tracking-wider text-base font-semibold text-primary">
              Mission & Vision
            </h4>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
            Purpose that guides today,
          </h2>

          <p className="mt-4 text-gray-600">
            Our mission defines what we do now, while our vision reflects where
            we aspire to go in the future.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div
            className="group relative overflow-hidden bg-linear-to-br from-primary/5 to-white 
                          border border-gray-200 rounded-2xl p-8 shadow-sm
                          hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6 group">
              <div
                className="w-14 h-14 flex items-center justify-center rounded-xl 
                              bg-secondary/10 group-hover:bg-secondary group-hover:text-white text-primary"
              >
                <FaBullseye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary">
                Our Mission
              </h3>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              "To engage students in the problem solving process while
              empowering personal and IT driven professional skills through
              networking and exposure.”
            </p>

            <span
              className="absolute bottom-0 left-0 h-1 w-0 bg-secondary 
                             group-hover:w-full transition-all duration-300 rounded-b-2xl"
            ></span>
          </div>

          {/* Vision Card */}
          <div
            className="group relative overflow-hidden bg-linear-to-br from-gray-50 to-white 
                          border border-gray-200 rounded-2xl p-8 shadow-sm
                          hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 flex items-center justify-center rounded-xl 
                              bg-secondary/10 group-hover:text-white group-hover:bg-secondary text-primary"
              >
                <FaEye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary">
                Our Vision
              </h3>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              "To be Nepal's largest platform for students pursuing technology."
            </p>

            <span
              className="absolute bottom-0 left-0 h-1 w-0 bg-secondary 
                             group-hover:w-full transition-all duration-300 rounded-b-2xl"
            ></span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Mission;
