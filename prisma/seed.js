import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.diwan_employees.create({
    data: {
      full_name: "نظام الديوان",
      job_role: "ADMIN",
      username: "admin",
      password_hash: password,
    },
  });

  console.log("Admin created!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
