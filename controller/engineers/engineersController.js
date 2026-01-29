import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// دالة مساعدة لتحويل BigInt إلى Number
const serializeBigInt = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
};

/**
 * تسجيل مهندس جديد
 * POST /api/engineers/register
 */
export const registerEngineer = async (req, res) => {
  try {
    const {
      full_name_ar,
      email,
      mobile,
      national_id_number,
      password
    } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!full_name_ar || !email || !mobile || !password) {
      return res.status(400).json({
        message: "يرجى إدخال جميع البيانات المطلوبة"
      });
    }

    // التحقق من وجود المهندس مسبقاً
    const existingEngineer = await prisma.engineers.findFirst({
      where: {
        OR: [
          { email: email },
          { mobile: mobile },
          { national_id_number: national_id_number }
        ]
      }
    });

    if (existingEngineer) {
      return res.status(400).json({
        message: "المهندس موجود مسبقاً (البريد الإلكتروني أو رقم الهاتف أو الرقم الوطني مسجل)"
      });
    }

    // تشفير كلمة المرور
    const password_hash = await bcrypt.hash(password, 10);

    // إنشاء المهندس
    const engineer = await prisma.engineers.create({
      data: {
        full_name_ar,
        email,
        mobile,
        national_id_number,
        password_hash,
        is_active: true,
        is_registered: false // لسه ما مسجل بالنقابة
      }
    });

    // إنشاء توكن
    const token = jwt.sign(
      {
        id: Number(engineer.id),
        email: engineer.email,
        userType: "engineer"
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "تم التسجيل بنجاح",
      token,
      engineer: {
        id: Number(engineer.id),
        full_name_ar: engineer.full_name_ar,
        email: engineer.email,
        mobile: engineer.mobile,
        is_registered: engineer.is_registered
      }
    });
  } catch (error) {
    console.error("خطأ في تسجيل المهندس:", error);

    // معالجة أخطاء القيود الفريدة
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const arabicFieldNames = {
        'mobile': 'رقم الموبايل',
        'email': 'البريد الإلكتروني',
        'national_id_number': 'الرقم الوطني',
        'username': 'اسم المستخدم'
      };
      return res.status(400).json({
        message: `${arabicFieldNames[field] || field} مستخدم من قبل`
      });
    }

    res.status(500).json({
      message: "حدث خطأ في التسجيل"
    });
  }
};

/**
 * تسجيل دخول المهندس
 * POST /api/engineers/login
 */
export const loginEngineer = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "يرجى إدخال اسم المستخدم وكلمة المرور"
      });
    }

    // البحث عن المهندس (يمكن الدخول بـ email أو mobile)
    const engineer = await prisma.engineers.findFirst({
      where: {
        OR: [
          { email: username },
          { mobile: username }
        ]
      }
    });

    if (!engineer) {
      return res.status(400).json({
        message: "بيانات الدخول غير صحيحة"
      });
    }

    if (!engineer.is_active) {
      return res.status(400).json({
        message: "الحساب معطل، يرجى التواصل مع الإدارة"
      });
    }

    // التحقق من كلمة المرور
    const validPassword = await bcrypt.compare(password, engineer.password_hash);

    if (!validPassword) {
      return res.status(400).json({
        message: "كلمة المرور غير صحيحة"
      });
    }

    // إنشاء توكن
    const token = jwt.sign(
      {
        id: Number(engineer.id),
        email: engineer.email,
        userType: "engineer"
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      engineer: {
        id: Number(engineer.id),
        full_name_ar: engineer.full_name_ar,
        email: engineer.email,
        mobile: engineer.mobile,
        is_registered: engineer.is_registered
      }
    });
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error);
    res.status(500).json({
      message: "حدث خطأ في تسجيل الدخول"
    });
  }
};

/**
 * جلب معلومات المهندس الحالي
 * GET /api/engineers/me
 */
export const getMyProfile = async (req, res) => {
  try {
    const engineerId = BigInt(req.engineer.id);

    const engineer = await prisma.engineers.findUnique({
      where: { id: engineerId },
      select: {
        id: true,
        full_name_ar: true,
        full_name_en: true,
        national_id_number: true,
        email: true,
        mobile: true,
        phone: true,
        address: true,
        birth_date: true,
        nationality: true,
        is_registered: true,
        created_at: true
      }
    });

    if (!engineer) {
      return res.status(404).json({
        message: "المهندس غير موجود"
      });
    }

    res.json(serializeBigInt(engineer));
  } catch (error) {
    console.error("خطأ في جلب المعلومات:", error);
    res.status(500).json({
      message: "حدث خطأ في جلب المعلومات"
    });
  }
};

