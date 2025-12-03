import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button.jsx";
import { Card } from "./ui/Card.jsx";
import {
  uploadPropertyImages,
  deletePropertyImage,
} from "../services/propertyImageService.js";

export const PropertyImageUploader = ({
  propertyId,
  property,
  onPropertyUpdate,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const acceptFiles = (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const arr = Array.from(incomingFiles);

    const maxFiles = 10;
    const maxSizeBytes = 5 * 1024 * 1024;

    const filtered = arr
      .filter((f) => f.size <= maxSizeBytes)
      .slice(0, maxFiles);

    if (filtered.length === 0) {
      setError("No valid files selected (max 5MB each).");
      return;
    }

    setError(null);
    setFiles((prev) => [...prev, ...filtered]);
  };

  const handleInputChange = (e) => {
    acceptFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    acceptFiles(e.dataTransfer.files);
  };

  const handleRemoveSelected = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError("No files to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await uploadPropertyImages(propertyId, files);
      onPropertyUpdate(result.property);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExisting = async (imageIndex) => {
    if (!window.confirm("Delete this image?")) return;
    setLoading(true);
    setError(null);
    try {
      const result = await deletePropertyImage(propertyId, imageIndex);
      onPropertyUpdate(result.property);
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-accent bg-accent/10"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          <input
            ref={inputRef}
            id={`property-image-input-${propertyId}`}
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={loading}
          />

          <label
            htmlFor={`property-image-input-${propertyId}`}
            className="cursor-pointer block"
            onClick={(e) => {
            }}
          >
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm font-medium mb-1">
              {dragActive
                ? "Drop images here"
                : "Drag images here or click to select"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maximum 10 images per upload, 5MB each
            </p>
          </label>
        </div>

        {previews && previews.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                Selected Images ({previews.length})
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setFiles([]);
                    setPreviews([]);
                  }}
                  variant="ghost"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  isLoading={loading}
                >
                  Upload
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {previews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative rounded overflow-hidden border"
                >
                  <img
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Uploading...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </Card>

      {/* Existing images gallery (from DB/cloudinary) */}
      {property?.images && property.images.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Property Images ({property.images.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {property.images.map((image, index) => (
              <div
                key={image.publicId || index}
                className="relative group rounded overflow-hidden border"
              >
                <img
                  src={image.url}
                  alt={`property-${index}`}
                  className="w-full h-32 object-cover"
                />

                <button
                  onClick={() => handleDeleteExisting(index)}
                  disabled={loading}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Delete image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PropertyImageUploader;
