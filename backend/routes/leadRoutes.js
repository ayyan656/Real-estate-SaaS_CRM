import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  assignLead,
  deleteLead,
} from "../controllers/leadController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getLeads);
router.get("/:id", getLeadById);

// Protected routes
router.post("/", protect, createLead);
router.put("/:id", protect, updateLead);
router.patch("/:id/status", protect, updateLeadStatus);
router.patch("/:id/assign", protect, assignLead);
router.delete("/:id", protect, deleteLead);

export default router;
