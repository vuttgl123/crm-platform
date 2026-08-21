import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  return (
    <div className="font-body-md text-on-surface flex flex-col min-h-screen bg-[#FAFBFC]">
      <Header />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-0 overflow-y-auto p-md md:p-lg bg-[#FAFBFC] md:ml-56">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
