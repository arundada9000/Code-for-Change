import { Supporter } from "./supporter.model.js";
import { ISupporter } from "./supporter.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";

export class SupporterService {
  async getAllSupporters(): Promise<ISupporter[]> {
    return await Supporter.find().sort({ order: 1, createdAt: -1 });
  }

  async getActiveSupporters(): Promise<ISupporter[]> {
    return await Supporter.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  }

  async getSupporterById(id: string): Promise<ISupporter> {
    const supporter = await Supporter.findById(id);
    if (!supporter) {
      throw new AppError("Supporter not found", 404);
    }
    return supporter;
  }

  async createSupporter(data: Partial<ISupporter>): Promise<ISupporter> {
    try {
      return await Supporter.create(data);
    } catch (error: any) {
      throw new AppError(error.message || "Failed to create supporter", 500);
    }
  }

  async updateSupporter(id: string, data: Partial<ISupporter>): Promise<ISupporter> {
    const supporter = await Supporter.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!supporter) {
      throw new AppError("Supporter not found", 404);
    }
    return supporter;
  }

  async deleteSupporter(id: string): Promise<ISupporter> {
    const supporter = await Supporter.findByIdAndDelete(id);
    if (!supporter) {
      throw new AppError("Supporter not found", 404);
    }
    return supporter;
  }
}
