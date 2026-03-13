import { Blog } from "./blog.model.js";
import { IBlog } from "./blog.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "blogs:all";
const CACHE_TTL = 3600;

export class BlogService {
  async getAllBlogs(queryParams: any = {}): Promise<IBlog[]> {
    const { search, category, author, province, startDate, endDate, ...otherFilters } = queryParams;

    // Build query
    const query: any = { ...otherFilters };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (province && province !== 'all') {
      query.province = province;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (author) {
      query.author = { $regex: author, $options: "i" };
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
      const blogs = await Blog.find(query).sort({ createdAt: -1 });
      
      if (isCacheable) {
        redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(blogs)).catch((err:any) => {
             console.warn("Redis cache set failed:", err);
        });
      }
      
      return blogs;
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
