// Common TypeScript types for the CampusHub application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'event' | 'urgent';
  targetAudience: 'all' | 'students' | 'faculty' | 'specific';
  departments?: string[];
  authorId: string;
  author: User;
  attachments?: Attachment[];
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: string;
  year: number;
  department: string;
  facultyId: string;
  faculty: User;
  students: User[];
  schedule: CourseSchedule[];
  isActive: boolean;
}

export interface CourseSchedule {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string;
  endTime: string;
  location: string;
  type: 'lecture' | 'lab' | 'tutorial';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}