import { db } from '../config/database';
import {
    users,
    notices,
    applications,
    notifications,
    noticeReads,
    forms,
    formSubmissions,
    departments,
    userSessions,
    type User,
    type InsertUser,
    type Notice,
    type InsertNotice,
    type Application,
    type InsertApplication,
    type Notification,
    type InsertNotification,
    type NoticeRead,
    type Form,
    type Department
} from '../../../shared/schema';
import { eq, and, desc, sql, count, isNull, or, gte, lte } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// =================== USER SERVICE ===================

export class UserService {
    // Get user by ID
    async getUser(id: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
    }

    // Get user by email
    async getUserByEmail(email: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
    }

    // Get user by enrollment number
    async getUserByEnrollment(enrollmentNumber: string): Promise<User | undefined> {
        const result = await db.select().from(users)
            .where(eq(users.enrollmentNumber, enrollmentNumber)).limit(1);
        return result[0];
    }

    // Create new user
    async createUser(insertUser: InsertUser): Promise<User> {
        const hashedPassword = await bcrypt.hash(insertUser.passwordHash, 12);

        const result = await db.insert(users).values({
            ...insertUser,
            passwordHash: hashedPassword
        }).returning();

        return result[0];
    }

    // Update user
    async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
        const result = await db.update(users)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return result[0];
    }

    // Get users by role
    async getUsersByRole(role: string): Promise<User[]> {
        return db.select().from(users).where(eq(users.role, role));
    }

    // Get users by department
    async getUsersByDepartment(department: string): Promise<User[]> {
        return db.select().from(users).where(eq(users.department, department));
    }

    // Verify user password
    async verifyPassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.passwordHash);
    }

    // List all users with pagination
    async listUsers(options: {
        page?: number;
        limit?: number;
        role?: string;
        department?: string;
        isActive?: boolean;
    } = {}): Promise<{ users: User[]; total: number }> {
        const { page = 1, limit = 20, role, department, isActive } = options;
        const offset = (page - 1) * limit;

        const conditions = [];
        if (role) conditions.push(eq(users.role, role));
        if (department) conditions.push(eq(users.department, department));
        if (isActive !== undefined) conditions.push(eq(users.isActive, isActive));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [userList, totalCount] = await Promise.all([
            db.select().from(users)
                .where(whereClause)
                .limit(limit)
                .offset(offset)
                .orderBy(desc(users.createdAt)),
            db.select({ count: count() }).from(users).where(whereClause)
        ]);

        return {
            users: userList,
            total: totalCount[0].count
        };
    }

    // Deactivate user
    async deactivateUser(id: string): Promise<boolean> {
        const result = await db.update(users)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return result.length > 0;
    }

    // Activate user
    async activateUser(id: string): Promise<boolean> {
        const result = await db.update(users)
            .set({ isActive: true, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return result.length > 0;
    }

    // Update user password
    async updatePassword(id: string, newPassword: string): Promise<boolean> {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await db.update(users)
            .set({ passwordHash: hashedPassword, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return result.length > 0;
    }
}

export const userService = new UserService();