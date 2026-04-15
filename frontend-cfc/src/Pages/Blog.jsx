import React from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import { BlogCard } from "../Components/PageComponents/Events/BlogCard";

function Blog() {
  const creativeItems = ["Blog", "Walkthrough", "Periodicals"];
  return (
    <div>
      <SEO
        title="Articles & Stories"
        description="Explore articles, stories, and technical insights from the Code for Change Nepal community."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Articles", path: "/blog" },
        ]}
      />
      <Banner />
      {/* <div className="max-w-7xl mx-auto px-5 mt-8">
        <Breadcrumbs crumbs={[{ name: "Articles", path: "/blog" }]} />
      </div> */}
      <div className="max-w-7xl mx-auto pt-16">
        <div className="flex flex-wrap justify-center gap-4">
          {creativeItems.map((item) => (
            <button key={item} className="px-6 py-2 rounded-full font-bold transition-all cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200">{item}</button>
          ))}
        </div>
      </div>
      <div className="py-16">
        <BlogCard />
      </div>
    </div>
  );
}

export default Blog;
