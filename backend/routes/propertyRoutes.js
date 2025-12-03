import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  uploadPropertyImages,
  deletePropertyImage,
} from "../controllers/propertyController.js";
import { protect } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Public routes
router.get("/", getProperties);
router.get("/featured", getFeaturedProperties);
router.get("/:id", getPropertyById);

// Protected routes
router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

// Image upload routes
router.post(
  "/:id/images",
  protect,
  upload.array("images", 10),
  uploadPropertyImages
);
router.delete("/:propertyId/images/:imageIndex", protect, deletePropertyImage);

export default router;
