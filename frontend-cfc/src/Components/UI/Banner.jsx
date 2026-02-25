import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

function Banner() {
  const location = useLocation();

  // Function to format the path into a readable title
  const getPageTitle = (path) => {
    const formattedPath = path.replace("/", "").replace(/-/g, " ");

    return formattedPath
      ? formattedPath.charAt(0).toUpperCase() + formattedPath.slice(1)
      : "Home";
  };
 
  const title = getPageTitle(location.pathname);

  return (
    <div className="relative bg-primary">
      {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 text-center text-white">
        <p className="text-3xl text-[#c8c8c8] uppercase pb-4 font-bold">
          {title}
        </p>
        <div className="w-fit border mx-auto border-white flex items-center gap-2 rounded-full p-2 bg-white/10 backdrop-blur-3xl">
          <Link to="/" className="text-white text-base pl-2">
            Home
          </Link>
          <span className="text-white">
            <IoChevronForward />
          </span>
          <span className="bg-white text-primary px-7 py-3 rounded-full text-sm">
            {title}
          </span>
        </div>

        {/* <h1 className="text-5xl font-bold uppercase">{title}</h1> */}
      </div>
    </div>
  );
}

export default Banner;
