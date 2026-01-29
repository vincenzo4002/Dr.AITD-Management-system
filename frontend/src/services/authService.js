import api from '../api/axiosInstance';

class AuthService {
  async login(credentials, role) {
    // Unified login route
    const response = await api.post('/api/auth/login', {
      ...credentials,
      role
    });
    return response.data;
  }

  async register(userData, role) {
    const endpoint = role === 'student' ? '/api/student/register' :
      role === 'teacher' ? '/api/teacher/register' :
        '/api/admin/register';

    const response = await api.post(endpoint, userData);
    return response.data;
  }

  async forgotPassword(email, role) {
    const endpoint = `/api/${role}/forgetPassword`;
    const response = await api.post(endpoint, { email });
    return response.data;
  }

  async verifyOtp(otp, userId, role) {
    const endpoint = `/api/${role}/verifyOtp`;
    const response = await api.post(endpoint, { otp, userId });
    return response.data;
  }

  async resetPassword(userId, otp, newPassword, role) {
    const endpoint = `/api/${role}/resetPassword`;
    const response = await api.post(endpoint, {
      userId,
      otp,
      password: newPassword
    });
    return response.data;
  }

  async updatePassword(currentPassword, newPassword, userId, role, token = null) {
    const endpoint = `/api/${role}/${userId}/change-password`;
    
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};

    const response = await api.post(endpoint, {
      oldPassword: currentPassword,
      newPassword
    }, config);
    return response.data;
  }
}

export default new AuthService();