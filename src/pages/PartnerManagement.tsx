import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { Users, AlertTriangle, Lock, Unlock, TrendingUp, Activity, Shield } from 'lucide-react';

const PartnerManagement: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [partners, setPartners] = useState([]);
  const [restrictedPartners, setRestrictedPartners] = useState([]);

  useEffect(() => {
    fetchPartners();
    fetchRestrictedPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockPartners = [
        {
          id: 'partner1',
          name: 'DataCorp',
          email: 'contact@datacorp.com',
          status: 'active',
          risk_score: 4.2,
          total_requests: 145,
          last_access: '2024-01-16T10:30:00Z',
          trap_hits: 3,
          blocked_users: ['user1', 'user2']
        },
        {
          id: 'partner2',
          name: 'TechFlow',
          email: 'info@techflow.com',
          status: 'active',
          risk_score: 2.1,
          total_requests: 89,
          last_access: '2024-01-16T08:45:00Z',
          trap_hits: 0,
          blocked_users: []
        },
        {
          id: 'partner3',
          name: 'SecureData',
          email: 'admin@securedata.com',
          status: 'active',
          risk_score: 1.8,
          total_requests: 234,
          last_access: '2024-01-15T16:20:00Z',
          trap_hits: 1,
          blocked_users: []
        },
        {
          id: 'partner4',
          name: 'InfoSys',
          email: 'contact@infosys.com',
          status: 'restricted',
          risk_score: 5.8,
          total_requests: 67,
          last_access: '2024-01-14T12:10:00Z',
          trap_hits: 5,
          blocked_users: ['user1', 'user3', 'user4']
        }
      ];
      setPartners(mockPartners);
    } catch (error) {
      addNotification('error', 'Failed to fetch partners');
    }
  };

  const fetchRestrictedPartners = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockRestricted = [
        {
          partner_id: 'partner4',
          partner_name: 'InfoSys',
          restriction_date: '2024-01-14T12:10:00Z',
          reason: 'Exceeded trap hit threshold (5 hits)',
          blocked_users: 3
        }
      ];
      setRestrictedPartners(mockRestricted);
    } catch (error) {
      addNotification('error', 'Failed to fetch restricted partners');
    }
  };

  const blockPartner = async (partnerId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPartners(prev => prev.map(p => 
        p.id === partnerId ? { ...p, status: 'restricted' } : p
      ));
      addNotification('success', 'Partner blocked successfully');
    } catch (error) {
      addNotification('error', 'Failed to block partner');
    }
  };

  const unblockPartner = async (partnerId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPartners(prev => prev.map(p => 
        p.id === partnerId ? { ...p, status: 'active' } : p
      ));
      addNotification('success', 'Partner unblocked successfully');
    } catch (error) {
      addNotification('error', 'Failed to unblock partner');
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 4) return 'text-red-400';
    if (score >= 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskStatus = (score: number) => {
    if (score >= 4) return 'error';
    if (score >= 2) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Partner Management</h1>
        <p className="text-slate-400 mt-2">Monitor and manage data partners and their access</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg inline-block mb-4">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{partners.length}</h3>
          <p className="text-slate-400">Total Partners</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg inline-block mb-4">
            <Shield className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {partners.filter(p => p.status === 'active').length}
          </h3>
          <p className="text-slate-400">Active</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {partners.filter(p => p.status === 'restricted').length}
          </h3>
          <p className="text-slate-400">Restricted</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {partners.reduce((sum, p) => sum + p.trap_hits, 0)}
          </h3>
          <p className="text-slate-400">Total Trap Hits</p>
        </Card>
      </div>

      {/* Partners List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">All Partners</h2>
            <p className="text-slate-400">Monitor partner activity and risk levels</p>
          </div>
        </div>

        <div className="space-y-4">
          {partners.map((partner) => (
            <div key={partner.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{partner.name}</h3>
                    <p className="text-slate-400 text-sm">{partner.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <StatusBadge 
                    status={partner.status === 'active' ? 'active' : 'error'} 
                    text={partner.status === 'active' ? 'Active' : 'Restricted'} 
                  />
                  {partner.status === 'active' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => blockPartner(partner.id)}
                      className="flex items-center space-x-1"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Block</span>
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => unblockPartner(partner.id)}
                      className="flex items-center space-x-1"
                    >
                      <Unlock className="h-4 w-4" />
                      <span>Unblock</span>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Risk Score</p>
                  <p className={`font-bold text-lg ${getRiskColor(partner.risk_score)}`}>
                    {partner.risk_score}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Total Requests</p>
                  <p className="text-white font-medium">{partner.total_requests}</p>
                </div>
                <div>
                  <p className="text-slate-400">Trap Hits</p>
                  <p className={`font-medium ${partner.trap_hits > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {partner.trap_hits}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Blocked Users</p>
                  <p className="text-white font-medium">{partner.blocked_users.length}</p>
                </div>
                <div>
                  <p className="text-slate-400">Last Access</p>
                  <p className="text-white font-medium">
                    {new Date(partner.last_access).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Restricted Partners */}
      {restrictedPartners.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Restricted Partners</h2>
              <p className="text-slate-400">Partners with access restrictions</p>
            </div>
          </div>

          <div className="space-y-4">
            {restrictedPartners.map((partner) => (
              <div key={partner.partner_id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <h3 className="text-white font-medium">{partner.partner_name}</h3>
                      <p className="text-red-400 text-sm">{partner.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Restricted on</p>
                    <p className="text-white font-medium">
                      {new Date(partner.restriction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-slate-400">
                  <p>Blocked from accessing {partner.blocked_users} users</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Risk Analysis */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
            <div className="text-slate-400 mt-2 space-y-2">
              <p>• <strong>Risk Score 0-2:</strong> Low risk - Normal access granted</p>
              <p>• <strong>Risk Score 2-4:</strong> Medium risk - Enhanced monitoring</p>
              <p>• <strong>Risk Score 4+:</strong> High risk - Automatic restrictions applied</p>
              <p>• <strong>3+ Trap Hits:</strong> Automatic partner restriction</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PartnerManagement;