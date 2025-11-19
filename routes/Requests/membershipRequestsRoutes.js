import express from "express";
import {
  getMembershipRequests,
  getMembershipRequestById,
  createMembershipRequest,
  updateMembershipRequest,
  deleteMembershipRequest,
  approveMembershipRequest,
  // المستندات
  addMembershipDocument,
  updateMembershipDocument,
  deleteMembershipDocument,
  // الرسوم
  addMembershipFee,
  updateMembershipFee,
  deleteMembershipFee,
  // Death Aid Forms
  addDeathAidForm,
  updateDeathAidForm,
  deleteDeathAidForm,
} from "../../controller/Requests/membershipRequestsController.js";

const router = express.Router();

// ================== Membership Requests ==================
router.get("/", getMembershipRequests);
router.get("/:id", getMembershipRequestById);
router.post("/", createMembershipRequest);
router.patch("/:id", updateMembershipRequest);
router.delete("/:id", deleteMembershipRequest);
router.post("/:id/approve", approveMembershipRequest);

// ================== Membership Documents ==================
router.post("/documents", addMembershipDocument);
router.patch("/documents/:id", updateMembershipDocument);
router.delete("/documents/:id", deleteMembershipDocument);

// ================== Membership Fees ==================
router.post("/fees", addMembershipFee);
router.patch("/fees/:id", updateMembershipFee);
router.delete("/fees/:id", deleteMembershipFee);

// ================== Death Aid Forms ==================
router.post("/death-aid", addDeathAidForm);
router.patch("/death-aid/:id", updateDeathAidForm);
router.delete("/death-aid/:id", deleteDeathAidForm);

export default router;
