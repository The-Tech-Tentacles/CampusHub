// Centralized data service that simulates API calls
// This will serve as our single source of truth for all data across the application

import { UserRole } from "@/stores/auth-store";
import { AlertTriangle, Info, Clock } from "lucide-react";

// =================== TYPES ===================
export type NoticeType = "urgent" | "important" | "general";
export type NoticeScope = "GLOBAL" | "DEPARTMENT" | "YEAR" | "CLASS";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
export type FormStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type NotificationType = "NOTICE" | "FORM" | "APPLICATION" | "SYSTEM" | "ALERT";
export type EventType = "LECTURE" | "LAB" | "EXAM" | "SEMINAR" | "WORKSHOP" | "SPORTS" | "CULTURAL" | "GENERIC";
export type EventStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type AcademicEventType = "SEMESTER_START" | "SEMESTER_END" | "EXAM_WEEK" | "HOLIDAY" | "REGISTRATION" | "ORIENTATION" | "BREAK";

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
}

export interface TimetableSlot {
    subject: string;
    room: string;
    type: "Lecture" | "Lab" | "Seminar";
    faculty?: string;
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
    submittedBy: string;
    submittedAt: string;
    status: ApplicationStatus;
    description: string;
    department?: string;
}

export interface Form {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: string;
    deadline: string;
    status: FormStatus;
    department?: string;
    submissions: number;
    maxSubmissions?: number;
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
    status: EventStatus;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    instructor?: string;
    department?: string;
    isRecurring?: boolean;
    recurringPattern?: "WEEKLY" | "MONTHLY";
    maxAttendees?: number;
    currentAttendees?: number;
    createdBy: string;
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
    department?: string;
    year: number; // Academic year
    semester?: 1 | 2;
    createdBy: string;
    canEdit: boolean; // Based on user role
}

// =================== MOCK DATA ===================

// Mock Notices Data
const mockNotices: Notice[] = [
    {
        id: "1",
        title: "Emergency: Campus Closure Due to Weather Alert",
        content: "Due to severe weather conditions expected tomorrow, all classes and campus activities are suspended. Students are advised to stay in their accommodations and follow safety protocols. The cafeteria will remain open with limited hours (8 AM - 6 PM). Emergency contact: +1-234-567-8900. Further updates will be shared via official channels.",
        createdBy: "Dr. Sarah Johnson",
        type: "urgent",
        scope: "GLOBAL",
        publishedAt: new Date().toISOString(), // Today
        isRead: false,
    },
    {
        id: "2",
        title: "Mid-Semester Examination Schedule Released",
        content: "The schedule for mid-semester examinations has been finalized and is now available on the student portal. Students are required to check their exam timings, venues, and seat numbers before the examination week begins. Any discrepancies should be reported to the academic office within 48 hours. Study materials and guidelines are also available for download.",
        createdBy: "Academic Office",
        type: "important",
        scope: "GLOBAL",
        publishedAt: "2024-01-14T14:20:00Z",
        isRead: false,
        department: "All Departments",
    },
    {
        id: "3",
        title: "Library Timings Extended for Exam Week",
        content: "To support students during the examination period, the central library will extend its operating hours from 7:00 AM to 11:00 PM throughout the exam week. Additional study spaces have been arranged in the community hall. Students are encouraged to follow library rules and maintain silence in designated study areas.",
        createdBy: "Library Administration",
        type: "important",
        scope: "GLOBAL",
        publishedAt: new Date().toISOString(), // Today
        isRead: true,
    },
    {
        id: "4",
        title: "Guest Lecture: Future of AI and Quantum Computing",
        content: "Join us for an exciting guest lecture by Prof. Michael Chen from MIT on 'The Convergence of AI and Quantum Computing: Shaping Tomorrow's Technology'. The session will cover cutting-edge research, career opportunities, and interactive Q&A. Venue: Main Auditorium, Date: January 20th, Time: 2:00 PM - 4:00 PM.",
        createdBy: "Prof. David Williams",
        type: "important",
        scope: "DEPARTMENT",
        publishedAt: "2024-01-12T16:45:00Z",
        isRead: true,
        department: "Computer Science",
    },
    {
        id: "5",
        title: "Annual Sports Day Registration Now Open",
        content: "Get ready for the most exciting event of the year! Annual Sports Day registration is now live on the student portal. Choose from basketball, football, cricket, athletics, and many more events. Early bird registration gets exclusive merchandise. Deadline: January 25th. Let's make this sports day unforgettable!",
        createdBy: "Sports Committee",
        type: "general",
        scope: "GLOBAL",
        publishedAt: "2024-01-11T11:30:00Z",
        isRead: false,
    },
    {
        id: "6",
        title: "Scholarship Applications for Merit Students",
        content: "Merit-based scholarship applications are now open for exceptional students. This scholarship covers 50% of tuition fees for the next semester. Eligibility: CGPA above 8.5, active participation in extracurricular activities, and clean disciplinary record. Application deadline: January 30th. Apply through the student portal.",
        createdBy: "Financial Aid Office",
        type: "important",
        scope: "GLOBAL",
        publishedAt: "2024-01-10T13:20:00Z",
        isRead: true,
    },
];

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
const mockTimetable: Timetable = {
    "Monday": {
        "9:00 AM": { subject: "Data Structures", room: "Room 205", type: "Lecture", faculty: "Dr. Smith" },
        "11:00 AM": { subject: "Operating Systems", room: "Lab 301", type: "Lab", faculty: "Prof. Johnson" },
        "2:00 PM": { subject: "Database Management", room: "Room 104", type: "Lecture", faculty: "Dr. Brown" },
    },
    "Tuesday": {
        "10:00 AM": { subject: "Computer Networks", room: "Room 302", type: "Lecture", faculty: "Dr. Wilson" },
        "1:00 PM": { subject: "Software Engineering", room: "Room 201", type: "Lecture", faculty: "Prof. Davis" },
        "3:00 PM": { subject: "Data Structures", room: "Lab 301", type: "Lab", faculty: "Dr. Smith" },
    },
    "Wednesday": {
        "9:00 AM": { subject: "Database Management", room: "Lab 205", type: "Lab", faculty: "Dr. Brown" },
        "12:00 PM": { subject: "Computer Architecture", room: "Room 105", type: "Lecture", faculty: "Dr. Taylor" },
    },
    "Thursday": {
        "10:00 AM": { subject: "Operating Systems", room: "Room 302", type: "Lecture", faculty: "Prof. Johnson" },
        "2:00 PM": { subject: "Software Engineering", room: "Lab 401", type: "Lab", faculty: "Prof. Davis" },
    },
    "Friday": {
        "9:00 AM": { subject: "Computer Networks", room: "Lab 303", type: "Lab", faculty: "Dr. Wilson" },
        "11:00 AM": { subject: "Seminar", room: "Auditorium", type: "Seminar", faculty: "Various Speakers" },
    },
};

