import { Impact } from "./impact.model.js";
import { IImpact } from "./impact.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import redis from "../../shared/configs/redis.js";

const CACHE_KEY = "impact:all";
const CACHE_TTL = 3600;

export class ImpactService {
  async getAllImpacts(queryParams: any = {}): Promise<IImpact[]> {
    const { province, ...otherFilters } = queryParams;
    const query: any = { ...otherFilters };

    if (province && province !== 'all') {
      query.province = province;
    }

    // Determine if we can use cache (only for no-filter requests)
    const isCacheable = Object.keys(query).length === 0;

    if (isCacheable) {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    }

    const impacts = await Impact.find(query).sort({ createdAt: -1 });
    
    if (isCacheable) {
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(impacts));
    }
    
    return impacts;
  }

  async getImpactById(id: string): Promise<IImpact> {
    const impact = await Impact.findById(id);
    if (!impact) throw new AppError("Impact not found", 404);
    return impact;
  }

  async createImpact(data: Partial<IImpact>): Promise<IImpact> {
    const impact = await Impact.create(data);
    await redis.del(CACHE_KEY);
    return impact;
  }

  async updateImpact(id: string, data: Partial<IImpact>): Promise<IImpact> {
    const impact = await Impact.findByIdAndUpdate(id, data, { 
      new: true, 
      runValidators: true 
    });
    if (!impact) throw new AppError("Impact not found", 404);
    await redis.del(CACHE_KEY);
    return impact;
  }

  async deleteImpact(id: string): Promise<void> {
    const impact = await Impact.findByIdAndDelete(id);
    if (!impact) throw new AppError("Impact not found", 404);
    await redis.del(CACHE_KEY);
  }
}
