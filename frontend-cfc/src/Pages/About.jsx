import React from "react";
import Banner from "../Components/UI/Banner";
import SEO from "../Components/Common/SEO";
import AboutSection from "../Components/PageComponents/About/AboutSection";
import OurObjectives from "../Components/PageComponents/About/OurObjectives";
import Mission from "../Components/PageComponents/About/Mission";
import OurValues from "../Components/PageComponents/About/OurValues";
import TeamSection from "../Components/PageComponents/About/TeamSection";

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
      <div className="max-w-7xl mx-auto px-5">
        <AboutSection />
      </div>
      <OurObjectives />
      <Mission />
      <OurValues />
      <div className="max-w-7xl mx-auto px-5">
        <TeamSection />
      </div>
    </div>
  );
}

export default About;
