import { Testimonial } from "./testimonial.model.js";
import { ITestimonial } from "./testimonial.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";

export class TestimonialService {
  async getAllTestimonials(): Promise<ITestimonial[]> {
    return await Testimonial.find().sort({ order: 1, createdAt: -1 });
  }

  async getActiveTestimonials(): Promise<ITestimonial[]> {
    return await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  }

  async getTestimonialById(id: string): Promise<ITestimonial> {
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      throw new AppError("Testimonial not found", 404);
    }
    return testimonial;
  }

  async createTestimonial(data: Partial<ITestimonial>): Promise<ITestimonial> {
    try {
      return await Testimonial.create(data);
    } catch (error: any) {
      throw new AppError(error.message || "Failed to create testimonial", 500);
    }
  }

  async updateTestimonial(id: string, data: Partial<ITestimonial>): Promise<ITestimonial> {
    const testimonial = await Testimonial.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) {
      throw new AppError("Testimonial not found", 404);
    }
    return testimonial;
  }

  async deleteTestimonial(id: string): Promise<ITestimonial> {
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      throw new AppError("Testimonial not found", 404);
    }
    return testimonial;
  }
}
