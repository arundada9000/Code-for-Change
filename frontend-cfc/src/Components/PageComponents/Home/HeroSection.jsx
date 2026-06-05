import React, { useEffect, useState } from "react";
import HeroImage from "../../../assets/HeroImage.jpg";
import { Link } from "react-router-dom";
import { FadeIn, SlideUp } from "../../Common/Animations";

import { FaHeart, FaUserPlus } from "react-icons/fa";

function HeroSection() {
  const data = [
    { title: "Executive bodies", total: 9 },
    { title: "General Members", total: 200 },
    { title: "Partners", total: 75 },
  ];

  // State for animated counts
  const [counts, setCounts] = useState(data.map(() => 0));

  useEffect(() => {
    const duration = 5000; // animation duration (ms)
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // easing

      const updatedCounts = data.map((item) =>
        Math.floor(easeOut * item.total)
      );

      setCounts(updatedCounts);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <section className="flex px-5 py-24 md:py-0 items-center bg-[url(/HeroImage.jpg)] bg-center bg-cover min-h-screen relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(1,21,46,0.8)_0%,rgba(1,21,46,0.3)_50%,transparent_100%)]" />
      <div className="absolute inset-0 bg-black/5" />

      <div className="max-w-7xl mx-auto z-10 w-full">
        <div className="max-w-5xl">
          <SlideUp delay={0.1}>
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold pb-6 md:pb-10 leading-tight">
              Code the change you want to see
            </h1>
          </SlideUp>

          <FadeIn delay={0.3}>
            <p className="pb-6 md:pb-8 text-white text-sm md:text-base">
              We are Open platform for the Learners to learn and trainers to
              transfer their learning to learners. We are the group of Young
              people uniting all the IT students and professionals under the same
              roof for the technological revolutions.
            </p>
          </FadeIn>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mt-6 md:mt-8">
            <Link
              to="/register"
              className="relative w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-4 rounded-full text-white font-bold tracking-widest text-sm uppercase overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_-10px_rgba(0,118,180,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-blue-400 transition-transform duration-500 group-hover:scale-110"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] transition-opacity duration-500"></div>
              <FaUserPlus className="relative z-10 text-lg group-hover:-rotate-6 transition-transform duration-300" />
              <span className="relative z-10">Join as Member</span>
            </Link>

            <Link
              to="/donate-us"
              className="relative w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-4 rounded-full text-white font-bold tracking-widest text-sm uppercase overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-white/20 hover:border-white/40 bg-white/5 backdrop-blur-md hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)]"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300"></div>
              <FaHeart className="relative z-10 text-lg text-white/70 group-hover:text-white transition-colors duration-300 group-hover:scale-110" />
              <span className="relative z-10 text-white/90 group-hover:text-white transition-colors duration-300">Donate Us</span>
            </Link>
          </div>
        </div>

        {/* Animated Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-12 md:pt-16 text-white">
          {data.map((val, i) => (
            <div key={i} className="flex items-center">
              <span className="text-2xl md:text-[28px] font-bold">
                {counts[i]}+
              </span>
              <span className="text-xs md:text-base font-normal pl-3 md:pl-4">
                {val.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
