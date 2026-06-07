import { Event } from "./event.model.js";
import { IEvent } from "./event.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "events:all";
const CACHE_TTL = 3600; // 1 hour

export class EventService {
  /**
  /**
   * Get all events with optional filtering
   */
  async getAllEvents(queryParams: any = {}): Promise<{ events: IEvent[], pagination: any }> {
    const {
      search,
      type,
      region,
      startDate,
      endDate,
      sort,
      status,
      isNational,
      page = 1,
      limit = 10,
      ...otherFilters
    } = queryParams;

    // Build query
    const query: any = { ...otherFilters };

    if (status) {
      if (typeof status === 'string' && status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (region && region !== "all") {
      query.region = region;
    }

    if (type) {
      query.type = type;
    }

    if (isNational !== undefined && isNational !== '') {
      query.isNational = isNational === 'true' || isNational === true;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
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
      const sortQuery = sort ? { [sort]: 1 } : { date: -1 };
      
      const parsedPage = parseInt(page as string, 10) || 1;
      const parsedLimit = parseInt(limit as string, 10) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const [events, total] = await Promise.all([
        Event.find(query).sort(sortQuery as any).skip(skip).limit(parsedLimit),
        Event.countDocuments(query)
      ]);

      const result = {
        events,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      };

      // Cache the result only if it was a broad fetch
      if (isCacheable) {
        redis
          .setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result))
          .catch((err: any) => {
            console.warn("Redis cache set failed:", err);
          });
      }

      return result;
    } catch (error) {
      throw new AppError("Failed to fetch events", 500);
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<IEvent> {
    const event = await Event.findById(id);
    if (!event) {
      throw new AppError("Event not found", 404);
    }
    return event;
  }

  /**
   * Get event by Slug
   */
  async getEventBySlug(slug: string): Promise<IEvent> {
    const event = await Event.findOne({ slug });
    if (!event) {
      throw new AppError("Event not found", 404);
    }
    return event;
  }

  /**
   * Create a new event
   */
  /**
   * Create a new event
   */
  async createEvent(data: Partial<IEvent>): Promise<IEvent> {
    // Duplicate Protection: Title + Date
    const existingEvent = await Event.findOne({
      title: data.title,
      date: data.date,
    });

    if (existingEvent) {
      throw new AppError(
        `An event with this title already exists on ${new Date(data.date!).toLocaleDateString()}`,
        409,
      );
    }

    try {
      const event = await Event.create(data);

      // Invalidate cache
      redis
        .del(CACHE_KEY)
        .catch((err: any) =>
          console.warn("Redis cache invalidation failed:", err),
        );

      return event;
    } catch (error) {
      console.error("Event Creation Error Details:", error);
      throw error;
    }
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, data: Partial<IEvent>): Promise<IEvent> {
    const event = await Event.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Invalidate cache
    redis
      .del(CACHE_KEY)
      .catch((err: any) =>
        console.warn("Redis cache invalidation failed:", err),
      );

    return event;
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Invalidate cache
    redis
      .del(CACHE_KEY)
      .catch((err: any) =>
        console.warn("Redis cache invalidation failed:", err),
      );
  }
}