// Mock Applications Data
const mockApplications: Application[] = [
    {
        id: "1",
        title: "Leave Application - Medical Emergency",
        type: "Leave Request",
        submittedBy: "John Doe",
        submittedAt: "2024-01-15T10:00:00Z",
        status: "PENDING",
        description: "Requesting 3 days leave for medical treatment",
        department: "Computer Science",
    },
    {
        id: "2",
        title: "Hostel Room Change Request",
        type: "Accommodation",
        submittedBy: "Jane Smith",
        submittedAt: "2024-01-14T15:30:00Z",
        status: "UNDER_REVIEW",
        description: "Request to change hostel room due to personal reasons",
    },
    {
        id: "3",
        title: "Extra Credit Assignment Submission",
        type: "Academic",
        submittedBy: "Mike Johnson",
        submittedAt: "2024-01-13T09:15:00Z",
        status: "APPROVED",
        description: "Submission for extra credit in Database Management course",
        department: "Computer Science",
    },
    {
        id: "4",
        title: "Event Organization Permission",
        type: "Event",
        submittedBy: "Sarah Wilson",
        submittedAt: "2024-01-12T14:20:00Z",
        status: "APPROVED",
        description: "Permission to organize a tech talk in the auditorium",
    },
];

// Mock Forms Data
const mockForms: Form[] = [
    {
        id: "1",
        title: "Course Feedback Form",
        description: "Mid-semester feedback for all enrolled courses",
        createdBy: "Academic Office",
        createdAt: "2024-01-10T09:00:00Z",
        deadline: "2024-01-25T23:59:00Z",
        status: "ACTIVE",
        submissions: 234,
        maxSubmissions: 500,
    },
    {
        id: "2",
        title: "Hostel Accommodation Preference",
        description: "Submit your hostel room and mess preferences for next semester",
        createdBy: "Hostel Administration",
        createdAt: "2024-01-08T12:00:00Z",
        deadline: "2024-01-30T18:00:00Z",
        status: "ACTIVE",
        department: "All Departments",
        submissions: 156,
        maxSubmissions: 800,
    },
    {
        id: "3",
        title: "Alumni Mentorship Program Registration",
        description: "Register for the alumni mentorship program to get guidance from industry experts",
        createdBy: "Career Services",
        createdAt: "2024-01-05T10:30:00Z",
        deadline: "2024-01-20T17:00:00Z",
        status: "ACTIVE",
        submissions: 89,
        maxSubmissions: 200,
    },
    {
        id: "4",
        title: "Research Project Proposal",
        description: "Submit your final year research project proposal",
        createdBy: "Research Committee",
        createdAt: "2024-01-15T11:00:00Z",
        deadline: "2024-02-15T23:59:00Z",
        status: "ACTIVE",
        department: "Computer Science",
        submissions: 12,
        maxSubmissions: 50,
    },
    {
        id: "5",
        title: "Sports Day Event Registration",
        description: "Register for various sports events in the annual sports day",
        createdBy: "Sports Committee",
        createdAt: "2024-01-01T08:00:00Z",
        deadline: "2024-01-15T20:00:00Z",
        status: "INACTIVE",
        submissions: 345,
        maxSubmissions: 400,
    },
];

