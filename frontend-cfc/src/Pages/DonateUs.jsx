import React from 'react'
import Banner from '../Components/UI/Banner'
import Breadcrumbs from '../Components/UI/Breadcrumbs'
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
    <div className="max-w-7xl mx-auto px-5 mt-8">
      <Breadcrumbs crumbs={[{ name: "Donate", path: "/donate-us" }]} />
    </div>
    <DonateSection/>
    </>
  )
}

export default DonateUs
