// controller/Requests/membershipRequestsController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { documentTypesMap } from "../../utils/documentTypes.js";

// دالة لتحويل كل BigInt إلى String و Date إلى ISO String و Decimal إلى String
const serializeBigInt = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (obj.constructor && obj.constructor.name === "Decimal") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);

  if (typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === "bigint") {
          newObj[key] = value.toString();
        } else if (value instanceof Date) {
          newObj[key] = value.toISOString();
        } else if (value && value.constructor && value.constructor.name === "Decimal") {
          newObj[key] = value.toString();
        } else if (typeof value === "object" && value !== null) {
          newObj[key] = serializeBigInt(value);
        } else {
          newObj[key] = value;
        }
      }
    }
    return newObj;
  }

  return obj;
};

// ================== Membership Requests ==================

// GET كل طلبات الانتساب
export const getMembershipRequests = async (req, res) => {
  try {
    const requests = await prisma.membership_requests.findMany({
      include: {
        membership_documents: true,
        membership_fees: true,
        death_aid_forms: true,
        engineers: true,
        studied_by: true,    // معلومات موظف التدقيق اللي كتب الملاحظة
        received_by: true,   // معلومات موظف الاستقبال
      },
    });

    // جلب المرفقات لكل طلب
    const requestsWithAttachments = await Promise.all(
      requests.map(async (request) => {
        const attachments = await prisma.attachments.findMany({
          where: {
            request_type: "membership",
            request_id: request.id
          },
          include: {
            diwan_employees: true
          },
          orderBy: {
            uploaded_at: "desc"
          }
        });

        return {
          ...request,
          attachments: attachments
        };
      })
    );

    res.json(serializeBigInt(requestsWithAttachments));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET طلب محدد
export const getMembershipRequestById = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await prisma.membership_requests.findUnique({
      where: { id: BigInt(id) },
      include: {
        membership_documents: true,
        membership_fees: true,
        death_aid_forms: true,
        engineers: true,
        studied_by: true,    // معلومات موظف التدقيق اللي كتب الملاحظة
        received_by: true,   // معلومات موظف الاستقبال
      },
    });

    // جلب المرفقات من جدول attachments
    const attachments = await prisma.attachments.findMany({
      where: {
        request_type: "membership",
        request_id: BigInt(id)
      },
      include: {
        diwan_employees: true  // معلومات الموظف اللي رفع الملف
      },
      orderBy: {
        uploaded_at: "desc"
      }
    });

    // إضافة المرفقات للطلب
    const requestWithAttachments = {
      ...request,
      attachments: attachments
    };

    res.json(serializeBigInt(requestWithAttachments));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// إنشاء طلب جديد
export const createMembershipRequest = async (req, res) => {
  try {
    const data = req.body;
    const request = await prisma.membership_requests.create({ data });
    res.json({ message: "تم إنشاء طلب الانتساب بنجاح", data: serializeBigInt(request) });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء طلب الانتساب", error: err.message });
  }
};

// تعديل طلب
export const updateMembershipRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const data = req.body;
    const updatedRequest = await prisma.membership_requests.update({
      where: { id: BigInt(id) },
      data,
    });
    res.json({ message: "تم تعديل طلب الانتساب بنجاح", data: serializeBigInt(updatedRequest) });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء تعديل طلب الانتساب", error: err.message });
  }
};

// حذف طلب
export const deleteMembershipRequest = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.membership_requests.delete({ where: { id: BigInt(id) } });
    res.json({ message: "تم حذف طلب الانتساب بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء حذف طلب الانتساب", error: err.message });
  }
};