// Mock Events Data
const mockEvents: Event[] = [
    {
        id: "1",
        title: "Data Structures - Advanced Topics",
        description: "Deep dive into advanced data structure concepts including graphs and trees",
        type: "LECTURE",
        status: "SCHEDULED",
        date: "2025-10-20",
        startTime: "10:00",
        endTime: "11:30",
        location: "Room 205",
        instructor: "Dr. Sarah Johnson",
        department: "Computer Science",
        createdBy: "faculty_001",
        createdAt: "2025-10-15T09:00:00Z",
        updatedAt: "2025-10-15T09:00:00Z"
    },
    {
        id: "2",
        title: "Machine Learning Workshop",
        description: "Hands-on workshop covering ML algorithms and implementation",
        type: "WORKSHOP",
        status: "SCHEDULED",
        date: "2025-10-22",
        startTime: "14:00",
        endTime: "17:00",
        location: "Lab 301",
        instructor: "Prof. Michael Chen",
        department: "AI & DS",
        maxAttendees: 30,
        currentAttendees: 18,
        createdBy: "faculty_002",
        createdAt: "2025-10-10T10:00:00Z",
        updatedAt: "2025-10-18T15:30:00Z"
    },
    {
        id: "3",
        title: "Cultural Night - Diwali Celebration",
        description: "Traditional Diwali celebration with performances and food",
        type: "CULTURAL",
        status: "SCHEDULED",
        date: "2025-10-30",
        startTime: "18:00",
        endTime: "22:00",
        location: "Auditorium",
        department: "Cultural Committee",
        maxAttendees: 400,
        currentAttendees: 156,
        createdBy: "student_council",
        createdAt: "2025-10-01T14:00:00Z",
        updatedAt: "2025-10-17T16:45:00Z"
    },
    {
        id: "4",
        title: "Mid-Semester Examination",
        description: "Mid-semester examinations for all departments",
        type: "EXAM",
        status: "SCHEDULED",
        date: "2025-11-15",
        startTime: "09:00",
        endTime: "12:00",
        location: "Exam Halls A, B, C",
        department: "All Departments",
        createdBy: "academic_office",
        createdAt: "2025-08-20T11:00:00Z",
        updatedAt: "2025-10-10T14:20:00Z"
    },
    {
        id: "5",
        title: "Guest Lecture: Industry 4.0",
        description: "Industry expert sharing insights on modern manufacturing trends",
        type: "SEMINAR",
        status: "SCHEDULED",
        date: "2025-11-28",
        startTime: "15:00",
        endTime: "16:30",
        location: "Auditorium",
        instructor: "Mr. Rajesh Kumar (Industry Expert)",
        department: "Mechanical Engineering",
        maxAttendees: 200,
        currentAttendees: 89,
        createdBy: "faculty_003",
        createdAt: "2025-10-12T13:30:00Z",
        updatedAt: "2025-10-19T09:15:00Z"
    }
];

