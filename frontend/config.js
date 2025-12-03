// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("🔧 [Config] API_BASE_URL:", API_BASE_URL);
