import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { Eye, Plus, AlertTriangle, Clock, User, Hash } from 'lucide-react';

interface Honeytoken {
  record_id: string;
  name: string;
  email: string;
  timestamp: string;
  status: 'active' | 'triggered';
  accessed?: boolean;
  accessed_at?: string;
}

const Honeytokens: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [honeytokens, setHoneytokens] = useState<Honeytoken[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    triggered: 0
  });

  useEffect(() => {
    // Initialize with empty state since backend doesn't store honeytokens
    updateStats([]);
  }, []);

  const updateStats = (tokens: Honeytoken[]) => {
    setStats({
      total: tokens.length,
      active: tokens.filter(h => h.status === 'active').length,
      triggered: tokens.filter(h => h.status === 'triggered').length
    });
  };

  const generateHoneytoken = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      const tokenData = await apiService.generateHoneytoken(user.id);
      const newHoneytoken: Honeytoken = {
        record_id: tokenData.record_id,
        name: tokenData.name,
        email: tokenData.email,
        timestamp: tokenData.timestamp,
        status: 'active',
        accessed: false
      };
      
      const updatedTokens = [newHoneytoken, ...honeytokens];
      setHoneytokens(updatedTokens);
      updateStats(updatedTokens);
      addNotification('success', 'Honeytoken generated successfully');
    } catch (error) {
      console.error('Failed to generate honeytoken:', error);
      addNotification('error', 'Failed to generate honeytoken');
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateTrapHit = async (honeytokenId: string) => {
    if (!user?.id) return;
    
    try {
      // Simulate a partner accessing this honeytoken
      await apiService.simulateTrapHit('partner1', user.id);
      
      const updatedTokens = honeytokens.map(h => 
        h.record_id === honeytokenId 
          ? { ...h, status: 'triggered' as const, accessed: true, accessed_at: new Date().toISOString() }
          : h
      );
      setHoneytokens(updatedTokens);
      updateStats(updatedTokens);
      addNotification('warning', 'Honeytoken trap activated - Security alert generated');
    } catch (error) {
      console.error('Failed to simulate trap hit:', error);
      addNotification('error', 'Failed to simulate trap hit');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Honeytokens</h1>
          <p className="text-slate-400 mt-2">Generate fake data to detect unauthorized access</p>
        </div>
        <Button
          variant="primary"
          onClick={generateHoneytoken}
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{isGenerating ? 'Generating...' : 'Generate Honeytoken'}</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <Eye className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
          <p className="text-slate-400">Total Honeytokens</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg inline-block mb-4">
            <Clock className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.active}</h3>
          <p className="text-slate-400">Active</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.triggered}</h3>
          <p className="text-slate-400">Triggered</p>
        </Card>
      </div>

      {/* Honeytokens List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Honeytokens</h2>
            <p className="text-slate-400">Monitor fake data entries for unauthorized access</p>
          </div>
        </div>

        {honeytokens.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No honeytokens generated yet</p>
            <p className="text-slate-500 text-sm mt-2">Click "Generate Honeytoken" to create your first one</p>
          </div>
        ) : (
          <div className="space-y-4">
            {honeytokens.map((honeytoken) => (
              <div key={honeytoken.record_id} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{honeytoken.name}</h3>
                      <p className="text-slate-400 text-sm">{honeytoken.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge 
                      status={honeytoken.status === 'active' ? 'active' : 'error'} 
                      text={honeytoken.status === 'active' ? 'Active' : 'Triggered'} 
                    />
                    {honeytoken.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => simulateTrapHit(honeytoken.record_id)}
                      >
                        Simulate Access
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center space-x-6 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>{honeytoken.record_id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Created {new Date(honeytoken.timestamp).toLocaleDateString()}</span>
                  </div>
                  {honeytoken.accessed && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400">
                        Accessed {honeytoken.accessed_at ? new Date(honeytoken.accessed_at).toLocaleDateString() : 'recently'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Information */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex-shrink-0">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">How Honeytokens Work</h3>
            <div className="text-slate-400 mt-2 space-y-2">
              <p>• Honeytokens are fake data entries that look real but should never be accessed</p>
              <p>• When someone accesses a honeytoken, it triggers a security alert</p>
              <p>• This helps detect unauthorized access to your data</p>
              <p>• Each honeytoken has a unique identifier and tracking information</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Honeytokens;