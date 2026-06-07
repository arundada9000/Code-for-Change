import { connectDB } from "../../shared/configs/database.js";
import "dotenv/config";
import { UserTable } from "./user.model.js";
import { ROLES, PERMISSIONS } from "../../shared/configs/permissions.js";
import { hashPassword } from "../../shared/utils/hash.js";

const ADMIN_ACCOUNTS = [
  {
    email: process.env.SUPERADMIN_EMAIL || "admin@codeforchange.org",
    password: process.env.ADMIN_PASSWORD || "Admin@2025Secure!",
    name: "Sajilo Digital",
  },
  ...(process.env.ADMIN_EMAIL_2
    ? [
        {
          email: process.env.ADMIN_EMAIL_2,
          password: process.env.ADMIN_PASSWORD_2 || "Admin@2025Secure!",
          name: "Code for Change",
        },
      ]
    : []),
];

async function seedAdmin() {
  try {
    console.log("Starting admin seed process...");
    await connectDB();
    console.log("✓ Database connection established");

    for (const account of ADMIN_ACCOUNTS) {
      const existingAdmin = await UserTable.findOne({ email: account.email });

      if (existingAdmin) {
        console.log(`Admin "${account.email}" already exists. Skipping.`);
        continue;
      }

      const hashedPassword = await hashPassword(account.password);

      await UserTable.create({
        name: account.name,
        email: account.email,
        password: hashedPassword,
        role: "superadmin",
        isVerified: true,
        isActive: true,
      });

      console.log(`✓ Super admin created: ${account.email}`);
    }

    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║         ADMIN SEED COMPLETE                ║");
    console.log("╚════════════════════════════════════════════╝");

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
