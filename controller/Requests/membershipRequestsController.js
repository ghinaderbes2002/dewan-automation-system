// import { PrismaClient } from "@prisma/client";
// import { documentTypesMap } from "../../utils/documentTypes.js";

// const prisma = new PrismaClient();

// // دالة لتحويل كل BigInt إلى String
// const serializeBigInt = (obj) => {
//   if (!obj) return obj;
//   if (Array.isArray(obj)) return obj.map(serializeBigInt);
//   if (typeof obj === "object") {
//     const newObj = {};
//     for (const key in obj) {
//       if (typeof obj[key] === "bigint") newObj[key] = obj[key].toString();
//       else if (typeof obj[key] === "object")
//         newObj[key] = serializeBigInt(obj[key]);
//       else newObj[key] = obj[key];
//     }
//     return newObj;
//   }
//   return obj;
// };

// // GET كل طلبات الانتساب
// export const getMembershipRequests = async (req, res) => {
//   try {
//     const requests = await prisma.membership_requests.findMany({
//       include: {
//         membership_documents: true,
//         membership_fees: true,
//         death_aid_forms: true,
//         engineers: true,
//       },
//     });
//     res.json(serializeBigInt(requests));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ------------------------------------------------
// // GET طلب محدد
// // ------------------------------------------------
// export const getMembershipRequestById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const request = await prisma.membership_requests.findUnique({
//       where: { id: BigInt(id) },
//       include: {
//         membership_documents: true,
//         membership_fees: true,
//         death_aid_forms: true,
//         engineers: true,
//       },
//     });
//     res.json(serializeBigInt(request));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // إنشاء طلب جديد
// export const createMembershipRequest = async (req, res) => {
//   try {
//     const data = req.body;
//     const request = await prisma.membership_requests.create({ data });
//     res.json(serializeBigInt(request));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // تعديل طلب
// export const updateMembershipRequest = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const data = req.body;
//     const updatedRequest = await prisma.membership_requests.update({
//       where: { id: BigInt(id) },
//       data,
//     });
//     res.json(serializeBigInt(updatedRequest));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // حذف طلب
// export const deleteMembershipRequest = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await prisma.membership_requests.delete({ where: { id: BigInt(id) } });
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // اعتماد الطلب وتحويله لسجل مهندس
// export const approveMembershipRequest = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const request = await prisma.membership_requests.findUnique({
//       where: { id: BigInt(id) },
//     });
//     if (!request) return res.status(404).json({ error: "Request not found" });

//     // إنشاء المهندس
//     const engineer = await prisma.engineers.create({
//       data: {
//         full_name_ar: request.full_name_ar,
//         full_name_en: [request.first_name_en, request.last_name_en]
//           .filter(Boolean)
//           .join(" "),
//         national_id_number: request.national_id_number,
//         birth_date: request.birth_date,
//         birth_place: request.birth_place,
//         civil_registry_office: request.civil_registry_office,
//         nationality: request.nationality,
//         phone: request.phone,
//         mobile: request.mobile,
//         email: request.email,
//         address: request.home_address,
//       },
//     });

//     // تحديث الطلب مع ربط المهندس وتغيير الحالة
//     const updatedRequest = await prisma.membership_requests.update({
//       where: { id: BigInt(id) },
//       data: {
//         status: "approved",
//         engineer_id: engineer.id,
//       },
//     });

