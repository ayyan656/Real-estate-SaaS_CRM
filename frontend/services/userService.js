import apiClient from "./apiClient";

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/users/register", userData);
    if (response.token) {
      localStorage.setItem("authToken", response.token);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/users/login", credentials);
    if (response.token) {
      localStorage.setItem("authToken", response.token);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all users
export const getUsers = async () => {
  try {
    return await apiClient.get("/users");
  } catch (error) {
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    return await apiClient.get(`/users/${userId}`);
  } catch (error) {
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    return await apiClient.put(`/users/${userId}`, userData);
  } catch (error) {
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    return await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("authToken");
};
