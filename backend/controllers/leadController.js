import Lead from "../models/Lead.js";
import { io } from "../server.js";

// Create lead
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, budget, interest } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      budget,
      interest,
      activities: [
        {
          type: "creation",
          description: "Lead created",
          date: new Date(),
        },
      ],
    });
    // Emit real-time event
    io.emit("new-lead", lead);
    res.status(201).json({ message: "Lead created successfully", lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("assignedTo", "name email")
      .populate("propertyInterest", "title price");
    res.status(200).json({ leads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lead by ID
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("propertyInterest", "title price");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update lead
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead updated", lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update lead status
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          activities: {
            type: "status_change",
            description: `Status changed to ${status}`,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Emit real-time event if lead is closed
    if (status === "Closed") {
      io.emit("lead-closed", lead);
    }

    res.status(200).json({ message: "Lead status updated", lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign lead to agent
export const assignLead = async (req, res) => {
  try {
    const { agentId } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: agentId,
        $push: {
          activities: {
            type: "assignment",
            description: "Lead assigned to agent",
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead assigned", lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete lead
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
