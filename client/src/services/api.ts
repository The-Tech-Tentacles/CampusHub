/**
 * Centralized API Service for CampusHub Frontend
 * Production-ready service with error handling, interceptors, and TypeScript support
 */

// =================== TYPES ===================
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    code?: string;
    requirements?: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    departmentId?: string;
    academicYearId?: string;
    enrollmentNumber?: string;
    phone?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'STUDENT' | 'FACULTY' | 'HOD' | 'DEAN' | 'ADMIN';
    departmentId?: string;
    departmentCode?: string;
    department?: string; // Backward compatibility
    academicYearId?: string;
    academicYearCode?: string;
    academicLevel?: string;
    year?: string; // Backward compatibility
    enrollmentNumber?: string;
    employeeId?: string;
    phone?: string;
    avatarUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
}

export interface AcademicYear {
    id: string;
    name: string;
    code: string;
    level: 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DOCTORATE';
    startYear: number;
    endYear: number;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    type: 'urgent' | 'important' | 'general';
    scope: 'GLOBAL' | 'DEPARTMENT' | 'YEAR';
    targetYears?: string[];
    targetDepartments?: string[];
    targetRoles?: string[];
    attachmentUrl?: string;
    publishedAt: string;
    expiresAt?: string;
    isActive: boolean;
    createdBy: string;
    createdByEmail?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;

    // Event Category (REGULAR or ACADEMIC)
    eventCategory: 'REGULAR' | 'ACADEMIC';

    // Event Type (unified - can be EventType or AcademicEventType)
    type: string;

    // Date fields (works for both single-day and multi-day events)
    startDate: string;
    endDate: string;

    // Regular event specific fields (optional for academic events)
    location?: string;
    instructor?: string;

    // Academic event specific fields (optional for regular events)
    isHoliday?: boolean;
    academicYear?: number;
    semester?: 1 | 2 | null;

