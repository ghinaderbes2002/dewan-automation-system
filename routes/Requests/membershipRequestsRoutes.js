// import express from "express";
// import {
//   getMembershipRequests,
//   getMembershipRequestById,
//   createMembershipRequest,
//   updateMembershipRequest,
//   deleteMembershipRequest,
//   approveMembershipRequest,
//   // المستندات
//   addMembershipDocument,
//   updateMembershipDocument,
//   deleteMembershipDocument,
//   uploadMembershipDocument,
//   // الرسوم
//   addMembershipFee,
//   updateMembershipFee,
//   deleteMembershipFee,
//   // Death Aid Forms
//   addDeathAidForm,
//   updateDeathAidForm,
//   deleteDeathAidForm,
// } from "../../controller/Requests/membershipRequestsController.js";

// import { auth, allowRoles } from "../../middlewares/auth.js";
// import { uploadMembershipFields } from "../../middlewares/upload.js";



// const router = express.Router();

// // ================== Membership Requests ==================
// router.get(
//   "/",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   getMembershipRequests
// );
// router.get(
//   "/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   getMembershipRequestById
// );
// router.post(
//   "/",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   createMembershipRequest
// );
// router.patch(
//   "/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   updateMembershipRequest
// );
// router.delete(
//   "/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   deleteMembershipRequest
// );
// router.post(
//   "/:id/approve",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   approveMembershipRequest
// );

// // ================== Membership Documents ==================
// router.post(
//   "/documents",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   addMembershipDocument
// );
// router.patch(
//   "/documents/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   updateMembershipDocument
// );
// router.delete(
//   "/documents/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   deleteMembershipDocument
// );

// router.post("/upload", auth,
//   uploadMembershipFields, uploadMembershipDocument);


// // ================== Membership Fees ==================
// router.post(
//   "/fees",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   addMembershipFee
// );
// router.patch(
//   "/fees/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   updateMembershipFee
// );
// router.delete(
//   "/fees/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   deleteMembershipFee
// );

// // ================== Death Aid Forms ==================
// router.post(
//   "/death-aid",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   addDeathAidForm
// );
// router.patch(
//   "/death-aid/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   updateDeathAidForm
// );
// router.delete(
//   "/death-aid/:id",
//   auth,
//   allowRoles("MEMBERSHIP_AND_SERVICE"),
//   deleteDeathAidForm
// );

// export default router;



// routes/Requests/membershipRequestsRoutes.js
import express from "express";
import {
  getMembershipRequests,
  getMembershipRequestById,
  createMembershipRequest,
  updateMembershipRequest,
  deleteMembershipRequest,
  approveMembershipRequest,
  // المستندات
  getMembershipDocuments,
  addMembershipDocument,
  updateMembershipDocument,
  deleteMembershipDocument,
  uploadMembershipDocument,
  // الرسوم
  getMembershipFees,
  addMembershipFee,
  updateMembershipFee,
  deleteMembershipFee,
  // Death Aid Forms
  getDeathAidForms,
  addDeathAidForm,
  updateDeathAidForm,
  deleteDeathAidForm,
} from "../../controller/Requests/membershipRequestsController.js";

import { auth, allowRoles } from "../../middlewares/auth.js";
import { uploadMembershipFields } from "../../middlewares/upload.js";


const router = express.Router();

// ================== Membership Requests ==================

// كل الطلبات
router.get(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getMembershipRequests
);

// إنشاء طلب
router.post(
  "/",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  createMembershipRequest
);

// ================== Membership Documents ==================
// ⚠️ لازم تيجي قبل "/:id"
router.get(
  "/documents",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getMembershipDocuments
);

router.post(
  "/documents",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  addMembershipDocument
);

router.patch(
  "/documents/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  updateMembershipDocument
);

router.delete(
  "/documents/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  deleteMembershipDocument
);
router.post("/upload", auth,
  uploadMembershipFields, uploadMembershipDocument);


// ================== Membership Fees ==================
router.get(
  "/fees",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getMembershipFees
);

router.post(
  "/fees",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  addMembershipFee
);

router.patch(
  "/fees/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  updateMembershipFee
);

router.delete(
  "/fees/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  deleteMembershipFee
);

// ================== Death Aid Forms ==================
router.get(
  "/death-aid",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getDeathAidForms
);

router.post(
  "/death-aid",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  addDeathAidForm
);

router.patch(
  "/death-aid/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  updateDeathAidForm
);

router.delete(
  "/death-aid/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  deleteDeathAidForm
);

// ================== Routes تعتمد على :id (في الآخر) ==================
router.get(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  getMembershipRequestById
);

router.patch(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  updateMembershipRequest
);

router.delete(
  "/:id",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  deleteMembershipRequest
);

// اعتماد طلب
router.post(
  "/:id/approve",
  auth,
  allowRoles("MEMBERSHIP_AND_SERVICE"),
  approveMembershipRequest
);

export default router;
