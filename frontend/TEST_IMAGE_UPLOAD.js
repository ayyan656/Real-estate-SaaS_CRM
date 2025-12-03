/**
` * EstateFlow Image Upload Test Suite
 * This script tests the image upload functionality for properties in EstateFlow.
 * It covers authentication, property creation, image upload, fetching properties,
 * and deleting images.
 */

console.log(
  "%c🚀 EstateFlow Image Upload Test Suite",
  "font-size: 16px; font-weight: bold; color: #007bff;"
);
console.log(
  "%c================================================",
  "font-size: 12px; color: #666;"
);

// Get API base URL
const API_BASE_URL = "http://localhost:5000/api";

// Test 1: Check if user is authenticated
async function testAuthentication() {
  console.log(
    "\n%c📋 TEST 1: Authentication Check",
    "font-size: 14px; font-weight: bold; color: #28a745;"
  );

  const userJSON = localStorage.getItem("estateflow_user");
  if (!userJSON) {
    console.warn("❌ No user found in localStorage. Please login first!");
    return null;
  }

  const user = JSON.parse(userJSON);
  console.log("✅ User authenticated:", {
    id: user.id,
    name: user.name,
    email: user.email,
    token: user.token ? "✅ Present" : "❌ Missing",
  });

  return user;
}

