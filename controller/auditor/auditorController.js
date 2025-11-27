import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🔥 تحويل BigInt → String
const convertBigIntToString = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

// 1) مشاهدة كل الطلبات المعلقة للتدقيق حسب النوع
// type: membership, training, office_opening, promotion
export const getPendingRequestsByType = async (req, res) => {
  const { type } = req.params;

  try {
    let requests;

    switch (type) {
      case "membership":
        requests = await prisma.membership_requests.findMany({
          where: { status: "draft" },
          include: { engineers: true, membership_documents: true },
        });
        break;

      case "training":
        requests = await prisma.training_requests.findMany({
          where: { status: "waiting_office" },
          include: { engineers: true, engineering_offices: true },
        });
        break;

      case "office_opening":
        requests = await prisma.office_opening_requests.findMany({
          where: { status: "under_review" },
          include: { engineers: true, engineering_offices: true },
        });
        break;

      case "promotion":
        requests = await prisma.promotion_requests.findMany({
          where: { status: "under_review" },
          include: { engineers: true },
        });
        break;

      default:
        return res.status(400).json({ message: "Unknown request type" });
    }

    res.json(convertBigIntToString(requests));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


// 2) مشاهدة تفاصيل طلب محدد حسب النوع
export const getRequestByIdAndType = async (req, res) => {
  const { type, id } = req.params;

  try {
    let request;

    switch (type) {
      case "membership":
        request = await prisma.membership_requests.findUnique({
          where: { id: BigInt(id) },
          include: { engineers: true, membership_documents: true },
        });
        break;

      case "training":
        request = await prisma.training_requests.findUnique({
          where: { id: BigInt(id) },
          include: { engineers: true, engineering_offices: true },
        });
        break;

      case "office_opening":
        request = await prisma.office_opening_requests.findUnique({
          where: { id: BigInt(id) },
          include: { engineers: true, engineering_offices: true },
        });
        break;

      case "promotion":
        request = await prisma.promotion_requests.findUnique({
          where: { id: BigInt(id) },
          include: { engineers: true },
        });
        break;

      default:
        return res.status(400).json({ message: "Unknown request type" });
    }

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json(convertBigIntToString(request));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ===============================
// 3) مراجعة الطلب وتحديث حالته حسب النوع
// body: { audit_notes, status }
// ===============================
export const auditRequestByType = async (req, res) => {
  const { type, id } = req.params;
  const { audit_notes, status } = req.body;

  try {
    let updatedRequest;

    switch (type) {
      case "membership":
        updatedRequest = await prisma.membership_requests.update({
          where: { id: BigInt(id) },
          data: {
            study_notes: audit_notes,
            study_date: new Date(),
            study_employee_id: req.user.id,
            status,
          },
        });
        break;

      case "training":
        updatedRequest = await prisma.training_requests.update({
          where: { id: BigInt(id) },
          data: {
            office_division_decision_summary: audit_notes,
            status,
          },
        });
        break;

      case "office_opening":
        updatedRequest = await prisma.office_opening_requests.update({
          where: { id: BigInt(id) },
          data: {
            office_division_decision_no: audit_notes,
            status,
          },
        });
        break;

      case "promotion":
        updatedRequest = await prisma.promotion_requests.update({
          where: { id: BigInt(id) },
          data: {
            first_committee_notes: audit_notes,
            status,
          },
        });
        break;

      default:
        return res.status(400).json({ message: "Unknown request type" });
    }

    res.json({
      message: "Request audited successfully",
      updatedRequest: convertBigIntToString(updatedRequest),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
