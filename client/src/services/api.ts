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
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    // Retry the original request with new token
                    const retryHeaders = {
                        ...headers,
                        Authorization: `Bearer ${this.accessToken}`,
                    };
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers: retryHeaders,
                    });
                    return await retryResponse.json();
                } else {
                    // Refresh failed - redirect to login
                    this.clearTokens();
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
            }

            const data: ApiResponse<T> = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
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

export default api;