// Mock Academic Calendar Data
const mockAcademicEvents: AcademicEvent[] = [
    {
        id: "ac_1",
        title: "Semester 1 Begins",
        description: "Start of Academic Year 2025-26 - First Semester",
        type: "SEMESTER_START",
        startDate: "2025-08-15",
        endDate: "2025-08-15",
        isHoliday: false,
        year: 2025,
        semester: 1,
        createdBy: "academic_office",
        canEdit: true
    },
    {
        id: "ac_2",
        title: "Independence Day",
        description: "National Holiday - Independence Day of India",
        type: "HOLIDAY",
        startDate: "2025-08-15",
        endDate: "2025-08-15",
        isHoliday: true,
        year: 2025,
        createdBy: "academic_office",
        canEdit: false
    },
    {
        id: "ac_3",
        title: "Orientation Week",
        description: "Orientation program for new students",
        type: "ORIENTATION",
        startDate: "2025-08-16",
        endDate: "2025-08-22",
        isHoliday: false,
        year: 2025,
        semester: 1,
        createdBy: "academic_office",
        canEdit: true
    },
    {
        id: "ac_4",
        title: "Diwali Break",
        description: "Diwali festival holidays",
        type: "HOLIDAY",
        startDate: "2025-10-17",
        endDate: "2025-10-27",
        isHoliday: true,
        year: 2025,
        createdBy: "academic_office",
        canEdit: true
    },
    {
        id: "ac_5",
        title: "Mid-Semester Exam Week",
        description: "Mid-semester examinations for all courses",
        type: "EXAM_WEEK",
        startDate: "2025-11-10",
        endDate: "2025-11-20",
        isHoliday: false,
        year: 2025,
        semester: 1,
        createdBy: "academic_office",
        canEdit: true
    },
    {
        id: "ac_6",
        title: "Winter Break",
        description: "Winter vacation break",
        type: "BREAK",
        startDate: "2025-12-20",
        endDate: "2026-01-05",
        isHoliday: true,
        year: 2025,
        createdBy: "academic_office",
        canEdit: true
    },
    {
        id: "ac_7",
        title: "Semester 1 Ends",
        description: "End of First Semester 2025-26",
        type: "SEMESTER_END",
        startDate: "2026-01-15",
        endDate: "2026-01-15",
        isHoliday: false,
        year: 2025,
        semester: 1,
        createdBy: "academic_office",
        canEdit: true
    },
    {
        id: "ac_8",
        title: "Semester 2 Registration",
        description: "Course registration for second semester",
        type: "REGISTRATION",
        startDate: "2026-01-16",
        endDate: "2026-01-25",
        isHoliday: false,
        year: 2025,
        semester: 2,
        createdBy: "academic_office",
        canEdit: true
    }
];

// Mock Users Data
const mockUsers: User[] = [
    {
        id: "1",
        name: "Rax",
        email: "rakesh.yadav@campus.edu",
        role: "STUDENT",
        department: "AI & DS",
        year: "3rd Year",
        enrollmentNumber: "21AI001",
        joiningDate: "2021-08-15",
    },
    {
        id: "2",
        name: "Dr. Sarah Williams",
        email: "s.williams@campus.edu",
        role: "FACULTY",
        department: "Computer Science",
        joiningDate: "2018-07-01",
    },
    {
        id: "3",
        name: "Prof. Michael Chen",
        email: "m.chen@campus.edu",
        role: "HOD",
        department: "Computer Science",
        joiningDate: "2015-08-01",
    },
    {
        id: "4",
        name: "Dr. Emily Davis",
        email: "e.davis@campus.edu",
        role: "DEAN",
        department: "Engineering",
        joiningDate: "2012-06-01",
    },
    {
        id: "5",
        name: "Admin User",
        email: "admin@campus.edu",
        role: "ADMIN",
        department: "Administration",
        joiningDate: "2020-01-01",
    },
];

// =================== DATA SERVICE CLASS ===================

class DataService {
    private notices: Notice[] = [...mockNotices];
    private timetable: Timetable = { ...mockTimetable };
    private applications: Application[] = [...mockApplications];
    private forms: Form[] = [...mockForms];
    private users: User[] = [...mockUsers];
    private notifications: Notification[] = [...mockNotifications];
    private events: Event[] = [...mockEvents];
    private academicEvents: AcademicEvent[] = [...mockAcademicEvents];

    // ===== NOTICES =====
    async getNotices(filters?: {
        type?: NoticeType;
        scope?: NoticeScope;
        department?: string;
        isRead?: boolean;
        today?: boolean;
    }): Promise<Notice[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        let filteredNotices = [...this.notices];

        if (filters?.type) {
            filteredNotices = filteredNotices.filter(notice => notice.type === filters.type);
        }

        if (filters?.scope) {
            filteredNotices = filteredNotices.filter(notice => notice.scope === filters.scope);
        }

        if (filters?.department) {
            filteredNotices = filteredNotices.filter(notice =>
                !notice.department || notice.department === filters.department || notice.department === "All Departments"
            );
        }

        if (filters?.isRead !== undefined) {
            filteredNotices = filteredNotices.filter(notice => notice.isRead === filters.isRead);
        }

        if (filters?.today) {
            const today = new Date().toISOString().split('T')[0];
            filteredNotices = filteredNotices.filter(notice => {
                const noticeDate = new Date(notice.publishedAt).toISOString().split('T')[0];
                return noticeDate === today;
            });
        }

        return filteredNotices.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }

