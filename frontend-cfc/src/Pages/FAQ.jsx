import React, { useState } from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";

const faqData = [
  {
    question: "What is Code For Change (CFC)?",
    answer:
      "Code For Change is a youth-led initiative in Nepal dedicated to bridging the gap between academia and the tech industry. We organize workshops, hackathons, and community events to empower students with practical technical skills.",
  },
  {
    question: "How can I participate in workshops or hackathons?",
    answer:
      "You can participate by registering through our 'Events' page or by clicking the 'Register' button in the navigation bar. We announce all upcoming events on our social media platforms and our official website.",
  },
  {
    question: "Are the workshops and events free to attend?",
    answer:
      "Most of our community awareness programs and student-led workshops are free. However, specialized technical bootcamps or large-scale hackathons may have a nominal registration fee to cover logistics and resources.",
  },
  {
    question: "Can I join Code For Change as a volunteer?",
    answer:
      "Absolutely! We are always looking for passionate youth leaders and tech enthusiasts to join our provincial chapters. Keep an eye on our 'Career' or 'Internships' section for recruitment openings.",
  },
  {
    question: "How does CFC support students across different provinces?",
    answer:
      "We have an active presence across all 7 provinces of Nepal. Our provincial leads coordinate with local colleges and schools to conduct 'Avail of Internet' campaigns and 'LCT-PeARLS' team reports to ensure digital literacy reaches rural areas.",
  },
  {
    question: "How can I support or donate to Code For Change?",
    answer:
      "You can support us by clicking the 'Donate' button in our header. Contributions help us scale our impact, provide resources to rural schools, and organize more technical events for students.",
  },
];

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEO 
        title="Frequently Asked Questions"
        description="Find answers to common questions about Code for Change, our events, and how you can join our community."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]}
      />
      <Banner />
      {/* <div className="max-w-4xl mx-auto px-6 mt-8">
        <Breadcrumbs crumbs={[{ name: "FAQ", path: "/faq" }]} />
      </div> */}

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Have Questions?{" "}
            <span className="text-blue-600">We have Answers.</span>
          </h2>
          <p className="text-slate-500 text-lg">
            Find quick answers to common inquiries about our community and
            events.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="group bg-white cursor-pointer rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between cursor-pointer p-6 text-left outline-none"
              >
                <span
                  className={`text-lg font-bold transition-colors duration-300 ${
                    activeIndex === index ? "text-blue-600" : "text-slate-800"
                  }`}
                >
                  {item.question}
                </span>
                <span
                  className={`text-2xl transition-transform duration-300 ${
                    activeIndex === index
                      ? "rotate-45 text-blue-600"
                      : "text-slate-400"
                  }`}
                >
                  +
                </span>
              </button>

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  activeIndex === index
                    ? "max-h-125 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-20 p-10 bg-blue-600 rounded-[2.5rem] text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-blue-100 mb-8">
              If you couldn't find what you were looking for, feel free to
              contact us directly.
            </p>
            <a
              href="/contact-us"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-full font-black hover:bg-blue-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>
      </main>
    </div>
  );
}

export default FAQ;
