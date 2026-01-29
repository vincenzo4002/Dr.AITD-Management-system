import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { FaBell, FaTimes } from 'react-icons/fa';

const NotificationBell = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(
        `/api/notifications/${userId}/unread-count?role=${userRole}`
      );
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get(
        `/api/notifications/${userId}?role=${userRole}&limit=10`
      );
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.pagination.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(
        `/api/notifications/${notificationId}/read`,
        { userId }
      );
      fetchUnreadCount();
      // Optimistically update local state to reflect read status immediately
      setNotifications(prev => prev.map(n =>
        n._id === notificationId
          ? { ...n, readBy: [...n.readBy, { userId }] }
          : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconMap = {
      notice: '📢',
      assignment: '📝',
      material: '📚',
      attendance: '✅',
      marks: '📊',
      general: '🔔'
    };
    return iconMap[type] || '🔔';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colorMap = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colorMap[priority] || 'text-gray-500';
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      fetchNotifications();
    }
  }, [showDropdown]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => {
                const isRead = notification.readBy.some(read => read.userId === userId);
                return (
                  <div
                    key={notification._id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    onClick={() => !isRead && markAsRead(notification._id)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.title}
                          </p>
                          {!isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {notification.sender.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to full notifications page
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
