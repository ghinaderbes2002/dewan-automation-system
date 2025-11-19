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

// ------------------------------------------------
// GET طلب محدد
// ------------------------------------------------
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

    // إنشاء المهندس
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

    // تحديث الطلب مع ربط المهندس وتغيير الحالة
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


// إدارة المستندات المرتبطة
export const addMembershipDocument = async (req, res) => {
  try {
    const data = req.body;
    const doc = await prisma.membership_documents.create({ data });
    res.json(serializeBigInt(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMembershipDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.membership_documents.update({
      where: { id: BigInt(id) },
      data,
    });
    res.json(serializeBigInt(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMembershipDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.membership_documents.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------------------------
// إدارة الرسوم المرتبطة
// ------------------------------------------------
export const addMembershipFee = async (req, res) => {
  try {
    const data = req.body;
    const fee = await prisma.membership_fees.create({ data });
    res.json(serializeBigInt(fee));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMembershipFee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.membership_fees.update({
      where: { id: BigInt(id) },
      data,
    });
    res.json(serializeBigInt(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMembershipFee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.membership_fees.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------------------------
// إدارة Death Aid Forms
// ------------------------------------------------
export const addDeathAidForm = async (req, res) => {
  try {
    const data = req.body;
    const form = await prisma.death_aid_forms.create({ data });
    res.json(serializeBigInt(form));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDeathAidForm = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.death_aid_forms.update({
      where: { id: BigInt(id) },
      data,
    });
    res.json(serializeBigInt(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDeathAidForm = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.death_aid_forms.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
