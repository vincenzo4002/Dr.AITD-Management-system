// Persistent Session Manager - 2 Minutes Inactivity Logout
class SessionManager {
  constructor() {
    this.INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes
    this.ACTIVITY_KEY = 'lastActivity';
    this.timer = null;
  }

  // Set session and start activity monitoring
  setSession(token) {
    localStorage.setItem('token', token);
    this.updateActivity();
    this.startActivityMonitoring();
  }

  // Update last activity time
  updateActivity() {
    localStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
    this.resetTimer();
  }

  // Check if session exists (no expiry check for navigation)
  isSessionValid() {
    return !!localStorage.getItem('token');
  }

  // Start monitoring user activity
  startActivityMonitoring() {
    // Track user interactions
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), true);
    });
    
    this.resetTimer();
  }

  // Reset inactivity timer
  resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    
    this.timer = setTimeout(() => {
      this.logout();
      window.location.href = '/login';
    }, this.INACTIVITY_TIMEOUT);
  }

  // Manual logout only
  logout() {
    if (this.timer) clearTimeout(this.timer);
    localStorage.removeItem('token');
    localStorage.removeItem(this.ACTIVITY_KEY);
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }
}

export default new SessionManager();