import React from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import { BlogCard } from "../Components/PageComponents/Events/BlogCard";

function Blog() {
  return (
    <div>
      <SEO 
        title="Articles & Stories"
        description="Explore articles, stories, and technical insights from the Code for Change Nepal community."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Articles", path: "/blog" }]}
      />
      <Banner />
      {/* <div className="max-w-7xl mx-auto px-5 mt-8">
        <Breadcrumbs crumbs={[{ name: "Articles", path: "/blog" }]} />
      </div> */}
      <div className="py-16">
        <BlogCard />
      </div>
    </div>
  );
}

export default Blog;
