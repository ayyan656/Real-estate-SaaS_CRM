import React, { useState, useRef } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyImageUploader } from "../components/PropertyImageUploader";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import {
  Plus,
  Search,
  Sparkles,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Filter,
  RotateCcw,
} from "lucide-react";
import { generatePropertyDescription } from "../services/geminiService";
import { useProperties } from "../context/PropertiesContext";

const PropertyType = {
  House: "House",
  Apartment: "Apartment",
  Commercial: "Commercial",
  Land: "Land",
};

const PropertyStatus = {
  Active: "Active",
  Sold: "Sold",
  Draft: "Draft",
};

const INITIAL_FORM_STATE = {
  title: "",
  address: "",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  status: PropertyStatus.Active,
  type: PropertyType.House,
  specs: "", 
  vibe: "",
  description: "",
  image: "",
};

export const Properties = () => {
  const {
    properties = [],
    addProperty,
    updateProperty,
    deleteProperty,
    fetchProperties,
    isLoading,
    error,
  } = useProperties();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newlyCreatedPropertyId, setNewlyCreatedPropertyId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Property Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);

  // Filter Logic
  const filteredProperties = properties.filter((p) => {
    // 1. Search Query
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Property Type
    const matchesType = filterType === "All" || p.type === filterType;

    // 3. Property Status
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;

    // 4. Price Range
    const matchesMinPrice =
      !priceRange.min || p.price >= Number(priceRange.min);
    const matchesMaxPrice =
      !priceRange.max || p.price <= Number(priceRange.max);

    // 5. Beds & Baths
    const matchesBeds = !minBeds || p.beds >= Number(minBeds);
    const matchesBaths = !minBaths || p.baths >= Number(minBaths);

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesBeds &&
      matchesBaths
    );
  });

  const resetFilters = () => {
    setSearchQuery("");
    setFilterType("All");
    setFilterStatus("All");
    setPriceRange({ min: "", max: "" });
    setMinBeds("");
    setMinBaths("");
  };

  const handleAiGenerate = async () => {
    if (!formData.title || !formData.specs) return;
    setIsGenerating(true);
    try {
      const desc = await generatePropertyDescription(
        formData.title,
        formData.specs,
        formData.vibe || "Professional and inviting"
      );
      setFormData((prev) => ({ ...prev, description: desc }));
    } catch (error) {
      alert("Failed to generate description. Check console or API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

  const openEditModal = (property) => {
    setEditingId(property._id);
    setFormData({
      title: property.title,
      address: property.address,
      price: property.price.toString(),
      beds: property.beds.toString(),
      baths: property.baths.toString(),
      sqft: property.sqft.toString(),
      status: property.status,
      type: property.type,
      specs: "", // Reset AI helpers
      vibe: "",
      description: property.description || "",
      image: property.image,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Fallback image if none provided
    const propertyImage =
      formData.image || `https://picsum.photos/400/300?random=${Date.now()}`;

    try {
      const propertyData = {
        title: formData.title,
        address: formData.address,
        price: Number(formData.price),
        beds: Number(formData.beds) || 0,
        baths: Number(formData.baths) || 0,
        sqft: Number(formData.sqft) || 0,
        type: formData.type,
        status: formData.status,
        description: formData.description,
        image: propertyImage,
      };

      if (editingId) {
        // Update Existing
        console.log(`✏️ Updating property: ${editingId}`);
        console.log(`📋 Property data:`, propertyData);
        await updateProperty(editingId, propertyData);
        console.log(`✅ Property updated successfully!`);
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(INITIAL_FORM_STATE);
      } else {
        // Create New
        console.log(`🏠 Creating new property listing...`);
        console.log(`📋 Property data:`, propertyData);
        const newProperty = await addProperty(propertyData);
        console.log(`✅ Property listing created successfully!`);
        console.log(`📸 New Property ID: ${newProperty._id}`);
        console.log(`💡 Tip: Now upload images for this property!`);

        // Keep modal open and show image uploader
        setNewlyCreatedPropertyId(newProperty._id);
        setEditingId(newProperty._id);
        // Don't close modal - user can upload images now
      }
    } catch (err) {
      console.error(`❌ Error saving property:`, err.message || err);
      alert("Error saving property: " + (err.message || "Unknown error"));
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteProperty(deleteId);
        setDeleteId(null);
      } catch (err) {
        alert("Error deleting property: " + (err.message || "Unknown error"));
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewlyCreatedPropertyId(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const handlePropertyUpdate = async (updatedProperty) => {
    console.log(`✅ Images updated for property: ${updatedProperty._id}`);
    await fetchProperties();
    // Optionally close modal
    closeModal();
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-3 w-full sm:w-auto flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <Input
                placeholder="Search properties by title or address..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "primary" : "secondary"}
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter size={18} />}
              className="shrink-0"
            >
              Filters
            </Button>
            {/* Show reset button if any filter is active */}
            {(searchQuery ||
              filterType !== "All" ||
              filterStatus !== "All" ||
              priceRange.min ||
              priceRange.max ||
              minBeds ||
              minBaths) && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="shrink-0 text-slate-500"
                title="Reset Filters"
              >
                <RotateCcw size={18} />
              </Button>
            )}
          </div>
          <Button
            onClick={openAddModal}
            icon={<Plus size={18} />}
            className="shrink-0"
          >
            Add Property
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                label="Property Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { label: "All Types", value: "All" },
                  { label: "House", value: PropertyType.House },
                  { label: "Apartment", value: PropertyType.Apartment },
                  { label: "Commercial", value: PropertyType.Commercial },
                  { label: "Land", value: PropertyType.Land },
                ]}
              />
              <Select
                label="Property Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: "All Statuses", value: "All" },
                  { label: "Active", value: PropertyStatus.Active },
                  { label: "Sold", value: PropertyStatus.Sold },
                  { label: "Draft", value: PropertyStatus.Draft },
                ]}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-accent"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-accent"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Beds"
                  type="number"
                  placeholder="Any"
                  value={minBeds}
                  onChange={(e) => setMinBeds(e.target.value)}
                />
                <Input
                  label="Min Baths"
                  type="number"
                  placeholder="Any"
                  value={minBaths}
                  onChange={(e) => setMinBaths(e.target.value)}
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            // Ensure property.image is set from images array
            const imageUrl = property.images?.[0]?.url || property.image || "";
            return (
              <PropertyCard
                key={property._id}
                property={{ ...property, image: imageUrl }}
                onClick={() => openEditModal(property)}
                onDelete={(e) => {
                  e.stopPropagation();
                  setDeleteId(property._id);
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No properties found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Try adjusting your filters or search query.
          </p>
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="mt-4 text-accent"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Add/Edit Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {newlyCreatedPropertyId
                  ? "🎉 Property Created! Now Upload Images"
                  : editingId
                  ? "Edit Property"
                  : "Add New Property"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>

            {newlyCreatedPropertyId ? (
              // Show image uploader for newly created property
              <div className="p-6">
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                    ✅ Property created successfully! Now upload images to
                    complete your listing.
                  </p>
                </div>
                <PropertyImageUploader
                  propertyId={newlyCreatedPropertyId}
                  property={properties.find(
                    (p) => p._id === newlyCreatedPropertyId
                  )}
                  onPropertyUpdate={handlePropertyUpdate}
                />
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="secondary" onClick={closeModal}>
                    Done (Skip Images)
                  </Button>
                </div>
              </div>
            ) : (
              // Show form for creating or editing property
              <form onSubmit={handleSave} className="p-6 space-y-6">
                {/* Multi-image Upload Section */}
                <PropertyImageUploader
                  propertyId={editingId}
                  property={properties.find((p) => p._id === editingId)}
                  onPropertyUpdate={handlePropertyUpdate}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Property Title"
                    placeholder="e.g. Sunny Villa"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Price ($)"
                    type="number"
                    placeholder="500000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Address"
                    className="md:col-span-2"
                    placeholder="123 Street Name"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Beds"
                    type="number"
                    value={formData.beds}
                    onChange={(e) =>
                      setFormData({ ...formData, beds: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Baths"
                    type="number"
                    step="0.5"
                    value={formData.baths}
                    onChange={(e) =>
                      setFormData({ ...formData, baths: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Sqft"
                    type="number"
                    value={formData.sqft}
                    onChange={(e) =>
                      setFormData({ ...formData, sqft: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    options={[
                      { label: "House", value: PropertyType.House },
                      { label: "Apartment", value: PropertyType.Apartment },
                      { label: "Commercial", value: PropertyType.Commercial },
                      { label: "Land", value: PropertyType.Land },
                    ]}
                  />
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    options={[
                      { label: "Active", value: PropertyStatus.Active },
                      { label: "Draft", value: PropertyStatus.Draft },
                      { label: "Sold", value: PropertyStatus.Sold },
                    ]}
                  />
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      AI Description Generator
                    </h3>
                    <Badge variant="info">Gemini 2.5 Flash</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Key Features/Specs"
                      placeholder="3 bed, 2 bath, garden, renovated kitchen"
                      value={formData.specs}
                      onChange={(e) =>
                        setFormData({ ...formData, specs: e.target.value })
                      }
                    />
                    <Input
                      label="Vibe/Tone"
                      placeholder="Luxury, Cozy, Modern, Family-friendly"
                      value={formData.vibe}
                      onChange={(e) =>
                        setFormData({ ...formData, vibe: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end mb-4">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAiGenerate}
                      isLoading={isGenerating}
                      icon={<Sparkles size={16} className="text-purple-600" />}
                      disabled={!formData.title || !formData.specs}
                    >
                      Generate Description
                    </Button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent h-32"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Property description will appear here..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <Button type="button" variant="ghost" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" icon={<Save size={18} />}>
                    {editingId && !newlyCreatedPropertyId
                      ? "Save Changes"
                      : "Create Listing"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Delete Property?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Are you sure you want to delete this property? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
