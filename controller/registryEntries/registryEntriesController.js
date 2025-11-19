import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// دالة مساعدة لتحويل كل BigInt إلى String
const serializeBigInt = (obj) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = obj[key].toString();
      } else {
        newObj[key] = serializeBigInt(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

// ====================== GET ALL ======================
export const getRegistryEntries = async (req, res) => {
  try {
    const { direction, request_type, search } = req.query;

    let filter = {};
    if (direction) filter.direction = direction;
    if (request_type) filter.request_type = request_type;
    if (search) {
      filter.OR = [
        { subject: { contains: search } },
        { from_entity: { contains: search } },
        { to_entity: { contains: search } },
      ];
    }

    const results = await prisma.registry_entries.findMany({
      where: filter,
      orderBy: { date: "desc" },
    });

    res.json(serializeBigInt(results));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ====================== GET BY ID ======================
export const getRegistryEntryById = async (req, res) => {
  try {
    const entry = await prisma.registry_entries.findUnique({
      where: { id: BigInt(req.params.id) },
    });

    if (!entry) return res.status(404).json({ message: "السجل غير موجود" });

    res.json(serializeBigInt(entry));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ====================== CREATE ======================
export const createRegistryEntry = async (req, res) => {
  try {
    const {
      registry_no,
      direction,
      date,
      from_entity,
      to_entity,
      subject,
      request_type,
      request_id,
      notes,
    } = req.body;

    const entry = await prisma.registry_entries.create({
      data: {
        registry_no,
        direction,
        date: new Date(date),
        from_entity,
        to_entity,
        subject,
        request_type,
        request_id: request_id ? BigInt(request_id) : null,
        notes,
      },
    });

    res.json({
      message: "تم إنشاء سجل صادر/وارد",
      entry: serializeBigInt(entry),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ====================== UPDATE ======================
export const updateRegistryEntry = async (req, res) => {
  try {
    const {
      registry_no,
      direction,
      date,
      from_entity,
      to_entity,
      subject,
      request_type,
      request_id,
      notes,
    } = req.body;

    const updated = await prisma.registry_entries.update({
      where: { id: BigInt(req.params.id) },
      data: {
        registry_no,
        direction,
        date: date ? new Date(date) : undefined,
        from_entity,
        to_entity,
        subject,
        request_type,
        request_id: request_id ? BigInt(request_id) : undefined,
        notes,
      },
    });

    res.json({ message: "تم تعديل السجل", updated: serializeBigInt(updated) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ====================== DELETE ======================
export const deleteRegistryEntry = async (req, res) => {
  try {
    await prisma.registry_entries.delete({
      where: { id: BigInt(req.params.id) },
    });

    res.json({ message: "تم حذف السجل" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
