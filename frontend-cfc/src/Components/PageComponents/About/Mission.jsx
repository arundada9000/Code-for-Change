import React from "react";
import { FaBullseye } from "react-icons/fa";
import { FaEye } from "react-icons/fa";

function Mission() {
  return (
    <section className="py-10 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <div className="flex gap-2 items-center group cursor-pointer mb-4">
            <div className="w-10 h-0.5 bg-secondary transition-all duration-300 group-hover:w-16" />
            <h4 className="uppercase text-base font-bold tracking-widest text-secondary">
              Mission & Vision
            </h4>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            Purpose that guides today,
          </h2>

          <p className="mt-4 text-slate-600 text-lg">
            Our mission defines what we do now, while our vision reflects where
            we aspire to go in the future.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div
            className="group relative overflow-hidden bg-white 
                          border border-slate-100 rounded-3xl p-10 shadow-sm
                          hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.15)] hover:-translate-y-2 transition-all duration-500"
          >
            <div className="flex items-center gap-4 mb-6 group">
              <div
                className="w-14 h-14 flex items-center justify-center rounded-2xl 
                              bg-secondary/10 group-hover:bg-secondary text-secondary group-hover:text-white transition-colors duration-500"
              >
                <FaBullseye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Our Mission
              </h3>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed">
              "To engage students in the problem solving process while
              empowering personal and IT driven professional skills through
              networking and exposure.”
            </p>

            <span
              className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-secondary to-blue-400
                             group-hover:w-full transition-all duration-500"
            ></span>
          </div>

          {/* Vision Card */}
          <div
            className="group relative overflow-hidden bg-white 
                          border border-slate-100 rounded-3xl p-10 shadow-sm
                          hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.15)] hover:-translate-y-2 transition-all duration-500"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 flex items-center justify-center rounded-2xl 
                              bg-secondary/10 group-hover:bg-secondary text-secondary group-hover:text-white transition-colors duration-500"
              >
                <FaEye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Our Vision
              </h3>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed">
              "To be Nepal's largest platform for students pursuing technology."
            </p>

            <span
              className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-secondary to-blue-400
                             group-hover:w-full transition-all duration-500"
            ></span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Mission;
