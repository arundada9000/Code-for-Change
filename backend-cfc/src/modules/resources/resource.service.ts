import { Resource } from "./resource.model.js";
import { ResourceVisibility, IResource } from "./resource.interface.js";
import { RoleValue, ROLES } from "../../shared/configs/permissions.js";

// Map role to numeric visibility level
// Public=0, GM=1, CR=2, EB=3, Admin=4
export const ROLE_LEVEL: Record<string, number> = {
  guest: 0,
  [ROLES.GM]: 1,
  [ROLES.CR]: 2,
  [ROLES.EB]: 3,
  [ROLES.ADMIN]: 4,
  [ROLES.SUPER_ADMIN]: 4,
};

// Map visibility label to level
const VISIBILITY_LEVEL: Record<ResourceVisibility, number> = {
  public: 0,
  gm: 1,
  cr: 2,
  eb: 3,
  admin: 4,
};

// Get all visibility values accessible to the role level
function getAllowedVisibilities(roleLevel: number): ResourceVisibility[] {
  return (Object.keys(VISIBILITY_LEVEL) as ResourceVisibility[]).filter(
    (v) => VISIBILITY_LEVEL[v] <= roleLevel
  );
}

export class ResourceService {
  // Get resources filtered by the caller's role level
  async getAllResources(role?: string, query: Record<string, any> = {}) {
    const roleLevel = ROLE_LEVEL[role ?? "guest"] ?? 0;
    const allowedVisibilities = getAllowedVisibilities(roleLevel);

    const filter: Record<string, any> = {
      isActive: true,
      visibility: { $in: allowedVisibilities },
    };

    // Optional filters
    if (query.category) filter.category = query.category;
    if (query.type) filter.type = query.type;
    if (query.subject) filter.subject = new RegExp(query.subject, "i");

    return Resource.find(filter).sort({ createdAt: -1 });
  }

  // Get a single resource by id - verifies role level
  async getResourceById(id: string, role?: string) {
    const resource = await Resource.findById(id);
    if (!resource || !resource.isActive) {
      throw new Error("Resource not found");
    }

    const roleLevel = ROLE_LEVEL[role ?? "guest"] ?? 0;
    const requiredLevel = VISIBILITY_LEVEL[resource.visibility];
    if (roleLevel < requiredLevel) {
      throw new Error("Unauthorized - insufficient permissions");
    }

    return resource;
  }

  async createResource(data: Partial<IResource>) {
    return Resource.create(data);
  }

  async updateResource(id: string, data: Partial<IResource>) {
    const resource = await Resource.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!resource) throw new Error("Resource not found");
    return resource;
  }

  async deleteResource(id: string) {
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) throw new Error("Resource not found");
    return resource;
  }

  async incrementDownloads(id: string) {
    return Resource.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true });
  }
}
