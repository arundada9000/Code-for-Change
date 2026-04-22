import { Gallery } from "./gallery.model.js";
import { IGallery } from "./gallery.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "gallery:all";
const CACHE_TTL = 3600;

export class GalleryService {
  async getAllGalleryItems(queryParams: any = {}): Promise<{ items: IGallery[], pagination: any }> {
    const { category, isFeatured, page = 1, limit = 10, ...otherFilters } = queryParams;

    const query: any = { ...otherFilters };

    if (category && category !== "All") {
      query.category = category;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true" || isFeatured === true;
    }

    if (queryParams.province && queryParams.province !== "all") {
      query.province = queryParams.province;
    }

    const isCacheable = Object.keys(query).length === 0;

    if (isCacheable) {
      try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.warn("Redis gallery cache fetch failed:", error);
      }
    }

    try {
      const parsedPage = parseInt(page as string, 10) || 1;
      const parsedLimit = parseInt(limit as string, 10) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const [items, total] = await Promise.all([
        Gallery.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
        Gallery.countDocuments(query),
      ]);

      const result = {
        items,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit),
        },
      };

      if (isCacheable) {
        redis
          .setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result))
          .catch((err: any) => {
            console.warn("Redis gallery cache set failed:", err);
          });
      }

      return result;
    } catch (error) {
      throw new AppError("Failed to fetch gallery items", 500);
    }
  }

  async getGalleryItemById(id: string): Promise<IGallery> {
    const item = await Gallery.findById(id);
    if (!item) {
      throw new AppError("Gallery item not found", 404);
    }
    return item;
  }

  async createGalleryItem(data: Partial<IGallery>): Promise<IGallery> {
    try {
      const item = await Gallery.create(data);
      await redis.del(CACHE_KEY);
      return item;
    } catch (error: any) {
      throw new AppError(error.message || "Failed to create gallery item", 500);
    }
  }

  async updateGalleryItem(
    id: string,
    data: Partial<IGallery>,
  ): Promise<IGallery> {
    const item = await Gallery.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      throw new AppError("Gallery item not found", 404);
    }

    await redis.del(CACHE_KEY);
    return item;
  }

  async deleteGalleryItem(id: string): Promise<void> {
    const item = await Gallery.findByIdAndDelete(id);
    if (!item) {
      throw new AppError("Gallery item not found", 404);
    }
    await redis.del(CACHE_KEY);
  }
}
