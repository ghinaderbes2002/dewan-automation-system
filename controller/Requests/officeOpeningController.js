import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🟢 دالة لتحويل كل الـ BigInt إلى String قبل إرسالها بالـ JSON
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

// 🟢 إنشاء طلب فتح مكتب جديد
export const createOfficeOpeningRequest = async (req, res) => {
  try {
    const data = req.body;
    const request = await prisma.office_opening_requests.create({
      data: {
        engineer_id: BigInt(data.engineer_id),
        request_date: data.request_date
          ? new Date(data.request_date)
          : undefined,
        office_name: data.office_name,
        office_type: data.office_type,
        specialization: data.specialization,
        office_address: data.office_address,
        office_phone: data.office_phone,
        law_declaration_signed: data.law_declaration_signed,
        law_declaration_date: data.law_declaration_date
          ? new Date(data.law_declaration_date)
          : undefined,
        law_declaration_home_address: data.law_declaration_home_address,
        status: data.status || "under_review",
      },
    });
    res.status(201).json(serializeBigInt(request));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🟢 جلب كل طلبات فتح المكتب
export const getAllOfficeOpeningRequests = async (req, res) => {
  try {
    const requests = await prisma.office_opening_requests.findMany({
      include: { engineers: true, engineering_offices: true },
    });
    res.json(serializeBigInt(requests));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 جلب طلب محدد
export const getOfficeOpeningRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.office_opening_requests.findUnique({
      where: { id: BigInt(id) },
      include: { engineers: true, engineering_offices: true },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(serializeBigInt(request));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 تحديث الطلب (يمكن تحديث أي حقل أساسي قبل الموافقة)
export const updateOfficeOpeningRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedRequest = await prisma.office_opening_requests.update({
      where: { id: BigInt(id) },
      data: {
        office_name: data.office_name,
        office_type: data.office_type,
        specialization: data.specialization,
        office_address: data.office_address,
        office_phone: data.office_phone,
        law_declaration_signed: data.law_declaration_signed,
        law_declaration_date: data.law_declaration_date
          ? new Date(data.law_declaration_date)
          : undefined,
        law_declaration_home_address: data.law_declaration_home_address,
        audit_notes: data.audit_notes,  // ملاحظات التدقيق
        status: data.status,
      },
    });
    res.json(serializeBigInt(updatedRequest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 تحديث الطلب بعد دراسة المكتب (إضافة القرار والمكتب الناتج)
export const approveOfficeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedRequest = await prisma.office_opening_requests.update({
      where: { id: BigInt(id) },
      data: {
        office_division_decision_no: data.office_division_decision_no,
        office_division_decision_date: data.office_division_decision_date
          ? new Date(data.office_division_decision_date)
          : undefined,
        resulting_office_id: data.resulting_office_id
          ? BigInt(data.resulting_office_id)
          : undefined,
        audit_notes: data.audit_notes,  // ملاحظات التدقيق
        status: data.status || "under_review",
      },
    });
    res.json(serializeBigInt(updatedRequest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 حذف الطلب
export const deleteOfficeOpeningRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.office_opening_requests.delete({
      where: { id: BigInt(id) },
    });
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
