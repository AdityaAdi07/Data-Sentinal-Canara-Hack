import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Home, 
  Settings, 
  Eye, 
  Droplets, 
  FileText, 
  Bell, 
  Activity, 
  Users, 
  TrendingUp,
  Menu,
  X,
  Folder,
  Share
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userNavItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Folder, label: 'My Files', path: '/my-files' },
    { icon: Share, label: 'Partner Files', path: '/partner-files' },
    { icon: Settings, label: 'Consent', path: '/consent' },
    { icon: Eye, label: 'Honeytokens', path: '/honeytokens' },
    { icon: Droplets, label: 'Watermarking', path: '/watermarking' },
    { icon: FileText, label: 'Policies', path: '/policies' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Activity, label: 'Access Logs', path: '/access-logs' },
  ];

  const adminNavItems = [
    { icon: Home, label: 'Admin Dashboard', path: '/admin' },
    { icon: Users, label: 'Partners', path: '/partners' },
    { icon: TrendingUp, label: 'Risk Monitoring', path: '/risk-monitoring' },
    ...userNavItems.filter(item => !['Dashboard'].includes(item.label))
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const NavLink: React.FC<{ icon: React.ComponentType<any>, label: string, path: string }> = ({ icon: Icon, label, path }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-blue-400 shadow-lg shadow-blue-500/10' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-teal-400'}`} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 p-6 border-b border-slate-700/50">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Data Sentinel</h1>
              <p className="text-sm text-slate-400">Data Protection Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </nav>

          {/* Status Indicator */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;