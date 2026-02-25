import { connectDB } from "./src/shared/configs/database.js";
import "dotenv/config";
import { UserTable } from "./src/modules/user/user.model.js";
import { comparePassword } from "./src/shared/utils/hash.js";

async function verify() {
  try {
    await connectDB();
    const admin = await UserTable.findOne({ email: "sajhilodigital@gmail.com" }).select("+password");
    if (!admin) {
      console.log("Admin not found!");
      return;
    }
    console.log("Admin found:", admin.email);
    console.log("Stored Hash:", admin.password);
    
    const plain = "Admin@2025Secure!";
    const isMatch = await comparePassword(plain, admin.password);
    console.log("Match test:", isMatch);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
verify();
