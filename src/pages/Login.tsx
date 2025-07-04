import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Lock, User, Crown } from 'lucide-react';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    login(userId, apiKey, isAdmin ? 'admin' : 'user');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full shadow-lg shadow-blue-500/25">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Data Sentinel</h2>
          <p className="mt-2 text-slate-400">Secure your data with confidence</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg shadow-slate-900/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-300 mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your user ID"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your API key"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsAdmin(!isAdmin)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                  ${isAdmin ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-slate-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                    ${isAdmin ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-slate-300">Admin Access</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Demo credentials: <span className="text-blue-400">aditya123</span> / <span className="text-blue-400">007085</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;