// دالة لتوليد رقم نقابي تلقائي
const generateSyndicateNumber = async () => {
  const currentYear = new Date().getFullYear();

  // جلب آخر رقم نقابي تم توليده هذه السنة
  const lastEngineer = await prisma.engineers.findFirst({
    where: {
      syndicate_number: {
        startsWith: `SYN-${currentYear}-`
      }
    },
    orderBy: {
      syndicate_number: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastEngineer && lastEngineer.syndicate_number) {
    // استخراج الرقم من الصيغة SYN-2026-0001
    const parts = lastEngineer.syndicate_number.split('-');
    const lastNumber = parseInt(parts[2]);
    nextNumber = lastNumber + 1;
  }

  // تنسيق الرقم بصيغة 4 خانات (0001, 0002, ...)
  const formattedNumber = String(nextNumber).padStart(4, '0');
  return `SYN-${currentYear}-${formattedNumber}`;
};

// اعتماد الطلب وتحويله لسجل مهندس
export const approveMembershipRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await prisma.membership_requests.findUnique({
      where: { id: BigInt(id) },
    });
    if (!request) return res.status(404).json({ message: "طلب الانتساب غير موجود" });

    // توليد رقم نقابي جديد
    const syndicateNumber = await generateSyndicateNumber();

    // التحقق إذا الطلب مربوط بمهندس موجود (قدمه المهندس بنفسه)
    let engineer;

    if (request.engineer_id) {
      // الطلب قدمه مهندس موجود، نحدث بياناته ونفعّل حسابه
      // نجيب المهندس الحالي عشان نتجنب تحديث الحقول الـ unique اللي نفسها
      const existingEngineer = await prisma.engineers.findUnique({
        where: { id: request.engineer_id }
      });

      const updateData = {
        is_registered: true, // المهندس صار مسجل بالنقابة
        syndicate_number: syndicateNumber, // الرقم النقابي الجديد
        full_name_ar: request.full_name_ar || existingEngineer.full_name_ar,
        birth_date: request.birth_date || existingEngineer.birth_date,
        birth_place: request.birth_place || existingEngineer.birth_place,
        civil_registry_office: request.civil_registry_office || existingEngineer.civil_registry_office,
        nationality: request.nationality || existingEngineer.nationality,
        address: request.home_address || existingEngineer.address,
      };

      // نضيف full_name_en فقط إذا في بيانات
      const fullNameEn = [request.first_name_en, request.last_name_en]
        .filter(Boolean)
        .join(" ");
      if (fullNameEn) {
        updateData.full_name_en = fullNameEn;
      }

      // نحدث الحقول الـ unique فقط إذا تغيرت
      if (request.national_id_number && request.national_id_number !== existingEngineer.national_id_number) {
        updateData.national_id_number = request.national_id_number;
      }
      if (request.mobile && request.mobile !== existingEngineer.mobile) {
        updateData.mobile = request.mobile;
      }
      if (request.email && request.email !== existingEngineer.email) {
        updateData.email = request.email;
      }
      if (request.phone && request.phone !== existingEngineer.phone) {
        updateData.phone = request.phone;
      }

      engineer = await prisma.engineers.update({
        where: { id: request.engineer_id },
        data: updateData,
      });
    } else {
      // الطلب قدمه موظف، ننشئ مهندس جديد
      engineer = await prisma.engineers.create({
        data: {
          full_name_ar: request.full_name_ar,
          full_name_en: [request.first_name_en, request.last_name_en]
            .filter(Boolean)
            .join(" "),
          national_id_number: request.national_id_number,
          birth_date: request.birth_date,
          birth_place: request.birth_place,
          civil_registry_office: request.civil_registry_office,
          nationality: request.nationality,
          phone: request.phone,
          mobile: request.mobile,
          email: request.email,
          address: request.home_address,
          is_registered: true, // مسجل بالنقابة
          syndicate_number: syndicateNumber, // الرقم النقابي
        },
      });
    }

    const updatedRequest = await prisma.membership_requests.update({
      where: { id: BigInt(id) },
      data: {
        status: "approved",
        engineer_id: engineer.id,
        syndicate_registration_number: syndicateNumber, // حفظ الرقم النقابي في طلب الانتساب كمان
      },
    });

    res.json({
      message: "تم قبول طلب الانتساب بنجاح",
      request: serializeBigInt(updatedRequest),
      engineer: serializeBigInt(engineer),
    });
  } catch (err) {
    console.error("خطأ في الموافقة على طلب الانتساب:", err);

    // معالجة أخطاء القيود الفريدة
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0];
      const arabicFieldNames = {
        'mobile': 'رقم الموبايل',
        'email': 'البريد الإلكتروني',
        'national_id_number': 'الرقم الوطني',
        'phone': 'رقم الهاتف'
      };
      return res.status(400).json({
        message: `${arabicFieldNames[field] || field} موجود مسبقاً لمهندس آخر في النظام`
      });
    }

    // معالجة أخطاء المفاتيح الخارجية
    if (err.code === 'P2003') {
      return res.status(400).json({
        message: 'خطأ في الربط بين البيانات. يرجى التحقق من المعلومات المدخلة'
      });
    }

    res.status(500).json({ message: "حدث خطأ في الموافقة على الطلب" });
  }
};

