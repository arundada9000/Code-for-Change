import { NationalTeamMember } from "./team.model.js";
import { INationalTeamMember } from "./team.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";

export class TeamService {
  async getAllMembers(queryParams: any = {}) {
    const query: any = {};
    if (queryParams.type) {
      query.type = queryParams.type;
    }
    const members = await NationalTeamMember.find(query).sort({ createdAt: -1 });
    return members;
  }

  async getMemberById(id: string) {
    const member = await NationalTeamMember.findById(id);
    if (!member) {
      throw new AppError("Team member not found", 404);
    }
    return member;
  }

  async createMember(data: Partial<INationalTeamMember>) {
    return await NationalTeamMember.create(data);
  }

  async updateMember(id: string, data: Partial<INationalTeamMember>) {
    const member = await NationalTeamMember.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!member) {
      throw new AppError("Team member not found", 404);
    }
    return member;
  }

  async deleteMember(id: string) {
    const member = await NationalTeamMember.findByIdAndDelete(id);
    if (!member) {
      throw new AppError("Team member not found", 404);
    }
    return member;
  }
}
