import React, { useEffect, useRef } from "react";
import CSIT from "../../assets/CSITAssociation.jpg";
import eduSanjal from "../../assets/eduSanjal.jpg";
import esewa from "../../assets/esewa.jpg";
import Grace from "../../assets/Grace.jpg";
import HostingSewa from "../../assets/HostingSewa.jpg";
import leapfrog from "../../assets/leapfrog.jpg";
import Nabil from "../../assets/Nabil.jpg";
import Partner1 from "../../assets/partner1.jpg";
import Texas from "../../assets/Texas.jpg";
import TU from "../../assets/TU.jpg";
import HamroPatro from "../../assets/hamropatro.jpg";


function Supporters() {
  const partners = [
    CSIT,
    eduSanjal,
    esewa,
    Grace,
    HostingSewa,
    leapfrog,
    Nabil,
    Partner1,
    Texas,
    TU,
    HamroPatro,
  ];

  const carouselRef = useRef(null);
  let animationId;

  useEffect(() => {
    const carousel = carouselRef.current;
    let scrollSpeed = 0.5; 

    const animate = () => {
      if (carousel) {
        carousel.scrollLeft += scrollSpeed;

        // Reset smoothly when half scrolled
        if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
          carousel.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="pb-16 overflow-hidden">
      <div className="flex gap-5 items-center">
        <p className="uppercase text-base font-semibold whitespace-nowrap text-primary">
          Our Supporters
        </p>
        <hr className="h-0.5 bg-primary flex-1 opacity-20" />
      </div>

      <div
        ref={carouselRef}
        className="flex gap-10 md:gap-28 max-md:h-14 h-20 mt-12 overflow-hidden"
      >
        {[...partners, ...partners].map((logo, i) => (
          <img
            key={i}
            src={logo}
            alt={`Partner ${i + 1}`}
            className="h-full object-contain shrink-0"
          />
        ))}
      </div>
    </section>
  );
}

export default Supporters;