    // Common fields
    linkUrl?: string;
    targetYears?: string[];
    targetDepartments?: string[];
    targetRoles?: string[];
    isActive: boolean;
    createdBy: string;
    createdByEmail?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Application {
    id: string;
    title: string;
    type: string;
    description: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
    submittedBy: string;
    submittedByEmail?: string;
    department?: string;
    departmentCode?: string;
    proofFileUrl?: string;
    mentorStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    mentorNotes?: string;
    mentorReviewedAt?: string;
    hodStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    hodNotes?: string;
    hodReviewedAt?: string;
    requiresDeanApproval: boolean;
    deanStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    deanNotes?: string;
    deanReviewedAt?: string;
    escalationReason?: string;
    currentLevel: 'MENTOR' | 'HOD' | 'DEAN' | 'COMPLETED';
    finalDecision: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApplicationRequest {
    title: string;
    type: string;
    description: string;
    proofFileUrl?: string;
}

export interface UpdateApplicationStatusRequest {
    status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    notes?: string;
    escalate?: boolean;
    escalationReason?: string;
}

export interface Form {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdByEmail?: string;
    createdAt: string;
    deadline: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
    department?: string;
    departmentCode?: string;
    formData: Record<string, any>; // JSON structure defining form fields
    maxSubmissions?: number;
    allowMultipleSubmissions: boolean;
    requiresApproval: boolean;
    targetYears?: string[];
    targetDepartments?: string[];
    targetRoles?: string[];
    isSubmitted: boolean;
    submittedAt?: string;
    submissionData?: Record<string, any>;
}

export interface FormSubmission {
    id: string;
    formId: string;
    submissionData: Record<string, any>;
    submittedAt: string;
    submittedBy: {
        id: string;
        name: string;
        email: string;
        enrollmentNumber?: string;
        department?: string;
        departmentCode?: string;
    };
}

export interface CreateFormRequest {
    title: string;
    description: string;
    deadline: string;
    formData: Record<string, any>;
    targetYears?: string[];
    targetDepartments?: string[];
    targetRoles?: string[];
    departmentId?: string;
    maxSubmissions?: number;
    allowMultipleSubmissions?: boolean;
    requiresApproval?: boolean;
}

// =================== API CLIENT ===================
class ApiClient {
    private baseURL: string;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        // Use environment variable or fallback to localhost
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        // Initialize tokens from localStorage
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    /**
     * Set authentication tokens
     */
    setTokens(tokens: TokenPair) {
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    }

    /**
     * Clear authentication tokens
     */
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    /**
     * Make authenticated API request with automatic token refresh
     */
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Merge with existing headers
        if (options.headers) {
            Object.assign(headers, options.headers);
        }

        // Add authorization header if we have an access token
        if (this.accessToken) {
            headers.Authorization = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 - try to refresh token
            if (response.status === 401 && this.refreshToken) {
                console.log('Received 401, attempting token refresh...');
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    console.log('Token refreshed successfully, retrying request');
                    // Retry the original request with new token
                    const retryHeaders = {
                        ...headers,
                        Authorization: `Bearer ${this.accessToken}`,
                    };
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: retryHeaders,
                    });

                    if (!retryResponse.ok) {
                        let retryData;
                        try {
                            retryData = await retryResponse.json();
                        } catch {
                            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                        }
                        throw new Error(retryData.message || `HTTP ${retryResponse.status}`);
                    }

                    return await retryResponse.json();
                } else {
                    // Refresh failed - redirect to login only if not already on login page
                    console.log('Token refresh failed, clearing auth');
                    this.clearTokens();
                    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                        window.location.href = '/login';
                    }
                    throw new Error('Session expired');
                }
            }

            // Try to parse response as JSON
            let data: ApiResponse<T>;
            try {
                data = await response.json();
            } catch (e) {
                // If not JSON, create error response
                console.error('Failed to parse JSON response:', e);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error: any) {
            console.error('API Request failed:', {
                url,
                method: options.method || 'GET',
                error: error.message,
                status: error.status
            });
            throw error;
        }
    }

    /**
     * Try to refresh the access token
     */
    private async tryRefreshToken(): Promise<boolean> {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken,
                }),
            });

            if (response.ok) {
                const data: ApiResponse<{ tokens: TokenPair }> = await response.json();
                if (data.success && data.data?.tokens) {
                    this.setTokens(data.data.tokens);
                    return true;
                }
            }

            return false;
        } catch {
            return false;
        }
    }

    // =================== AUTH ENDPOINTS ===================
    /**
     * User login
     */
    async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; tokens: TokenPair }>> {
        return this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    /**
     * User registration
     */
    async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; tokens: TokenPair }>> {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    /**
     * User logout
     */
    async logout(): Promise<ApiResponse> {
        return this.makeRequest('/auth/logout', {
            method: 'POST',
        });
    }

    /**
     * Get current user profile
     */
    async getProfile(): Promise<ApiResponse<User>> {
        return this.makeRequest('/auth/profile');
    }

    /**
     * Update user profile
     */
    async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
        return this.makeRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
        return this.makeRequest('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
        });
    }

    /**
     * Get faculty list for mentor selection
     */
    async getFacultyList(): Promise<ApiResponse> {
        return this.makeRequest('/faculty');
    }

    /**
     * Get faculty statistics (mentees, pending reviews, etc.)
     */
    async getFacultyStats(): Promise<ApiResponse> {
        return this.makeRequest('/faculty/stats');
    }

    /**
     * Get all rooms with optional search
     */
    async getRooms(search?: string): Promise<ApiResponse> {
        const queryParam = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.makeRequest(`/rooms${queryParam}`);
    }

    /**
     * Get list of mentees assigned to faculty
     */
    async getFacultyMentees(): Promise<ApiResponse> {
        return this.makeRequest('/faculty/mentees');
    }

    /**
     * Get faculty profile
     */
    async getFacultyProfile(): Promise<ApiResponse> {
        return this.makeRequest('/faculty/profile');
    }

    /**
     * Update faculty profile
     */
    async updateFacultyProfile(profileData: any): Promise<ApiResponse> {
        return this.makeRequest('/faculty/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // =================== DEPARTMENT ENDPOINTS ===================
    /**
     * Get all departments
     */
    async getDepartments(): Promise<ApiResponse<Department[]>> {
        return this.makeRequest('/departments');
    }

    /**
     * Get department by ID
     */
    async getDepartment(id: string): Promise<ApiResponse<Department>> {
        return this.makeRequest(`/departments/${id}`);
    }

    // =================== ACADEMIC YEAR ENDPOINTS ===================
    /**
     * Get all academic years
     */
    async getAcademicYears(): Promise<ApiResponse<AcademicYear[]>> {
        return this.makeRequest('/academic-years');
    }

    /**
     * Get academic year by ID
     */
    async getAcademicYear(id: string): Promise<ApiResponse<AcademicYear>> {
        return this.makeRequest(`/academic-years/${id}`);
    }

    // =================== NOTICES ENDPOINTS ===================
    /**
     * Get all notices with optional filters
     */
    async getNotices(filters?: {
        type?: 'urgent' | 'important' | 'general';
        scope?: 'GLOBAL' | 'DEPARTMENT' | 'YEAR';
        department?: string;
        isRead?: boolean;
        today?: boolean;
    }): Promise<ApiResponse<Notice[]>> {
        const queryParams = new URLSearchParams();

        if (filters?.type) queryParams.append('type', filters.type);
        if (filters?.scope) queryParams.append('scope', filters.scope);
        if (filters?.department) queryParams.append('department', filters.department);
        if (filters?.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
        if (filters?.today !== undefined) queryParams.append('today', filters.today.toString());

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/notices?${queryString}` : '/notices';

        return this.makeRequest(endpoint);
    }

    /**
     * Get notice by ID
     */
    async getNotice(id: string): Promise<ApiResponse<Notice>> {
        return this.makeRequest(`/notices/${id}`);
    }

    /**
     * Mark notice as read
     */
    async markNoticeAsRead(id: string): Promise<ApiResponse<{ readAt: string }>> {
        return this.makeRequest(`/notices/${id}/read`, {
            method: 'PATCH',
        });
    }

    /**
     * Create a new notice
     */
    async createNotice(noticeData: Partial<Notice>): Promise<ApiResponse<Notice>> {
        return this.makeRequest('/faculty/notices', {
            method: 'POST',
            body: JSON.stringify(noticeData),
        });
    }

    /**
     * Get notices created by current user
     */
    async getMyNotices(): Promise<ApiResponse<Notice[]>> {
        return this.makeRequest('/faculty/notices');
    }

    /**
     * Update a notice
     */
    async updateNotice(id: string, noticeData: Partial<Notice>): Promise<ApiResponse<Notice>> {
        return this.makeRequest(`/faculty/notices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(noticeData),
        });
    }

    /**
     * Delete a notice
     */
    async deleteNotice(id: string): Promise<ApiResponse<void>> {
        return this.makeRequest(`/faculty/notices/${id}`, {
            method: 'DELETE',
        });
    }

    // =================== EVENT ENDPOINTS ===================
    /**
     * Get all events with optional filters
     */
    async getEvents(filters?: {
        month?: number;
        year?: number;
        type?: Event['type'];
        department?: string;
    }): Promise<ApiResponse<Event[]>> {
        const queryParams = new URLSearchParams();

        if (filters?.month !== undefined) queryParams.append('month', filters.month.toString());
        if (filters?.year !== undefined) queryParams.append('year', filters.year.toString());
        if (filters?.type) queryParams.append('type', filters.type);
        if (filters?.department) queryParams.append('department', filters.department);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/events?${queryString}` : '/events';

        return this.makeRequest(endpoint);
    }

    /**
     * Get event by ID
     */
    async getEvent(id: string): Promise<ApiResponse<Event>> {
        return this.makeRequest(`/events/${id}`);
    }

    /**
     * Create a new event
     */
    async createEvent(eventData: Partial<Event>): Promise<ApiResponse<Event>> {
        return this.makeRequest('/faculty/events', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
    }

    /**
     * Get events created by current user
     */
    async getMyEvents(): Promise<ApiResponse<Event[]>> {
        return this.makeRequest('/faculty/events');
    }

    /**
     * Update an event
     */
    async updateEvent(id: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> {
        return this.makeRequest(`/faculty/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
        });
    }

    /**
     * Delete an event
     */
    async deleteEvent(id: string): Promise<ApiResponse<void>> {
        return this.makeRequest(`/faculty/events/${id}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get all events with optional filters (supports both REGULAR and ACADEMIC)
     */
    async getAcademicEvents(filters?: {
        year?: number;
        month?: number;
        semester?: 1 | 2;
        eventCategory?: 'REGULAR' | 'ACADEMIC';
    }): Promise<ApiResponse<Event[]>> {
        const queryParams = new URLSearchParams();

        if (filters?.year !== undefined) queryParams.append('year', filters.year.toString());
        if (filters?.month !== undefined) queryParams.append('month', filters.month.toString());
        if (filters?.semester !== undefined) queryParams.append('semester', filters.semester.toString());
        if (filters?.eventCategory) queryParams.append('eventCategory', filters.eventCategory);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/events?${queryString}` : '/events';

        return this.makeRequest(endpoint);
    }

    /**
     * Get event by ID
     */
    async getAcademicEvent(id: string): Promise<ApiResponse<Event>> {
        return this.makeRequest(`/events/${id}`);
    }

    // =================== APPLICATIONS ===================
    /**
     * Get all applications
     */
    async getApplications(): Promise<ApiResponse<Application[]>> {
        return this.makeRequest('/applications');
    }

    /**
     * Get application by ID
     */
    async getApplication(id: string): Promise<ApiResponse<Application>> {
        return this.makeRequest(`/applications/${id}`);
    }

    /**
     * Create a new application
     */
    async createApplication(data: CreateApplicationRequest): Promise<ApiResponse<Application>> {
        return this.makeRequest('/applications', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update application status
     */
    async updateApplicationStatus(id: string, data: UpdateApplicationStatusRequest): Promise<ApiResponse<Application>> {
        return this.makeRequest(`/faculty/applications/${id}/review`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete/Cancel application
     */
    async deleteApplication(id: string): Promise<ApiResponse<void>> {
        return this.makeRequest(`/applications/${id}`, {
            method: 'DELETE',
        });
    }

    // =================== FORMS ===================
    /**
     * Get all forms
     */
    async getForms(): Promise<ApiResponse<Form[]>> {
        return this.makeRequest('/forms');
    }

    /**
     * Get form by ID
     */
    async getForm(id: string): Promise<ApiResponse<Form>> {
        return this.makeRequest(`/forms/${id}`);
    }

    /**
     * Create a new form
     */
    async createForm(data: CreateFormRequest): Promise<ApiResponse<Form>> {
        return this.makeRequest('/faculty/forms', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Submit a form
     */
    async submitForm(id: string, submissionData: Record<string, any>): Promise<ApiResponse<FormSubmission>> {
        return this.makeRequest(`/forms/${id}/submit`, {
            method: 'POST',
            body: JSON.stringify({ submissionData }),
        });
    }

    /**
     * Delete a form
     */
    async deleteForm(id: string): Promise<ApiResponse<void>> {
        return this.makeRequest(`/faculty/forms/${id}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get forms created by current user
     */
    async getMyForms(): Promise<ApiResponse<Form[]>> {
        return this.makeRequest('/faculty/forms');
    }

    /**
     * Get all submissions for a form
     */
    async getFormSubmissions(id: string): Promise<ApiResponse<FormSubmission[]>> {
        return this.makeRequest(`/faculty/forms/${id}/submissions`);
    }

    /**
     * Update a form
     */
    async updateForm(id: string, data: Partial<CreateFormRequest>): Promise<ApiResponse<Form>> {
        return this.makeRequest(`/forms/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // =================== UTILITY METHODS ===================
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }
}

// =================== API INSTANCE ===================
export const api = new ApiClient();

// =================== CONVENIENCE FUNCTIONS ===================
export const authAPI = {
    login: (credentials: LoginRequest) => api.login(credentials),
    register: (userData: RegisterRequest) => api.register(userData),
    logout: () => api.logout(),
    getProfile: () => api.getProfile(),
    updateProfile: (updates: Partial<User>) => api.updateProfile(updates),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.changePassword(currentPassword, newPassword),
};

export const departmentAPI = {
    getAll: () => api.getDepartments(),
    getById: (id: string) => api.getDepartment(id),
};

export const academicYearAPI = {
    getAll: () => api.getAcademicYears(),
    getById: (id: string) => api.getAcademicYear(id),
};

export const noticeAPI = {
    getAll: (filters?: Parameters<typeof api.getNotices>[0]) => api.getNotices(filters),
    getById: (id: string) => api.getNotice(id),
    markAsRead: (id: string) => api.markNoticeAsRead(id),
    create: (noticeData: Partial<Notice>) => api.createNotice(noticeData),
    getMy: () => api.getMyNotices(),
    update: (id: string, noticeData: Partial<Notice>) => api.updateNotice(id, noticeData),
    delete: (id: string) => api.deleteNotice(id),
};

export const eventAPI = {
    getAll: (filters?: Parameters<typeof api.getEvents>[0]) => api.getEvents(filters),
    getById: (id: string) => api.getEvent(id),
    create: (eventData: Partial<Event>) => api.createEvent(eventData),
    update: (id: string, eventData: Partial<Event>) => api.updateEvent(id, eventData),
    delete: (id: string) => api.deleteEvent(id),
    getMy: () => api.getMyEvents(),
};

export const academicEventAPI = {
    getAll: (filters?: Parameters<typeof api.getAcademicEvents>[0]) => api.getAcademicEvents(filters),
    getById: (id: string) => api.getAcademicEvent(id),
};

export const applicationAPI = {
    getAll: () => api.getApplications(),
    getById: (id: string) => api.getApplication(id),
    create: (data: CreateApplicationRequest) => api.createApplication(data),
    updateStatus: (id: string, data: UpdateApplicationStatusRequest) => api.updateApplicationStatus(id, data),
    delete: (id: string) => api.deleteApplication(id),
};

export const formAPI = {
    getAll: () => api.getForms(),
    getById: (id: string) => api.getForm(id),
    create: (data: CreateFormRequest) => api.createForm(data),
    submit: (id: string, submissionData: Record<string, any>) => api.submitForm(id, submissionData),
    delete: (id: string) => api.deleteForm(id),
    getMy: () => api.getMyForms(),
    getSubmissions: (id: string) => api.getFormSubmissions(id),
    update: (id: string, data: Partial<CreateFormRequest>) => api.updateForm(id, data),
};

export default api;