// Test 2: Create a test property
async function testCreateProperty() {
  console.log(
    "\n%c📋 TEST 2: Create Property",
    "font-size: 14px; font-weight: bold; color: #28a745;"
  );

  const user = await testAuthentication();
  if (!user) return null;

  const propertyData = {
    title: "Test Property - Image Upload",
    description: "This is a test property for image upload",
    address: "123 Main St, Test City, TC 12345",
    price: 500000,
    beds: 3,
    baths: 2,
    sqft: 2500,
    type: "House",
  };

  try {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(propertyData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Property created successfully:");
      console.log({
        propertyId: data.property._id,
        title: data.property.title,
        address: data.property.address,
      });
      return data.property;
    } else {
      console.error("❌ Failed to create property:", data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Error creating property:", error.message);
    return null;
  }
}

// Test 3: Upload test images
async function testImageUpload(propertyId) {
  console.log(
    "\n%c📋 TEST 3: Upload Images to Cloudinary",
    "font-size: 14px; font-weight: bold; color: #28a745;"
  );

  const user = await testAuthentication();
  if (!user || !propertyId) {
    console.error("❌ Missing user or property ID");
    return;
  }

  console.log("Creating test image from canvas...");

  // Create a test image using canvas
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  // Draw a test image
  ctx.fillStyle = "#FF6B6B";
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Test Property Image", 200, 150);
  ctx.font = "16px Arial";
  ctx.fillText("Generated: " + new Date().toLocaleString(), 200, 180);

  // Convert canvas to blob
  canvas.toBlob(async (blob) => {
    console.log("✅ Test image created:", {
      size: (blob.size / 1024).toFixed(2) + " KB",
      type: blob.type,
    });

    // Create FormData
    const formData = new FormData();
    formData.append("images", blob, "test-image-1.png");

    // Add second image
    const canvas2 = document.createElement("canvas");
    canvas2.width = 400;
    canvas2.height = 300;
    const ctx2 = canvas2.getContext("2d");
    ctx2.fillStyle = "#4ECDC4";
    ctx2.fillRect(0, 0, 400, 300);
    ctx2.fillStyle = "#FFFFFF";
    ctx2.font = "24px Arial";
    ctx2.textAlign = "center";
    ctx2.fillText("Property Image #2", 200, 150);

    canvas2.toBlob((blob2) => {
      formData.append("images", blob2, "test-image-2.png");

      // Upload
      uploadWithFormData(propertyId, formData, user.token);
    });
  });
}

async function uploadWithFormData(propertyId, formData, token) {
  try {
    console.log(
      `\n🔄 Uploading images to: ${API_BASE_URL}/properties/${propertyId}/images`
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

    const data = await response.json();

    if (response.ok) {
      console.log(
        "%c✅ IMAGES UPLOADED SUCCESSFULLY!",
        "font-size: 14px; font-weight: bold; color: #28a745;"
      );
      console.log("📊 Upload Details:");
      console.table(
        data.images.map((img, idx) => ({
          index: idx,
          url: img.url.substring(0, 50) + "...",
          publicId: img.publicId,
        }))
      );

      console.log("\n✅ Images saved in Cloudinary:");
      data.images.forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.url}`);
      });

      return data.property;
    } else {
      console.error("❌ Upload failed:", data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    return null;
  }
}

// Test 4: Fetch updated property with images
async function testFetchProperty(propertyId) {
  console.log(
    "\n%c📋 TEST 4: Fetch Property with Images",
    "font-size: 14px; font-weight: bold; color: #28a745;"
  );

  if (!propertyId) {
    console.error("❌ Missing property ID");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`);
    const data = await response.json();

    if (response.ok) {
      const property = data.property;
      console.log("✅ Property fetched successfully:");
      console.log({
        title: property.title,
        imageCount: property.images?.length || 0,
        images: property.images,
      });

      if (property.images && property.images.length > 0) {
        console.log("\n📸 Image URLs:");
        property.images.forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img.url}`);
        });
      }

      return property;
    } else {
      console.error("❌ Failed to fetch property:", data.message);
    }
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
  }
}

// Test 5: Delete image
async function testDeleteImage(propertyId, imageIndex) {
  console.log(
    `\n%c📋 TEST 5: Delete Image (Index ${imageIndex})`,
    "font-size: 14px; font-weight: bold; color: #ff6b6b;"
  );

  const user = await testAuthentication();
  if (!user || !propertyId) return;

  try {
    console.log(
      `🔄 Deleting image from ${API_BASE_URL}/properties/${propertyId}/images/${imageIndex}`
    );

    const response = await fetch(
      `${API_BASE_URL}/properties/${propertyId}/images/${imageIndex}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Image deleted successfully!");
      console.log("Remaining images:", data.property.images?.length || 0);
      return data.property;
    } else {
      console.error("❌ Delete failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Delete error:", error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log(
    "\n%c🧪 STARTING FULL TEST SUITE",
    "font-size: 16px; font-weight: bold; color: #0066cc; background: #e6f2ff; padding: 10px;"
  );

  // Test 1: Auth
  const user = await testAuthentication();
  if (!user) {
    console.error(
      "%c❌ TESTS FAILED: User not authenticated",
      "font-size: 14px; color: #dc3545;"
    );
    return;
  }

  // Test 2: Create property
  const property = await testCreateProperty();
  if (!property) {
    console.error(
      "%c❌ TESTS FAILED: Could not create property",
      "font-size: 14px; color: #dc3545;"
    );
    return;
  }

  // Test 3: Upload images
  await testImageUpload(property._id);

  // Wait for upload to complete, then fetch
  setTimeout(() => {
    testFetchProperty(property._id).then((updatedProperty) => {
      if (
        updatedProperty &&
        updatedProperty.images &&
        updatedProperty.images.length > 0
      ) {
        console.log(
          "\n%c✅ ALL TESTS PASSED!",
          "font-size: 16px; font-weight: bold; color: #28a745; background: #d4edda; padding: 10px;"
        );
        console.log("\n📝 SUMMARY:");
        console.log(`   ✅ Property created: ${property.title}`);
        console.log(
          `   ✅ Images uploaded: ${updatedProperty.images.length} images`
        );
        console.log(`   ✅ Images saved in Cloudinary`);

        // Store property ID for manual testing
        window.testPropertyId = property._id;
        console.log(`\n💾 Saved property ID for later tests: ${property._id}`);
        console.log(`   Use: testFetchProperty("${property._id}")`);
        console.log(`   Use: testDeleteImage("${property._id}", 0)`);
      }
    });
  }, 3000);
}

// Easy commands to test manually
console.log(
  "\n%c🎯 QUICK TEST COMMANDS",
  "font-size: 14px; font-weight: bold; color: #0066cc;"
);
console.log("Run these in console:");
console.log("   runAllTests()                    - Run complete test suite");
console.log("   testAuthentication()             - Check if authenticated");
console.log("   testCreateProperty()             - Create test property");
console.log("   testFetchProperty(propertyId)    - Fetch property with images");
console.log("   testDeleteImage(propertyId, 0)   - Delete first image");

console.log(
  "\n%c📚 NEXT STEPS",
  "font-size: 14px; font-weight: bold; color: #ff9800;"
);
console.log("1. Run: runAllTests()");
console.log("2. Check Cloudinary dashboard: https://cloudinary.com/console");
console.log("3. Look for images in 'estateflow/properties' folder");
console.log("4. Check MongoDB to see property documents with image URLs");

console.log(
  "\n%c================================================",
  "font-size: 12px; color: #666;"
);
