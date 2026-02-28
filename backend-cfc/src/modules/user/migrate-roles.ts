import { connectDB } from "../../shared/configs/database.js";
import "dotenv/config";
import { UserTable } from "./user.model.js";

/**
 * Migration script to update existing users to the new role system.
 * 
 * Old roles → New roles:
 * - tech-lead → eb (position: tech-lead)
 * - project-lead → eb (position: project-lead)
 * - cr-eb → eb (position from existing executiveDetails.position or "executive-member")
 * - general-member → gm
 * - guest → gm
 * - admin, superadmin, cr → no change
 * 
 * Run with: npx tsx src/modules/user/migrate-roles.ts
 */
async function migrateRoles() {
    try {
        console.log("Starting role migration...");
        await connectDB();
        console.log("✓ Database connected\n");

        // 1. tech-lead → eb (position: tech-lead)
        const techLeads = await UserTable.updateMany(
            { role: "tech-lead" },
            {
                $set: {
                    role: "eb",
                    "executiveDetails.position": "tech-lead"
                }
            }
        );
        console.log(`tech-lead → eb: ${techLeads.modifiedCount} users updated`);

        // 2. project-lead → eb (position: project-lead)
        const projectLeads = await UserTable.updateMany(
            { role: "project-lead" },
            {
                $set: {
                    role: "eb",
                    "executiveDetails.position": "project-lead"
                }
            }
        );
        console.log(`project-lead → eb: ${projectLeads.modifiedCount} users updated`);

        // 3. cr-eb → eb (keep existing position or default to "executive-member")
        const crEbs = await UserTable.find({ role: "cr-eb" });
        let crEbCount = 0;
        for (const user of crEbs) {
            const position = user.executiveDetails?.position || "executive-member";
            user.role = "eb" as any;
            user.executiveDetails = {
                ...user.executiveDetails,
                position: position as any,
            };
            await user.save({ validateBeforeSave: false });
            crEbCount++;
        }
        console.log(`cr-eb → eb: ${crEbCount} users updated`);

        // 4. general-member → gm
        const generalMembers = await UserTable.updateMany(
            { role: "general-member" },
            { $set: { role: "gm" } }
        );
        console.log(`general-member → gm: ${generalMembers.modifiedCount} users updated`);

        // 5. guest → gm (optional — uncomment if you want guests converted to gm)
        // const guests = await UserTable.updateMany(
        //   { role: "guest" },
        //   { $set: { role: "gm" } }
        // );
        // console.log(`guest → gm: ${guests.modifiedCount} users updated`);

        console.log("\n╔════════════════════════════════════════════╗");
        console.log("║      ROLE MIGRATION COMPLETE               ║");
        console.log("╚════════════════════════════════════════════╝");

        // Summary
        const roleCounts = await UserTable.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        console.log("\nCurrent role distribution:");
        roleCounts.forEach((r) => console.log(`  ${r._id}: ${r.count}`));

        process.exit(0);
    } catch (error: any) {
        console.error("Migration failed:", error.message || error);
        process.exit(1);
    }
}

migrateRoles();
