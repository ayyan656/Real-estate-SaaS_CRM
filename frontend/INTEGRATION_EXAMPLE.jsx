// Example: How to integrate PropertyImageUploader into your Properties page

import { useState, useEffect } from "react";
import { useProperties } from "../context/PropertiesContext.jsx";
import PropertyImageUploader from "../components/PropertyImageUploader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";

export const PropertiesPageWithImageUpload = () => {
  const { properties, addProperty, updateProperty } = useProperties();
  const [editingId, setEditingId] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    beds: 0,
    baths: 0,
    sqft: 0,
    type: "House",
  });

  const handleEdit = (property) => {
    setEditingId(property._id);
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description || "",
      address: property.address,
      price: property.price,
      beds: property.beds || 0,
      baths: property.baths || 0,
      sqft: property.sqft || 0,
      type: property.type || "House",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateProperty(editingId, formData);
    } else {
      await addProperty(formData);
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      address: "",
      price: "",
      beds: 0,
      baths: 0,
      sqft: 0,
      type: "House",
    });
  };

  // Handle property update from image uploader
  const handlePropertyUpdate = (updatedProperty) => {
    setEditingProperty(updatedProperty);
    // Update in context if needed
    updateProperty(updatedProperty._id, updatedProperty);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Button
          onClick={() => {
            setEditingId(null);
            setEditingProperty(null);
            setFormData({
              title: "",
              description: "",
              address: "",
              price: "",
              beds: 0,
              baths: 0,
              sqft: 0,
              type: "House",
            });
            setShowModal(true);
          }}
        >
          + Add Property
        </Button>
      </div>

      {/* Modal for Creating/Editing Properties */}
      {showModal && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Property" : "Create Property"}
          </h2>

          {/* Property Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Property Title"
              value={formData.title}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            >
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
            </select>
            <input
              type="number"
              name="beds"
              placeholder="Bedrooms"
              value={formData.beds}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              name="baths"
              placeholder="Bathrooms"
              value={formData.baths}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              name="sqft"
              placeholder="Square Feet"
              value={formData.sqft}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full border rounded px-3 py-2"
          />

          {/* IMAGE UPLOADER COMPONENT - Add it here! */}
          {editingId && editingProperty && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Property Images</h3>
              <PropertyImageUploader
                propertyId={editingId}
                property={editingProperty}
                onPropertyUpdate={handlePropertyUpdate}
              />
            </div>
          )}

          {/* Save/Cancel Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </Card>
      )}

      {/* Properties List/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties?.map((property) => (
          <Card key={property._id} className="p-4 space-y-3">
            {/* Show first image if available */}
            {property.images && property.images.length > 0 && (
              <img
                src={property.images[0].url}
                alt={property.title}
                className="w-full h-40 object-cover rounded"
              />
            )}

            {/* Show badge with image count */}
            {property.images && property.images.length > 0 && (
              <span className="inline-block bg-accent text-white px-2 py-1 rounded text-xs">
                📸 {property.images.length} images
              </span>
            )}

            <h3 className="font-semibold">{property.title}</h3>
            <p className="text-sm text-slate-600">{property.address}</p>
            <p className="text-lg font-bold">
              ${property.price?.toLocaleString()}
            </p>
            <p className="text-sm">
              {property.beds} beds • {property.baths} baths • {property.sqft}{" "}
              sqft
            </p>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleEdit(property)}>
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertiesPageWithImageUpload;

/**
 * Key Integration Points:
 *
 * 1. Import PropertyImageUploader:
 *    import PropertyImageUploader from "../components/PropertyImageUploader.jsx";
 *
 * 2. Add state for editing property:
 *    const [editingProperty, setEditingProperty] = useState(null);
 *
 * 3. Load property when editing:
 *    const handleEdit = (property) => {
 *      setEditingId(property._id);
 *      setEditingProperty(property);
 *    };
 *
 * 4. Add component to modal/form:
 *    {editingId && editingProperty && (
 *      <PropertyImageUploader
 *        propertyId={editingId}
 *        property={editingProperty}
 *        onPropertyUpdate={handlePropertyUpdate}
 *      />
 *    )}
 *
 * 5. Handle property updates:
 *    const handlePropertyUpdate = (updatedProperty) => {
 *      setEditingProperty(updatedProperty);
 *    };
 *
 * 6. Display images in property cards:
 *    {property.images && property.images.length > 0 && (
 *      <img src={property.images[0].url} alt={property.title} />
 *    )}
 */
