import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { 
  Shield, 
  Eye, 
  Droplets, 
  FileText, 
  Bell, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    honeytokensGenerated: 0,
    watermarksActive: 0,
    policiesActive: 0,
    notifications: 0,
    lastAccess: new Date().toISOString()
  });
  const [consentStatus, setConsentStatus] = useState({
    watermark: false,
    policy: false,
    honeytoken: false
  });

  useEffect(() => {
    // Simulate fetching user data
    const fetchData = async () => {
      // Mock data - in real app would fetch from API
      setStats({
        honeytokensGenerated: 12,
        watermarksActive: 8,
        policiesActive: 5,
        notifications: 3,
        lastAccess: new Date().toISOString()
      });
      
      setConsentStatus({
        watermark: true,
        policy: true,
        honeytoken: false
      });
    };

    fetchData();
  }, []);

  const quickActions = [
    { 
      icon: Eye, 
      label: 'Generate Honeytoken', 
      description: 'Create fake data to detect breaches',
      action: () => window.location.href = '/honeytokens',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      icon: Droplets, 
      label: 'Create Watermark', 
      description: 'Track your data sharing',
      action: () => window.location.href = '/watermarking',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: FileText, 
      label: 'Manage Policies', 
      description: 'Control data access rules',
      action: () => window.location.href = '/policies',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      icon: Bell, 
      label: 'View Notifications', 
      description: 'Check recent alerts',
      action: () => window.location.href = '/notifications',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.id}</h1>
          <p className="text-slate-400 mt-2">Monitor and protect your data with our advanced security tools</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Last access</p>
          <p className="text-white font-medium">{new Date(stats.lastAccess).toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <Eye className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.honeytokensGenerated}</h3>
          <p className="text-slate-400">Honeytokens</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg inline-block mb-4">
            <Droplets className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.watermarksActive}</h3>
          <p className="text-slate-400">Active Watermarks</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg inline-block mb-4">
            <FileText className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.policiesActive}</h3>
          <p className="text-slate-400">Active Policies</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg inline-block mb-4">
            <Bell className="h-8 w-8 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.notifications}</h3>
          <p className="text-slate-400">Notifications</p>
        </Card>
      </div>

      {/* Consent Status */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Consent Status</h2>
            <p className="text-slate-400">Your current privacy preferences</p>
          </div>
          <Button variant="secondary" onClick={() => window.location.href = '/consent'}>
            Manage Consent
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Droplets className="h-5 w-5 text-blue-400" />
              <span className="text-white">Watermarking</span>
            </div>
            <StatusBadge status={consentStatus.watermark ? 'active' : 'inactive'} text={consentStatus.watermark ? 'Enabled' : 'Disabled'} />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-400" />
              <span className="text-white">Policy Enforcement</span>
            </div>
            <StatusBadge status={consentStatus.policy ? 'active' : 'inactive'} text={consentStatus.policy ? 'Enabled' : 'Disabled'} />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-purple-400" />
              <span className="text-white">Honeytokens</span>
            </div>
            <StatusBadge status={consentStatus.honeytoken ? 'active' : 'inactive'} text={consentStatus.honeytoken ? 'Enabled' : 'Disabled'} />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} hover className="cursor-pointer" onClick={action.action}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 bg-gradient-to-r ${action.color} rounded-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{action.label}</h3>
                  <p className="text-slate-400 text-sm mt-1">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <p className="text-slate-400">Latest actions on your account</p>
          </div>
          <Button variant="secondary" onClick={() => window.location.href = '/access-logs'}>
            View All Logs
          </Button>
        </div>
        
        <div className="space-y-4">
          {[
            { icon: CheckCircle, text: 'Watermark generated for data request', time: '2 minutes ago', type: 'success' },
            { icon: AlertTriangle, text: 'Honeytoken accessed - security alert', time: '15 minutes ago', type: 'warning' },
            { icon: Activity, text: 'Policy updated for partner access', time: '1 hour ago', type: 'info' },
            { icon: Shield, text: 'Consent preferences updated', time: '3 hours ago', type: 'info' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-lg">
              <activity.icon className={`h-5 w-5 ${
                activity.type === 'success' ? 'text-green-400' : 
                activity.type === 'warning' ? 'text-yellow-400' : 
                'text-blue-400'
              }`} />
              <div className="flex-1">
                <p className="text-white">{activity.text}</p>
                <p className="text-slate-400 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;