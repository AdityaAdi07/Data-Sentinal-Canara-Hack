import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import { Shield, Calendar, Info, Save } from 'lucide-react';

const ConsentManagement: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [consent, setConsent] = useState({
    watermark: false,
    policy: false,
    honeytoken: false,
    expiry_date: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchConsent();
  }, [user]);

  const fetchConsent = async () => {
    if (!user?.id) return;
    
    try {
      const consentData = await apiService.getConsent(user.id);
      setConsent(consentData);
    } catch (error) {
      console.error('Failed to fetch consent:', error);
      addNotification('error', 'Failed to fetch consent data');
    }
  };

  const handleConsentChange = (field: string, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleExpiryChange = (value: string) => {
    setConsent(prev => ({
      ...prev,
      expiry_date: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      await apiService.updateConsent(user.id, consent);
      addNotification('success', 'Consent preferences updated successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update consent:', error);
      addNotification('error', 'Failed to update consent preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const consentOptions = [
    {
      key: 'watermark',
      title: 'Watermarking',
      description: 'Allow watermarking of your data to track sharing and usage',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'policy',
      title: 'Policy Enforcement',
      description: 'Enable policy-based access controls for your data',
      icon: Shield,
      color: 'from-green-500 to-emerald-500'
    },
    {
      key: 'honeytoken',
      title: 'Honeytokens',
      description: 'Allow creation of honeytokens to detect unauthorized access',
      icon: Shield,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Consent Management</h1>
        <p className="text-slate-400 mt-2">Control how your data is protected and monitored</p>
      </div>

      {/* Consent Options */}
      <div className="grid grid-cols-1 gap-6">
        {consentOptions.map((option) => (
          <Card key={option.key} className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 bg-gradient-to-r ${option.color} rounded-lg flex-shrink-0`}>
                <option.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                    <p className="text-slate-400 mt-1">{option.description}</p>
                  </div>
                  <Toggle
                    enabled={consent[option.key as keyof typeof consent] as boolean}
                    onChange={(value) => handleConsentChange(option.key, value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Expiry Date */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex-shrink-0">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Consent Expiry</h3>
            <p className="text-slate-400 mt-1 mb-4">Set when your consent preferences should expire</p>
            <input
              type="date"
              value={consent.expiry_date}
              onChange={(e) => handleExpiryChange(e.target.value)}
              className="w-full max-w-xs px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Information Card */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex-shrink-0">
            <Info className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Important Information</h3>
            <div className="text-slate-400 mt-2 space-y-2">
              <p>• <strong>Watermarking:</strong> Helps track how your data is shared and used by partners</p>
              <p>• <strong>Policy Enforcement:</strong> Ensures partners follow your data usage rules</p>
              <p>• <strong>Honeytokens:</strong> Creates fake data entries to detect unauthorized access</p>
              <p>• <strong>Expiry Date:</strong> After this date, you'll need to renew your consent</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 p-4 -mx-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-400">You have unsaved changes</p>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentManagement;