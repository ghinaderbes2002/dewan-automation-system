import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 بدء عملية Seeding...\n");

  // ====================================
  // 0. مسح البيانات القديمة
  // ====================================
  console.log("🗑️  مسح البيانات القديمة...");

  await prisma.membership_fees.deleteMany();
  await prisma.membership_documents.deleteMany();
  await prisma.death_aid_forms.deleteMany();
  await prisma.promotion_experiences.deleteMany();
  await prisma.promotion_qualifications.deleteMany();
  await prisma.promotion_requests.deleteMany();
  await prisma.office_opening_requests.deleteMany();
  await prisma.training_requests.deleteMany();
  await prisma.membership_requests.deleteMany();
  await prisma.registry_entries.deleteMany();
  await prisma.attachments.deleteMany();
  await prisma.office_division_links.deleteMany();
  await prisma.engineering_offices.deleteMany();
  await prisma.engineers.deleteMany();
  await prisma.diwan_employees.deleteMany();

  console.log("   ✅ تم مسح البيانات القديمة\n");

  // ====================================
  // 1. إنشاء الموظفين
  // ====================================
  console.log("👨‍💼 إنشاء الموظفين...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.diwan_employees.create({
    data: {
      full_name: "مدير النظام",
      job_role: "ADMIN",
      username: "admin",
      password_hash: adminPassword,
      is_active: true,
    },
  });
  console.log("   ✅ تم إنشاء المدير: admin / admin123");

  const issuingPassword = await bcrypt.hash("123456", 10);
  await prisma.diwan_employees.create({
    data: {
      full_name: "موظف الصادر والوارد",
      job_role: "ISSUING",
      username: "issuing",
      password_hash: issuingPassword,
      is_active: true,
    },
  });
  console.log("   ✅ تم إنشاء موظف الصادر: issuing / 123456");

  const auditorPassword = await bcrypt.hash("123456", 10);
  await prisma.diwan_employees.create({
    data: {
      full_name: "موظف التدقيق",
      job_role: "AUDITOR",
      username: "auditor",
      password_hash: auditorPassword,
      is_active: true,
    },
  });
  console.log("   ✅ تم إنشاء موظف التدقيق: auditor / 123456");

  const membershipPassword = await bcrypt.hash("123456", 10);
  await prisma.diwan_employees.create({
    data: {
      full_name: "موظف الانتساب",
      job_role: "MEMBERSHIP_AND_SERVICE",
      username: "membership",
      password_hash: membershipPassword,
      is_active: true,
    },
  });
  console.log("   ✅ تم إنشاء موظف الانتساب: membership / 123456\n");

  // ====================================
  // الملخص
  // ====================================
  console.log("✅ تم إكمال Seeding بنجاح!\n");
  console.log("📊 الملخص:");
  console.log("   - 4 موظفين (admin, issuing, auditor, membership)\n");
  console.log("🔐 بيانات الدخول:");
  console.log("      admin / admin123");
  console.log("      issuing / 123456");
  console.log("      auditor / 123456");
  console.log("      membership / 123456\n");
}

main()
  .catch((e) => {
    console.error("❌ حدث خطأ:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
