import React, { useEffect, useRef, useState } from "react";
import API from "../../Services/api";

function Supporters() {
  const [partners, setPartners] = useState([]);
  const carouselRef = useRef(null);
  let animationId;

  // Fetch partners from API
  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const { data } = await API.get("/supporters");
        setPartners(data.data || []);
      } catch (error) {
        console.error("Error fetching supporters:", error);
      }
    };
    fetchSupporters();
  }, []);

  useEffect(() => {
    // Only animate if there are items to animate
    if (partners.length === 0) return;

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
  }, [partners]);

  if (partners.length === 0) return null;

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
        {[...partners, ...partners].map((supporter, i) => (
          <img
            key={i}
            src={supporter.logo}
            alt={supporter.name || `Partner ${i + 1}`}
            className="h-full object-contain shrink-0"
          />
        ))}
      </div>
    </section>
  );
}

export default Supporters;