/**
 * تقديم طلب انتساب
 * POST /api/engineers/requests/membership
 */
export const submitMembershipRequest = async (req, res) => {
  try {
    const engineerId = BigInt(req.engineer.id);

    // التحقق من البيانات المطلوبة
    const { request_scope, full_name_ar } = req.body;

    if (!request_scope || !full_name_ar) {
      return res.status(400).json({
        message: "يرجى إدخال البيانات المطلوبة: request_scope و full_name_ar"
      });
    }

    // التحقق إذا المهندس عنده طلب معلق
    const existingRequest = await prisma.membership_requests.findFirst({
      where: {
        engineer_id: engineerId,
        status: {
          in: ["draft", "pending", "under_review"]
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "لديك طلب معلق بالفعل، لا يمكنك تقديم طلب جديد"
      });
    }

    // إنشاء طلب جديد
    const request = await prisma.membership_requests.create({
      data: {
        engineer_id: engineerId,
        submitted_by: "engineer", // المهندس هو اللي قدم
        application_date: new Date(),
        status: "pending", // معلق بانتظار الموظف
        request_scope,
        full_name_ar,
        // باقي البيانات الاختيارية
        first_name_en: req.body.first_name_en,
        last_name_en: req.body.last_name_en,
        father_name: req.body.father_name,
        mother_name: req.body.mother_name,
        national_id_number: req.body.national_id_number,
        civil_registry_office: req.body.civil_registry_office,
        birth_place: req.body.birth_place,
        birth_date: req.body.birth_date ? new Date(req.body.birth_date) : null,
        nationality: req.body.nationality,
        university_name: req.body.university_name,
        faculty_name: req.body.faculty_name,
        degree_title: req.body.degree_title,
        engineering_department: req.body.engineering_department,
        specialization: req.body.specialization,
        academic_year: req.body.academic_year,
        exam_session: req.body.exam_session,
        university_record_no: req.body.university_record_no,
        university_council_decision_no: req.body.university_council_decision_no,
        university_council_decision_date: req.body.university_council_decision_date ? new Date(req.body.university_council_decision_date) : null,
        is_resident_abroad: req.body.is_resident_abroad || false,
        country: req.body.country || "سوريا",
        home_address: req.body.home_address,
        work_address: req.body.work_address,
        phone: req.body.phone,
        mobile: req.body.mobile,
        email: req.body.email,
        laws_acknowledged: req.body.laws_acknowledged || false,
        correspondence_address: req.body.correspondence_address,
        applicant_signature: req.body.applicant_signature
      }
    });

    res.status(201).json({
      message: "تم تقديم طلب الانتساب بنجاح",
      request: serializeBigInt({
        id: request.id,
        status: request.status,
        application_date: request.application_date,
        full_name_ar: request.full_name_ar
      })
    });
  } catch (error) {
    console.error("خطأ في تقديم طلب الانتساب:", error);

    // معالجة أخطاء القيود الفريدة
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const arabicFieldNames = {
        'mobile': 'رقم الموبايل',
        'email': 'البريد الإلكتروني',
        'national_id_number': 'الرقم الوطني'
      };
      return res.status(400).json({
        message: `${arabicFieldNames[field] || field} مستخدم من قبل. يرجى استخدام ${arabicFieldNames[field] || field} آخر`
      });
    }

    res.status(500).json({
      message: "حدث خطأ في تقديم الطلب"
    });
  }
};

/**
 * تقديم طلب تدريب
 * POST /api/engineers/requests/training
 */
