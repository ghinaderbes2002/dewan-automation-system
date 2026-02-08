import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ====================== Helper لتحويل BigInt ======================
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

// ====================== GET جميع طلبات التدريب ======================
export const getTrainingRequests = async (req, res) => {
  try {
    const requests = await prisma.training_requests.findMany({
      include: { engineers: true, engineering_offices: true },
      orderBy: { created_at: "desc" },
    });
    res.json(serializeBigInt(requests));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== GET طلب تدريب محدد ======================
export const getTrainingRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.training_requests.findUnique({
      where: { id: BigInt(id) },
      include: { engineers: true, engineering_offices: true },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });

    // جلب المرفقات
    const attachments = await prisma.attachments.findMany({
      where: {
        request_type: "TRAINING",
        request_id: BigInt(id)
      },
      include: {
        diwan_employees: true
      },
      orderBy: {
        uploaded_at: "desc"
      }
    });

    const requestWithAttachments = {
      ...request,
      attachments: attachments
    };

    res.json(serializeBigInt(requestWithAttachments));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== إنشاء طلب تدريب ======================
export const createTrainingRequest = async (req, res) => {
  try {
    const data = req.body;
    if (data.engineer_id) data.engineer_id = BigInt(data.engineer_id);
    if (data.host_office_id) data.host_office_id = BigInt(data.host_office_id);

    const request = await prisma.training_requests.create({ data });
    res.json(serializeBigInt(request));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== تعديل طلب تدريب ======================
export const updateTrainingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.engineer_id) data.engineer_id = BigInt(data.engineer_id);
    if (data.host_office_id) data.host_office_id = BigInt(data.host_office_id);

    const updated = await prisma.training_requests.update({
      where: { id: BigInt(id) },
      data,
    });
    res.json(serializeBigInt(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== حذف طلب تدريب ======================
export const deleteTrainingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.training_requests.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
