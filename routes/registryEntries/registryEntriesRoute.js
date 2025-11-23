import express from "express";
import {
  getRegistryEntries,
  getRegistryEntryById,
  createRegistryEntry,
  updateRegistryEntry,
  deleteRegistryEntry,
} from "../../controller/registryEntries/registryEntriesController.js";

import { auth, allowRoles } from "../../middlewares/auth.js";

const router = express.Router();

// ================== CRUD ==================
// كل هالـ routes تتطلب توكن وصلاحية ISSUING
router.get("/", auth, allowRoles("ISSUING"), getRegistryEntries);
router.get("/:id", auth, allowRoles("ISSUING"), getRegistryEntryById);
router.post("/", auth, allowRoles("ISSUING"), createRegistryEntry);
router.patch("/:id", auth, allowRoles("ISSUING"), updateRegistryEntry);
router.delete("/:id", auth, allowRoles("ISSUING"), deleteRegistryEntry);

export default router;
