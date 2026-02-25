import React from "react";
import { Link, useLocation } from "react-router-dom";

function AboutSection() {
  const location = useLocation();
  return (
    <section className="py-16 flex flex-col lg:flex-row justify-between items-center gap-24 max-md:gap-6">
      <div>
        <div className="flex gap- items-center group cursor-pointer">
          <div className="w-10 h-0.5 bg-primary transition-all duration-300 ease-in "></div>
          <h4 className="uppercase text-base font-medium">Know about us</h4>
        </div>
        <div className="py-4">
          <h2 className="md:text-4xl text-3xl font-bold text-primary leading-tight">
            We are a movement of changemakers
          </h2>

          <p className="py-4 mb-2">
            “Code for Change” is a not-for-profit organization formed in
            collaboration with students from various colleges around the country
            with the aim of bringing IT students and industry professionals
            together. We believe that the students should be provided with
            relevant skills to prepare them for their careers. Realizing this
            fact, we have initiated "Code for Change" to provide a platform and
            opportunities for them. In the past five years, we have conducted
            nationwide hackathons, workshops, and training programs targeting IT
            students.
          </p>
          <div className="mx-auto w-full max-md:flex items-center justify-center">
            <Link
              to="/about"
              className={`px-8 py-3 border-4 border-secondary rounded-full text-white bg-secondary hover:bg-secondary/70 hover:text-white transition ${location.pathname === "/about" ? "hidden" : "inline-block"}`}
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>

      <iframe
        src="https://www.youtube.com/embed/ZIWp_LErmm0?si=4KAo1D607Rp4F8ra"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        className="rounded shadow shrink-0 max-lg:w-full h-145 w-120"
      ></iframe>
    </section>
  );
}

export default AboutSection;
