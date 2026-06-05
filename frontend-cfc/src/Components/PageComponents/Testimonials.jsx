import { useEffect, useRef, useState } from "react";
import { FaQuoteRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import API from "../../Services/api";
import { SlideUp, FadeIn } from "../Common/Animations";

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
    <section className="py-20 max-w-7xl mx-auto px-5 relative">
      {/* Section Header */}
      <div className="max-w-2xl mb-14">
        <SlideUp>
          <div className="flex gap-2 items-center group cursor-pointer">
            <div className="w-10 h-0.5 bg-secondary transition-all duration-300 group-hover:w-16" />
            <h4 className="uppercase text-base font-bold tracking-widest text-secondary">
              What our well-wishers say
            </h4>
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <h2 className="md:text-4xl text-3xl font-black text-slate-900 leading-tight py-4">
            Voices of students and professionals shaping our story
          </h2>
        </SlideUp>
        <FadeIn delay={0.2}>
          <p className="text-slate-600 max-w-3xl leading-relaxed text-lg">
            Hear from the talented individuals whose ideas, feedback, and
            experiences drive innovation and growth across our community.
          </p>
        </FadeIn>
      </div>

      {/* Carousel viewport */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={prev}
          className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-20
            w-12 h-12 rounded-full flex items-center justify-center
            bg-white border border-slate-200 text-slate-500
            shadow-sm hover:shadow-md hover:text-secondary hover:border-secondary/30
            transition-all duration-300 cursor-pointer active:scale-90"
        >
          <FaChevronLeft size={14} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={next}
          className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-20
            w-12 h-12 rounded-full flex items-center justify-center
            bg-white border border-slate-200 text-slate-500
            shadow-sm hover:shadow-md hover:text-secondary hover:border-secondary/30
            transition-all duration-300 cursor-pointer active:scale-90"
        >
          <FaChevronRight size={14} />
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
                className="shrink-0 rounded-3xl p-8 flex flex-col justify-between
                  bg-white border border-slate-100
                  shadow-sm
                  hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.12)]
                  transition-all duration-500 hover:-translate-y-2"
                style={{ width: CARD_WIDTH, minHeight: 320 }}
              >
                {/* Avatar */}
                <div className="flex justify-center -mt-16">
                  <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-secondary to-blue-400 shadow-lg shadow-secondary/20">
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
                <div className="mt-6 text-center relative flex-1">
                  <FaQuoteRight className="absolute -top-8 right-2 text-5xl text-secondary/10" />
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base line-clamp-4">
                    {item.text}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-10 h-1 rounded-full bg-gradient-to-r from-secondary to-blue-400 mx-auto my-5" />

                {/* Author */}
                <div className="text-center">
                  <p className="font-black text-slate-900 text-lg">
                    {item.author}
                  </p>
                  <p className="text-xs tracking-widest uppercase text-slate-400 font-bold mt-1">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2.5 mt-6">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (animating) return;
                setAnimating(true);
                trackRef.current.style.transition = "transform 0.6s ease";
                setIndex(visible + i);
              }}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                i === activeDot
                  ? "w-8 bg-secondary"
                  : "w-2 bg-slate-200 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
