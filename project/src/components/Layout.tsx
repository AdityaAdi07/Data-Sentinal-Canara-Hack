import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationToast from './NotificationToast';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
      <NotificationToast />
    </div>
  );
};

export default Layout;