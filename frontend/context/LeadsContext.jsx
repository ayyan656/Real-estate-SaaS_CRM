import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getLeads,
  createLead,
  updateLead,
  updateLeadStatus as updateLeadStatusService,
  assignLead,
  deleteLead,
} from "../services/leadService";

const LeadStatus = {
  New: "New",
  Contacted: "Contacted",
  Viewing: "Viewing",
  Negotiation: "Negotiation",
  Closed: "Closed",
};

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await getLeads();
      setLeads(response.leads || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch leads");
      console.error("Error fetching leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addLead = async (leadData) => {
    try {
      const response = await createLead(leadData);
      setLeads((prev) => [response.lead, ...prev]);
      return response.lead;
    } catch (err) {
      setError(err.message || "Failed to create lead");
      throw err;
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      const response = await updateLeadStatusService(id, status);
      setLeads((prev) =>
        prev.map((lead) => (lead._id === id ? response.lead : lead))
      );
      return response.lead;
    } catch (err) {
      setError(err.message || "Failed to update lead status");
      throw err;
    }
  };

  const updateLeadInfo = async (id, updates) => {
    try {
      const response = await updateLead(id, updates);
      setLeads((prev) =>
        prev.map((lead) => (lead._id === id ? response.lead : lead))
      );
      return response.lead;
    } catch (err) {
      setError(err.message || "Failed to update lead");
      throw err;
    }
  };

  const assignLeadToAgent = async (id, agentId) => {
    try {
      const response = await assignLead(id, agentId);
      setLeads((prev) =>
        prev.map((lead) => (lead._id === id ? response.lead : lead))
      );
      return response.lead;
    } catch (err) {
      setError(err.message || "Failed to assign lead");
      throw err;
    }
  };

  const removeLead = async (id) => {
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((lead) => lead._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete lead");
      throw err;
    }
  };

  return (
    <LeadsContext.Provider
      value={{
        leads,
        isLoading,
        error,
        addLead,
        updateLeadStatus,
        updateLead: updateLeadInfo,
        assignLead: assignLeadToAgent,
        deleteLead: removeLead,
        fetchLeads,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
};
