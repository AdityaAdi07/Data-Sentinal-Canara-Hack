import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Crown } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-white">
              {isAdmin ? 'Admin Panel' : 'User Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg">
              {isAdmin ? (
                <Crown className="h-4 w-4 text-yellow-400" />
              ) : (
                <User className="h-4 w-4 text-blue-400" />
              )}
              <span className="text-sm text-slate-300">{user?.id}</span>
              {isAdmin && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                  Admin
                </span>
              )}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;