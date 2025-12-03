import React from "react";
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeadsProvider } from '../context/LeadsContext.jsx';
import { PropertiesProvider } from '../context/PropertiesContext.jsx';
import { Leads } from '../pages/Leads.jsx';

// Mock socket.io-client to avoid real connection
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })
}));

// Mock updateLead to resolve with updated data
vi.mock('../services/leadService', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    updateLead: vi.fn(async (id, data) => ({ ...data, _id: id, status: 'New' })),
    getLeads: vi.fn(async () => ({ leads: [{ _id: '1', name: 'Test Lead', email: 'test@example.com', phone: '123', budget: 100, interest: 'House', notes: '', assignedTo: null, status: 'New' }] }))
  };
});

describe('Leads Profile Edit Integration', () => {
  it('should update lead, close modal, and not crash Kanban board', async () => {
    render(
      <LeadsProvider>
        <PropertiesProvider>
          <Leads />
        </PropertiesProvider>
      </LeadsProvider>
    );

    // Open the lead modal
    const leadCard = await screen.findByText('Test Lead');
    fireEvent.click(leadCard);

    // Click Edit Profile
    const editBtn = await screen.findByText('Edit Profile');
    fireEvent.click(editBtn);

    // Change name
    const nameInput = screen.getByPlaceholderText('Lead Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Lead' } });

    // Save changes
    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    // Modal should close and Kanban should not crash
    await waitFor(() => {
      expect(screen.queryByText('Save Changes')).toBeNull();
      expect(screen.getByText('Updated Lead')).toBeInTheDocument();
    });
  });
});
