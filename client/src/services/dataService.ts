// Centralized data service that simulates API calls
// This will serve as our single source of truth for all data across the application

import { UserRole } from "@/stores/auth-store";
import { AlertTriangle, Info, Clock } from "lucide-react";
import { noticeAPI, eventAPI, academicEventAPI, applicationAPI, formAPI, api } from "./api";

// =================== TYPES ===================
export type NoticeType = "urgent" | "important" | "general";
export type NoticeScope = "GLOBAL" | "DEPARTMENT" | "YEAR";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW" | "ESCALATED";
export type FormStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type NotificationType = "NOTICE" | "FORM" | "APPLICATION" | "SYSTEM" | "ALERT";
export type EventType = "LECTURE" | "LAB" | "EXAM" | "SEMINAR" | "WORKSHOP" | "SPORTS" | "CULTURAL" | "GENERIC";
export type EventStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type AcademicEventType = "SEMESTER_START" | "SEMESTER_END" | "EXAM_WEEK" | "HOLIDAY" | "REGISTRATION" | "ORIENTATION" | "BREAK" | "OTHER";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface Profile {
    id?: string;
    userId: string;

    // Personal Info (All users)
    prefix?: string; // Dr., Prof., Mr., Ms., etc.
    dateOfBirth?: string;
    gender?: Gender;
    bloodGroup?: string;
    altEmail?: string;
    address?: string;
    permanentAddress?: string;
    bio?: string;

    // Academic Info (Students)
    department?: string; // Department name from users table
    year?: string; // Academic year name from users table
    section?: string;
    semester?: string;
    cgpa?: number;
    batch?: string;
    rollNumber?: string;
    specialization?: string;
    admissionDate?: string;
    expectedGraduation?: string;
    previousEducation?: string;

    // Faculty/Staff Info
    cabinLocationId?: string;
    cabinLocation?: string; // For display
    officeHours?: string;
    researchInterests?: string[];
    qualifications?: string[];
    experienceYears?: number;

    // Guardian Info (Students)
    guardianName?: string;
    guardianContact?: string;
    guardianEmail?: string;
    guardianRelation?: string;
    guardianOccupation?: string;

    // Mentor Info (Students)
    mentorId?: string;
    mentorName?: string; // For display
    mentorEmail?: string; // Mentor email
    mentorPhone?: string; // Mentor phone

    // Social Links
    socialLinks?: Record<string, string>;

    // Skills and Interests (All users)
    skills?: string[];
    hobbies?: string[];
    achievements?: string[];

    createdAt?: string;
    updatedAt?: string;
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    readAt: string | null;
    createdAt: string;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    createdBy: string;
    type: NoticeType;
    scope: NoticeScope;
    publishedAt: string;
    isRead: boolean;
    department?: string;
    year?: number;
    targetYears?: string[];
    targetDepartments?: string[];
    targetRoles?: string[];
    attachmentUrl?: string;
    expiresAt?: string;
    isActive?: boolean;
    createdByEmail?: string;
    readAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TimetableSlot {
    id?: string;
    subject: string;
    subject_id?: string;
    room: string;
    room_id?: string;
    type: "Lecture" | "Lab" | "Seminar" | "Break";
    faculty?: string;
    faculty_id?: string;
    department_id?: string;
    academic_year_id?: string;
    section?: string;
    batch?: string; // Batch number (1, 2, 3, 4, etc.)
    semester?: number;
}

export interface Timetable {
    [day: string]: {
        [time: string]: TimetableSlot;
    };
}

export interface Application {
    id: string;
    title: string;
    type: string;
    description: string;
    status: ApplicationStatus;
    submittedBy: string;
    submittedByEmail?: string;
    department?: string;
    departmentCode?: string;
    proofFileUrl?: string;
    mentorStatus: ApplicationStatus;
    mentorNotes?: string;
    mentorReviewedAt?: string;
    hodStatus: ApplicationStatus;
    hodNotes?: string;
    hodReviewedAt?: string;
    requiresDeanApproval?: boolean;
    deanStatus?: ApplicationStatus;
    deanNotes?: string;
    deanReviewedAt?: string;
    escalationReason?: string;
    currentLevel: 'MENTOR' | 'HOD' | 'DEAN' | 'COMPLETED';
    finalDecision: ApplicationStatus;
    submittedAt: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Form {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdByEmail?: string;
    createdAt: string;
    deadline: string;
    status: FormStatus;
    department?: string;
    departmentCode?: string;
    formData: Record<string, any>; // JSON structure defining form fields
    submissions: number;
    maxSubmissions?: number;
    allowMultipleSubmissions?: boolean;
    requiresApproval?: boolean;
    targetYears?: string[];
    targetDepartments?: string[];
    targetRoles?: string[];
    isSubmitted?: boolean;
    submittedAt?: string;
    submissionData?: Record<string, any>;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    year?: string;
    enrollmentNumber?: string;
    joiningDate?: string;
    avatar?: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    type: EventType;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    instructor?: string;
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

export interface AcademicEvent {
    id: string;
    title: string;
    description?: string;
    type: AcademicEventType;
    startDate: string;
    endDate: string;
    isHoliday: boolean;
    linkUrl?: string;
    targetYears?: string[];
    targetDepartments?: string[];
    targetRoles?: string[];
    academicYear: number;
    semester: 1 | 2;
    canEdit: boolean;
    createdBy: string;
    createdByEmail?: string;
    createdAt: string;
    updatedAt: string;
}

// =================== MOCK DATA ===================

// Mock Notifications Data
const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "NOTICE",
        title: "New Notice Published",
        body: "Mid-Semester Examination Schedule has been released",
        readAt: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
        id: "2",
        type: "FORM",
        title: "Form Submission Required",
        body: "Student Feedback Form - Semester 1 is now available",
        readAt: null,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
        id: "3",
        type: "APPLICATION",
        title: "Application Approved",
        body: "Your leave application has been approved",
        readAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Read yesterday
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    },
    {
        id: "4",
        type: "SYSTEM",
        title: "System Maintenance",
        body: "Scheduled maintenance tonight from 2 AM to 4 AM",
        readAt: null,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    },
];

// Mock Timetable Data
// Schedule: 9:15 AM - 4:15 PM
// Short Break: 11:15 AM - 11:30 AM
// Long Break (Lunch): 1:30 PM - 2:15 PM
// Lectures: 1 hour, Labs: 2 hours (but shown as single entry at start time)
const mockTimetable: Timetable = {
    "Monday": {
        "9:15 AM": { subject: "Data Structures", room: "Room 205", type: "Lecture", faculty: "Dr. Smith" },
        "10:15 AM": { subject: "Operating Systems", room: "Room 302", type: "Lecture", faculty: "Prof. Johnson" },
        "11:15 AM": { subject: "Short", room: "-", type: "Break" },
        "11:30 AM": { subject: "Database Management", room: "Lab 301", type: "Lab", faculty: "Dr. Brown", batch: "1" },
        "1:30 PM": { subject: "Lunch", room: "-", type: "Break" },
        "2:15 PM": { subject: "Computer Networks", room: "Room 104", type: "Lecture", faculty: "Dr. Wilson" },
        "3:15 PM": { subject: "Software Engineering", room: "Room 201", type: "Lecture", faculty: "Prof. Davis" },
    },
    "Tuesday": {
        "9:15 AM": { subject: "Computer Architecture", room: "Room 105", type: "Lecture", faculty: "Dr. Taylor" },
        "10:15 AM": { subject: "Database Management", room: "Room 203", type: "Lecture", faculty: "Dr. Brown" },
        "11:15 AM": { subject: "Short", room: "-", type: "Break" },
        "11:30 AM": { subject: "Database Management", room: "Lab 302", type: "Lab", faculty: "Dr. Brown", batch: "2" },
        "1:30 PM": { subject: "Lunch", room: "-", type: "Break" },
        "2:15 PM": { subject: "Operating Systems", room: "Lab 303", type: "Lab", faculty: "Prof. Johnson", batch: "1" },
    },
    "Wednesday": {
        "9:15 AM": { subject: "Software Engineering", room: "Lab 401", type: "Lab", faculty: "Prof. Davis", batch: "1" },
        "11:15 AM": { subject: "Short", room: "-", type: "Break" },
        "11:30 AM": { subject: "Computer Networks", room: "Room 302", type: "Lecture", faculty: "Dr. Wilson" },
        "12:30 PM": { subject: "Computer Architecture", room: "Room 105", type: "Lecture", faculty: "Dr. Taylor" },
        "1:30 PM": { subject: "Lunch", room: "-", type: "Break" },
        "2:15 PM": { subject: "Mathematics", room: "Room 202", type: "Lecture", faculty: "Dr. Anderson" },
        "3:15 PM": { subject: "Technical Seminar", room: "Auditorium", type: "Seminar", faculty: "Various Speakers" },
    },
    "Thursday": {
        "9:15 AM": { subject: "Operating Systems", room: "Room 302", type: "Lecture", faculty: "Prof. Johnson" },
        "10:15 AM": { subject: "Data Structures", room: "Room 205", type: "Lecture", faculty: "Dr. Smith" },
        "11:15 AM": { subject: "Short ", room: "-", type: "Break" },
        "11:30 AM": { subject: "Computer Networks ", room: "Lab 303", type: "Lab", faculty: "Dr. Wilson" },
        "1:30 PM": { subject: "Lunch ", room: "-", type: "Break" },
        "2:15 PM": { subject: "Database Management", room: "Room 104", type: "Lecture", faculty: "Dr. Brown" },
        "3:15 PM": { subject: "Software Engineering", room: "Room 201", type: "Lecture", faculty: "Prof. Davis" },
    },
    "Friday": {
        "9:15 AM": { subject: "Mathematics", room: "Room 202", type: "Lecture", faculty: "Dr. Anderson" },
        "10:15 AM": { subject: "Computer Architecture", room: "Room 105", type: "Lecture", faculty: "Dr. Taylor" },
        "11:15 AM": { subject: "Short ", room: "-", type: "Break" },
        "11:30 AM": { subject: "Software Engineering ", room: "Lab 401", type: "Lab", faculty: "Prof. Davis" },
        "1:30 PM": { subject: "Lunch ", room: "-", type: "Break" },
        "2:15 PM": { subject: "Project Work ", room: "Lab 302", type: "Lab", faculty: "Multiple Faculty" },
    },
};

// Users data now comes from backend API

// =================== DATA SERVICE CLASS ===================

class DataService {
    // private notices: Notice[] = [];
    private timetable: Timetable = { ...mockTimetable };
    // private applications: Application[] = [];
    // private forms: Form[] = [];
    private notifications: Notification[] = [...mockNotifications];
    private events: Event[] = [];
    private academicEvents: AcademicEvent[] = [];

    // ===== NOTICES ===== (Now using real API)
    async getNotices(filters?: {
        type?: NoticeType;
        scope?: NoticeScope;
        department?: string;
        isRead?: boolean;
        today?: boolean;
    }): Promise<Notice[]> {
        try {
            const response = await noticeAPI.getAll(filters);
            if (response.success && response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching notices:', error);
            return [];
        }
    }

    async getNoticeById(id: string): Promise<Notice | null> {
        try {
            const response = await noticeAPI.getById(id);
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching notice:', error);
            return null;
        }
    }

    async markNoticeAsRead(id: string): Promise<boolean> {
        try {
            const response = await noticeAPI.markAsRead(id);
            return response.success;
        } catch (error) {
            console.error('Error marking notice as read:', error);
            return false;
        }
    }

    // ===== TIMETABLE =====
    async getTimetable(): Promise<Timetable> {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { ...this.timetable };
    }

    async getTodaySchedule(): Promise<(TimetableSlot & { time: string })[]> {
        await new Promise(resolve => setTimeout(resolve, 50));

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];

        const todayClasses = this.timetable[today] || {};

        return Object.entries(todayClasses).map(([time, classInfo]) => ({
            ...classInfo,
            time,
        }));
    }

    // ===== APPLICATIONS =====
    async getApplications(filters?: {
        status?: ApplicationStatus;
        type?: string;
        submittedBy?: string;
    }): Promise<Application[]> {
        try {
            const response = await applicationAPI.getAll();

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to fetch applications');
            }

            let applications = response.data;

            // Apply client-side filters if needed
            if (filters?.status) {
                applications = applications.filter(app => app.status === filters.status);
            }

            if (filters?.type) {
                applications = applications.filter(app => app.type === filters.type);
            }

            if (filters?.submittedBy) {
                applications = applications.filter(app => app.submittedBy === filters.submittedBy);
            }

            return applications;
        } catch (error) {
            console.error('Error fetching applications:', error);
            return [];
        }
    }

    async getApplicationById(id: string): Promise<Application | null> {
        try {
            const response = await applicationAPI.getById(id);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to fetch application');
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching application:', error);
            return null;
        }
    }

    async createApplication(data: {
        title: string;
        type: string;
        description: string;
        proofFileUrl?: string;
    }): Promise<Application | null> {
        try {
            const response = await applicationAPI.create(data);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Failed to create application');
            }

            return response.data;
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    }

    async deleteApplication(id: string): Promise<boolean> {
        try {
            const response = await applicationAPI.delete(id);
            return response.success;
        } catch (error) {
            console.error('Error deleting application:', error);
            return false;
        }
    }

    // ===== FORMS ===== (Now using real API)
    async getForms(filters?: {
        status?: FormStatus;
        department?: string;
    }): Promise<Form[]> {
        try {
            const response = await formAPI.getAll();
            if (response.success && response.data) {
                let forms = response.data.map((form: any) => ({
                    id: form.id,
                    title: form.title,
                    description: form.description,
                    createdBy: form.createdBy,
                    createdByEmail: form.createdByEmail,
                    createdAt: form.createdAt,
                    deadline: form.deadline,
                    status: form.status as FormStatus,
                    department: form.department,
                    departmentCode: form.departmentCode,
                    formData: form.formData || {},
                    submissions: 0, // Not tracked in this version
                    maxSubmissions: form.maxSubmissions,
                    allowMultipleSubmissions: form.allowMultipleSubmissions,
                    requiresApproval: form.requiresApproval,
                    targetYears: form.targetYears,
                    targetDepartments: form.targetDepartments,
                    targetRoles: form.targetRoles,
                    isSubmitted: form.isSubmitted,
                    submittedAt: form.submittedAt,
                    submissionData: form.submissionData
                }));

                // Apply client-side filters if needed
                const now = new Date();
                if (filters?.status) {
                    if (filters.status === "ACTIVE") {
                        forms = forms.filter((form: Form) =>
                            form.status === "ACTIVE" && new Date(form.deadline) > now
                        );
                    } else {
                        forms = forms.filter((form: Form) => form.status === filters.status);
                    }
                }

                if (filters?.department) {
                    forms = forms.filter((form: Form) =>
                        !form.department || form.department === filters.department || form.department === "All Departments"
                    );
                }

                return forms;
            }
            return [];
        } catch (error) {
            console.error('Error fetching forms:', error);
            return [];
        }
    }

    async getFormById(id: string): Promise<Form | null> {
        try {
            const response = await formAPI.getById(id);
            if (response.success && response.data) {
                const form = response.data;
                return {
                    id: form.id,
                    title: form.title,
                    description: form.description,
                    createdBy: form.createdBy,
                    createdByEmail: form.createdByEmail,
                    createdAt: form.createdAt,
                    deadline: form.deadline,
                    status: form.status as FormStatus,
                    department: form.department,
                    departmentCode: form.departmentCode,
                    formData: form.formData || {},
                    submissions: 0,
                    maxSubmissions: form.maxSubmissions,
                    allowMultipleSubmissions: form.allowMultipleSubmissions,
                    requiresApproval: form.requiresApproval,
                    targetYears: form.targetYears,
                    targetDepartments: form.targetDepartments,
                    targetRoles: form.targetRoles,
                    isSubmitted: form.isSubmitted,
                    submittedAt: form.submittedAt,
                    submissionData: form.submissionData
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching form:', error);
            return null;
        }
    }

    async submitForm(id: string, submissionData: Record<string, any>): Promise<boolean> {
        try {
            const response = await formAPI.submit(id, submissionData);
            return response.success;
        } catch (error) {
            console.error('Error submitting form:', error);
            return false;
        }
    }

    // ===== USERS =====
    async getUsers(filters?: {
        role?: UserRole;
        department?: string;
    }): Promise<User[]> {
        // TODO: Implement backend API endpoint for fetching users list
        // For now, return empty array as this is admin functionality
        return [];
    }

    // ===== STATISTICS =====
    async getStats(userRole?: UserRole): Promise<{
        classesToday: number;
        totalNotices: number;
        unreadNotices: number;
        pendingApplications: number;
        activeForms: number;
        totalUsers: number;
        // Detailed form counts
        submittedForms: number;
        missedForms: number;
        // Detailed application counts
        approvedApplications: number;
        rejectedApplications: number;
        underReviewApplications: number;
    }> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const todaySchedule = await this.getTodaySchedule();
        const allNotices = await this.getNotices();
        const unreadNotices = await this.getNotices({ isRead: false });

        // Application counts
        const pendingApps = await this.getApplications({ status: "PENDING" });
        const approvedApps = await this.getApplications({ status: "APPROVED" });
        const rejectedApps = await this.getApplications({ status: "REJECTED" });
        const underReviewApps = await this.getApplications({ status: "UNDER_REVIEW" });

        // Form counts
        const activeForms = await this.getForms({ status: "ACTIVE" }); // Now excludes expired forms
        const allForms = await this.getForms();
        const now = new Date();
        const submittedForms = allForms.filter(form => form.isSubmitted === true);
        // Missed forms are expired forms that were not submitted
        // They can be either INACTIVE (already expired) or ACTIVE forms that expired
        const missedForms = allForms.filter(form =>
            new Date(form.deadline) <= now &&
            !form.isSubmitted &&
            (form.status === "ACTIVE" || form.status === "INACTIVE")
        );

        const allUsers = await this.getUsers();

        return {
            classesToday: todaySchedule.filter(slot => slot.type !== "Break").length,
            totalNotices: allNotices.length,
            unreadNotices: unreadNotices.length,
            pendingApplications: pendingApps.length,
            activeForms: activeForms.length,
            totalUsers: allUsers.length,
            // Detailed counts
            submittedForms: submittedForms.length,
            missedForms: missedForms.length,
            approvedApplications: approvedApps.length,
            rejectedApplications: rejectedApps.length,
            underReviewApplications: underReviewApps.length,
        };
    }

    // ===== NOTIFICATIONS =====
    async getNotifications(): Promise<Notification[]> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...this.notifications].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    async markNotificationAsRead(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 50));
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.readAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    async markAllNotificationsAsRead(): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.notifications.forEach(notification => {
            if (!notification.readAt) {
                notification.readAt = new Date().toISOString();
            }
        });
        return true;
    }

    async getUnreadNotificationCount(): Promise<number> {
        await new Promise(resolve => setTimeout(resolve, 30));
        return this.notifications.filter(n => !n.readAt).length;
    }

    // ===== EVENTS ===== (Now using real API)
    async getEvents(filters?: {
        month?: number;
        year?: number;
        type?: EventType;
        department?: string;
    }): Promise<Event[]> {
        try {
            const response = await eventAPI.getAll(filters);
            if (response.success && response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    async getEventById(id: string): Promise<Event | null> {
        try {
            const response = await eventAPI.getById(id);
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching event:', error);
            return null;
        }
    }

    async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const newEvent: Event = {
            ...eventData,
            id: `event_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.events.push(newEvent);
        return newEvent;
    }

    async updateEvent(id: string, updates: Partial<Event>): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 150));

        const eventIndex = this.events.findIndex(e => e.id === id);
        if (eventIndex !== -1) {
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            return true;
        }
        return false;
    }

    async deleteEvent(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const eventIndex = this.events.findIndex(e => e.id === id);
        if (eventIndex !== -1) {
            this.events.splice(eventIndex, 1);
            return true;
        }
        return false;
    }

    // ===== ACADEMIC CALENDAR ===== (Now using real API)
    async getAcademicEvents(filters?: {
        year?: number;
        month?: number;
        semester?: 1 | 2;
        type?: AcademicEventType;
    }): Promise<AcademicEvent[]> {
        try {
            const response = await academicEventAPI.getAll(filters);
            if (response.success && response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching academic events:', error);
            return [];
        }
    }

    async getAcademicEventById(id: string): Promise<AcademicEvent | null> {
        try {
            const response = await academicEventAPI.getById(id);
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching academic event:', error);
            return null;
        }
    }

    async createAcademicEvent(eventData: Omit<AcademicEvent, 'id'>): Promise<AcademicEvent> {
        await new Promise(resolve => setTimeout(resolve, 150));

        const newEvent: AcademicEvent = {
            ...eventData,
            id: `ac_${Date.now()}`
        };

        this.academicEvents.push(newEvent);
        return newEvent;
    }

    async updateAcademicEvent(id: string, updates: Partial<AcademicEvent>): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const eventIndex = this.academicEvents.findIndex(e => e.id === id);
        if (eventIndex !== -1) {
            this.academicEvents[eventIndex] = {
                ...this.academicEvents[eventIndex],
                ...updates
            };
            return true;
        }
        return false;
    }

    async deleteAcademicEvent(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const eventIndex = this.academicEvents.findIndex(e => e.id === id);
        if (eventIndex !== -1) {
            this.academicEvents.splice(eventIndex, 1);
            return true;
        }
        return false;
    }

    async getFullYearCalendar(year: number): Promise<AcademicEvent[]> {
        return this.getAcademicEvents({ year });
    }

    // ===== PROFILE ===== (Using real API)
    async getUserProfile(): Promise<Profile> {
        try {
            const response = await api.getProfile();
            if (!response.success || !response.data) {
                throw new Error('Failed to fetch profile');
            }
            // Backend returns { success: true, data: { profile: {...} } }
            const profile = (response.data as any).profile;

            // Map backend response to frontend Profile type
            return {
                id: profile.profileId,
                userId: profile.id,

                // Personal Info
                prefix: profile.prefix,
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                bloodGroup: profile.bloodGroup,
                altEmail: profile.altEmail,
                address: profile.address,
                permanentAddress: profile.permanentAddress,
                bio: profile.bio,

                // Academic Info (Students)
                department: profile.department,
                year: profile.year,
                section: profile.section,
                semester: profile.semester,
                cgpa: profile.cgpa ? parseFloat(profile.cgpa) : undefined,
                batch: profile.batch,
                rollNumber: profile.rollNumber,
                specialization: profile.specialization,
                admissionDate: profile.admissionDate,
                expectedGraduation: profile.expectedGraduation,
                previousEducation: profile.previousEducation,

                // Faculty/Staff Info
                officeHours: profile.officeHours,
                researchInterests: profile.researchInterests || [],
                qualifications: profile.qualifications || [],
                experienceYears: profile.experienceYears,

                // Guardian Info
                guardianName: profile.guardianName,
                guardianContact: profile.guardianContact,
                guardianEmail: profile.guardianEmail,
                guardianRelation: profile.guardianRelation,
                guardianOccupation: profile.guardianOccupation,

                // Mentor Info
                mentorId: profile.mentorId,
                mentorName: profile.mentor?.name,
                mentorEmail: profile.mentor?.email,
                mentorPhone: profile.mentor?.phone,

                // Social Links
                socialLinks: profile.socialLinks || {},

                // Skills
                skills: profile.skills || [],

                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
            };
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }

    async updateUserProfile(profileData: Partial<Profile>): Promise<boolean> {
        try {
            const response = await api.updateProfile(profileData as any);
            return response.success;
        } catch (error) {
            console.error('Update user profile error:', error);
            throw error;
        }
    }

    async getFacultyList(): Promise<any[]> {
        try {
            const response = await api.getFacultyList();
            if (!response.success || !response.data) {
                throw new Error('Failed to fetch faculty list');
            }
            return (response.data as any).faculty || [];
        } catch (error) {
            console.error('Get faculty list error:', error);
            throw error;
        }
    }
}

// =================== SINGLETON INSTANCE ===================
export const dataService = new DataService();

// =================== UTILITY FUNCTIONS ===================

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
};

export const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
};

export const getTypeIcon = (type: NoticeType) => {
    switch (type) {
        case "urgent": return AlertTriangle;
        case "important": return Info;
        case "general": return Clock;
    }
};

export const getTypeColor = (type: NoticeType) => {
    switch (type) {
        case "urgent": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
        case "important": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
        case "general": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    }
};