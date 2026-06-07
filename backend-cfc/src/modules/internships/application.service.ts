import { InternshipApplication } from "./application.model.js";
import { IInternshipApplication, ApplicationStatus } from "./application.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";

export class ApplicationService {
  /**
   * Submit a new application
   */
  async submitApplication(data: Partial<IInternshipApplication>): Promise<IInternshipApplication> {
    try {
      const existing = await InternshipApplication.findOne({
        email: data.email,
        internshipId: data.internshipId
      });
      if (existing) {
        throw new AppError("You have already applied for this internship.", 400);
      }
      return await InternshipApplication.create(data);
    } catch (error: any) {
      console.error("Application Submission Error:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to submit application", 500);
    }
  }

  /**
   * Get all applications with filters
   */
  async getAllApplications(queryParams: any = {}): Promise<IInternshipApplication[]> {
    const { search, track, status, startDate, endDate, sort } = queryParams;
    const query: any = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      // Find internships matching search to include in search
      const { Internship } = await import("./internship.model.js");
      const matchingInternships = await Internship.find({
        $or: [
          { title: { $regex: safeSearch, $options: "i" } },
          { companyName: { $regex: safeSearch, $options: "i" } }
        ]
      }).select("_id");
      
      const internshipIds = matchingInternships.map(i => i._id);

      query.$or = [
        { fullName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { college: { $regex: safeSearch, $options: "i" } },
        { internshipId: { $in: internshipIds } }
      ];
    }

    if (track && track !== "All") query.track = track;
    if (status && status !== "All") query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    try {
      const sortQuery = sort ? { [sort]: 1 } : { createdAt: -1 };
      return await InternshipApplication.find(query).sort(sortQuery as any).populate("internshipId", "title companyName");
    } catch (error) {
      throw new AppError("Failed to fetch applications", 500);
    }
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id: string): Promise<IInternshipApplication> {
    const application = await InternshipApplication.findById(id).populate("internshipId", "title companyName");
    if (!application) {
      throw new AppError("Application not found", 404);
    }
    return application;
  }

  /**
   * Update application status
   */
  async updateStatus(id: string, status: ApplicationStatus): Promise<IInternshipApplication> {
    const application = await InternshipApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    return application;
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: string): Promise<void> {
    const application = await InternshipApplication.findByIdAndDelete(id);
    if (!application) {
      throw new AppError("Application not found", 404);
    }
  }
}
