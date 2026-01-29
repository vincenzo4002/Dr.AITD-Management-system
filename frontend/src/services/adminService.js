import api from '../api/axiosInstance';

class AdminService {
  // api instance automatically handles headers

  // Dashboard
  async getDashboard() {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  }

  // Course Management
  async getCourses() {
    const response = await api.get('/api/admin/courses');
    return response.data;
  }

  async createCourse(courseData) {
    const response = await api.post('/api/admin/courses', courseData);
    return response.data;
  }

  async updateCourse(courseId, courseData) {
    const response = await api.put(`/api/admin/courses/${courseId}`, courseData);
    return response.data;
  }

  async deleteCourse(courseId) {
    const response = await api.delete(`/api/admin/courses/${courseId}`);
    return response.data;
  }

  // Subject Management
  async getSubjects() {
    const response = await api.get('/api/admin/subjects');
    return response.data;
  }

  async createSubject(subjectData) {
    const response = await api.post('/api/admin/subjects', subjectData);
    return response.data;
  }

  // Teacher Management
  async getTeachers() {
    const response = await api.get('/api/admin/teachers');
    return response.data;
  }

  async createTeacher(teacherData) {
    const response = await api.post('/api/admin/teachers', teacherData);
    return response.data;
  }

  async updateTeacher(teacherId, teacherData) {
    const response = await api.put(`/api/admin/teachers/${teacherId}`, teacherData);
    return response.data;
  }

  async deleteTeacher(teacherId) {
    const response = await api.delete(`/api/admin/teachers/${teacherId}`);
    return response.data;
  }

  // Student Management
  async getStudents() {
    const response = await api.get('/api/admin/students');
    return response.data;
  }

  async createStudent(studentData) {
    const response = await api.post('/api/admin/students', studentData);
    return response.data;
  }

  async updateStudent(studentId, studentData) {
    const response = await api.put(`/api/admin/students/${studentId}`, studentData);
    return response.data;
  }

  async deleteStudent(studentId) {
    const response = await api.delete(`/api/admin/students/${studentId}`);
    return response.data;
  }

  // Reports
  async generateReport(reportType, filters = {}) {
    // Validate reportType against allowed values to prevent SSRF
    const allowedReportTypes = ['fees', 'academic', 'enrollment', 'attendance'];
    
    if (!allowedReportTypes.includes(reportType)) {
      throw new Error('Invalid report type');
    }

    let url = `/api/admin/reports/${reportType}`;

    // Handle special case for attendance report
    if (reportType === 'attendance') {
      url = `/api/admin/attendance-report`;
    }

    const response = await api.get(url, { params: filters });
    return response.data;
  }

  // Library Management
  async getBooks() {
    const response = await api.get('/api/admin/library/books');
    return response.data;
  }

  async addBook(bookData) {
    const response = await api.post('/api/admin/library/books', bookData);
    return response.data;
  }

  async deleteBook(bookId) {
    const response = await api.delete(`/api/admin/library/books/${bookId}`);
    return response.data;
  }

  async issueBook(issueData) {
    const response = await api.post('/api/admin/library/issue', issueData);
    return response.data;
  }

  async returnBook(returnData) {
    const response = await api.post('/api/admin/library/return', returnData);
    return response.data;
  }

  // Fee Management
  async getFees() {
    const response = await api.get('/api/admin/fees');
    return response.data;
  }

  // Settings
  async getSettings() {
    const response = await api.get('/api/admin/settings');
    return response.data;
  }

  async updateSettings(settings) {
    const response = await api.put('/api/admin/settings', settings);
    return response.data;
  }
}

export default new AdminService();