import React, { useEffect, useState } from "react";
import HeroImage from "../../../assets/HeroImage.jpg";
import { Link } from "react-router-dom";

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
    <section className="flex px-5 items-center bg-[url(/HeroImage.jpg)] bg-center bg-cover min-h-screen relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(1,21,46,0.8)_0%,rgba(1,21,46,0.3)_50%,transparent_100%)]" />
      <div className="absolute inset-0 bg-black/5" />

      <div className="max-w-7xl mx-auto z-10 w-full">
        <div className="max-w-5xl">
          <h1 className="text-white text-6xl font-bold pb-10">
            Code the change you want to see
          </h1>

          <p className="pb-8 text-white">
            We are Open platform for the Learners to learn and trainers to
            transfer their learning to learners. We are the group of Young
            people uniting all the IT students and professionals under the same
            roof for the technological revolutions.
          </p>

          <div className="flex gap-7">
              <Link
                        to="/donate-us"
                        className="px-8 py-3 border-4 border-secondary rounded-full text-white bg-secondary hover:bg-secondary/70 hover:text-white transition"
                      >
                        Donate us
                      </Link>
              <Link
                        to="/register"
                        className="px-8 py-3 border-4 border-secondary rounded-full text-white bg-secondary hover:bg-secondary/70 hover:text-white transition"
                      >
                        Join us
                      </Link>
          </div>
        </div>

        {/* Animated Numbers */}
        <div className="grid md:grid-cols-5 gap-6 pt-16 text-white">
          {data.map((val, i) => (
            <div key={i} className="flex items-center">
              <span className="text-[28px] font-bold">
                {counts[i]}+
              </span>
              <span className="text-base font-normal pl-4">
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