// ================== Membership Documents ==================
// ================== جلب المستندات ==================
export const getMembershipDocuments = async (req, res) => {
  try {
    const { request_id } = req.query;

    const where = {};
    if (request_id) {
      const idStr = String(request_id);
      if (!/^\d+$/.test(idStr)) {
        return res
          .status(400)
          .json({ message: "رقم الطلب يجب أن يكون رقمياً" });
      }
      where.membership_request_id = BigInt(idStr);
    }

    const docs = await prisma.membership_documents.findMany({ where });
    const serialized = docs.map((d) => serializeBigInt(d));
    res.json(serialized);
  } catch (err) {
    console.error("getMembershipDocuments error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب المستندات", error: err.message });
  }
};

// إنشاء سجل مستندات جديد
export const addMembershipDocument = async (req, res) => {
  try {
    const { membership_request_id, ...rest } = req.body;

    if (!membership_request_id) {
      return res
        .status(400)
        .json({ message: "رقم طلب الانتساب مطلوب" });
    }

    const idStr = String(membership_request_id);
    if (!/^\d+$/.test(idStr)) {
      return res
        .status(400)
        .json({ message: "رقم طلب الانتساب يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    const request = await prisma.membership_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res
        .status(400)
        .json({ message: "طلب الانتساب غير موجود" });
    }

    const doc = await prisma.membership_documents.create({
      data: {
        membership_request_id: requestId,
        ...rest,
      },
    });

    res.json({ message: "تم إضافة سجل المستندات بنجاح", data: serializeBigInt(doc) });
  } catch (err) {
    console.error("addMembershipDocument error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة المستندات", error: err.message });
  }
};

// تعديل سجل مستندات
export const updateMembershipDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const rawData = { ...req.body };

    // لو حدا حاول يغيّر membership_request_id في التعديل
    if (rawData.membership_request_id !== undefined) {
      const idStr = String(rawData.membership_request_id);
      if (!/^\d+$/.test(idStr)) {
        return res
          .status(400)
          .json({ message: "رقم طلب الانتساب يجب أن يكون رقمياً" });
      }
      rawData.membership_request_id = BigInt(idStr);
    }

    const updated = await prisma.membership_documents.update({
      where: { id: BigInt(id) },
      data: rawData,
    });

    res.json({ message: "تم تعديل المستندات بنجاح", data: serializeBigInt(updated) });
  } catch (err) {
    console.error("updateMembershipDocument error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل المستندات", error: err.message });
  }
};

// حذف سجل مستندات
export const deleteMembershipDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.membership_documents.delete({ where: { id: BigInt(id) } });
    res.json({ message: "تم حذف سجل المستندات بنجاح" });
  } catch (err) {
    console.error("deleteMembershipDocument error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء حذف المستندات", error: err.message });
  }
};


