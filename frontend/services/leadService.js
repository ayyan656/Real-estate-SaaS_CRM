import apiClient from "./apiClient";

// Create lead
export const createLead = async (leadData) => {
  try {
    return await apiClient.post("/leads", leadData);
  } catch (error) {
    throw error;
  }
};

// Get all leads
export const getLeads = async () => {
  try {
    return await apiClient.get("/leads");
  } catch (error) {
    throw error;
  }
};

// Get lead by ID
export const getLeadById = async (leadId) => {
  try {
    return await apiClient.get(`/leads/${leadId}`);
  } catch (error) {
    throw error;
  }
};

// Update lead
export const updateLead = async (leadId, leadData) => {
  try {
    const response = await apiClient.put(`/leads/${leadId}`, leadData);
    return response.lead;
  } catch (error) {
    throw error;
  }
};

// Update lead status
export const updateLeadStatus = async (leadId, status) => {
  try {
    return await apiClient.patch(`/leads/${leadId}/status`, { status });
  } catch (error) {
    throw error;
  }
};

// Assign lead to agent
export const assignLead = async (leadId, agentId) => {
  try {
    return await apiClient.patch(`/leads/${leadId}/assign`, { agentId });
  } catch (error) {
    throw error;
  }
};

// Delete lead
export const deleteLead = async (leadId) => {
  try {
    return await apiClient.delete(`/leads/${leadId}`);
  } catch (error) {
    throw error;
  }
};

// Get leads by status
export const getLeadsByStatus = async (status) => {
  try {
    const response = await apiClient.get("/leads");
    return response.leads.filter((lead) => lead.status === status);
  } catch (error) {
    throw error;
  }
};
