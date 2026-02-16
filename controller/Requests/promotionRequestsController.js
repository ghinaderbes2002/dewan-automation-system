import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { promotionDocumentTypesMap } from "../../utils/documentTypes.js";



// Helper لتحويل BigInt
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

// ====================== GET جميع طلبات الترقيات ======================
export const getPromotionRequests = async (req, res) => {
  try {
    const requests = await prisma.promotion_requests.findMany({
      include: {
        engineers: true,
        promotion_qualifications: true,
        promotion_experiences: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.json(serializeBigInt(requests));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== GET طلب ترقية محدد ======================
export const getPromotionRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.promotion_requests.findUnique({
      where: { id: BigInt(id) },
      include: {
        engineers: true,
        promotion_qualifications: true,
        promotion_experiences: true,
      },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(serializeBigInt(request));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== إنشاء طلب ترقية مع المؤهلات والخبرات ======================
export const createPromotionRequest = async (req, res) => {
  try {
    const {
      engineer_id,
      target_rank,
      register_number,
      request_date,
      specialization,
      work_address,
      residence_address,
      phone,
      status,
      promotion_qualifications,
      promotion_experiences,
    } = req.body;

    // تحويل التواريخ في المؤهلات إلى DateTime
    const qualificationsWithDateTime = (promotion_qualifications || []).map(q => ({
      ...q,
      obtained_date: q.obtained_date ? new Date(q.obtained_date) : null,
    }));

    const data = {
      engineer_id: BigInt(engineer_id),
      target_rank,
      register_number,
      request_date: request_date ? new Date(request_date) : null,
      specialization,
      work_address,
      residence_address,
      phone,
      status,
      promotion_qualifications: {
        create: qualificationsWithDateTime,
      },
      promotion_experiences: {
        create: promotion_experiences || [],
      },
    };

    const request = await prisma.promotion_requests.create({
      data,
      include: {
        promotion_qualifications: true,
        promotion_experiences: true,
      },
    });

    res.json(serializeBigInt(request));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== تعديل طلب ترقية مع المؤهلات والخبرات ======================
export const updatePromotionRequest = async (req, res) => {
  try {
    const { id } = req.params;
   const {
     engineer_id,
     target_rank,
     register_number,
     request_date,
     specialization,
     work_address,
     residence_address,
     phone,
     status,
     promotion_qualifications,
     promotion_experiences,

     // ✅ الحقول الإضافية
     membership_accept_decision_no,
     membership_accept_decision_date,
     membership_accept_branch,
     last_modification_decision_no,
     last_modification_decision_date,
     last_modification_branch,
     practice_summary_a,
     practice_summary_b,
     theoretical_entitlement_date,
     half_delay_period_months,
     entitlement_date,
     first_committee_notes,
     second_committee_notes,
     administrative_opinion,
     branch_council_decision,
     branch_council_decision_date,
     promotion_effective_date,
     promotion_fee_amount,
     promotion_fee_receipt_no,
     promotion_fee_receipt_date,
     audit_notes,  // ملاحظات التدقيق الموحدة
   } = req.body;


    // تعديل الطلب الرئيسي
 const updatedRequest = await prisma.promotion_requests.update({
   where: { id: BigInt(id) },
   data: {
     engineer_id: engineer_id ? BigInt(engineer_id) : undefined,
     target_rank,
     register_number,
     request_date: request_date ? new Date(request_date) : undefined,
     specialization,
     work_address,
     residence_address,
     phone,
     status,

     // هاد الحقول الإضافية
     membership_accept_decision_no,
     membership_accept_decision_date: membership_accept_decision_date ? new Date(membership_accept_decision_date) : undefined,
     membership_accept_branch,
     last_modification_decision_no,
     last_modification_decision_date: last_modification_decision_date ? new Date(last_modification_decision_date) : undefined,
     last_modification_branch,
     practice_summary_a,
     practice_summary_b,
     theoretical_entitlement_date: theoretical_entitlement_date ? new Date(theoretical_entitlement_date) : undefined,
     half_delay_period_months,
     entitlement_date: entitlement_date ? new Date(entitlement_date) : undefined,
     first_committee_notes,
     second_committee_notes,
     administrative_opinion,
     branch_council_decision,
     branch_council_decision_date: branch_council_decision_date ? new Date(branch_council_decision_date) : undefined,
     promotion_effective_date: promotion_effective_date ? new Date(promotion_effective_date) : undefined,
     promotion_fee_amount,
     promotion_fee_receipt_no,
     promotion_fee_receipt_date: promotion_fee_receipt_date ? new Date(promotion_fee_receipt_date) : undefined,
     audit_notes,  // ملاحظات التدقيق الموحدة
   },
 });


    // حذف المؤهلات القديمة وإضافة الجديدة (سهل التنفيذ)
    if (promotion_qualifications) {
      await prisma.promotion_qualifications.deleteMany({
        where: { promotion_request_id: BigInt(id) },
      });
      await prisma.promotion_qualifications.createMany({
        data: promotion_qualifications.map((q) => ({
          promotion_request_id: BigInt(id),
          degree_name: q.degree_name,
          obtained_date: q.obtained_date ? new Date(q.obtained_date) : null,
          specialization: q.specialization,
          university_and_faculty: q.university_and_faculty,
        })),
      });
    }

    // حذف الخبرات القديمة وإضافة الجديدة
    if (promotion_experiences) {
      await prisma.promotion_experiences.deleteMany({
        where: { promotion_request_id: BigInt(id) },
      });
      await prisma.promotion_experiences.createMany({
        data: promotion_experiences.map((e) => ({
          promotion_request_id: BigInt(id),
          from_year: e.from_year,
          to_year: e.to_year,
          employer: e.employer,
          job_title_and_work_type: e.job_title_and_work_type,
        })),
      });
    }

    const finalRequest = await prisma.promotion_requests.findUnique({
      where: { id: BigInt(id) },
      include: {
        promotion_qualifications: true,
        promotion_experiences: true,
      },
    });

    res.json(serializeBigInt(finalRequest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== حذف طلب ترقية ======================
export const deletePromotionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.promotion_requests.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const uploadPromotionDocuments = async (req, res) => {
  try {
    // دعم أسماء حقول مختلفة من الفرونت (body أو query)
    const promotionRequestId =
      req.body.promotionRequestId ||
      req.body.promotion_request_id ||
      req.body.requestId ||
      req.body.id ||
      req.query.promotionRequestId ||
      req.query.promotion_request_id ||
      req.query.id;
    // إذا كان المرسِل موظفاً نحفظ id الموظف، وإذا كان مهندساً نحط null
    const employeeId = req.user?.userType === "employee" ? req.user.id : null;

    if (!promotionRequestId) {
      return res.status(400).json({
        message: "رقم طلب الترقية مطلوب. أرسله في body أو query parameter",
        hint: "FormData.append('promotionRequestId', id) أو ?promotionRequestId=123"
      });
    }

    const idStr = String(promotionRequestId).trim();
    if (!/^\d+$/.test(idStr)) {
      return res.status(400).json({ message: "رقم طلب الترقية يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    // upload.any() يرجع array مش object
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "لم يتم رفع أي ملفات" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fieldName = file.fieldname;
      const documentType = promotionDocumentTypesMap[fieldName] || fieldName;

      await prisma.attachments.create({
        data: {
          request_type: "promotion",
          request_id: requestId,
          document_type: documentType,
          file_path: `/uploads/promotion/${file.filename}`,
          uploaded_by_employee_id: employeeId,
        },
      });

      uploadedFiles.push({
        field: fieldName,
        document_type: documentType,
        file_path: `/uploads/promotion/${file.filename}`,
      });
    }

    res.json({ message: "تم رفع المستندات بنجاح", files: uploadedFiles });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "حدث خطأ أثناء رفع المستندات", error: err.message });
  }
};