// رفع ملفات المستندات + ربطها بالـ attachments و membership_documents
export const uploadMembershipDocument = async (req, res) => {
  try {
    console.log("uploadMembershipDocument - body:", req.body);
    console.log("uploadMembershipDocument - files:", req.files ? Object.keys(req.files) : "no files");

    const { membershipRequestId, request_type } = req.body;
    const employeeId = req.user.id;

    if (!membershipRequestId) {
      return res.status(400).json({ message: "رقم طلب الانتساب مطلوب" });
    }

    const idStr = String(membershipRequestId);
    if (!/^\d+$/.test(idStr)) {
      return res
        .status(400)
        .json({ message: "رقم طلب الانتساب يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "لم يتم رفع أي ملفات" });
    }

    const uploadedFiles = [];

    for (const fieldName of Object.keys(req.files)) {
      const fileArray = req.files[fieldName];
      if (!documentTypesMap[fieldName]) continue;

      const documentType = documentTypesMap[fieldName];
      const file = fileArray[0];

      // 1) إنشاء سجل في جدول attachments
      await prisma.attachments.create({
        data: {
          request_type,
          request_id: requestId,
          document_type: documentType,
          file_path:`/uploads/membership/${file.filename}`,
          uploaded_by_employee_id: employeeId,
        },
      });

      // 2) تحديث جدول membership_documents (فقط للحقول التي تبدأ بـ doc_)
      if (fieldName.startsWith("doc_")) {
        await prisma.membership_documents.updateMany({
          where: { membership_request_id: requestId },
          data: { [fieldName]: true },
        });
      }

      uploadedFiles.push({
        field: fieldName,
        document_type: documentType,
        file_path:`/uploads/membership/${file.filename}`,
      });
    }

    return res.json({
      message: "تم رفع المستندات بنجاح",
      files: uploadedFiles,
    });
  } catch (error) {
    console.log("uploadMembershipDocument error:", error);
    return res
      .status(500)
      .json({ message: "حدث خطأ أثناء رفع المستندات", error: error.message });
  }
};


// ================== Membership Fees ==================

// جلب كل سجلات الرسوم (اختياري: ممكن تضيف فلترة لاحقًا على membership_request_id)
export const getMembershipFees = async (req, res) => {
  try {
    const { request_id } = req.query;

    const where = {};
    if (request_id) {
      const idStr = String(request_id);
      if (!/^\d+$/.test(idStr)) {
        return res
          .status(400)
          .json({ message: "رقم الطلب يجب أن يكون رقمياً" });
      }
      where.membership_request_id = BigInt(idStr);
    }

    const fees = await prisma.membership_fees.findMany({ where });
    res.json(serializeBigInt(fees));
  } catch (err) {
    console.error("getMembershipFees error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الرسوم", error: err.message });
  }
};

// دالة مساعدة لتحويل التاريخ إلى صيغة ISO-8601
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  // إذا كان التاريخ بصيغة YYYY-MM-DD نحوله إلى DateTime
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "T00:00:00.000Z");
  }
  return new Date(dateStr);
};

// إنشاء سجل رسوم جديد
export const addMembershipFee = async (req, res) => {
  try {
    const { membership_request_id, ...rest } = req.body;

    if (!membership_request_id) {
      return res
        .status(400)
        .json({ message: "رقم طلب الانتساب مطلوب" });
    }

    const idStr = String(membership_request_id);
    if (!/^\d+$/.test(idStr)) {
      return res
        .status(400)
        .json({ message: "رقم طلب الانتساب يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    // تأكد أن طلب الانتساب موجود
    const request = await prisma.membership_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res
        .status(400)
        .json({ message: "طلب الانتساب غير موجود" });
    }

    // تحويل حقول التاريخ
    const data = { ...rest };
    if (data.receipt_branch_fee_date) {
      data.receipt_branch_fee_date = parseDate(data.receipt_branch_fee_date);
    }
    if (data.receipt_death_aid_date) {
      data.receipt_death_aid_date = parseDate(data.receipt_death_aid_date);
    }
    if (data.receipt_retirement_date) {
      data.receipt_retirement_date = parseDate(data.receipt_retirement_date);
    }

    const fee = await prisma.membership_fees.create({
      data: {
        membership_request_id: requestId,
        ...data,
      },
    });

    res.json({ message: "تم إضافة سجل الرسوم بنجاح", data: serializeBigInt(fee) });
  } catch (err) {
    console.error("addMembershipFee error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة الرسوم", error: err.message });
  }
};

// تعديل سجل رسوم
export const updateMembershipFee = async (req, res) => {
  try {
    const { id } = req.params;
    const rawData = { ...req.body };

    // لو حدا حاول يغيّر رقم طلب الانتساب
    if (rawData.membership_request_id !== undefined) {
      const idStr = String(rawData.membership_request_id);
      if (!/^\d+$/.test(idStr)) {
        return res
          .status(400)
          .json({ message: "رقم طلب الانتساب يجب أن يكون رقمياً" });
      }
      rawData.membership_request_id = BigInt(idStr);
    }

    // تحويل حقول التاريخ
    if (rawData.receipt_branch_fee_date) {
      rawData.receipt_branch_fee_date = parseDate(rawData.receipt_branch_fee_date);
    }
    if (rawData.receipt_death_aid_date) {
      rawData.receipt_death_aid_date = parseDate(rawData.receipt_death_aid_date);
    }
    if (rawData.receipt_retirement_date) {
      rawData.receipt_retirement_date = parseDate(rawData.receipt_retirement_date);
    }

    const updated = await prisma.membership_fees.update({
      where: { id: BigInt(id) },
      data: rawData,
    });

    res.json({ message: "تم تعديل سجل الرسوم بنجاح", data: serializeBigInt(updated) });
  } catch (err) {
    console.error("updateMembershipFee error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل الرسوم", error: err.message });
  }
};

