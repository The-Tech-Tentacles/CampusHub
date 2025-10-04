// API service functions for CampusHub

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Generic API request function
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
  
  getCurrentUser: () =>
    apiRequest('/auth/me'),
};

// Notices API
export const noticesAPI = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    
    const queryString = searchParams.toString();
    return apiRequest(`/notices${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/notices/${id}`),
  
  create: (noticeData: any) =>
    apiRequest('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    }),
  
  update: (id: string, noticeData: any) =>
    apiRequest(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noticeData),
    }),
  
  delete: (id: string) =>
    apiRequest(`/notices/${id}`, {
      method: 'DELETE',
    }),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: { page?: number; limit?: number; department?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.department) searchParams.append('department', params.department);
    
    const queryString = searchParams.toString();
    return apiRequest(`/courses${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id: string) =>
    apiRequest(`/courses/${id}`),
  
  create: (courseData: any) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),
  
  update: (id: string, courseData: any) =>
    apiRequest(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }),
  
  delete: (id: string) =>
    apiRequest(`/courses/${id}`, {
      method: 'DELETE',
    }),
};