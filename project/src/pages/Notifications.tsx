import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface UserNotification {
  id: string;
  user: string;
  type: 'threat' | 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'high' | 'medium' | 'low';
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const notificationData = await apiService.getUserNotifications(user.id);
      // Transform backend notifications to frontend format
      const transformedNotifications = notificationData.map((notif: any, index: number) => ({
        id: `notif_${index}`,
        user: notif.user,
        type: notif.type || 'info',
        title: getNotificationTitle(notif.type, notif.message),
        message: notif.message,
        timestamp: notif.timestamp,
        read: false,
        severity: getSeverityFromType(notif.type)
      }));
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      addNotification('error', 'Failed to fetch notifications');
    }
  };

  const getNotificationTitle = (type: string, message: string) => {
    switch (type) {
      case 'threat': return 'Security Alert';
      case 'warning': return 'Warning';
      case 'success': return 'Success';
      case 'error': return 'Error';
      default: return 'Information';
    }
  };

  const getSeverityFromType = (type: string) => {
    switch (type) {
      case 'threat': return 'high';
      case 'warning': return 'medium';
      default: return 'low';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      addNotification('success', 'Notification marked as read');
    } catch (error) {
      addNotification('error', 'Failed to mark notification as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      addNotification('success', 'Notification deleted');
    } catch (error) {
      addNotification('error', 'Failed to delete notification');
    }
  };

  const escalateToAdmin = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      await apiService.requestAdminAction(user.id, 'partner1', 'User escalated security alert');
      addNotification('success', 'Alert escalated to admin for review');
    } catch (error) {
      console.error('Failed to escalate to admin:', error);
      addNotification('error', 'Failed to escalate to admin');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-slate-500';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'threats') return n.type === 'threat';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 mt-2">Stay informed about your data security events</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-red-400 font-medium">
            {notifications.filter(n => !n.read).length} unread
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </Button>
        <Button
          variant={filter === 'threats' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('threats')}
        >
          Threats ({notifications.filter(n => n.type === 'threat').length})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No notifications found</p>
            <p className="text-slate-500 text-sm mt-2">
              {filter === 'all' 
                ? 'You have no notifications yet' 
                : `No ${filter} notifications found`}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`border-l-4 ${getSeverityColor(notification.severity)} ${!notification.read ? 'bg-slate-800/70' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      <StatusBadge 
                        status={notification.severity === 'high' ? 'error' : notification.severity === 'medium' ? 'warning' : 'active'} 
                        text={notification.severity.toUpperCase()} 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {notification.type === 'threat' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => escalateToAdmin(notification.id)}
                    >
                      Escalate
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Information */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex-shrink-0">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Notification Types</h3>
            <div className="text-slate-400 mt-2 space-y-2">
              <p>• <strong>Threats:</strong> Security alerts that require immediate attention</p>
              <p>• <strong>Warnings:</strong> Important information about policy changes or expirations</p>
              <p>• <strong>Info:</strong> General updates about system activities</p>
              <p>• <strong>Success:</strong> Confirmations of successful operations</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Notifications;