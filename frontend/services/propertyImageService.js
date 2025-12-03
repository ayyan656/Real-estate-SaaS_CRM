import { API_BASE_URL } from "../config.js";

const getAuthToken = () => {
  // get token from localStorage
  const token = localStorage.getItem("authToken");
  if (token) {
    console.log("✅ [Auth] Token found in localStorage");
    return token;
  }

  const userJSON = localStorage.getItem("estateflow_user");
  if (userJSON) {
    try {
      const user = JSON.parse(userJSON);
      if (user.token) {
        return user.token;
      }
    } catch (error) {
      console.error("❌ [Auth] Error parsing user data:", error);
    }
  }

  console.warn("⚠️ [Auth] No authentication token found");
  return null;
};

export const uploadPropertyImages = async (propertyId, files) => {
  try {
    console.log(`🚀 [API] Starting image upload for property: ${propertyId}`);
    console.log(`📦 [API] Files to upload: ${files.length}`);

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("images", file);
      console.log(
        `📄 [API] Added file ${index + 1}: ${file.name} (${(
          file.size / 1024
        ).toFixed(2)} KB)`
      );
    });

    const token = getAuthToken();
    console.log(
      `🔐 [API] Authorization token: ${token ? "Present ✓" : "Missing ✗"}`
    );
    console.log(
      `🌐 [API] POST Request to: ${API_BASE_URL}/properties/${propertyId}/images`
    );

    const response = await fetch(
      `${API_BASE_URL}/properties/${propertyId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    console.log(
      `📨 [API] Response Status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(
        `❌ [API] Server Error: ${error.message || "Unknown error"}`
      );
      throw new Error(error.message || "Failed to upload images");
    }

    const result = await response.json();
    console.log(`✅ [API] Upload successful!`);
    console.log(`☁️ [API] Images saved to Cloudinary:`);
    result.property.images.forEach((img, index) => {
      console.log(`   ${index + 1}. URL: ${img.url}`);
      console.log(`      Public ID: ${img.publicId}`);
    });
    console.log(
      `💾 [API] Images stored in MongoDB for property: ${result.property._id}`
    );

    return result;
  } catch (error) {
    console.error("❌ [API] Error uploading images:", error);
    throw error;
  }
};

export const deletePropertyImage = async (propertyId, imageIndex) => {
  try {
    console.log(
      `🗑️ [API] Starting image deletion for property: ${propertyId}, index: ${imageIndex}`
    );
    const token = getAuthToken();
    console.log(
      `🔐 [API] Authorization token: ${token ? "Present ✓" : "Missing ✗"}`
    );
    console.log(
      `🌐 [API] DELETE Request to: ${API_BASE_URL}/properties/${propertyId}/images/${imageIndex}`
    );

    const response = await fetch(
      `${API_BASE_URL}/properties/${propertyId}/images/${imageIndex}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      `📨 [API] Response Status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(
        `❌ [API] Server Error: ${error.message || "Unknown error"}`
      );
      throw new Error(error.message || "Failed to delete image");
    }

    const result = await response.json();
    console.log(
      `✅ [API] Image deleted successfully from Cloudinary and MongoDB!`
    );
    console.log(
      `📸 [API] Remaining images count: ${result.property.images.length}`
    );

    return result;
  } catch (error) {
    console.error("❌ [API] Error deleting image:", error);
    throw error;
  }
};
