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
    const office = await prisma.engineering_offices.create({
      data: {
        office_name,
        owner_engineer_id: owner_engineer_id ? BigInt(owner_engineer_id) : null,
        office_type,
        specialization,
        address,
        phone,
        license_no,
        license_issue_date: license_issue_date ? new Date(license_issue_date) : null,
        license_status,
      },
    });
    res.json({ message: "تم إنشاء المكتب", office: serializeBigInt(office) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء المكتب" });
  }
};

// نفس الشيء لبقية الدوال:
export const getOffices = async (req, res) => {
  try {
    const offices = await prisma.engineering_offices.findMany();
    res.json(serializeBigInt(offices));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب المكاتب" });
  }
};

export const updateOffice = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (data.owner_engineer_id) data.owner_engineer_id = BigInt(data.owner_engineer_id);
  if (data.license_issue_date) data.license_issue_date = new Date(data.license_issue_date);

  try {
    const updatedOffice = await prisma.engineering_offices.update({
      where: { id: BigInt(id) },
      data,
    });
    res.json({ message: "تم تعديل المكتب", office: serializeBigInt(updatedOffice) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل المكتب" });
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
