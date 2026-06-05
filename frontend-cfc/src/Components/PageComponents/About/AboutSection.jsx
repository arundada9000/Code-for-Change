import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SlideUp, FadeIn } from "../../Common/Animations";
import { FaArrowRight } from "react-icons/fa";

function AboutSection() {
  const location = useLocation();
  return (
    <section className="py-16 flex flex-col lg:flex-row justify-between items-center gap-24 max-md:gap-6">
      <SlideUp className="flex-1">
        <div>
          <div className="flex gap-2 items-center group cursor-pointer">
            <div className="w-10 h-0.5 bg-secondary transition-all duration-300 ease-in group-hover:w-16"></div>
            <h4 className="uppercase text-base font-bold tracking-widest text-secondary">Know about us</h4>
          </div>
          <div className="py-4">
            <h2 className="md:text-4xl text-3xl font-black text-slate-900 leading-tight">
              We are a movement of changemakers
            </h2>

            <p className="py-4 mb-2 text-slate-600 leading-relaxed text-lg">
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
            <div className="mx-auto w-full max-md:flex items-center justify-center mt-4">
              <Link
                to="/about"
                className={`group flex items-center justify-center gap-3 px-8 py-4 rounded-full text-white bg-secondary font-bold tracking-widest text-sm uppercase transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 w-full sm:w-auto ${location.pathname === "/about" ? "hidden" : "inline-flex"}`}
              >
                <span>Learn more</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </SlideUp>

      <FadeIn delay={0.2} className="shrink-0 max-lg:w-full">
        <iframe
          src="https://www.youtube.com/embed/ZIWp_LErmm0?si=4KAo1D607Rp4F8ra"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="rounded-[2rem] shadow-2xl shrink-0 max-lg:w-full h-80 md:h-96 lg:h-[400px] lg:w-[500px] border-4 border-white object-cover"
        ></iframe>
      </FadeIn>
    </section>
  );
}

export default AboutSection;
