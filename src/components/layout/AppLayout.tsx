import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content space */}
      <div className="flex flex-col lg:pl-64 min-h-screen">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic page content container */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
