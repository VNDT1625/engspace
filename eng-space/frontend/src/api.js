import axios from 'axios';

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
};

// Get API base URL from environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // If relative path starting with /uploads, add backend base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  // If relative path, assume it's from public folder
  return imagePath;
};

const readToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
  } catch {
    // ignore storage errors
  }
};

API.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearStoredAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getProfile = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/me', data);
export const updatePlan = (data) => API.post('/auth/plan', data);

// Courses
export const getCourses = () => API.get('/courses');
export const getCourseDetails = (slug) => API.get(`/courses/slug/${slug}`);
export const getCourseById = (id) => API.get(`/courses/${id}`);

// Payments
export const purchaseCourse = (payload) => API.post('/payments/course', payload);
export const purchasePlan = (payload) => API.post('/payments/plan', payload);
export const getMyPayments = () => API.get('/payments/me');

// Admin
export const getAdminSummary = () => API.get('/admin/summary');
export const exportRevenuePdf = () => API.get('/admin/revenue/pdf', { responseType: 'blob' });
export const exportRevenueDoc = () => API.get('/admin/revenue/doc', { responseType: 'blob' });
export const createCourse = (payload) => API.post('/courses', payload);
export const updateCourse = (id, payload) => API.put(`/courses/${id}`, payload);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

// Admin - User Management
export const getUsers = (params) => API.get('/admin/users', { params });
export const createAdmin = (payload) => API.post('/admin/users', payload);
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// Admin - Upload
export const uploadImage = (formData) => API.post('/admin/upload/image', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Contact
export const submitContactMessage = (payload) => API.post('/contact', payload);
export const getMyContacts = () => API.get('/contact/me');
export const getContacts = (params) => API.get('/contact', { params });
export const updateContactStatus = (id, status, notes) => API.put(`/contact/${id}`, { status, notes });

// Quizzes
export const getQuizzes = (params) => API.get('/quizzes', { params });
export const getQuizBySlug = (slug) => API.get(`/quizzes/${slug}`);
export const getQuizByLesson = (courseSlug, lessonId) => API.get(`/quizzes/lesson/${courseSlug}/${lessonId}`);
export const recordQuizResult = (payload) => API.post('/quizzes/results', payload);
export const getQuizHistory = () => API.get('/quizzes/results/me');
export const createQuiz = (payload) => API.post('/quizzes', payload);
export const updateQuiz = (id, payload) => API.put(`/quizzes/${id}`, payload);
export const deleteQuiz = (id) => API.delete(`/quizzes/${id}`);

// Enrollments
export const enrollCourse = (data) => API.post('/enrollments', data);
export const getMyEnrollments = () => API.get('/enrollments/me');

// Vocab (Chrome Extension)
export const getMyVocab = (params) => API.get('/extension/my-vocab', { params });

// Readings
export const getReadings = () => API.get('/readings');
export const getReadingBySlug = (slug) => API.get(`/readings/${slug}`);
export const translateReadingText = (text, source = 'en', target = 'vi') =>
  API.get('/readings/translate', { params: { text, source, target } });
export const saveReadingNote = (payload) => API.post('/readings/notes', payload);
export const getMyReadingNotes = (params) => API.get('/readings/notes/me', { params });
export const submitReadingAttempt = (payload) => API.post('/readings/submit', payload);
export const getMyReadingResults = () => API.get('/readings/results/me');
export const getReadingResultDetail = (id) => API.get(`/readings/results/${id}`);

export default API;

