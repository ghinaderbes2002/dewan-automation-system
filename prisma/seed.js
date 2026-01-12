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
  const admin = await prisma.diwan_employees.create({
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
  const issuing = await prisma.diwan_employees.create({
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
  const auditor = await prisma.diwan_employees.create({
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
  const membership = await prisma.diwan_employees.create({
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
  // 2. إنشاء مهندسين تجريبيين
  // ====================================
  console.log("👷 إنشاء مهندسين تجريبيين...");

  const engineer1Password = await bcrypt.hash("123456", 10);
  const engineer1 = await prisma.engineers.create({
    data: {
      full_name_ar: "أحمد محمد علي",
      full_name_en: "Ahmad Mohammad Ali",
      national_id_number: "01234567890",
      email: "ahmad@example.com",
      mobile: "0911111111",
      username: "ahmad_eng",
      password_hash: engineer1Password,
      is_active: true,
      is_registered: false, // لسه ما مسجل بالنقابة
      nationality: "سوري",
      birth_date: new Date("1995-05-15"),
      address: "دمشق - المزة",
    },
  });
  console.log("   ✅ مهندس 1: ahmad_eng / 123456 (غير مسجل بالنقابة)");

  const engineer2Password = await bcrypt.hash("123456", 10);
  const engineer2 = await prisma.engineers.create({
    data: {
      full_name_ar: "محمد خالد حسن",
      full_name_en: "Mohammad Khaled Hassan",
      national_id_number: "09876543210",
      email: "mohammad@example.com",
      mobile: "0922222222",
      username: "mohammad_eng",
      password_hash: engineer2Password,
      is_active: true,
      is_registered: true, // مسجل بالنقابة
      nationality: "سوري",
      birth_date: new Date("1992-08-20"),
      address: "حلب - الشهباء",
    },
  });
  console.log("   ✅ مهندس 2: mohammad_eng / 123456 (مسجل بالنقابة)");

  const engineer3Password = await bcrypt.hash("123456", 10);
  const engineer3 = await prisma.engineers.create({
    data: {
      full_name_ar: "سارة أحمد يوسف",
      full_name_en: "Sara Ahmad Yousef",
      national_id_number: "05555555555",
      email: "sara@example.com",
      mobile: "0933333333",
      username: "sara_eng",
      password_hash: engineer3Password,
      is_active: true,
      is_registered: true,
      nationality: "سوري",
      birth_date: new Date("1997-12-10"),
      address: "حمص - الوعر",
    },
  });
  console.log("   ✅ مهندس 3: sara_eng / 123456 (مسجل بالنقابة)\n");

  // ====================================
  // 3. إنشاء طلبات تجريبية
  // ====================================
  console.log("📋 إنشاء طلبات تجريبية...");

  // طلب انتساب من المهندس 1 (pending)
  const membershipRequest1 = await prisma.membership_requests.create({
    data: {
      engineer_id: engineer1.id,
      submitted_by: "engineer", // قدمه المهندس بنفسه
      request_scope: "انتساب",
      full_name_ar: "أحمد محمد علي",
      national_id_number: "01234567890",
      nationality: "سوري",
      birth_date: new Date("1995-05-15"),
      university_name: "جامعة دمشق",
      faculty_name: "كلية الهندسة المعمارية",
      degree_title: "إجازة في الهندسة المعمارية",
      specialization: "هندسة معمارية",
      academic_year: "2018",
      mobile: "0911111111",
      email: "ahmad@example.com",
      home_address: "دمشق - المزة",
      status: "pending", // معلق بانتظار الموظف
      application_date: new Date(),
      laws_acknowledged: true,
    },
  });
  console.log("   ✅ طلب انتساب 1: من أحمد (حالة: pending)");

  // طلب انتساب من موظف (draft)
  const membershipRequest2 = await prisma.membership_requests.create({
    data: {
      submitted_by: "employee", // قدمه الموظف
      request_scope: "انتساب",
      full_name_ar: "علي حسن محمود",
      national_id_number: "11111111111",
      nationality: "سوري",
      birth_date: new Date("1996-03-10"),
      university_name: "جامعة حلب",
      specialization: "هندسة مدنية",
      academic_year: "2019",
      status: "draft", // مسودة
      received_by_employee_id: membership.id,
    },
  });
  console.log("   ✅ طلب انتساب 2: من موظف (حالة: draft)");

  // طلب تدريب من المهندس 2 (pending)
  const trainingRequest1 = await prisma.training_requests.create({
    data: {
      engineer_id: engineer2.id,
      submitted_by: "engineer",
      host_office_name: "مكتب الهندسة المتقدمة",
      host_office_address: "دمشق - أبو رمانة",
      host_office_specialization: "هندسة معمارية",
      planned_training_duration_months: 12,
      has_previous_practice: false,
      status: "pending",
      request_date: new Date(),
      law_declaration_signed: true,
    },
  });
  console.log("   ✅ طلب تدريب: من محمد (حالة: pending)");

  // طلب فتح مكتب من المهندس 3 (pending)
  const officeRequest1 = await prisma.office_opening_requests.create({
    data: {
      engineer_id: engineer3.id,
      submitted_by: "engineer",
      office_name: "مكتب المهندسة سارة للاستشارات الهندسية",
      office_type: "فردي",
      specialization: "هندسة معمارية",
      office_address: "حمص - الوعر",
      office_phone: "0312345678",
      status: "pending",
      request_date: new Date(),
      law_declaration_signed: true,
    },
  });
  console.log("   ✅ طلب فتح مكتب: من سارة (حالة: pending)\n");

  // ====================================
  // الملخص
  // ====================================
  console.log("✅ تم إكمال Seeding بنجاح!\n");
  console.log("📊 الملخص:");
  console.log("   - 4 موظفين (admin, issuing, auditor, membership)");
  console.log("   - 3 مهندسين (1 غير مسجل، 2 مسجلين)");
  console.log("   - 4 طلبات (2 انتساب، 1 تدريب، 1 فتح مكتب)\n");
  console.log("🔐 بيانات الدخول:");
  console.log("   الموظفين:");
  console.log("      admin / admin123");
  console.log("      issuing / 123456");
  console.log("      auditor / 123456");
  console.log("      membership / 123456");
  console.log("   المهندسين:");
  console.log("      ahmad_eng / 123456");
  console.log("      mohammad_eng / 123456");
  console.log("      sara_eng / 123456\n");
}

main()
  .catch((e) => {
    console.error("❌ حدث خطأ:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
