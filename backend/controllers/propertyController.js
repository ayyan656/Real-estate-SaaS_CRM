import Property from "../models/Property.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../config/cloudinary.js";

// Create property
export const createProperty = async (req, res) => {
  try {
    const { title, description, address, price, beds, baths, sqft, type } =
      req.body;

    const property = await Property.create({
      title,
      description,
      address,
      price,
      beds,
      baths,
      sqft,
      type,
      agent: req.user?.id,
      images: [],
    });

    res
      .status(201)
      .json({ message: "Property created successfully", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload images for a property
export const uploadPropertyImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files provided" });
    }

    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Upload each image to Cloudinary
    const uploadedImages = [];
    for (const file of req.files) {
      try {
        const result = await uploadImageToCloudinary(
          file.buffer,
          `${propertyId}-${Date.now()}-${file.originalname}`
        );
        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
        return res
          .status(500)
          .json({ message: "Error uploading image: " + uploadError.message });
      }
    }

    // Add images to property
    property.images = [...property.images, ...uploadedImages];
    await property.save();

    res.status(200).json({
      message: "Images uploaded successfully",
      images: uploadedImages,
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete image from property
export const deletePropertyImage = async (req, res) => {
  try {
    const { propertyId, imageIndex } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const imageToDelete = property.images[imageIndex];
    if (!imageToDelete) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary if publicId exists
    if (imageToDelete.publicId) {
      try {
        await deleteImageFromCloudinary(imageToDelete.publicId);
      } catch (deleteError) {
        console.error("Error deleting from Cloudinary:", deleteError);
      }
    }

    // Remove from property images array
    property.images.splice(imageIndex, 1);
    await property.save();

    res.status(200).json({
      message: "Image deleted successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("agent", "name email");
    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "agent",
      "name email"
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property updated", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured properties
export const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ featured: true }).limit(6);
    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
