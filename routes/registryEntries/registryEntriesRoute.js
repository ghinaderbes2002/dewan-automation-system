import express from "express";
import {
  getRegistryEntries,
  getRegistryEntryById,
  createRegistryEntry,
  updateRegistryEntry,
  deleteRegistryEntry,
} from "../../controller/registryEntries/registryEntriesController.js";

const router = express.Router();

// CRUD
router.get("/", getRegistryEntries);
router.get("/:id", getRegistryEntryById);
router.post("/", createRegistryEntry);
router.patch("/:id", updateRegistryEntry);
router.delete("/:id", deleteRegistryEntry);

export default router;
