import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// دالة مساعدة لتحويل أي BigInt في object إلى string
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

// إنشاء مكتب
export const createOffice = async (req, res) => {
  const {
    office_name,
    owner_engineer_id,
    office_type,
    specialization,
    address,
    phone,
    license_no,
    license_issue_date,
    license_status,
  } = req.body;

  try {
    // التحقق من صحة owner_engineer_id
    let engineerId = null;
    if (owner_engineer_id) {
      const idStr = String(owner_engineer_id).trim();
      if (!/^\d+$/.test(idStr)) {
        return res.status(400).json({
          message: "رقم المهندس يجب أن يكون رقمياً",
          field: "owner_engineer_id"
        });
      }
      engineerId = BigInt(idStr);
    }

    const office = await prisma.engineering_offices.create({
      data: {
        office_name,
        owner_engineer_id: engineerId,
        office_type,
        specialization,
        address,
        phone,
        license_no,
        license_issue_date: license_issue_date ? new Date(license_issue_date) : null,
        license_status,
      },
      include: {
        engineers: true  // إرجاع بيانات المهندس المالك مع المكتب
      }
    });
    res.json({ message: "تم إنشاء المكتب", office: serializeBigInt(office) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء المكتب", error: err.message });
  }
};

// جلب كل المكاتب مع بيانات المهندس المالك
export const getOffices = async (req, res) => {
  try {
    const offices = await prisma.engineering_offices.findMany({
      include: {
        engineers: true  // جلب بيانات المهندس المالك
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json(serializeBigInt(offices));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب المكاتب", error: err.message });
  }
};

export const updateOffice = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    // التحقق من صحة owner_engineer_id
    if (data.owner_engineer_id !== undefined) {
      if (data.owner_engineer_id === null || data.owner_engineer_id === "") {
        data.owner_engineer_id = null;
      } else {
        const idStr = String(data.owner_engineer_id).trim();
        if (!/^\d+$/.test(idStr)) {
          return res.status(400).json({
            message: "رقم المهندس يجب أن يكون رقمياً",
            field: "owner_engineer_id"
          });
        }
        data.owner_engineer_id = BigInt(idStr);
      }
    }

    if (data.license_issue_date) {
      data.license_issue_date = new Date(data.license_issue_date);
    }

    const updatedOffice = await prisma.engineering_offices.update({
      where: { id: BigInt(id) },
      data,
      include: {
        engineers: true  // إرجاع بيانات المهندس المالك مع المكتب
      }
    });
    res.json({ message: "تم تعديل المكتب", office: serializeBigInt(updatedOffice) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل المكتب", error: err.message });
  }
};

export const deleteOffice = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.engineering_offices.delete({
      where: { id: BigInt(id) },
    });
    res.json({ message: "تم حذف المكتب بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء حذف المكتب" });
  }
};
