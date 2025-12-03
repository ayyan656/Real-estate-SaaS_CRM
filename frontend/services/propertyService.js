import apiClient from "./apiClient";

// Create property
export const createProperty = async (propertyData) => {
  try {
    return await apiClient.post("/properties", propertyData);
  } catch (error) {
    throw error;
  }
};

// Get all properties
export const getProperties = async () => {
  try {
    return await apiClient.get("/properties");
  } catch (error) {
    throw error;
  }
};

// Get featured properties
export const getFeaturedProperties = async () => {
  try {
    return await apiClient.get("/properties/featured");
  } catch (error) {
    throw error;
  }
};

// Get property by ID
export const getPropertyById = async (propertyId) => {
  try {
    return await apiClient.get(`/properties/${propertyId}`);
  } catch (error) {
    throw error;
  }
};

// Update property
export const updateProperty = async (propertyId, propertyData) => {
  try {
    return await apiClient.put(`/properties/${propertyId}`, propertyData);
  } catch (error) {
    throw error;
  }
};

// Delete property
export const deleteProperty = async (propertyId) => {
  try {
    return await apiClient.delete(`/properties/${propertyId}`);
  } catch (error) {
    throw error;
  }
};

// Search properties by filters
export const searchProperties = async (filters) => {
  try {
    const queryString = new URLSearchParams(filters).toString();
    return await apiClient.get(`/properties?${queryString}`);
  } catch (error) {
    throw error;
  }
};
