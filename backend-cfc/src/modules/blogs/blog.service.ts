import { Blog } from "./blog.model.js";
import { IBlog } from "./blog.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "blogs:all";
const CACHE_TTL = 3600;

export class BlogService {
  async getAllBlogs(queryParams: any = {}): Promise<{ blogs: IBlog[], pagination: any }> {
    const { search, category, author, province, startDate, endDate, page = 1, limit = 10, ...otherFilters } = queryParams;

    // Build query
    const query: any = { ...otherFilters };

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { content: { $regex: safeSearch, $options: "i" } },
        { tags: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (province && province !== 'all') {
      query.province = province;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (author) {
      query.author = { $regex: escapeRegex(author), $options: "i" };
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

      const [blogs, total] = await Promise.all([
        Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
        Blog.countDocuments(query)
      ]);

      const result = {
        blogs,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      };
      
      if (isCacheable) {
        redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result)).catch((err:any) => {
             console.warn("Redis cache set failed:", err);
        });
      }
      
      return result;
    } catch (error) {
      throw new AppError("Failed to fetch blogs", 500);
    }
  }

  async getBlogById(id: string): Promise<IBlog> {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new AppError("Blog not found", 404);
    }
    return blog;
  }

  async getBlogBySlug(slug: string): Promise<IBlog> {
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      throw new AppError("Blog not found", 404);
    }
    return blog;
  }

  async createBlog(data: Partial<IBlog>): Promise<IBlog> {
    // Duplicate Protection: Title
    const existingBlog = await Blog.findOne({ title: data.title });
    if (existingBlog) {
      throw new AppError("A blog with this title already exists", 409);
    }

    try {
      const blog = await Blog.create(data);
      await redis.del(CACHE_KEY);
      return blog;
    } catch (error: any) {
      throw new AppError(error.message || "Failed to create blog", 500);
    }
  }

  async updateBlog(id: string, data: Partial<IBlog>): Promise<IBlog> {
    const blog = await Blog.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      throw new AppError("Blog not found", 404);
    }

    await redis.del(CACHE_KEY);
    return blog;
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new AppError("Blog not found", 404);
    }
    await redis.del(CACHE_KEY);
  }
}