//     res.json({
//       request: serializeBigInt(updatedRequest),
//       engineer: serializeBigInt(engineer),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // إدارة المستندات المرتبطة
// export const addMembershipDocument = async (req, res) => {
//   try {
//     const data = req.body;
//     const doc = await prisma.membership_documents.create({ data });
//     res.json(serializeBigInt(doc));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const updateMembershipDocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;
//     const updated = await prisma.membership_documents.update({
//       where: { id: BigInt(id) },
//       data,
//     });
//     res.json(serializeBigInt(updated));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const deleteMembershipDocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.membership_documents.delete({ where: { id: BigInt(id) } });
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const uploadMembershipDocument = async (req, res) => {
//   try {
//     const { membershipRequestId, request_type } = req.body;
//     const employeeId = req.user.id; // أخذناها من التوكن

//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }

//     const uploadedFiles = [];

//     for (const fieldName of Object.keys(req.files)) {
//       const fileArray = req.files[fieldName];
//       if (!documentTypesMap[fieldName]) continue;

//       const documentType = documentTypesMap[fieldName];
//       const file = fileArray[0];

//       // 1) إنشاء سجل في جدول attachments
//       await prisma.attachments.create({
//         data: {
//           request_type, // مو ثابت
//           request_id: Number(membershipRequestId),
//           document_type: documentType,
//           file_path: `/uploads/membership/${file.filename}`,
//           uploaded_by_employee_id: employeeId, // من التوكن
//         },
//       });

//       // 2) تحديث جدول membership_documents
//       await prisma.membership_documents.updateMany({
//         where: { membership_request_id: Number(membershipRequestId) },
//         data: { [fieldName]: true },
//       });

//       uploadedFiles.push({
//         field: fieldName,
//         document_type: documentType,
//         file_path: `/uploads/membership/${file.filename}`,
//       });
//     }

//     return res.json({
//       message: "Documents uploaded successfully",
//       files: uploadedFiles,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };


// // ------------------------------------------------
// // إدارة الرسوم المرتبطة
// // ------------------------------------------------
// export const addMembershipFee = async (req, res) => {
//   try {
//     const data = req.body;
//     const fee = await prisma.membership_fees.create({ data });
//     res.json(serializeBigInt(fee));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const updateMembershipFee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;
//     const updated = await prisma.membership_fees.update({
//       where: { id: BigInt(id) },
//       data,
//     });
//     res.json(serializeBigInt(updated));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const deleteMembershipFee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.membership_fees.delete({ where: { id: BigInt(id) } });
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ------------------------------------------------
// // إدارة Death Aid Forms
// // ------------------------------------------------
// export const addDeathAidForm = async (req, res) => {
//   try {
//     const data = req.body;
//     const form = await prisma.death_aid_forms.create({ data });
//     res.json(serializeBigInt(form));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const updateDeathAidForm = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;
//     const updated = await prisma.death_aid_forms.update({
//       where: { id: BigInt(id) },
//       data,
//     });
//     res.json(serializeBigInt(updated));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const deleteDeathAidForm = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.death_aid_forms.delete({ where: { id: BigInt(id) } });
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// controller/Requests/membershipRequestsController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// دالة لتحويل كل BigInt إلى String
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
      },
    });
    res.json(serializeBigInt(requests));
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
      },
    });
    res.json(serializeBigInt(request));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// إنشاء طلب جديد
export const createMembershipRequest = async (req, res) => {
  try {
    const data = req.body;
    const request = await prisma.membership_requests.create({ data });
    res.json(serializeBigInt(request));
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.json(serializeBigInt(updatedRequest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// حذف طلب
export const deleteMembershipRequest = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.membership_requests.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// اعتماد الطلب وتحويله لسجل مهندس
export const approveMembershipRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await prisma.membership_requests.findUnique({
      where: { id: BigInt(id) },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });

    const engineer = await prisma.engineers.create({
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
      },
    });

    const updatedRequest = await prisma.membership_requests.update({
      where: { id: BigInt(id) },
      data: {
        status: "approved",
        engineer_id: engineer.id,
      },
    });

    res.json({
      request: serializeBigInt(updatedRequest),
      engineer: serializeBigInt(engineer),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
          .json({ error: "Invalid request_id, must be numeric" });
      }
      where.membership_request_id = BigInt(idStr);
    }

    const docs = await prisma.membership_documents.findMany({ where });
    const serialized = docs.map((d) => serializeBigInt(d));
    res.json(serialized);
  } catch (err) {
    console.error("getMembershipDocuments error:", err);
    res.status(500).json({ error: err.message });
  }
};

// إنشاء سجل مستندات جديد
export const addMembershipDocument = async (req, res) => {
  try {
    const { membership_request_id, ...rest } = req.body;

    if (!membership_request_id) {
      return res
        .status(400)
        .json({ error: "membership_request_id مطلوب" });
    }

    const idStr = String(membership_request_id);
    if (!/^\d+$/.test(idStr)) {
      return res
        .status(400)
        .json({ error: "membership_request_id يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    const request = await prisma.membership_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res
        .status(400)
        .json({ error: "طلب الانتساب غير موجود في قاعدة البيانات" });
    }

    const doc = await prisma.membership_documents.create({
      data: {
        membership_request_id: requestId,
        ...rest,
      },
    });

    res.json(serializeBigInt(doc));
  } catch (err) {
    console.error("addMembershipDocument error:", err);
    res.status(500).json({ error: err.message });
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
          .json({ error: "membership_request_id يجب أن يكون رقمياً" });
      }
      rawData.membership_request_id = BigInt(idStr);
    }

    const updated = await prisma.membership_documents.update({
      where: { id: BigInt(id) },
      data: rawData,
    });

    res.json(serializeBigInt(updated));
  } catch (err) {
    console.error("updateMembershipDocument error:", err);
    res.status(500).json({ error: err.message });
  }
};

// حذف سجل مستندات
export const deleteMembershipDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.membership_documents.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteMembershipDocument error:", err);
    res.status(500).json({ error: err.message });
  }
};


