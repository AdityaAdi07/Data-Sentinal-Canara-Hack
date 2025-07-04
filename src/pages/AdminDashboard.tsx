import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { 
  Users, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Eye, 
  Lock, 
  Activity,
  Server,
  Database
} from 'lucide-react';
import honeytokenRegistryABI from '../services/honeytokenRegistryABI.json';
import { ethers } from 'ethers';
import jsPDF from 'jspdf';

const AdminDashboard: React.FC = () => {
  const { addNotification } = useNotification();
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activePartners: 0,
    trapHits: 0,
    riskScore: 0,
    systemHealth: 'healthy'
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [partnerActivity, setPartnerActivity] = useState([]);
  const [htInput, setHtInput] = useState('');
  const [htMetadata, setHtMetadata] = useState('');
  const [htStatus, setHtStatus] = useState<null | boolean>(null);
  const [htLoading, setHtLoading] = useState(false);
  const [htRegistering, setHtRegistering] = useState(false);
  const [htRegisterSuccess, setHtRegisterSuccess] = useState(false);
  const [htError, setHtError] = useState('');
  const [htTxHash, setHtTxHash] = useState<string | null>(null);
  const [htTxReceipt, setHtTxReceipt] = useState<any>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [userActivity, partnerScores, trapLogs] = await Promise.all([
        apiService.getUserActivitySummary(),
        apiService.getPartnerActivitySummary(),
        apiService.getAdminTrapLogs()
      ]);

      setSystemStats({
        totalUsers: Object.keys(userActivity).length,
        activePartners: Object.keys(partnerScores).length,
        trapHits: trapLogs.length,
        riskScore: Object.values(partnerScores).reduce((sum: number, score: any) => sum + score, 0) / Object.keys(partnerScores).length || 0,
        systemHealth: 'healthy'
      });

      // Transform partner scores to activity format
      const partnerActivityData = Object.entries(partnerScores).map(([partnerId, score]) => ({
        partner: partnerId,
        requests: Math.floor(Math.random() * 100) + 10,
        riskScore: score,
        status: score > 80 ? 'error' : score > 40 ? 'warning' : 'active'
      }));
      setPartnerActivity(partnerActivityData);

      // Create mock alerts from trap logs
      const alerts = trapLogs.slice(0, 3).map((log: any, index: number) => ({
        id: index + 1,
        type: 'high',
        message: `Partner "${log.partner}" triggered security alert`,
        time: new Date(log.timestamp).toLocaleString()
      }));
      setRecentAlerts(alerts);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      addNotification('error', 'Failed to fetch admin dashboard data');
    }
  };

  const quickAdminActions = [
    { 
      icon: Users, 
      label: 'Manage Partners', 
      description: 'View and control partner access',
      action: () => window.location.href = '/partners',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: TrendingUp, 
      label: 'Risk Monitoring', 
      description: 'Monitor system-wide risk levels',
      action: () => window.location.href = '/risk-monitoring',
      color: 'from-red-500 to-pink-500'
    },
    { 
      icon: Eye, 
      label: 'Trap Logs', 
      description: 'Review honeytoken activations',
      action: () => console.log('View trap logs'),
      color: 'from-purple-500 to-indigo-500'
    },
    { 
      icon: Lock, 
      label: 'Security Alerts', 
      description: 'Handle security incidents',
      action: () => console.log('View security alerts'),
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const HONEYTOKEN_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // <-- your actual deployed address

  async function verifyHoneytokenOnChain() {
    setHtLoading(true);
    setHtStatus(null);
    setHtError("");
    setHtRegisterSuccess(false);
    try {
      if (!(window as any).ethereum) {
        setHtError("No Ethereum provider found. Please install MetaMask or similar.");
        setHtLoading(false);
        return;
      }
      if (!ethers.isAddress(HONEYTOKEN_CONTRACT_ADDRESS)) {
        setHtError("Invalid contract address. Please check your configuration.");
        setHtLoading(false);
        return;
      }
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(HONEYTOKEN_CONTRACT_ADDRESS, honeytokenRegistryABI.abi, provider);
      const verifyHash = ethers.keccak256(ethers.toUtf8Bytes(htInput));
      const isRegistered = await contract.isRegistered(verifyHash);
      setHtStatus(isRegistered);
    } catch (err: any) {
      setHtError("Blockchain verification failed: " + (err.message || err));
    }
    setHtLoading(false);
  }

  async function registerHoneytokenOnChain() {
    setHtRegistering(true);
    setHtRegisterSuccess(false);
    setHtError("");
    setHtTxHash(null);
    setHtTxReceipt(null);
    try {
      if (!(window as any).ethereum) {
        setHtError("No Ethereum provider found. Please install MetaMask or similar.");
        setHtRegistering(false);
        return;
      }
      if (!ethers.isAddress(HONEYTOKEN_CONTRACT_ADDRESS)) {
        setHtError("Invalid contract address. Please check your configuration.");
        setHtRegistering(false);
        return;
      }
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(HONEYTOKEN_CONTRACT_ADDRESS, honeytokenRegistryABI.abi, signer);
      const registerHash = ethers.keccak256(ethers.toUtf8Bytes(htInput));
      const tx = await contract.registerHoneytoken(registerHash, htMetadata);
      setHtTxHash(tx.hash);
      const receipt = await tx.wait();
      setHtRegisterSuccess(true);
      setHtTxReceipt(receipt);
      // Re-verify after registration
      const isRegistered = await contract.isRegistered(registerHash);
      setHtStatus(isRegistered);
    } catch (err: any) {
      setHtError("Registration failed: " + (err.data?.message || err.message || err));
    }
    setHtRegistering(false);
  }

  function downloadPdfReceipt() {
    if (!htTxHash || !htTxReceipt) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Blockchain Honeytoken Registration Receipt', 10, 15);
    doc.setFontSize(12);
    doc.text(`Transaction Hash: ${htTxHash}`, 10, 30);
    doc.text(`Block Number: ${htTxReceipt.blockNumber}`, 10, 40);
    doc.text(`From: ${htTxReceipt.from}`, 10, 50);
    doc.text(`To: ${htTxReceipt.to}`, 10, 60);
    doc.text(`Gas Used: ${htTxReceipt.gasUsed?.toString()}`, 10, 70);
    doc.text(`Status: ${htTxReceipt.status === 1 ? 'Success' : 'Failed'}`, 10, 80);
    doc.text(`Contract Address: ${HONEYTOKEN_CONTRACT_ADDRESS}`, 10, 90);
    doc.save(`honeytoken_receipt_${htTxHash.slice(0, 10)}.pdf`);
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">System overview and security monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">System Online</span>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg inline-block mb-4">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{systemStats.totalUsers}</h3>
          <p className="text-slate-400">Total Users</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg inline-block mb-4">
            <Shield className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{systemStats.activePartners}</h3>
          <p className="text-slate-400">Active Partners</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{systemStats.trapHits}</h3>
          <p className="text-slate-400">Trap Hits</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg inline-block mb-4">
            <TrendingUp className="h-8 w-8 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{systemStats.riskScore.toFixed(1)}</h3>
          <p className="text-slate-400">Avg Risk Score</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg inline-block mb-4">
            <Server className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Healthy</h3>
          <p className="text-slate-400">System Status</p>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent Security Alerts</h2>
            <p className="text-slate-400">Latest security events requiring attention</p>
          </div>
          <Button variant="secondary">View All Alerts</Button>
        </div>
        
        {recentAlerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No recent alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="flex-1">
                  <p className="text-white">{alert.message}</p>
                  <p className="text-slate-400 text-sm">{alert.time}</p>
                </div>
                <StatusBadge status="error" text="HIGH" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Admin Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickAdminActions.map((action, index) => (
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

      {/* Partner Activity Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Partner Activity Overview</h2>
            <p className="text-slate-400">Monitor partner access patterns and risk levels</p>
          </div>
          <Button variant="secondary" onClick={() => window.location.href = '/partners'}>
            Manage Partners
          </Button>
        </div>
        
        {partnerActivity.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No partner activity data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Partner</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Requests</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Risk Score</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {partnerActivity.map((partner: any, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 text-white font-medium">{partner.partner}</td>
                    <td className="py-3 px-4 text-slate-300">{partner.requests}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        partner.riskScore > 80 ? 'text-red-400' : 
                        partner.riskScore > 40 ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}>
                        {partner.riskScore}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge 
                        status={partner.status} 
                        text={partner.status === 'active' ? 'Active' : partner.status === 'warning' ? 'Warning' : 'Blocked'} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Blockchain Honeytoken Registration & Verification Section */}
      <Card>
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold text-white">Blockchain Honeytoken Registration & Verification</h2>
          <p className="text-slate-400">Register or verify a honeytoken on the blockchain registry for authenticity and tamper-proof tracking.</p>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
            <input
              type="text"
              value={htInput}
              onChange={e => setHtInput(e.target.value)}
              placeholder="Enter honeytoken string..."
              className="flex-1 p-2 rounded bg-slate-800 text-white border border-slate-700"
              disabled={htLoading || htRegistering}
            />
            <input
              type="text"
              value={htMetadata}
              onChange={e => setHtMetadata(e.target.value)}
              placeholder="Metadata (description, context, etc.)"
              className="flex-1 p-2 rounded bg-slate-800 text-white border border-slate-700"
              disabled={htLoading || htRegistering}
            />
            <Button
              variant="primary"
              onClick={verifyHoneytokenOnChain}
              disabled={htLoading || htRegistering || !htInput}
            >
              {htLoading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button
              variant="secondary"
              onClick={registerHoneytokenOnChain}
              disabled={htRegistering || htLoading || !htInput || !htMetadata || htStatus}
            >
              {htRegistering ? 'Registering...' : 'Register'}
            </Button>
          </div>
          {htStatus !== null && (
            <div className={`mt-2 font-bold ${htStatus ? 'text-green-400' : 'text-red-400'}`}>
              {htStatus ? '✅ Registered Honeytoken (Trap Detected)' : '❌ Not Registered (Not a known trap)'}
            </div>
          )}
          {htRegisterSuccess && (
            <>
              <div className="mt-2 text-green-400 font-bold">✅ Registration successful!</div>
              {htTxHash && (
                <div className="mt-2 text-blue-400 text-sm flex items-center space-x-2">
                  <span>Transaction Hash:</span>
                  <span className="font-mono bg-slate-800 px-2 py-1 rounded text-white">{htTxHash}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(htTxHash)}
                    className="ml-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Copy
                  </button>
                </div>
              )}
              {htTxHash && (
                <div className="mt-1 text-slate-400 text-xs">
                  To view details, use Hardhat console or ethers.js:<br/>
                  <span className="font-mono">await ethers.provider.getTransaction('{htTxHash}')</span><br/>
                  <span className="font-mono">await ethers.provider.getTransactionReceipt('{htTxHash}')</span><br/>
                  Or check MetaMask activity.
                </div>
              )}
              {htTxHash && htTxReceipt && (
                <button
                  onClick={downloadPdfReceipt}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                >
                  Download PDF Receipt
                </button>
              )}
            </>
          )}
          {htError && <div className="mt-2 text-red-400 font-bold">{htError}</div>}
          <div className="mt-2 text-slate-400 text-xs">
            <b>Contract:</b> <span className="font-mono text-green-400">{HONEYTOKEN_CONTRACT_ADDRESS}</span>
            <span className="ml-2">(Update this address if redeployed)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;