const { Notification } = require('../models');

// Send notification
const sendNotification = async (type, data) => {
  try {
    // This is a placeholder for notification logic
    console.log(`Notification sent: ${type}`, data);
    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ success: true, msg: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead
};