    async getNoticeById(id: string): Promise<Notice | null> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return this.notices.find(notice => notice.id === id) || null;
    }

    async markNoticeAsRead(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 50));
        const notice = this.notices.find(n => n.id === id);
        if (notice) {
            notice.isRead = true;
            return true;
        }
        return false;
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
        await new Promise(resolve => setTimeout(resolve, 100));

        let filteredApps = [...this.applications];

        if (filters?.status) {
            filteredApps = filteredApps.filter(app => app.status === filters.status);
        }

        if (filters?.type) {
            filteredApps = filteredApps.filter(app => app.type === filters.type);
        }

        if (filters?.submittedBy) {
            filteredApps = filteredApps.filter(app => app.submittedBy === filters.submittedBy);
        }

        return filteredApps.sort((a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
    }

    // ===== FORMS =====
    async getForms(filters?: {
        status?: FormStatus;
        department?: string;
    }): Promise<Form[]> {
        await new Promise(resolve => setTimeout(resolve, 100));

        let filteredForms = [...this.forms];

        if (filters?.status) {
            filteredForms = filteredForms.filter(form => form.status === filters.status);
        }

        if (filters?.department) {
            filteredForms = filteredForms.filter(form =>
                !form.department || form.department === filters.department || form.department === "All Departments"
            );
        }

        return filteredForms.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // ===== USERS =====
    async getUsers(filters?: {
        role?: UserRole;
        department?: string;
    }): Promise<User[]> {
        await new Promise(resolve => setTimeout(resolve, 100));

        let filteredUsers = [...this.users];

        if (filters?.role) {
            filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }

        if (filters?.department) {
            filteredUsers = filteredUsers.filter(user => user.department === filters.department);
        }

        return filteredUsers;
    }

    // ===== STATISTICS =====
    async getStats(userRole?: UserRole): Promise<{
        classesToday: number;
        totalNotices: number;
        unreadNotices: number;
        pendingApplications: number;
        activeForms: number;
        totalUsers: number;
    }> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const todaySchedule = await this.getTodaySchedule();
        const allNotices = await this.getNotices();
        const unreadNotices = await this.getNotices({ isRead: false });
        const pendingApps = await this.getApplications({ status: "PENDING" });
        const activeForms = await this.getForms({ status: "ACTIVE" });
        const allUsers = await this.getUsers();

        return {
            classesToday: todaySchedule.length,
            totalNotices: allNotices.length,
            unreadNotices: unreadNotices.length,
            pendingApplications: pendingApps.length,
            activeForms: activeForms.length,
            totalUsers: allUsers.length,
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

    // ===== EVENTS =====
    async getEvents(filters?: {
        month?: number;
        year?: number;
        type?: EventType;
        department?: string;
        status?: EventStatus;
    }): Promise<Event[]> {
        await new Promise(resolve => setTimeout(resolve, 100));

        let filteredEvents = [...this.events];

        if (filters?.month !== undefined && filters?.year !== undefined) {
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === filters.month && eventDate.getFullYear() === filters.year;
            });
        }

        if (filters?.type) {
            filteredEvents = filteredEvents.filter(event => event.type === filters.type);
        }

        if (filters?.department) {
            filteredEvents = filteredEvents.filter(event =>
                !event.department ||
                event.department === filters.department ||
                event.department === "All Departments"
            );
        }

        if (filters?.status) {
            filteredEvents = filteredEvents.filter(event => event.status === filters.status);
        }

        return filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

    // ===== ACADEMIC CALENDAR =====
    async getAcademicEvents(filters?: {
        year?: number;
        month?: number;
        semester?: 1 | 2;
        type?: AcademicEventType;
    }): Promise<AcademicEvent[]> {
        await new Promise(resolve => setTimeout(resolve, 80));

        let filteredEvents = [...this.academicEvents];

        if (filters?.year) {
            filteredEvents = filteredEvents.filter(event => event.year === filters.year);
        }

        if (filters?.month !== undefined) {
            filteredEvents = filteredEvents.filter(event => {
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                return startDate.getMonth() <= filters.month! && endDate.getMonth() >= filters.month!;
            });
        }

        if (filters?.semester) {
            filteredEvents = filteredEvents.filter(event =>
                event.semester === filters.semester || !event.semester
            );
        }

        if (filters?.type) {
            filteredEvents = filteredEvents.filter(event => event.type === filters.type);
        }

        return filteredEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
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