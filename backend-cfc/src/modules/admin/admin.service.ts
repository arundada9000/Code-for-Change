import { Event } from "../events/event.model.js";
import { Blog } from "../blogs/blog.model.js";
import { Resource } from "../resources/resource.model.js";
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
      users: { percentage: 0, today: newUsersToday || 0 },
      events: { percentage: 0, today: newEventsToday || 0 },
      blogs: { percentage: 0, today: newBlogsToday || 0 },
      messages: { percentage: 0, today: newMessagesToday || 0 },
      donations: { percentage: 0, today: newDonationsToday || 0 },
      certificates: { percentage: 0, today: newCertificatesToday || 0 },
      internships: { percentage: 0, today: newInternshipsToday || 0 },
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
    const [usersByRole, membersByProvince, eventsByProvince, certificatesByProvince] = await Promise.all([
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: { $in: ['eb', 'cr', 'gm'] } } },
        { $group: { _id: { province: "$province", role: "$role" }, count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $group: { _id: "$region", count: { $sum: 1 } } }
      ]),
      Certificate.aggregate([
        { $group: { _id: "$province", count: { $sum: 1 } } }
      ])
    ]);

    // Format usersByRole
    const formattedUsersByRole = usersByRole.map(u => ({
      name: (u._id || 'unassigned').toUpperCase(),
      value: u.count
    }));

    // Format membersByProvince
    const provMap: Record<string, any> = {};
    membersByProvince.forEach(m => {
      const p = m._id.province || 'National';
      if (!provMap[p]) provMap[p] = { province: p, eb: 0, cr: 0, gm: 0 };
      provMap[p][m._id.role] = m.count;
    });
    const formattedMembersByProvince = Object.values(provMap);

    // Format eventsByProvince
    const formattedEventsByProvince = eventsByProvince.map(e => ({
      province: e._id || 'National',
      events: e.count
    }));

    // Format certificatesByProvince
    const formattedCertificatesByProvince = certificatesByProvince.map(c => ({
      province: c._id || 'National',
      certificates: c.count
    }));

    return {
      usersByRole: formattedUsersByRole,
      membersByProvince: formattedMembersByProvince,
      eventsByProvince: formattedEventsByProvince,
      certificatesByProvince: formattedCertificatesByProvince
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
        return await Resource.find().sort({ createdAt: -1 });
      case "team":
        return await User.find({ role: { $ne: 'guest' } }).sort({ createdAt: -1 });
      case "impacts":
        return await Impact.find().sort({ createdAt: -1 });
      case "contacts":
        return await Contact.find().sort({ createdAt: -1 });
      case "users":
        return await User.find().select(
          "-password -otp -otpExpiry -otpLastSentAt -otpAttempts -otpVerified -failedLoginAttempts -lockUntil -resetPasswordToken -resetPasswordExpiry"
        ).sort({ createdAt: -1 });
      default:
        return [];
    }
  }

  async updateUser(id: string, data: any, currentUser?: any) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    // 0️⃣ Superadmin protection
    if (user.email === "sajhilodigital@gmail.com" || user.role === 'superadmin') {
      if (currentUser?.email !== "sajhilodigital@gmail.com") {
        throw new Error("Superadmin accounts can only be modified by the primary system owner.");
      }
    }

    // 1️⃣ Basic profile fields
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.secondaryEmail !== undefined) user.secondaryEmail = data.secondaryEmail;
    if (data.address !== undefined) user.address = data.address;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.gender !== undefined) user.gender = data.gender;
    if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;
    if (data.province !== undefined) user.province = data.province;
    if (data.tenure !== undefined) user.tenure = data.tenure;
    if (data.profileImage !== undefined) user.profileImage = data.profileImage;

    // 2️⃣ Social links
    if (data.linkedin !== undefined) user.linkedin = data.linkedin;
    if (data.github !== undefined) user.github = data.github;
    if (data.website !== undefined) user.website = data.website;
    if (data.facebook !== undefined) user.facebook = data.facebook;
    if (data.twitter !== undefined) user.twitter = data.twitter;
    if (data.instagram !== undefined) user.instagram = data.instagram;
    if (data.tiktok !== undefined) user.tiktok = data.tiktok;
    if (data.youtube !== undefined) user.youtube = data.youtube;

    // 3️⃣ Role update with permission sync and hierarchy check
    if (data.role) {
      const { ROLE_PERMISSIONS, ROLES } = await import("../../shared/configs/permissions.js");

      if (currentUser?.role === 'tech-lead') {
        if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(data.role as any)) {
          throw new Error("Tech Leads are not authorized to assign Admin or Super Admin roles.");
        }
        if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role as any)) {
          throw new Error("Tech Leads cannot modify Admin or Super Admin accounts.");
        }
      }

      user.role = data.role;
      user.permissions = ROLE_PERMISSIONS[data.role as keyof typeof ROLE_PERMISSIONS] || [];
    }

    // 4️⃣ Status & verification
    if (data.status !== undefined) user.isActive = data.status === "Active";
    if (typeof data.isActive === "boolean") user.isActive = data.isActive;
    if (typeof data.isVerified === "boolean") user.isVerified = data.isVerified;

    // 5️⃣ Membership
    if (data.membership || data.code || data.membershipStatus) {
      user.membership = {
        ...user.membership,
        membershipId: data.membership?.membershipId ?? data.code ?? user.membership?.membershipId,
        membershipStatus: data.membership?.membershipStatus ?? data.membershipStatus ?? user.membership?.membershipStatus ?? "active",
        joinedAt: user.membership?.joinedAt ?? new Date(),
      };
    }

    // 6️⃣ Education
    if (data.education || data.collegeName || data.faculty || data.semester || data.university || data.graduationYear) {
      user.education = {
        ...user.education,
        ...(data.education?.collegeName !== undefined && { collegeName: data.education.collegeName }),
        ...(data.collegeName !== undefined && { collegeName: data.collegeName }),
        ...(data.education?.university !== undefined && { university: data.education.university }),
        ...(data.university !== undefined && { university: data.university }),
        ...(data.education?.faculty !== undefined && { faculty: data.education.faculty }),
        ...(data.faculty !== undefined && { faculty: data.faculty }),
        ...(data.education?.semester !== undefined && { semester: data.education.semester }),
        ...(data.semester !== undefined && { semester: data.semester }),
        ...(data.education?.graduationYear !== undefined && { graduationYear: data.education.graduationYear }),
        ...(data.graduationYear !== undefined && { graduationYear: data.graduationYear }),
      };
    }

    // 7️⃣ Executive details
    if (data.ebBody || data.executiveDetails || data.department || data.termStart || data.termEnd) {
      user.executiveDetails = {
        ...user.executiveDetails,
        ...(data.ebBody !== undefined && { position: data.ebBody }),
        ...(data.executiveDetails?.position !== undefined && { position: data.executiveDetails.position }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.executiveDetails?.department !== undefined && { department: data.executiveDetails.department }),
        ...(data.termStart !== undefined && { termStart: data.termStart }),
        ...(data.executiveDetails?.termStart !== undefined && { termStart: data.executiveDetails.termStart }),
        ...(data.termEnd !== undefined && { termEnd: data.termEnd }),
        ...(data.executiveDetails?.termEnd !== undefined && { termEnd: data.executiveDetails.termEnd }),
      };
    }

    await user.save();
    return user;
  }

  async createUser(data: any) {
    const { register } = await import("../auth/auth.service.js");
    return await register({
      ...data,
      isVerified: true, // Admins create verified users by default
      accountStatus: "active"
    });
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

  async getAdminActivities(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      Log.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Log.countDocuments()
    ]);

    return {
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + activities.length < total
    };
  }
}