// حذف سجل رسوم
export const deleteMembershipFee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.membership_fees.delete({ where: { id: BigInt(id) } });
    res.json({ message: "تم حذف سجل الرسوم بنجاح" });
  } catch (err) {
    console.error("deleteMembershipFee error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء حذف الرسوم", error: err.message });
  }
};

// ================== Death Aid Forms ==================

// جلب استمارات الوفاة (اختياري: فلترة حسب رقم طلب الانتساب)
export const getDeathAidForms = async (req, res) => {
  try {
    const { request_id } = req.query;

    const where = {};
    if (request_id) {
      const idStr = String(request_id);
      if (!/^\d+$/.test(idStr)) {
        return res
          .status(400)
          .json({ message: "رقم الطلب يجب أن يكون رقمياً" });
      }
      where.membership_request_id = BigInt(idStr);
    }

    const forms = await prisma.death_aid_forms.findMany({ where });
    res.json(serializeBigInt(forms));
  } catch (err) {
    console.error("getDeathAidForms error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب استمارات الإعانة", error: err.message });
  }
};

export const addDeathAidForm = async (req, res) => {
  try {
    const { membership_request_id, ...rest } = req.body;

    if (!membership_request_id) {
      return res
        .status(400)
        .json({ message: "رقم طلب الانتساب مطلوب" });
    }

    const idStr = String(membership_request_id);
    if (!/^\d+$/.test(idStr)) {
      return res
        .status(400)
        .json({ message: "رقم طلب الانتساب يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    // تأكد أن طلب الانتساب موجود
    const request = await prisma.membership_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res
        .status(400)
        .json({ message: "طلب الانتساب غير موجود" });
    }

    const form = await prisma.death_aid_forms.create({
      data: {
        membership_request_id: requestId,
        ...rest,
      },
    });

    res.json({ message: "تم إضافة استمارة الإعانة بنجاح", data: serializeBigInt(form) });
  } catch (err) {
    console.error("addDeathAidForm error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة استمارة الإعانة", error: err.message });
  }
};

export const updateDeathAidForm = async (req, res) => {
  try {
    const { id } = req.params;
    const rawData = { ...req.body };

    if (rawData.membership_request_id !== undefined) {
      const idStr = String(rawData.membership_request_id);
      if (!/^\d+$/.test(idStr)) {
        return res
          .status(400)
          .json({ message: "رقم طلب الانتساب يجب أن يكون رقمياً" });
      }
      rawData.membership_request_id = BigInt(idStr);
    }

    const updated = await prisma.death_aid_forms.update({
      where: { id: BigInt(id) },
      data: rawData,
    });
    res.json({ message: "تم تعديل استمارة الإعانة بنجاح", data: serializeBigInt(updated) });
  } catch (err) {
    console.error("updateDeathAidForm error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل استمارة الإعانة", error: err.message });
  }
};

export const deleteDeathAidForm = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.death_aid_forms.delete({ where: { id: BigInt(id) } });
    res.json({ message: "تم حذف استمارة الإعانة بنجاح" });
  } catch (err) {
    console.error("deleteDeathAidForm error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء حذف استمارة الإعانة", error: err.message });
  }
};
