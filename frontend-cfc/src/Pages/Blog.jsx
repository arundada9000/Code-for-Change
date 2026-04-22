import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Banner from "../Components/UI/Banner";
import SEO from "../Components/Common/SEO";
import { BlogCard } from "../Components/PageComponents/Events/BlogCard";

function Blog() {
  const navigate = useNavigate();
  const location = useLocation();

  const creativeItems = [
    { label: "Blog", path: "/creative" },
    { label: "Walkthrough", path: "/creative/walkthrough" },
    { label: "Periodicals", path: "/creative/periodicals" },
  ];

  const currentPath = location.pathname;

  return (
    <div>
      <SEO
        title="Articles & Stories"
        description="Explore articles, stories, and technical insights from the Code for Change Nepal community."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Creative", path: "/creative" },
        ]}
      />
      <Banner />
      <div className="max-w-7xl mx-auto pt-16">
        <div className="flex flex-wrap justify-center gap-4">
          {creativeItems.map((item) => {
            const isActive =
              item.path === "/creative"
                ? currentPath === "/creative"
                : currentPath.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-secondary text-white shadow-lg shadow-secondary/25 scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="py-16">
        <BlogCard />
      </div>
    </div>
  );
}

export default Blog;
