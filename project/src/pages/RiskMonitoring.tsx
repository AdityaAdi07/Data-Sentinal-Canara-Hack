import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { TrendingUp, AlertTriangle, Shield, Eye, Users, Activity, BarChart3 } from 'lucide-react';

const RiskMonitoring: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [riskData, setRiskData] = useState({
    systemRisk: 0,
    totalAlerts: 0,
    highRiskPartners: 0,
    trapHits: 0
  });
  const [trapLogs, setTrapLogs] = useState([]);
  const [partnerRisks, setPartnerRisks] = useState([]);

  useEffect(() => {
    fetchRiskData();
    fetchTrapLogs();
    fetchPartnerRisks();
  }, []);

  const fetchRiskData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setRiskData({
        systemRisk: 3.4,
        totalAlerts: 12,
        highRiskPartners: 2,
        trapHits: 8
      });
    } catch (error) {
      addNotification('error', 'Failed to fetch risk data');
    }
  };

  const fetchTrapLogs = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockTrapLogs = [
        {
          id: 'trap_001',
          partner_id: 'partner1',
          partner_name: 'DataCorp',
          user_id: 'user1',
          timestamp: '2024-01-16T10:30:00Z',
          trap_type: 'honeytoken',
          severity: 'high',
          escalated: true
        },
        {
          id: 'trap_002',
          partner_id: 'partner4',
          partner_name: 'InfoSys',
          user_id: 'user2',
          timestamp: '2024-01-16T08:15:00Z',
          trap_type: 'honeytoken',
          severity: 'high',
          escalated: false
        },
        {
          id: 'trap_003',
          partner_id: 'partner1',
          partner_name: 'DataCorp',
          user_id: 'user3',
          timestamp: '2024-01-15T14:45:00Z',
          trap_type: 'honeytoken',
          severity: 'medium',
          escalated: false
        }
      ];
      setTrapLogs(mockTrapLogs);
    } catch (error) {
      addNotification('error', 'Failed to fetch trap logs');
    }
  };

  const fetchPartnerRisks = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      const mockPartnerRisks = [
        {
          partner_id: 'partner4',
          partner_name: 'InfoSys',
          risk_score: 5.8,
          trap_hits: 5,
          last_incident: '2024-01-16T08:15:00Z',
          status: 'restricted'
        },
        {
          partner_id: 'partner1',
          partner_name: 'DataCorp',
          risk_score: 4.2,
          trap_hits: 3,
          last_incident: '2024-01-16T10:30:00Z',
          status: 'monitored'
        },
        {
          partner_id: 'partner2',
          partner_name: 'TechFlow',
          risk_score: 2.1,
          trap_hits: 0,
          last_incident: null,
          status: 'normal'
        }
      ];
      setPartnerRisks(mockPartnerRisks);
    } catch (error) {
      addNotification('error', 'Failed to fetch partner risks');
    }
  };

  const escalateAlert = async (trapId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setTrapLogs(prev => prev.map(t => 
        t.id === trapId ? { ...t, escalated: true } : t
      ));
      addNotification('success', 'Alert escalated for admin review');
    } catch (error) {
      addNotification('error', 'Failed to escalate alert');
    }
  };

  const getSystemRiskColor = (score: number) => {
    if (score >= 4) return 'text-red-400';
    if (score >= 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSystemRiskStatus = (score: number) => {
    if (score >= 4) return 'error';
    if (score >= 2) return 'warning';
    return 'success';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'inactive';
    }
  };

  const getPartnerStatus = (status: string) => {
    switch (status) {
      case 'restricted': return 'error';
      case 'monitored': return 'warning';
      case 'normal': return 'success';
      default: return 'inactive';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Risk Monitoring</h1>
        <p className="text-slate-400 mt-2">Monitor system-wide security risks and threats</p>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <TrendingUp className="h-8 w-8 text-red-400" />
          </div>
          <h3 className={`text-2xl font-bold ${getSystemRiskColor(riskData.systemRisk)}`}>
            {riskData.systemRisk}
          </h3>
          <p className="text-slate-400">System Risk</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{riskData.totalAlerts}</h3>
          <p className="text-slate-400">Active Alerts</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <Users className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{riskData.highRiskPartners}</h3>
          <p className="text-slate-400">High Risk Partners</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg inline-block mb-4">
            <Eye className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{riskData.trapHits}</h3>
          <p className="text-slate-400">Trap Hits</p>
        </Card>
      </div>

      {/* System Risk Status */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">System Risk Status</h2>
            <p className="text-slate-400">Overall system security assessment</p>
          </div>
          <StatusBadge 
            status={getSystemRiskStatus(riskData.systemRisk)} 
            text={riskData.systemRisk >= 4 ? 'HIGH RISK' : riskData.systemRisk >= 2 ? 'MEDIUM RISK' : 'LOW RISK'} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">Security Score</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {Math.max(0, 10 - riskData.systemRisk).toFixed(1)}/10
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">Threat Level</span>
            </div>
            <div className={`text-2xl font-bold ${getSystemRiskColor(riskData.systemRisk)}`}>
              {riskData.systemRisk >= 4 ? 'High' : riskData.systemRisk >= 2 ? 'Medium' : 'Low'}
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Incidents</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {trapLogs.length}
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Trap Hits */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent Trap Hits</h2>
            <p className="text-slate-400">Latest security incidents detected</p>
          </div>
          <Button variant="secondary">View All Logs</Button>
        </div>

        {trapLogs.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No recent trap hits</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trapLogs.map((log) => (
              <div key={log.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`h-5 w-5 ${
                      log.severity === 'high' ? 'text-red-400' : 
                      log.severity === 'medium' ? 'text-yellow-400' : 
                      'text-blue-400'
                    }`} />
                    <div>
                      <h3 className="text-white font-medium">{log.partner_name}</h3>
                      <p className="text-slate-400 text-sm">User: {log.user_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge 
                      status={getSeverityColor(log.severity)} 
                      text={log.severity.toUpperCase()} 
                    />
                    {log.escalated ? (
                      <StatusBadge status="active" text="ESCALATED" />
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => escalateAlert(log.id)}
                      >
                        Escalate
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-slate-400">
                  <p>{log.trap_type.toUpperCase()} accessed on {new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Partner Risk Analysis */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Partner Risk Analysis</h2>
            <p className="text-slate-400">Risk assessment for all partners</p>
          </div>
        </div>

        <div className="space-y-4">
          {partnerRisks.map((partner) => (
            <div key={partner.partner_id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">{partner.partner_name}</h3>
                    <p className="text-slate-400 text-sm">Risk Score: {partner.risk_score}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <StatusBadge 
                    status={getPartnerStatus(partner.status)} 
                    text={partner.status.toUpperCase()} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Trap Hits</p>
                  <p className={`font-medium ${partner.trap_hits > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {partner.trap_hits}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="text-white">{partner.status}</p>
                </div>
                <div>
                  <p className="text-slate-400">Last Incident</p>
                  <p className="text-white">
                    {partner.last_incident ? new Date(partner.last_incident).toLocaleDateString() : 'None'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RiskMonitoring;