export const uploadMembershipDocument = async (req, res) => {
  try {
    const { membershipRequestId, request_type } = req.body;
    const employeeId = req.user.id; // أخذناها من التوكن

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
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
          request_type, // مو ثابت
          request_id: Number(membershipRequestId),
          document_type: documentType,
          file_path: `/uploads/membership/${file.filename}`,
          uploaded_by_employee_id: employeeId, // من التوكن
        },
      });

      // 2) تحديث جدول membership_documents
      await prisma.membership_documents.updateMany({
        where: { membership_request_id: Number(membershipRequestId) },
        data: { [fieldName]: true },
      });

      uploadedFiles.push({
        field: fieldName,
        document_type: documentType,
        file_path: `/uploads/membership/${file.filename}`,
      });
    }

    return res.json({
      message: "Documents uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
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
          .json({ error: "Invalid request_id, must be numeric" });
      }
      where.membership_request_id = BigInt(idStr);
    }

    const fees = await prisma.membership_fees.findMany({ where });
    res.json(serializeBigInt(fees));
  } catch (err) {
    console.error("getMembershipFees error:", err);
    res.status(500).json({ error: err.message });
  }
};

// إنشاء سجل رسوم جديد
export const addMembershipFee = async (req, res) => {
  try {
    const { membership_request_id, ...rest } = req.body;

    if (!membership_request_id) {
      return res
        .status(400)
        .json({ error: "membership_request_id مطلوب" });
    }

    const idStr = String(membership_request_id);
    if (!/^\d+$/.test(idStr)) {
      return res
        .status(400)
        .json({ error: "membership_request_id يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    // تأكد أن طلب الانتساب موجود
    const request = await prisma.membership_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res
        .status(400)
        .json({ error: "طلب الانتساب غير موجود في قاعدة البيانات" });
    }

    const fee = await prisma.membership_fees.create({
      data: {
        membership_request_id: requestId,
        ...rest,
      },
    });

    res.json(serializeBigInt(fee));
  } catch (err) {
    console.error("addMembershipFee error:", err);
    res.status(500).json({ error: err.message });
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
          .json({ error: "membership_request_id يجب أن يكون رقمياً" });
      }
      rawData.membership_request_id = BigInt(idStr);
    }

    const updated = await prisma.membership_fees.update({
      where: { id: BigInt(id) },
      data: rawData,
    });

    res.json(serializeBigInt(updated));
  } catch (err) {
    console.error("updateMembershipFee error:", err);
    res.status(500).json({ error: err.message });
  }
};

// حذف سجل رسوم
export const deleteMembershipFee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.membership_fees.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteMembershipFee error:", err);
    res.status(500).json({ error: err.message });
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
          .json({ error: "Invalid request_id, must be numeric" });
      }
      where.membership_request_id = BigInt(idStr);
    }

    const forms = await prisma.death_aid_forms.findMany({ where });
    res.json(serializeBigInt(forms));
  } catch (err) {
    console.error("getDeathAidForms error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const addDeathAidForm = async (req, res) => {
  try {
    const { membership_request_id, ...rest } = req.body;

    if (!membership_request_id) {
      return res
        .status(400)
        .json({ error: "membership_request_id مطلوب" });
    }

    const idStr = String(membership_request_id);
    if (!/^\d+$/.test(idStr)) {
      return res
        .status(400)
        .json({ error: "membership_request_id يجب أن يكون رقمياً" });
    }

    const requestId = BigInt(idStr);

    // تأكد أن طلب الانتساب موجود
    const request = await prisma.membership_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res
        .status(400)
        .json({ error: "طلب الانتساب غير موجود في قاعدة البيانات" });
    }

    const form = await prisma.death_aid_forms.create({
      data: {
        membership_request_id: requestId,
        ...rest,
      },
    });

    res.json(serializeBigInt(form));
  } catch (err) {
    console.error("addDeathAidForm error:", err);
    res.status(500).json({ error: err.message });
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
          .json({ error: "membership_request_id يجب أن يكون رقمياً" });
      }
      rawData.membership_request_id = BigInt(idStr);
    }

    const updated = await prisma.death_aid_forms.update({
      where: { id: BigInt(id) },
      data: rawData,
    });
    res.json(serializeBigInt(updated));
  } catch (err) {
    console.error("updateDeathAidForm error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteDeathAidForm = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.death_aid_forms.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteDeathAidForm error:", err);
    res.status(500).json({ error: err.message });
  }
};
