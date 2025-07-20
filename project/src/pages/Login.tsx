import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Navigate } from 'react-router-dom';
import { Shield, Lock, User, Crown } from 'lucide-react';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(userId, apiKey);
      if (success) {
        addNotification('success', 'Login successful!');
      } else {
        addNotification('error', 'Invalid credentials');
      }
    } catch (error) {
      addNotification('error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const users = [
    { id: 'aditya123', name: 'Aditya Ankanath', role: 'user' },
    { id: 'ace277', name: 'Anirudh C', role: 'user' },
    { id: 'tulya343', name: 'Tulya Reddy', role: 'user' },
    { id: 'admin', name: 'System Admin', role: 'admin' }
  ];

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

            <Button
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-slate-400 mb-4 text-center">Available Users:</p>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900/70 transition-colors"
                  onClick={() => {
                    setUserId(user.id);
                    setApiKey('007085');
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {user.role === 'admin' ? (
                      <Crown className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <User className="h-4 w-4 text-blue-400" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-slate-400 text-xs">{user.id}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              API Key: <span className="text-blue-400">007085</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;