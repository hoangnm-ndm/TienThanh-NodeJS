// * Chạy seed: npm run db:seed (ở gốc repo). Mỗi seeder phải idempotent — chạy lại nhiều lần không nhân bản dữ liệu.
// * Thêm seeder mới: tạo src/seeds/<tên>.seed.js export hàm async, rồi thêm vào SEEDERS (theo thứ tự phụ thuộc).
import mongoose from "mongoose";
import { envConfig } from "../config/envConfig.js";
import { seedSystemRoles } from "./systemRoles.seed.js";
import { migrateLegacyRoles } from "./migrateLegacyRoles.seed.js";
import { seedSuperAdmin } from "./superAdmin.seed.js";

// * Thứ tự: role hệ thống → chuyển dữ liệu role cũ (cần role hệ thống) → superAdmin (sau migration
//   để không tạo superAdmin thứ 2 khi dữ liệu cũ còn role: "superAdmin").
const SEEDERS = [
  { name: "systemRoles", run: seedSystemRoles },
  { name: "migrateLegacyRoles", run: migrateLegacyRoles },
  { name: "superAdmin", run: seedSuperAdmin },
];

try {
  await mongoose.connect(envConfig.DB_URI);
  for (const { name, run } of SEEDERS) {
    const message = await run();
    console.log(`[seed:${name}] ${message}`);
  }
} catch (err) {
  console.error(`[seed] Thất bại: ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
