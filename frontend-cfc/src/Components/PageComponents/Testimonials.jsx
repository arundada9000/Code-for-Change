import { useEffect, useRef, useState } from "react";
import { FaQuoteRight } from "react-icons/fa";
import API from "../../Services/api";

const CARD_WIDTH = 340;
const GAP = 20;
const SLIDE_DURATION = 600;
const AUTO_DELAY = 4000;

export default function Testimonial() {
  const trackRef = useRef(null);

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await API.get("/testimonials");
        setTestimonials(data.data || []);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Determine visible slides based on screen width
  const getVisible = () => {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1025) return 2;
    return 3;
  };

  const [visible, setVisible] = useState(getVisible);
  const SLIDE_SIZE = CARD_WIDTH + GAP;

  useEffect(() => {
    const onResize = () => setVisible(getVisible());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Clone slides for infinite effect
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(visible);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (testimonials.length === 0) return;
    setSlides([
      ...testimonials.slice(-visible),
      ...testimonials,
      ...testimonials.slice(0, visible),
    ]);
    setIndex(visible);
  }, [visible, testimonials]);

  /* Auto slide */
  useEffect(() => {
    const interval = setInterval(next, AUTO_DELAY);
    return () => clearInterval(interval);
  }, [visible]);

  /* Infinite reset */
  useEffect(() => {
    if (!animating) return;
    const timer = setTimeout(() => {
      setAnimating(false);
      if (index >= testimonials.length + visible) {
        trackRef.current.style.transition = "none";
        setIndex(visible);
      }
      if (index <= visible - 1) {
        trackRef.current.style.transition = "none";
        setIndex(testimonials.length + visible - 1);
      }
    }, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [index, animating, visible]);

  const next = () => {
    if (animating) return;
    setAnimating(true);
    trackRef.current.style.transition = "transform 0.6s ease";
    setIndex((i) => i + 1);
  };

  const prev = () => {
    if (animating) return;
    setAnimating(true);
    trackRef.current.style.transition = "transform 0.6s ease";
    setIndex((i) => i - 1);
  };

  // Dots now represent each testimonial individually
  const totalDots = testimonials.length;
  const activeDot =
    testimonials.length > 0
      ? (index - visible + testimonials.length) % testimonials.length
      : 0;

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 relative">
      {/* Label */}
      <div className="max-w-2xl mb-14">
        <div className="flex gap-2 items-center group cursor-pointer">
          <div className="w-10 h-0.5 bg-primary transition-all duration-300" />
          <h4 className="uppercase text-base font-medium tracking-wider">
            What our well-wishers say
          </h4>
        </div>

        {/* Heading */}
        <h2 className="md:text-4xl text-3xl font-bold text-primary py-4">
          Voices of students and professionals shaping our story
        </h2>
        <p className="text-gray-600 max-w-3xl">
          Hear from the talented individuals whose ideas, feedback, and
          experiences drive innovation and growth across our community.
        </p>
      </div>
      {/* Carousel viewport */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20
   rounded-full flex items-center justify-center
 text-3xl px-5 py-2 bg-white/80 backdrop-blur-md border border-gray-200
  shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
        >
          ‹
        </button>

        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20
   rounded-full flex items-center justify-center
 text-3xl px-5 py-2 bg-white/80 backdrop-blur-md border border-gray-200
  shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
        >
          ›
        </button>

        <div
          className="relative mx-auto overflow-x-hidden overflow-y-visible py-10"
          style={{ width: visible * SLIDE_SIZE - GAP }}
        >
          <div
            ref={trackRef}
            className="flex"
            style={{
              gap: GAP,
              width: slides.length * SLIDE_SIZE,
              transform: `translateX(-${index * SLIDE_SIZE}px)`,
            }}
          >
            {slides.map((item, i) => (
              <div
                key={i}
                className="shrink-0 rounded-2xl p-7 flex flex-col justify-between
  bg-linear-to-br from-white via-white to-gray-50
  border border-gray-200/60
  shadow-[0_0_10px_rgba(0,0,0,0.08)]
  hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]
  transition-all duration-500 hover:-translate-y-2"
                style={{ width: CARD_WIDTH, minHeight: 320 }}
              >
                {/* Avatar */}
                <div className="flex justify-center -mt-14">
                  <div className="w-24 h-24 rounded-full p-0.5 bg-linear-to-tr from-primary to-purple-500 shadow-lg">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <img
                        src={item.image}
                        alt={item.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div className="mt-8 text-center relative">
                  <FaQuoteRight className="absolute -top-10 right-2 text-5xl text-purple-100" />
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base line-clamp-3 md:line-clamp-4">
                    {item.text}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-10 h-1 rounded-full bg-linear-to-r from-primary to-purple-500 mx-auto my-5" />

                {/* Author */}
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-lg">
                    {item.author}
                  </p>
                  <p className="text-xs tracking-wide uppercase text-gray-500">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (animating) return;
                setAnimating(true);
                trackRef.current.style.transition = "transform 0.6s ease";
                setIndex(visible + i);
              }}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === activeDot
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
