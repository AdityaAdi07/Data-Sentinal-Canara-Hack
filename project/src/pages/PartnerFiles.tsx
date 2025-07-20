import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { 
  Users, 
  FileText, 
  Download, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Key,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

interface PartnerFile {
  fileId: string;
  filename: string;
  type: string;
  size: string;
  description: string;
  uploadDate: string;
  hasAccess: boolean;
  pendingRequest: boolean;
  honeytoken?: string;
}

interface PartnerData {
  owner: string;
  files: PartnerFile[];
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

const PartnerFiles: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [partnerFiles, setPartnerFiles] = useState<Record<string, PartnerData>>({});
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [selectedFile, setSelectedFile] = useState<PartnerFile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [honeytoken, setHoneytoken] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPartnerFiles();
      fetchAccessRequests();
    }
  }, [user]);

  const fetchPartnerFiles = async () => {
    if (!user?.id) return;
    
    try {
      const files = await apiService.getPartnerFiles(user.id);
      setPartnerFiles(files);
    } catch (error) {
      console.error('Failed to fetch partner files:', error);
      addNotification('error', 'Failed to fetch partner files');
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

  const handleRequestAccess = (file: PartnerFile) => {
    setSelectedFile(file);
    setRequestMessage('');
    setHoneytoken('');
    setShowRequestModal(true);
  };

  const submitAccessRequest = async () => {
    if (!selectedFile || !user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.requestAccess(
        selectedFile.fileId,
        user.id,
        requestMessage,
        honeytoken
      );
      
      if (response.access) {
        addNotification('success', 'Access granted via honeytoken!');
      } else {
        addNotification('success', 'Access request sent successfully');
      }
      
      setShowRequestModal(false);
      fetchPartnerFiles(); // Refresh to update pending status
    } catch (error: any) {
      console.error('Failed to request access:', error);
      if (error.message.includes('Invalid honeytoken')) {
        addNotification('error', 'Invalid honeytoken - Security alert triggered!');
      } else {
        addNotification('error', error.message || 'Failed to send access request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, action: 'approve' | 'deny') => {
    try {
      await apiService.approveAccess(requestId, action);
      addNotification('success', `Request ${action}d successfully`);
      fetchAccessRequests();
      fetchPartnerFiles(); // Refresh to update access status
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      addNotification('error', `Failed to ${action} request`);
    }
  };

  const handleDownloadFile = async (file: PartnerFile) => {
    if (!user?.id) return;
    
    try {
      const response = await apiService.downloadFile(file.fileId, user.id);
      addNotification('success', response.message || `Downloaded ${file.filename}`);
    } catch (error: any) {
      console.error('Failed to download file:', error);
      if (error.message.includes('security alert')) {
        addNotification('error', 'Access denied - Security alert triggered!');
      } else {
        addNotification('error', 'Access denied');
      }
    }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Partner Files</h1>
        <p className="text-slate-400 mt-2">Request access to files shared by other users</p>
      </div>

      {/* Access Requests (for files I own) */}
      {accessRequests.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Pending Access Requests</h2>
              <p className="text-slate-400">Requests for your files</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {accessRequests.filter((req: AccessRequest) => req.status === 'pending').map((request: AccessRequest) => (
              <div key={request.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-400" />
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
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleApproveRequest(request.id, 'deny')}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
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

      {/* Partner Files */}
      {Object.keys(partnerFiles).length === 0 ? (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No partner files available</p>
          <p className="text-slate-500 text-sm mt-2">Files shared by other users will appear here</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(partnerFiles).map(([ownerId, partnerData]: [string, PartnerData]) => (
            <Card key={ownerId}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{partnerData.owner}</h2>
                    <p className="text-slate-400">{partnerData.files.length} files available</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {partnerData.files.map((file: PartnerFile) => (
                  <div key={file.fileId} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:bg-slate-900/70 transition-colors">
                    <div className="flex items-center justify-between">
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
                        {file.hasAccess ? (
                          <>
                            <StatusBadge status="success" text="Access Granted" />
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDownloadFile(file)}
                              className="flex items-center space-x-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </Button>
                          </>
                        ) : file.pendingRequest ? (
                          <StatusBadge status="warning" text="Request Pending" />
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRequestAccess(file)}
                            className="flex items-center space-x-1"
                          >
                            <Lock className="h-4 w-4" />
                            <span>Request Access</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Request Access Modal */}
      {showRequestModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Request Access</h3>
              <button
                onClick={() => setShowRequestModal(false)}
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
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Why do you need access to this file?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Key className="h-4 w-4 inline mr-1" />
                  Honeytoken (Optional)
                </label>
                <input
                  type="text"
                  value={honeytoken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneytoken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter honeytoken for immediate access"
                />
                <p className="text-xs text-slate-500 mt-1">
                  If you have a honeytoken, access will be granted immediately
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
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitAccessRequest}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerFiles;