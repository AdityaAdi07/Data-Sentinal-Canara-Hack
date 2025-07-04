import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info': return <Info className="h-5 w-5 text-blue-400" />;
      default: return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-500/30';
      case 'error': return 'bg-red-500/20 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 border-blue-500/30';
      default: return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm
            ${getBgColor(notification.type)}
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-5
          `}
        >
          {getIcon(notification.type)}
          <div className="flex-1">
            <p className="text-sm text-white font-medium">{notification.message}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;