import { Walkthrough } from "./walkthrough.model.js";
import { IWalkthrough } from "./walkthrough.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "walkthroughs:all";
const CACHE_TTL = 3600;


export class WalkthroughService {
  async getAllWalkthroughs(queryParams: any = {}): Promise<{ walkthroughs: IWalkthrough[]; pagination: any }> {
    const {
      search,
      category,
      province,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = "-createdAt",
      ...otherFilters
    } = queryParams;

    // Build query
    const query: any = { ...otherFilters };

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { tags: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (province && province !== "all") {
      query.province = province;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Determine if we can use cache (only for no-filter requests)
    const isCacheable = Object.keys(query).length === 0;

    if (isCacheable) {
      try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.warn("Redis cache fetch failed:", error);
      }
    }

    try {
      const parsedPage = parseInt(page as string, 10) || 1;
      const parsedLimit = parseInt(limit as string, 10) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const [walkthroughs, total] = await Promise.all([
        Walkthrough.find(query).sort(sort).skip(skip).limit(parsedLimit),
        Walkthrough.countDocuments(query),
      ]);

      const result = {
        walkthroughs,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit),
        },
      };

      if (isCacheable) {
        redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result)).catch((err: any) => {
          console.warn("Redis cache set failed:", err);
        });
      }

      return result;
    } catch (error) {
      throw new AppError("Failed to fetch walkthroughs", 500);
    }
  }

  async getWalkthroughById(id: string): Promise<IWalkthrough> {
    const walkthrough = await Walkthrough.findById(id);
    if (!walkthrough) {
      throw new AppError("Walkthrough not found", 404);
    }
    return walkthrough;
  }

  async getWalkthroughBySlug(slug: string): Promise<IWalkthrough> {
    const walkthrough = await Walkthrough.findOne({ slug });
    if (!walkthrough) {
      throw new AppError("Walkthrough not found", 404);
    }
    return walkthrough;
  }

  async createWalkthrough(data: Partial<IWalkthrough>): Promise<IWalkthrough> {
    const existing = await Walkthrough.findOne({ title: data.title });
    if (existing) {
      throw new AppError("A walkthrough with this title already exists", 409);
    }

    try {
      const walkthrough = await Walkthrough.create(data);
      await redis.del(CACHE_KEY);
      return walkthrough;
    } catch (error: any) {
      throw new AppError(error.message || "Failed to create walkthrough", 500);
    }
  }

  async updateWalkthrough(id: string, data: Partial<IWalkthrough>): Promise<IWalkthrough> {
    const walkthrough = await Walkthrough.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!walkthrough) {
      throw new AppError("Walkthrough not found", 404);
    }

    await redis.del(CACHE_KEY);
    return walkthrough;
  }

  async deleteWalkthrough(id: string): Promise<void> {
    const walkthrough = await Walkthrough.findByIdAndDelete(id);
    if (!walkthrough) {
      throw new AppError("Walkthrough not found", 404);
    }
    await redis.del(CACHE_KEY);
  }
}
