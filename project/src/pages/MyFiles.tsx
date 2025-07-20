import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { 
  FileText, 
  Users, 
  Eye, 
  Key, 
  Calendar,
  Download,
  Share,
  Lock,
  AlertTriangle,
  Upload,
  Plus,
  X
} from 'lucide-react';

interface UserFile {
  fileId: string;
  filename: string;
  type: string;
  size: string;
  description: string;
  uploadDate: string;
  sharedWith: string[];
  honeytoken: string;
}

interface FileAlert {
  id: string;
  fileId: string;
  requesterId: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AccessRequest {
  id: string;
  fileId: string;
  filename: string;
  requesterId: string;
  requesterName: string;
  message: string;
  status: string;
  timestamp: string;
}

const MyFiles: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [myFiles, setMyFiles] = useState<UserFile[]>([]);
  const [fileAlerts, setFileAlerts] = useState<FileAlert[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [selectedFile, setSelectedFile] = useState<UserFile | null>(null);
  const [showHoneytokenModal, setShowHoneytokenModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMyFiles();
      fetchFileAlerts();
      fetchAccessRequests();
    }
  }, [user]);

  const fetchMyFiles = async () => {
    if (!user?.id) return;
    
    try {
      const files = await apiService.getFiles(undefined, user.id);
      setMyFiles(files);
    } catch (error) {
      console.error('Failed to fetch my files:', error);
      addNotification('error', 'Failed to fetch your files');
    }
  };

  const fetchFileAlerts = async () => {
    if (!user?.id) return;
    
    try {
      const alerts = await apiService.getFileAlerts(user.id);
      setFileAlerts(alerts);
    } catch (error) {
      console.error('Failed to fetch file alerts:', error);
    }
  };

  const fetchAccessRequests = async () => {
    if (!user?.id) return;
    
    try {
      const requests = await apiService.getAccessRequests(user.id);
      setAccessRequests(requests);
    } catch (error) {
      console.error('Failed to fetch access requests:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !user?.id) return;
    
    setIsUploading(true);
    try {
      await apiService.uploadFile(uploadFile, user.id, uploadDescription);
      addNotification('success', 'File uploaded successfully');
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadDescription('');
      fetchMyFiles(); // Refresh file list
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      addNotification('error', error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, action: 'approve' | 'deny') => {
    try {
      await apiService.approveAccess(requestId, action);
      addNotification('success', `Request ${action}d successfully`);
      fetchAccessRequests();
      fetchMyFiles(); // Refresh to update sharing status
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      addNotification('error', `Failed to ${action} request`);
    }
  };

  const showHoneytoken = (file: UserFile) => {
    setSelectedFile(file);
    setShowHoneytokenModal(true);
  };

  const copyHoneytoken = (honeytoken: string) => {
    navigator.clipboard.writeText(honeytoken);
    addNotification('success', 'Honeytoken copied to clipboard');
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-400" />;
      case 'xlsx': case 'xls': return <FileText className="h-5 w-5 text-green-400" />;
      case 'pptx': case 'ppt': return <FileText className="h-5 w-5 text-orange-400" />;
      case 'docx': case 'doc': return <FileText className="h-5 w-5 text-blue-400" />;
      default: return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'unauthorized_access': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default: return <Eye className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Files</h1>
          <p className="text-slate-400 mt-2">Manage your files and monitor access</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload File</span>
        </Button>
      </div>

      {/* Access Requests */}
      {accessRequests.filter(req => req.status === 'pending').length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Pending Access Requests</h2>
              <p className="text-slate-400">Users requesting access to your files</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {accessRequests.filter(req => req.status === 'pending').map((request) => (
              <div key={request.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{request.filename}</h3>
                      <p className="text-slate-400 text-sm">
                        Request from <span className="text-blue-400">{request.requesterName}</span>
                      </p>
                      {request.message && (
                        <p className="text-slate-300 text-sm mt-1">"{request.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApproveRequest(request.id, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleApproveRequest(request.id, 'deny')}
                    >
                      Deny
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Requested {new Date(request.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* File Alerts */}
      {fileAlerts.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Security Alerts</h2>
              <p className="text-slate-400">Recent security events for your files</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {fileAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-white font-medium">{alert.message}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status="error" text="ALERT" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* My Files */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Files</h2>
            <p className="text-slate-400">Files you own and their sharing status</p>
          </div>
        </div>

        {myFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No files found</p>
            <p className="text-slate-500 text-sm mt-2">Upload your first file to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myFiles.map((file) => (
              <div key={file.fileId} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:bg-slate-900/70 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{file.filename}</h3>
                      <p className="text-slate-400 text-sm">{file.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => showHoneytoken(file)}
                      className="flex items-center space-x-1"
                    >
                      <Key className="h-4 w-4" />
                      <span>Honeytoken</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-400">Shared with:</span>
                    <span className="text-white">
                      {file.sharedWith.length > 0 ? `${file.sharedWith.length} users` : 'None'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-400" />
                    <span className="text-slate-400">Protected:</span>
                    <StatusBadge status="success" text="Yes" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-purple-400" />
                    <span className="text-slate-400">Monitored:</span>
                    <StatusBadge status="active" text="Active" />
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
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg inline-block mb-4">
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{myFiles.length}</h3>
          <p className="text-slate-400">Total Files</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg inline-block mb-4">
            <Share className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {myFiles.reduce((sum, file) => sum + file.sharedWith.length, 0)}
          </h3>
          <p className="text-slate-400">Shared Access</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{fileAlerts.length}</h3>
          <p className="text-slate-400">Security Alerts</p>
        </Card>

        <Card className="text-center">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg inline-block mb-4">
            <Key className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{myFiles.length}</h3>
          <p className="text-slate-400">Honeytokens</p>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload File</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supported: PDF, PNG, JPG, GIF, DOC, DOCX
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Brief description of the file..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleFileUpload}
                disabled={!uploadFile || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Honeytoken Modal */}
      {showHoneytokenModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">File Honeytoken</h3>
              <button
                onClick={() => setShowHoneytokenModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-slate-300 font-medium">{selectedFile.filename}</p>
                <p className="text-slate-400 text-sm">{selectedFile.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Honeytoken Code
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={selectedFile.honeytoken}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-mono"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyHoneytoken(selectedFile.honeytoken)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Share this code with trusted partners for immediate access
                </p>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Security Warning</p>
                    <p className="text-yellow-300 text-xs mt-1">
                      Invalid honeytoken attempts will trigger security alerts and may result in access restrictions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowHoneytokenModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;