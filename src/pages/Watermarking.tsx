import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { Droplets, Plus, Hash, Clock, User } from 'lucide-react';

interface Watermark {
  watermark: string;
  partner_id: string;
  partner_name: string;
  user_id: string;
  timestamp: string;
  status: 'active' | 'expired';
  purpose: string;
}

const Watermarking: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [watermarks, setWatermarks] = useState<Watermark[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0
  });

  const partners = [
    { id: 'partner1', name: 'DataCorp' },
    { id: 'partner2', name: 'TechFlow' },
    { id: 'partner3', name: 'SecureData' }
  ];

  useEffect(() => {
    updateStats([]);
  }, []);

  const updateStats = (marks: Watermark[]) => {
    setStats({
      total: marks.length,
      active: marks.filter(w => w.status === 'active').length,
      expired: marks.filter(w => w.status === 'expired').length
    });
  };

  const generateWatermark = async () => {
    if (!selectedPartner || !user?.id) {
      addNotification('error', 'Please select a partner');
      return;
    }

    setIsGenerating(true);
    try {
      const timestamp = new Date().toISOString();
      const watermarkData = await apiService.generateWatermark(selectedPartner, user.id, timestamp);
      const partner = partners.find(p => p.id === selectedPartner);
      
      const newWatermark: Watermark = {
        watermark: watermarkData.watermark,
        partner_id: selectedPartner,
        partner_name: partner?.name || 'Unknown',
        user_id: user.id,
        timestamp: timestamp,
        status: 'active',
        purpose: 'Data sharing'
      };
      
      const updatedWatermarks = [newWatermark, ...watermarks];
      setWatermarks(updatedWatermarks);
      updateStats(updatedWatermarks);
      addNotification('success', 'Watermark generated successfully');
      setSelectedPartner('');
    } catch (error) {
      console.error('Failed to generate watermark:', error);
      addNotification('error', 'Failed to generate watermark');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Watermarking</h1>
        <p className="text-slate-400 mt-2">Track and monitor your data sharing with unique watermarks</p>
      </div>

      {/* Generate Watermark */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex-shrink-0">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Generate New Watermark</h3>
            <p className="text-slate-400 mt-1 mb-4">Create a unique watermark for data sharing with a partner</p>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a partner</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
              </select>
              <Button
                variant="primary"
                onClick={generateWatermark}
                disabled={isGenerating || !selectedPartner}
                className="flex items-center space-x-2"
              >
                <Droplets className="h-4 w-4" />
                <span>{isGenerating ? 'Generating...' : 'Generate Watermark'}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg inline-block mb-4">
            <Droplets className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
          <p className="text-slate-400">Total Watermarks</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg inline-block mb-4">
            <Clock className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.active}</h3>
          <p className="text-slate-400">Active</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-lg inline-block mb-4">
            <Hash className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.expired}</h3>
          <p className="text-slate-400">Expired</p>
        </Card>
      </div>

      {/* Watermarks List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Watermarks</h2>
            <p className="text-slate-400">Monitor data sharing watermarks and their usage</p>
          </div>
        </div>

        {watermarks.length === 0 ? (
          <div className="text-center py-12">
            <Droplets className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No watermarks generated yet</p>
            <p className="text-slate-500 text-sm mt-2">Create your first watermark to track data sharing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {watermarks.map((watermark, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{watermark.partner_name}</h3>
                      <p className="text-slate-400 text-sm">{watermark.purpose}</p>
                    </div>
                  </div>
                  <StatusBadge 
                    status={watermark.status === 'active' ? 'active' : 'inactive'} 
                    text={watermark.status === 'active' ? 'Active' : 'Expired'} 
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono break-all">{watermark.watermark}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Created {new Date(watermark.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Information */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex-shrink-0">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">How Watermarking Works</h3>
            <div className="text-slate-400 mt-2 space-y-2">
              <p>• Each watermark is a unique SHA-256 hash that identifies data sharing</p>
              <p>• Watermarks help track when and how your data is being used</p>
              <p>• Partners receive watermarked data that can be traced back to you</p>
              <p>• This enables detection of unauthorized data sharing or misuse</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Watermarking;