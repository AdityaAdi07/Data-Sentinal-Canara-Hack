import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { FileText, Plus, Calendar, MapPin, Clock, Shield } from 'lucide-react';

interface Policy {
  id: string;
  purpose: string;
  expiry_date: string;
  retention_policy: string;
  geo_restriction: string;
  created_at: string;
  status: 'active' | 'inactive';
}

const PolicyManagement: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '',
    retention_days: '30',
    geo_restriction: 'US'
  });

  const purposes = [
    'Marketing Analysis',
    'Service Improvement',
    'Research',
    'Analytics',
    'Customer Support'
  ];

  const geoRestrictions = [
    { code: 'US', name: 'United States' },
    { code: 'EU', name: 'European Union' },
    { code: 'CA', name: 'Canada' },
    { code: 'IN', name: 'India' },
    { code: 'GLOBAL', name: 'Global' }
  ];

  useEffect(() => {
    // Initialize with empty state since backend doesn't store policies persistently
  }, []);

  const generatePolicy = async () => {
    if (!formData.purpose || !user?.id) {
      addNotification('error', 'Please select a purpose');
      return;
    }

    setIsGenerating(true);
    try {
      const policyData = await apiService.generatePolicy(
        formData.purpose,
        parseInt(formData.retention_days),
        formData.geo_restriction,
        user.id
      );
      
      const newPolicy: Policy = {
        id: `policy_${Date.now()}`,
        purpose: formData.purpose,
        expiry_date: policyData.expiry_date,
        retention_policy: policyData.retention_policy,
        geo_restriction: policyData.geo_restriction,
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      setPolicies(prev => [newPolicy, ...prev]);
      addNotification('success', 'Policy generated successfully');
      setFormData({
        purpose: '',
        retention_days: '30',
        geo_restriction: 'US'
      });
    } catch (error) {
      console.error('Failed to generate policy:', error);
      addNotification('error', 'Failed to generate policy');
    } finally {
      setIsGenerating(false);
    }
  };

  const deactivatePolicy = async (policyId: string) => {
    try {
      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, status: 'inactive' } : p
      ));
      addNotification('success', 'Policy deactivated successfully');
    } catch (error) {
      addNotification('error', 'Failed to deactivate policy');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Policy Management</h1>
        <p className="text-slate-400 mt-2">Create and manage data sharing policies</p>
      </div>

      {/* Generate Policy */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex-shrink-0">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Generate New Policy</h3>
            <p className="text-slate-400 mt-1 mb-4">Create a new data sharing policy with specific rules</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Purpose</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select purpose</option>
                  {purposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Retention (days)</label>
                <select
                  value={formData.retention_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, retention_days: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Geo Restriction</label>
                <select
                  value={formData.geo_restriction}
                  onChange={(e) => setFormData(prev => ({ ...prev, geo_restriction: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {geoRestrictions.map(geo => (
                    <option key={geo.code} value={geo.code}>{geo.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={generatePolicy}
              disabled={isGenerating || !formData.purpose}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate Policy'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Policies List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Policies</h2>
            <p className="text-slate-400">Manage your data sharing policies</p>
          </div>
        </div>

        {policies.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No policies created yet</p>
            <p className="text-slate-500 text-sm mt-2">Create your first policy to control data sharing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{policy.purpose}</h3>
                      <p className="text-slate-400 text-sm">Policy ID: {policy.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge 
                      status={policy.status === 'active' ? 'active' : 'inactive'} 
                      text={policy.status === 'active' ? 'Active' : 'Inactive'} 
                    />
                    {policy.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => deactivatePolicy(policy.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Retention: {policy.retention_policy}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>Geo: {policy.geo_restriction}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Expires: {new Date(policy.expiry_date).toLocaleDateString()}</span>
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
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex-shrink-0">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">How Policies Work</h3>
            <div className="text-slate-400 mt-2 space-y-2">
              <p>• <strong>Purpose:</strong> Defines why your data is being shared</p>
              <p>• <strong>Retention:</strong> How long partners can keep your data</p>
              <p>• <strong>Geo Restriction:</strong> Where your data can be processed</p>
              <p>• <strong>Expiry:</strong> When the policy automatically expires</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PolicyManagement;