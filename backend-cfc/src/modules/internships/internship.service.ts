import { Internship } from "./internship.model.js";
import { IInternship } from "./internship.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "internships:all";
const CACHE_TTL = 3600; // 1 hour

export class InternshipService {
  /**
   * Get all internships with optional filtering
   */
  async getAllInternships(queryParams: any = {}): Promise<IInternship[]> {
    const {
      search,
      type,
      category,
      status,
      province,
      deadlineStart,
      deadlineEnd,
      sort,
      ...otherFilters
    } = queryParams;

    // Build query
    const query: any = { ...otherFilters };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (province && province !== "all") query.province = province;

    if (deadlineStart || deadlineEnd) {
      query.applicationDeadline = {};
      if (deadlineStart)
        query.applicationDeadline.$gte = new Date(deadlineStart);
      if (deadlineEnd) query.applicationDeadline.$lte = new Date(deadlineEnd);
    }

    // Determine if we can use cache (only for no-filter requests)
    const isCacheable = Object.keys(query).length === 0;

    // Try cache first if cacheable
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
      const sortQuery = sort ? { [sort]: 1 } : { createdAt: -1 };
      const internships = await Internship.find(query).sort(sortQuery as any);

      // Cache the result only if it was a broad fetch
      if (isCacheable) {
        redis
          .setex(CACHE_KEY, CACHE_TTL, JSON.stringify(internships))
          .catch((err: any) => {
            console.warn("Redis cache set failed:", err);
          });
      }

      return internships;
    } catch (error) {
      throw new AppError("Failed to fetch internships", 500);
    }
  }

  /**
   * Get internship by ID
   */
  async getInternshipById(id: string): Promise<IInternship> {
    const internship = await Internship.findById(id);
    if (!internship) {
      throw new AppError("Internship/Job vacancy not found", 404);
    }
    return internship;
  }

  /**
   * Create a new internship
   */
  async createInternship(data: Partial<IInternship>): Promise<IInternship> {
    // Duplicate Protection: Title + Company
    const existingInternship = await Internship.findOne({
      title: data.title,
      companyName: data.companyName,
    });

    if (existingInternship) {
      throw new AppError(
        `A vacancy for "${data.title}" at "${data.companyName}" already exists`,
        409,
      );
    }

    try {
      const internship = await Internship.create(data);

      // Invalidate cache
      redis
        .del(CACHE_KEY)
        .catch((err: any) =>
          console.warn("Redis cache invalidation failed:", err),
        );

      return internship;
    } catch (error) {
      console.error("Internship Creation Error Details:", error);
      throw error;
    }
  }

  /**
   * Update an internship
   */
  async updateInternship(
    id: string,
    data: Partial<IInternship>,
  ): Promise<IInternship> {
    const internship = await Internship.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!internship) {
      throw new AppError("Internship/Job vacancy not found", 404);
    }

    // Invalidate cache
    redis
      .del(CACHE_KEY)
      .catch((err: any) =>
        console.warn("Redis cache invalidation failed:", err),
      );

    return internship;
  }

  /**
   * Delete an internship
   */
  async deleteInternship(id: string): Promise<void> {
    const internship = await Internship.findByIdAndDelete(id);

    if (!internship) {
      throw new AppError("Internship/Job vacancy not found", 404);
    }

    // Invalidate cache
    redis
      .del(CACHE_KEY)
      .catch((err: any) =>
        console.warn("Redis cache invalidation failed:", err),
      );
  }
}
