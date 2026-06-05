import React from "react";
import Banner from "../Components/UI/Banner";
import SEO from "../Components/Common/SEO";
import AboutSection from "../Components/PageComponents/About/AboutSection";
import OurObjectives from "../Components/PageComponents/About/OurObjectives";
import Mission from "../Components/PageComponents/About/Mission";
import OurValues from "../Components/PageComponents/About/OurValues";
import TeamSection from "../Components/PageComponents/About/TeamSection";
import { FadeIn, SlideUp } from "../Components/Common/Animations";

function About() {
  return (
    <div>
      <SEO
        title="About Us"
        description="Learn about Code for Change Nepal's mission, vision, and the team driving technological transformation in IT students."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
      <Banner />
      <FadeIn delay={0.1}>
        <div className="max-w-7xl mx-auto px-5">
          <AboutSection />
        </div>
      </FadeIn>
      <SlideUp delay={0.1}>
        <OurObjectives />
      </SlideUp>
      <SlideUp delay={0.1}>
        <Mission />
      </SlideUp>
      <SlideUp delay={0.1}>
        <OurValues />
      </SlideUp>
      <div className="max-w-7xl mx-auto px-5">
        <TeamSection />
      </div>
    </div>
  );
}

export default About;
