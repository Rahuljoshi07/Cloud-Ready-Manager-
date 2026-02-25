import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '../common/ErrorBoundary';
import { useQuery } from '@tanstack/react-query';
import costService from '../../services/costService';

export default function Layout() {
  const { data: alertsData } = useQuery({
    queryKey: ['alerts-count'],
    queryFn: costService.getAlerts,
    staleTime: 60000,
  });

  const openAlertCount = Array.isArray(alertsData)
    ? alertsData.filter((a) => a.status === 'active' || a.status === 'open').length
    : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header alertCount={openAlertCount} />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
