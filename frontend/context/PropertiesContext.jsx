import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
} from "../services/propertyService";

const PropertiesContext = createContext();

export const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await getProperties();
      setProperties(response.properties || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch properties");
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addProperty = async (propertyData) => {
    try {
      const response = await createProperty(propertyData);
      setProperties((prev) => [response.property, ...prev]);
      return response.property;
    } catch (err) {
      setError(err.message || "Failed to create property");
      throw err;
    }
  };

  const updatePropertyInfo = async (id, updates) => {
    try {
      const response = await updateProperty(id, updates);
      setProperties((prev) =>
        prev.map((prop) => (prop._id === id ? response.property : prop))
      );
      return response.property;
    } catch (err) {
      setError(err.message || "Failed to update property");
      throw err;
    }
  };

  const removeProperty = async (id) => {
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((prop) => prop._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete property");
      throw err;
    }
  };

  const getFeatured = async () => {
    try {
      const response = await getFeaturedProperties();
      return response.properties || [];
    } catch (err) {
      console.error("Error fetching featured properties:", err);
      return [];
    }
  };

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        isLoading,
        error,
        addProperty,
        updateProperty: updatePropertyInfo,
        deleteProperty: removeProperty,
        fetchProperties,
        getFeatured,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error("useProperties must be used within a PropertiesProvider");
  }
  return context;
};
