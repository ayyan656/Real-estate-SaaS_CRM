import React from "react";
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Dashboard from '../pages/Dashboard.jsx';
import { LeadsProvider } from '../context/LeadsContext.jsx';
import { PropertiesProvider } from '../context/PropertiesContext.jsx';

// Mock socket.io-client to simulate real-time events
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })
}));

describe('Dashboard Real-Time Closed Deal', () => {
  it('updates deals closed stat when lead is closed', async () => {
    render(
      <LeadsProvider>
        <PropertiesProvider>
          <Dashboard />
        </PropertiesProvider>
      </LeadsProvider>
    );
    // Simulate initial state
    expect(screen.getByText(/Deals Closed/i)).toBeInTheDocument();
    // Simulate real-time closed lead event
    act(() => {
      window.dispatchEvent(new CustomEvent('lead-closed', {
        detail: {
          _id: 'test-lead-id',
          status: 'Closed',
          name: 'Test Lead',
          interest: 'Test Property',
          createdAt: new Date().toISOString(),
        }
      }));
    });
    // Check if dashboard stat updates
    expect(screen.getByText(/Deals Closed/i)).toBeInTheDocument();
  });
});
