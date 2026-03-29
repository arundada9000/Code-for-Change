import React, { useState, useEffect, useCallback, useMemo } from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import API from "../Services/api";
import { toast } from "react-hot-toast";
import { GalleryMasonrySkeleton } from "../Components/Loading/Skeleton";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "../Components/Common/Animations";
import { RiCloseFill } from "react-icons/ri";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { FiDownload } from "react-icons/fi";

function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchGallery = async (currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "15");
      params.append("page", String(currentPage));

      const { data } = await API.get(`/gallery?${params.toString()}`);
      const newItems = data.data?.items || [];
      const pagination = data.pagination || data.data?.pagination || null;

      if (currentPage === 1) {
        setGalleryImages(newItems);
      } else {
        setGalleryImages((prev) => [...prev, ...newItems]);
      }

      if (pagination && pagination.page < pagination.totalPages) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch gallery", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGallery(nextPage);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(galleryImages.map((img) => img.category))];
    return cats;
  }, [galleryImages]);

  const filteredImages = useMemo(() => {
    return filter === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === filter);
  }, [filter, galleryImages]);

  // Function to move to next image
  const nextImage = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentIndex((prev) =>
        prev + 1 === filteredImages.length ? 0 : prev + 1,
      );
    },
    [filteredImages.length],
  );

  // Function to move to previous image
  const prevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentIndex((prev) =>
        prev === 0 ? filteredImages.length - 1 : prev - 1,
      );
    },
    [filteredImages.length],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setCurrentIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, nextImage, prevImage]);

  const selectedImg =
    currentIndex !== null ? filteredImages[currentIndex] : null;

  // handle download
  const handleDownload = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Try to extract extension from URL
      const extMatch = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)(?:[\?#]|$)/i);
      const extension = extMatch ? extMatch[0] : "";

      link.download = imageName
        ? `${imageName.replace(/[^a-zA-Z0-9-\s]/g, "").replace(/\s+/g, "_")}${extension}`
        : `download${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image using fetch:", error);
      // Fallback: direct opening/download using a tag
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageName || "download";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO
        title="Gallery & Memories"
        description="Browse through the memories of our workshops, hackathons, and community events across Nepal."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ]}
      />
      <Banner />
      {/* <div className="max-w-7xl mx-auto px-4 mt-8">
        <Breadcrumbs crumbs={[{ name: "Gallery", path: "/gallery" }]} />
      </div> */}

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <SlideUp>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilter(cat);
                  setCurrentIndex(null);
                }}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  filter === cat
                    ? "bg-secondary text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SlideUp>

        {loading && filteredImages.length === 0 ? (
          <GalleryMasonrySkeleton count={9} />
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold text-xl">
              No memories found.
            </p>
          </div>
        ) : (
          <StaggerContainer className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 lg:px-10">
            {filteredImages.map((image, index) => (
              <StaggerItem
                key={image._id || image.id}
                className="break-inside-avoid"
              >
                <div
                  onClick={() => setCurrentIndex(index)}
                  className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer bg-slate-50 border border-slate-100"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Visual refinement matching image: glassmorphism hover effect */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <div className="flex justify-between bg-white/20 backdrop-blur-xl p-5 rounded-3xl border border-white/30 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-out shadow-2xl">
                      <div>
                        <span className="text-white/80 text-[10px] font-black uppercase tracking-widest block mb-1.5 drop-shadow-sm">
                          {image.category}
                        </span>
                        <h3 className="text-white text-base font-bold truncate drop-shadow-md">
                          {image.title}
                        </h3>{" "}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image.imageUrl, image.title);
                        }}
                        className=" bg-white/20 p-3 rounded-full text-white text-xl cursor-pointer z-110 transition-all ease-in duration-300"
                      >
                        <FiDownload />
                      </button>
                    </div>
                  </div>

                  {/* Always visible title if requested, but let's stick to clean hover for now as per "arrangement" */}
                  {image.isFeatured && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        Featured
                      </div>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More Images"}
            </button>
          </div>
        )}
      </main>

      {/* Lightbox Slider */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setCurrentIndex(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 group bg-white/20 p-3 rounded-full text-white text-xl cursor-pointer z-110 transition-all ease-in duration-300"
            onClick={() => setCurrentIndex(null)}
          >
            <RiCloseFill className="group-hover:rotate-90 transition-all ease-in duration-300" />
          </button>
          {/* Download Button */}
          <button
            onClick={() =>
              handleDownload(selectedImg.imageUrl, selectedImg.title)
            }
            className="absolute top-6 right-20 group bg-white/20 p-3 rounded-full text-white text-xl cursor-pointer z-110 transition-all ease-in duration-300"
          >
            <FiDownload className="group-hover:translate-y-0.5 transition-all ease-in duration-200"/>
          </button>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 md:left-10 w-12 h-12 flex items-center cursor-pointer justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[110]"
            onClick={prevImage}
          >
            <span className="text-2xl">
              <FiChevronLeft />
            </span>
          </button>

          <button
            className="absolute right-4 md:right-10 w-12 h-12 flex items-center cursor-pointer justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[110]"
            onClick={nextImage}
          >
            <span className="text-2xl">
              <FiChevronRight />
            </span>
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImg.imageUrl}
              alt={selectedImg.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />

            <div className="mt-8 text-center text-white">
              <p className="text- text-xs font-bold uppercase tracking-[0.2em] mb-2">
                {selectedImg.category}
              </p>
              <h3 className="text-2xl font-bold mb-2">{selectedImg.title}</h3>
              <p className="text-white/40 text-sm font-medium">
                {currentIndex + 1} of {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
