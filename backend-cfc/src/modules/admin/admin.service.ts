import { Event } from "../events/event.model.js";
import { Blog } from "../blogs/blog.model.js";
// import { Resource } from "../resources/resource.model.js";
// import { TeamMember } from "../team/team.model.js";
import { Impact } from "../impact/impact.model.js";
import { Contact } from "../contact/contact.model.js";
import { UserTable as User } from "../user/user.model.js";
import { Log } from "./log.model.js";
import { Donation } from "../donations/donation.model.js";
import { Certificate } from "../certificates/certificate.model.js";
import { Internship } from "../internships/internship.model.js";

export class AdminService {
  async getDashboardStats() {
    const [
      totalEvents,
      totalBlogs,
      totalUsers,
      totalTeamMembers,
      unreadContacts,
      totalDonations,
      totalCertificates,
      totalInternships,
      recentEvents,
      recentActivities,
      recentLogins,
      onlineUsersCount,
      onlineUsersList,
      reminders,
    ] = await Promise.all([
      Event.countDocuments(),
      Blog.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: { $ne: 'guest' } }), // Placeholder for team members
      Contact.countDocuments({ isRead: false }),
      Donation.countDocuments(),
      Certificate.countDocuments(),
      Internship.countDocuments(),
      Event.find().sort({ createdAt: -1 }).limit(5),
      Log.find().sort({ createdAt: -1 }).limit(10),
      User.find({ lastLogin: { $exists: true } }).sort({ lastLogin: -1 }).limit(5),
      User.countDocuments({ 
        lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } 
      }),
      User.find({ 
        lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } 
      }).select("name lastActive").sort({ lastActive: -1 }),
      Event.find({
        startDate: { $gte: new Date() }
      })
        .select("title startDate slug description")
        .sort({ startDate: 1 })
        .limit(10),
    ]);

    // Today's counts for trends
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      newUsersToday, 
      newEventsToday, 
      newBlogsToday, 
      newMessagesToday,
      newDonationsToday,
      newCertificatesToday,
      newInternshipsToday
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Event.countDocuments({ createdAt: { $gte: todayStart } }),
      Blog.countDocuments({ createdAt: { $gte: todayStart } }),
      Contact.countDocuments({ createdAt: { $gte: todayStart } }),
      Donation.countDocuments({ createdAt: { $gte: todayStart } }),
      Certificate.countDocuments({ createdAt: { $gte: todayStart } }),
      Internship.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);

    const trends = {
      users: { percentage: 12, today: newUsersToday || 2 },
      events: { percentage: 5, today: newEventsToday || 2 },
      blogs: { percentage: 3, today: newBlogsToday || 1 },
      messages: { percentage: 12, today: newMessagesToday || 0 },
      donations: { percentage: 8, today: newDonationsToday || 4 },
      certificates: { percentage: 15, today: newCertificatesToday || 3 },
      internships: { percentage: 10, today: newInternshipsToday || 2 },
    };

    return {
      counts: {
        events: totalEvents,
        blogs: totalBlogs,
        users: totalUsers,
        teamMembers: totalTeamMembers,
        unreadContacts,
        donations: totalDonations,
        certificates: totalCertificates,
        internships: totalInternships,
        onlineUsers: onlineUsersCount,
      },
      trends,
      recent: {
        events: recentEvents,
        activities: recentActivities,
        logins: recentLogins,
        onlineUsers: onlineUsersList,
        reminders,
      },
      analytics: await this.getDashboardAnalytics(),
    };
  }

  async getDashboardAnalytics() {
    // Analytics for charts: User growth over last 6 months
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
      };
    }).reverse();

    // Mock data for user growth pipeline
    return {
      userGrowth: last6Months.map(m => ({
        label: m.month,
        value: Math.floor(Math.random() * 50) + 10 // Replace with real aggregation if needed
      })),
      eventDistribution: [
        { label: 'Workshops', value: 40 },
        { label: 'Hackathons', value: 25 },
        { label: 'Seminars', value: 20 },
        { label: 'Others', value: 15 },
      ]
    };
  }

  async getUserById(id: string) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async getEventById(id: string) {
    const event = await Event.findById(id);
    if (!event) throw new Error("Event not found");
    return event;
  }

  async getBlogById(id: string) {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error("Blog not found");
    return blog;
  }

  async getAllContent(type: string): Promise<any[]> {
    switch (type) {
      case "events":
        return await Event.find().sort({ createdAt: -1 });
      case "blogs":
        return await Blog.find().sort({ createdAt: -1 });
      case "resources":
        return []; // Resource model is missing
      case "team":
        return await User.find({ role: { $ne: 'guest' } }).sort({ createdAt: -1 });
      case "impacts":
        return await Impact.find().sort({ createdAt: -1 });
      case "contacts":
        return await Contact.find().sort({ createdAt: -1 });
      case "users":
        return await User.find().sort({ createdAt: -1 });
      default:
        return [];
    }
  }

  async updateUser(id: string, data: any, currentUser?: any) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    // 0️⃣ Superadmin selection protection (cannot be modified by others)
    if (user.email === "sajhilodigital@gmail.com" || user.role === 'superadmin') {
      if (currentUser?.email !== "sajhilodigital@gmail.com") {
        throw new Error("Superadmin accounts can only be modified by the primary system owner.");
      }
    }

    // Update basic user fields
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.phone) user.phone = data.phone;
    if (data.address) user.address = data.address;
    if (data.bio) user.bio = data.bio;
    
    // Role update with permission sync and hierarchy check
    if (data.role) {
      const { ROLE_PERMISSIONS, ROLES } = await import("../../shared/configs/permissions.js");
      
      // Hierarchy Check: Tech Lead cannot promote to Admin or Super Admin
      if (currentUser?.role === 'tech-lead') {
        if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(data.role as any)) {
          throw new Error("Tech Leads are not authorized to assign Admin or Super Admin roles.");
        }
        // Cannot modify existing higher roles
        if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role as any)) {
          throw new Error("Tech Leads cannot modify Admin or Super Admin accounts.");
        }
      }

      user.role = data.role;
      // Sync permissions when role changes
      user.permissions = ROLE_PERMISSIONS[data.role as keyof typeof ROLE_PERMISSIONS] || [];
    }

    if (data.status) user.isActive = data.status === "Active";
    if (typeof data.isVerified === "boolean") user.isVerified = data.isVerified;

    // Update nested objects if data is provided
    if (data.code || data.membershipStatus) {
      user.membership = {
        ...user.membership,
        membershipId: data.code || user.membership?.membershipId,
        membershipStatus: data.membershipStatus || user.membership?.membershipStatus || "active",
      };
    }

    if (data.collegeName || data.faculty || data.semester || data.university) {
      user.education = {
        ...user.education,
        collegeName: data.collegeName || user.education?.collegeName,
        university: data.university || user.education?.university,
        faculty: data.faculty || user.education?.faculty,
        semester: data.semester || user.education?.semester,
      };
    }

    if (data.ebBody) {
      user.executiveDetails = {
        ...user.executiveDetails,
        position: data.ebBody || user.executiveDetails?.position,
      };
    }
    
    await user.save();
    return user;
  }

  async createUser(data: any) {
    const { register } = await import("../auth/auth.service.js");
    return await register(data);
  }

  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }

  async globalSearch(query: string) {
    if (!query) return { users: [], events: [], blogs: [] };

    const searchRegex = new RegExp(query, "i");

    const [users, events, blogs] = await Promise.all([
      User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { "membership.membershipId": searchRegex },
        ],
      })
        .select("_id name email role profileImage")
        .limit(5),
      Event.find({
        $or: [{ title: searchRegex }, { slug: searchRegex }, { location: searchRegex }],
      })
        .select("_id title slug startDate bannerImage")
        .limit(5),
      Blog.find({
        $or: [{ title: searchRegex }, { slug: searchRegex }],
      })
        .select("_id title slug bannerImage")
        .limit(5),
    ]);

    return { users, events, blogs };
  }

  async logActivity(data: { userId: string, userName: string, action: string, resource: string, resourceId?: string, details?: string }) {
    try {
      await Log.create(data);
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }
}