export const submitTrainingRequest = async (req, res) => {
  try {
    const engineerId = BigInt(req.engineer.id);

    // التحقق إذا المهندس مسجل بالنقابة
    const engineer = await prisma.engineers.findUnique({
      where: { id: engineerId }
    });

    if (!engineer.is_registered) {
      return res.status(400).json({
        message: "يجب أن تكون مسجلاً في النقابة أولاً لتقديم طلب تدريب"
      });
    }

    // إنشاء طلب تدريب
    const request = await prisma.training_requests.create({
      data: {
        engineer_id: engineerId,
        submitted_by: "engineer",
        request_date: new Date(),
        status: "pending",
        host_office_id: req.body.host_office_id ? BigInt(req.body.host_office_id) : null,
        host_engineer_name: req.body.host_engineer_name,
        host_office_name: req.body.host_office_name,
        host_office_address: req.body.host_office_address,
        host_office_specialization: req.body.host_office_specialization,
        host_office_registration_no: req.body.host_office_registration_no,
        planned_training_duration_months: req.body.planned_training_duration_months,
        has_previous_practice: req.body.has_previous_practice || false,
        notes_from_branch: req.body.notes_from_branch,
        law_declaration_signed: req.body.law_declaration_signed || false,
        law_declaration_date: req.body.law_declaration_date ? new Date(req.body.law_declaration_date) : null,
        law_declaration_home_address: req.body.law_declaration_home_address,
        office_approval_date: req.body.office_approval_date ? new Date(req.body.office_approval_date) : null,
        office_approval_notes: req.body.office_approval_notes,
        training_size: req.body.training_size,
        office_division_decision_summary: req.body.office_division_decision_summary
      }
    });

    res.status(201).json({
      message: "تم تقديم طلب التدريب بنجاح",
      request: serializeBigInt(request)
    });
  } catch (error) {
    console.error("خطأ في تقديم طلب التدريب:", error);

    // معالجة أخطاء القيود الفريدة
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const arabicFieldNames = {
        'mobile': 'رقم الموبايل',
        'email': 'البريد الإلكتروني',
        'national_id_number': 'الرقم الوطني'
      };
      return res.status(400).json({
        message: `${arabicFieldNames[field] || field} مستخدم من قبل. يرجى استخدام ${arabicFieldNames[field] || field} آخر`
      });
    }

    res.status(500).json({
      message: "حدث خطأ في تقديم الطلب"
    });
  }
};

/**
 * تقديم طلب فتح مكتب
 * POST /api/engineers/requests/office-opening
 */
export const submitOfficeOpeningRequest = async (req, res) => {
  try {
    const engineerId = BigInt(req.engineer.id);

    // التحقق إذا المهندس مسجل بالنقابة
    const engineer = await prisma.engineers.findUnique({
      where: { id: engineerId }
    });

    if (!engineer.is_registered) {
      return res.status(400).json({
        message: "يجب أن تكون مسجلاً في النقابة أولاً لتقديم طلب فتح مكتب"
      });
    }

    // إنشاء طلب فتح مكتب
    const request = await prisma.office_opening_requests.create({
      data: {
        engineer_id: engineerId,
        submitted_by: "engineer",
        request_date: new Date(),
        status: "pending",
        office_name: req.body.office_name,
        office_type: req.body.office_type,
        specialization: req.body.specialization,
        office_address: req.body.office_address,
        office_phone: req.body.office_phone,
        law_declaration_signed: req.body.law_declaration_signed || false,
        law_declaration_date: req.body.law_declaration_date ? new Date(req.body.law_declaration_date) : null,
        law_declaration_home_address: req.body.law_declaration_home_address,
        office_division_decision_no: req.body.office_division_decision_no,
        office_division_decision_date: req.body.office_division_decision_date ? new Date(req.body.office_division_decision_date) : null,
        resulting_office_id: req.body.resulting_office_id ? BigInt(req.body.resulting_office_id) : null
      }
    });

    res.status(201).json({
      message: "تم تقديم طلب فتح المكتب بنجاح",
      request: serializeBigInt(request)
    });
  } catch (error) {
    console.error("خطأ في تقديم طلب فتح المكتب:", error);

    // معالجة أخطاء القيود الفريدة
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const arabicFieldNames = {
        'mobile': 'رقم الموبايل',
        'email': 'البريد الإلكتروني',
        'national_id_number': 'الرقم الوطني'
      };
      return res.status(400).json({
        message: `${arabicFieldNames[field] || field} مستخدم من قبل. يرجى استخدام ${arabicFieldNames[field] || field} آخر`
      });
    }

    res.status(500).json({
      message: "حدث خطأ في تقديم الطلب"
    });
  }
};

/**
 * تقديم طلب ترقية
 * POST /api/engineers/requests/promotion
 */
