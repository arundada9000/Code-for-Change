import React from 'react'
import Banner from '../Components/UI/Banner'
import SEO from '../Components/Common/SEO'
import DonateSection from '../Components/PageComponents/Donate/DonateSection'

function DonateUs() {
  return (
    <>
    <SEO 
      title="Support Our Mission"
      description="Help us empower the next generation of IT leaders in Nepal. Your contribution fuels digital education and industry readiness."
      breadcrumbs={[{ name: "Home", path: "/" }, { name: "Donate", path: "/donate-us" }]}
    />
    <Banner/>
    <DonateSection/>
    </>
  )
}

export default DonateUs
