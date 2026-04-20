import { Periodical } from "./periodical.model.js";
import { IPeriodical } from "./periodical.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "periodicals:all";
const CACHE_TTL = 3600;

/**
 * Escape regex special characters to prevent ReDoS attacks
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class PeriodicalService {
  async getAllPeriodicals(queryParams: any = {}): Promise<{ periodicals: IPeriodical[]; pagination: any }> {
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

      const [periodicals, total] = await Promise.all([
        Periodical.find(query).sort(sort).skip(skip).limit(parsedLimit),
        Periodical.countDocuments(query),
      ]);

      const result = {
        periodicals,
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
      throw new AppError("Failed to fetch periodicals", 500);
    }
  }

  async getPeriodicalById(id: string): Promise<IPeriodical> {
    const periodical = await Periodical.findById(id);
    if (!periodical) {
      throw new AppError("Periodical not found", 404);
    }
    return periodical;
  }

  async getPeriodicalBySlug(slug: string): Promise<IPeriodical> {
    const periodical = await Periodical.findOne({ slug });
    if (!periodical) {
      throw new AppError("Periodical not found", 404);
    }
    return periodical;
  }

  async createPeriodical(data: Partial<IPeriodical>): Promise<IPeriodical> {
    const existing = await Periodical.findOne({ title: data.title });
    if (existing) {
      throw new AppError("A periodical with this title already exists", 409);
    }

    try {
      const periodical = await Periodical.create(data);
      await redis.del(CACHE_KEY);
      return periodical;
    } catch (error: any) {
      throw new AppError(error.message || "Failed to create periodical", 500);
    }
  }

  async updatePeriodical(id: string, data: Partial<IPeriodical>): Promise<IPeriodical> {
    const periodical = await Periodical.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!periodical) {
      throw new AppError("Periodical not found", 404);
    }

    await redis.del(CACHE_KEY);
    return periodical;
  }

  async deletePeriodical(id: string): Promise<void> {
    const periodical = await Periodical.findByIdAndDelete(id);
    if (!periodical) {
      throw new AppError("Periodical not found", 404);
    }
    await redis.del(CACHE_KEY);
  }
}
