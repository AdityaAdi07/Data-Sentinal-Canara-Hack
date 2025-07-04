import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { Activity, Calendar, User, Eye, Download } from 'lucide-react';

const AccessLogs: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [logs, setLogs] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  const fetchLogs = async () => {
    try {
      const accessLogs = await apiService.getAccessLogs();
      setLogs(accessLogs);
    } catch (error) {
      console.error('Failed to fetch access logs:', error);
      addNotification('error', 'Failed to fetch access logs');
    }
  };

  const exportLogs = async () => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification('success', 'Access logs exported successfully');
    } catch (error) {
      addNotification('error', 'Failed to export logs');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'alert': return 'error';
      case 'blocked': return 'warning';
      default: return 'inactive';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DATA_ACCESS': return <Eye className="h-4 w-4 text-blue-400" />;
      case 'HONEYTOKEN_ACCESS': return <Eye className="h-4 w-4 text-red-400" />;
      case 'POLICY_CHECK': return <Activity className="h-4 w-4 text-green-400" />;
      case 'DATA_REQUEST': return <User className="h-4 w-4 text-purple-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Access Logs</h1>
          <p className="text-slate-400 mt-2">Monitor all data access activities</p>
        </div>
        <Button
          variant="secondary"
          onClick={exportLogs}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Logs</span>
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Date Range</h3>
            <div className="flex items-center space-x-4 mt-2">
              <div>
                <label className="block text-sm text-slate-400 mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Access Logs */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Access Activity</h2>
            <p className="text-slate-400">Detailed log of all data access events</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total entries</p>
            <p className="text-2xl font-bold text-white">{logs.length}</p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No access logs found</p>
            <p className="text-slate-500 text-sm mt-2">Access logs will appear here when data is accessed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">Data Access</h3>
                      <p className="text-slate-400 text-sm">{log.partner || 'Unknown Partner'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge status="success" text="SUCCESS" />
                    <span className="text-sm text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">User</p>
                    <p className="text-white">{log.user}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">IP Address</p>
                    <p className="text-white font-mono">{log.ip || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Purpose</p>
                    <p className="text-white">{log.purpose || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Region</p>
                    <p className="text-white">{log.region || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg inline-block mb-4">
            <Activity className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{logs.length}</h3>
          <p className="text-slate-400">Total Accesses</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg inline-block mb-4">
            <User className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {new Set(logs.map((l: any) => l.user)).size}
          </h3>
          <p className="text-slate-400">Unique Users</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <Eye className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {new Set(logs.map((l: any) => l.partner)).size}
          </h3>
          <p className="text-slate-400">Partners</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg inline-block mb-4">
            <Activity className="h-6 w-6 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white">0</h3>
          <p className="text-slate-400">Blocked</p>
        </Card>
      </div>
    </div>
  );
};

export default AccessLogs;