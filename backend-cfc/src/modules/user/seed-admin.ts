import { connectDB } from "../../shared/configs/database.js";
import "dotenv/config";
import { UserTable } from "./user.model.js";
import { ROLES, PERMISSIONS } from "../../shared/configs/permissions.js";
import { hashPassword } from "../../shared/utils/hash.js";

async function seedAdmin() {
  try {
    console.log("Starting admin seed process...");
    await connectDB();
    console.log("✓ Database connection established");

    const adminEmail = "sajhilodigital@gmail.com";
    const plainPassword = "Admin@2025Secure!";

    // Check if admin already exists
    const existingAdmin = await UserTable.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping creation.");
      console.log("→ Email:", existingAdmin.email);
      console.log("→ Role:", existingAdmin.role);
      process.exit(0);
    }

    // Create new admin
    const hashedPassword = await hashPassword(plainPassword);

    const admin = await UserTable.create({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isActive: true,
      // Optional fields (uncomment if your schema has them)
      // permissions: ['*'],
      // createdBy: 'system-seed-script',
    });

    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║         ADMIN USER CREATED SUCCESSFULLY    ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log(`Email:       ${admin.email}`);
    console.log(`Password:    ${plainPassword}`);
    console.log(`Role:        ${admin.role}`);
    console.log(`User ID:     ${admin._id}`);

    process.exit(0);
  } catch (error: any) {
    console.error("Failed to seed admin:");
    console.error(error.message || error);
    if (error.stack) console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Execute
seedAdmin();
