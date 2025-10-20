import { db } from '../config/database';
import {
    notices,
    noticeReads,
    type Notice,
    type InsertNotice,
    type NoticeRead
} from '../../../shared/schema';
import { eq, and, desc, sql, or, count } from 'drizzle-orm';

// =================== NOTICE SERVICE ===================

export class NoticeService {
    // Get all notices with filters
    async getNotices(filters: {
        type?: string;
        scope?: string;
        departmentId?: string;
        isActive?: boolean;
        userId?: string; // For checking read status
        limit?: number;
        offset?: number;
    } = {}): Promise<Notice[]> {
        const conditions = [];

        if (filters.type) conditions.push(eq(notices.type, filters.type));
        if (filters.scope) conditions.push(eq(notices.scope, filters.scope));
        if (filters.departmentId) conditions.push(eq(notices.departmentId, filters.departmentId));
        if (filters.isActive !== undefined) conditions.push(eq(notices.isActive, filters.isActive));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return db.select().from(notices)
            .where(whereClause)
            .orderBy(desc(notices.publishedAt))
            .limit(filters.limit || 50)
            .offset(filters.offset || 0);
    }

    // Get notice by ID
    async getNotice(id: string): Promise<Notice | undefined> {
        const result = await db.select().from(notices).where(eq(notices.id, id)).limit(1);
        return result[0];
    }

    // Create new notice
    async createNotice(insertNotice: InsertNotice, createdBy: string): Promise<Notice> {
        const result = await db.insert(notices).values({
            ...insertNotice,
            createdBy
        }).returning();

        return result[0];
    }

    // Update notice
    async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice | undefined> {
        const result = await db.update(notices)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(notices.id, id))
            .returning();
        return result[0];
    }

    // Delete notice (soft delete)
    async deleteNotice(id: string): Promise<boolean> {
        const result = await db.update(notices)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(notices.id, id))
            .returning();
        return result.length > 0;
    }

    // Mark notice as read by user
    async markNoticeAsRead(noticeId: string, userId: string): Promise<NoticeRead> {
        const result = await db.insert(noticeReads).values({
            noticeId,
            userId
        }).onConflictDoNothing().returning();

        return result[0];
    }

    // Get unread notices for user
    async getUnreadNotices(userId: string, departmentId?: string): Promise<Notice[]> {
        const subquery = db.select({ noticeId: noticeReads.noticeId })
            .from(noticeReads)
            .where(eq(noticeReads.userId, userId));

        return db.select().from(notices)
            .where(and(
                eq(notices.isActive, true),
                sql`${notices.id} NOT IN ${subquery}`,
                or(
                    eq(notices.scope, "GLOBAL"),
                    and(
                        eq(notices.scope, "DEPARTMENT"),
                        departmentId ? eq(notices.departmentId, departmentId) : sql`1=1`
                    )
                )
            ))
            .orderBy(desc(notices.publishedAt));
    }

    // Get notices with pagination and counts
    async getNoticesWithPagination(options: {
        page?: number;
        limit?: number;
        type?: string;
        scope?: string;
        departmentId?: string;
        isActive?: boolean;
        userId?: string;
    } = {}): Promise<{ notices: Notice[]; total: number; unreadCount?: number }> {
        const { page = 1, limit = 20, userId, ...filters } = options;
        const offset = (page - 1) * limit;

        const conditions = [];
        if (filters.type) conditions.push(eq(notices.type, filters.type));
        if (filters.scope) conditions.push(eq(notices.scope, filters.scope));
        if (filters.departmentId) conditions.push(eq(notices.departmentId, filters.departmentId));
        if (filters.isActive !== undefined) conditions.push(eq(notices.isActive, filters.isActive));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [noticeList, totalCount] = await Promise.all([
            db.select().from(notices)
                .where(whereClause)
                .limit(limit)
                .offset(offset)
                .orderBy(desc(notices.publishedAt)),
            db.select({ count: count() }).from(notices).where(whereClause)
        ]);

        let unreadCount: number | undefined;
        if (userId) {
            const unreadResult = await this.getUnreadNotices(userId, filters.departmentId);
            unreadCount = unreadResult.length;
        }

        return {
            notices: noticeList,
            total: totalCount[0].count,
            unreadCount
        };
    }

    // Check if notice is read by user
    async isNoticeReadByUser(noticeId: string, userId: string): Promise<boolean> {
        const result = await db.select().from(noticeReads)
            .where(and(
                eq(noticeReads.noticeId, noticeId),
                eq(noticeReads.userId, userId)
            ))
            .limit(1);

        return result.length > 0;
    }

    // Get notice read statistics
    async getNoticeReadStats(noticeId: string): Promise<{ totalReads: number; readBy: string[] }> {
        const reads = await db.select().from(noticeReads)
            .where(eq(noticeReads.noticeId, noticeId));

        return {
            totalReads: reads.length,
            readBy: reads.map(r => r.userId)
        };
    }
}

export const noticeService = new NoticeService();