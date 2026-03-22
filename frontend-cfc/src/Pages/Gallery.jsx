import React, { useState, useEffect, useCallback, useMemo } from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import API from "../Services/api";
import { toast } from "react-hot-toast";
import { GalleryMasonrySkeleton } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "../Components/Common/Animations";

function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(null);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/gallery");
      setGalleryImages(data.data || []);
    } catch (error) {
      console.error("Failed to fetch gallery", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
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
        prev + 1 === filteredImages.length ? 0 : prev + 1
      );
    },
    [filteredImages.length]
  );

  // Function to move to previous image
  const prevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentIndex((prev) =>
        prev === 0 ? filteredImages.length - 1 : prev - 1
      );
    },
    [filteredImages.length]
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

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO 
        title="Gallery & Memories"
        description="Browse through the memories of our workshops, hackathons, and community events across Nepal."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }]}
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
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SlideUp>

        {loading ? (
          <GalleryMasonrySkeleton count={9} />
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold text-xl">No memories found.</p>
          </div>
        ) : (
          <StaggerContainer className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 lg:px-10">
            {filteredImages.map((image, index) => (
              <StaggerItem key={image._id || image.id} className="break-inside-avoid">
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
                    <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl border border-white/30 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-out shadow-2xl">
                      <span className="text-white/80 text-[10px] font-black uppercase tracking-widest block mb-1.5 drop-shadow-sm">
                        {image.category}
                      </span>
                      <h3 className="text-white text-base font-bold truncate drop-shadow-md">{image.title}</h3>
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
      </main>

      {/* Lightbox Slider */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setCurrentIndex(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white text-4xl cursor-pointer hover:text-blue-400 z-[110]"
            onClick={() => setCurrentIndex(null)}
          >
            ×
          </button>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 md:left-10 w-12 h-12 flex items-center cursor-pointer justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[110]"
            onClick={prevImage}
          >
            <span className="text-2xl">←</span>
          </button>

          <button
            className="absolute right-4 md:right-10 w-12 h-12 flex items-center cursor-pointer justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[110]"
            onClick={nextImage}
          >
            <span className="text-2xl">→</span>
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
              <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
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
