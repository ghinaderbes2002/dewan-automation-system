import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { promotionDocumentTypesMap } from "../../utils/documentTypes.js";



// Helper لتحويل BigInt
const serializeBigInt = (obj) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") newObj[key] = obj[key].toString();
      else if (typeof obj[key] === "object")
        newObj[key] = serializeBigInt(obj[key]);
      else newObj[key] = obj[key];
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

    const data = {
      engineer_id: BigInt(engineer_id),
      target_rank,
      register_number,
      request_date,
      specialization,
      work_address,
      residence_address,
      phone,
      status,
      promotion_qualifications: {
        create: promotion_qualifications || [],
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
   } = req.body;


    // تعديل الطلب الرئيسي
 const updatedRequest = await prisma.promotion_requests.update({
   where: { id: BigInt(id) },
   data: {
     engineer_id: engineer_id ? BigInt(engineer_id) : undefined,
     target_rank,
     register_number,
     request_date,
     specialization,
     work_address,
     residence_address,
     phone,
     status,

     // هاد الحقول الإضافية
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
          obtained_date: q.obtained_date,
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
    const { promotionRequestId } = req.body;
    const employeeId = req.user.id;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const fieldName of Object.keys(req.files)) {
      const file = req.files[fieldName][0];
      const documentType = promotionDocumentTypesMap[fieldName];

      await prisma.attachments.create({
        data: {
          request_type: "PROMOTION",
          request_id: Number(promotionRequestId),
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

    res.json({ message: "Files uploaded successfully", files: uploadedFiles });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