export const submitPromotionRequest = async (req, res) => {
  try {
    const engineerId = BigInt(req.engineer.id);

    // التحقق من البيانات المطلوبة
    if (!req.body.target_rank) {
      return res.status(400).json({
        message: "يرجى إدخال الرتبة المستهدفة (target_rank)"
      });
    }

    // التحقق إذا المهندس مسجل بالنقابة
    const engineer = await prisma.engineers.findUnique({
      where: { id: engineerId }
    });

    if (!engineer.is_registered) {
      return res.status(400).json({
        message: "يجب أن تكون مسجلاً في النقابة أولاً لتقديم طلب ترقية"
      });
    }

    // إنشاء طلب ترقية
    const request = await prisma.promotion_requests.create({
      data: {
        engineer_id: engineerId,
        submitted_by: "engineer",
        request_date: new Date(),
        status: "pending",
        target_rank: req.body.target_rank,
        register_number: req.body.register_number,
        specialization: req.body.specialization,
        work_address: req.body.work_address,
        residence_address: req.body.residence_address,
        phone: req.body.phone,
        membership_accept_decision_no: req.body.membership_accept_decision_no,
        membership_accept_decision_date: req.body.membership_accept_decision_date ? new Date(req.body.membership_accept_decision_date) : null,
        membership_accept_branch: req.body.membership_accept_branch,
        last_modification_decision_no: req.body.last_modification_decision_no,
        last_modification_decision_date: req.body.last_modification_decision_date ? new Date(req.body.last_modification_decision_date) : null,
        last_modification_branch: req.body.last_modification_branch,
        practice_summary_a: req.body.practice_summary_a,
        practice_summary_b: req.body.practice_summary_b,
        theoretical_entitlement_date: req.body.theoretical_entitlement_date ? new Date(req.body.theoretical_entitlement_date) : null,
        half_delay_period_months: req.body.half_delay_period_months,
        entitlement_date: req.body.entitlement_date ? new Date(req.body.entitlement_date) : null,
        first_committee_notes: req.body.first_committee_notes,
        second_committee_notes: req.body.second_committee_notes,
        administrative_opinion: req.body.administrative_opinion,
        branch_council_decision: req.body.branch_council_decision,
        branch_council_decision_date: req.body.branch_council_decision_date ? new Date(req.body.branch_council_decision_date) : null,
        promotion_effective_date: req.body.promotion_effective_date ? new Date(req.body.promotion_effective_date) : null,
        promotion_fee_amount: req.body.promotion_fee_amount,
        promotion_fee_receipt_no: req.body.promotion_fee_receipt_no,
        promotion_fee_receipt_date: req.body.promotion_fee_receipt_date ? new Date(req.body.promotion_fee_receipt_date) : null
      }
    });

    res.status(201).json({
      message: "تم تقديم طلب الترقية بنجاح",
      request: serializeBigInt(request)
    });
  } catch (error) {
    console.error("خطأ في تقديم طلب الترقية:", error);

    // معالجة أخطاء القيود الفريدة
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const arabicFieldNames = {
        'mobile': 'رقم الموبايل',
        'email': 'البريد الإلكتروني',
        'national_id_number': 'الرقم الوطني'
      };
      return res.status(400).json({
        message: `${arabicFieldNames[field] || field} مستخدم من قبل. يرجى استخدام ${arabicFieldNames[field] || field} آخر`
      });
    }

    res.status(500).json({
      message: "حدث خطأ في تقديم الطلب"
    });
  }
};

/**
 * عرض طلبات المهندس
 * GET /api/engineers/my-requests
 */
export const getMyRequests = async (req, res) => {
  try {
    const engineerId = BigInt(req.engineer.id);

    // جلب جميع طلبات المهندس
    const membershipRequests = await prisma.membership_requests.findMany({
      where: { engineer_id: engineerId },
      include: {
        membership_documents: true,
        membership_fees: true
      },
      orderBy: { created_at: "desc" }
    });

    const trainingRequests = await prisma.training_requests.findMany({
      where: { engineer_id: engineerId },
      orderBy: { created_at: "desc" }
    });

    const officeOpeningRequests = await prisma.office_opening_requests.findMany({
      where: { engineer_id: engineerId },
      orderBy: { created_at: "desc" }
    });

    const promotionRequests = await prisma.promotion_requests.findMany({
      where: { engineer_id: engineerId },
      orderBy: { created_at: "desc" }
    });

    res.json({
      membership_requests: serializeBigInt(membershipRequests),
      training_requests: serializeBigInt(trainingRequests),
      office_opening_requests: serializeBigInt(officeOpeningRequests),
      promotion_requests: serializeBigInt(promotionRequests)
    });
  } catch (error) {
    console.error("خطأ في جلب الطلبات:", error);
    res.status(500).json({
      message: "حدث خطأ في جلب الطلبات"
    });
  }
};
