import React from "react";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard.jsx';
import { LeadsProvider } from '../context/LeadsContext.jsx';
import { PropertiesProvider } from '../context/PropertiesContext.jsx';

// Mock socket.io-client to avoid real connection
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })
}));

describe('Dashboard', () => {
  it('renders stats and recent leads', () => {
    render(
      <LeadsProvider>
        <PropertiesProvider>
          <Dashboard />
        </PropertiesProvider>
      </LeadsProvider>
    );
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Listings/i)).toBeInTheDocument();
    expect(screen.getByText(/New Leads/i)).toBeInTheDocument();
    expect(screen.getByText(/Deals Closed/i)).toBeInTheDocument();
  });
});
