import { db } from '../config/database';
import {
    notifications,
    type Notification,
    type InsertNotification
} from '../../../shared/schema';
import { eq, and, desc, isNull, count } from 'drizzle-orm';

// =================== NOTIFICATION SERVICE ===================

export class NotificationService {
    // Create notification
    async createNotification(insertNotification: InsertNotification): Promise<Notification> {
        const result = await db.insert(notifications).values(insertNotification).returning();
        return result[0];
    }

    // Get user notifications
    async getUserNotifications(
        userId: string,
        options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
    ): Promise<Notification[]> {
        const conditions = [eq(notifications.userId, userId)];

        if (options.unreadOnly) {
            conditions.push(isNull(notifications.readAt));
        }

        return db.select().from(notifications)
            .where(and(...conditions))
            .orderBy(desc(notifications.createdAt))
            .limit(options.limit || 20)
            .offset(options.offset || 0);
    }

    // Mark notification as read
    async markAsRead(id: string): Promise<boolean> {
        const result = await db.update(notifications)
            .set({ readAt: new Date() })
            .where(eq(notifications.id, id))
            .returning();
        return result.length > 0;
    }

    // Mark all notifications as read for user
    async markAllAsRead(userId: string): Promise<number> {
        const result = await db.update(notifications)
            .set({ readAt: new Date() })
            .where(and(
                eq(notifications.userId, userId),
                isNull(notifications.readAt)
            ))
            .returning();

        return result.length;
    }

    // Delete notification
    async deleteNotification(id: string): Promise<boolean> {
        const result = await db.delete(notifications)
            .where(eq(notifications.id, id))
            .returning();
        return result.length > 0;
    }

    // Get unread count for user
    async getUnreadCount(userId: string): Promise<number> {
        const result = await db.select({ count: count() })
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                isNull(notifications.readAt)
            ));

        return result[0].count;
    }

    // Get notifications with pagination
    async getNotificationsWithPagination(options: {
        userId: string;
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    }): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
        const { userId, page = 1, limit = 20, unreadOnly } = options;
        const offset = (page - 1) * limit;

        const conditions = [eq(notifications.userId, userId)];
        if (unreadOnly) {
            conditions.push(isNull(notifications.readAt));
        }

        const whereClause = and(...conditions);

        const [notificationList, totalCount, unreadCount] = await Promise.all([
            db.select().from(notifications)
                .where(whereClause)
                .limit(limit)
                .offset(offset)
                .orderBy(desc(notifications.createdAt)),
            db.select({ count: count() }).from(notifications).where(whereClause),
            this.getUnreadCount(userId)
        ]);

        return {
            notifications: notificationList,
            total: totalCount[0].count,
            unreadCount
        };
    }

    // Create bulk notifications for multiple users
    async createBulkNotifications(
        userIds: string[],
        notificationData: Omit<InsertNotification, 'userId'>
    ): Promise<Notification[]> {
        const notificationsToInsert = userIds.map(userId => ({
            ...notificationData,
            userId
        }));

        const result = await db.insert(notifications)
            .values(notificationsToInsert)
            .returning();

        return result;
    }

    // Delete old notifications (cleanup)
    async deleteOldNotifications(daysOld: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await db.delete(notifications)
            .where(and(
                isNull(notifications.readAt).not(), // Only delete read notifications
                // Note: Need to add date comparison here based on your schema
            ))
            .returning();

        return result.length;
    }

    // Get notification by ID
    async getNotification(id: string): Promise<Notification | undefined> {
        const result = await db.select().from(notifications)
            .where(eq(notifications.id, id))
            .limit(1);

        return result[0];
    }

    // Update notification
    async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | undefined> {
        const result = await db.update(notifications)
            .set(updates)
            .where(eq(notifications.id, id))
            .returning();

        return result[0];
    }
}

export const notificationService = new NotificationService();