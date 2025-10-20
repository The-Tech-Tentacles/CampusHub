import { db } from '../config/database';
import {
    applications,
    type Application,
    type InsertApplication
} from '../../../shared/schema';
import { eq, and, desc, count } from 'drizzle-orm';

// =================== APPLICATION SERVICE ===================

export class ApplicationService {
    // Get applications with filters
    async getApplications(filters: {
        submittedBy?: string;
        status?: string;
        type?: string;
        departmentId?: string;
        limit?: number;
        offset?: number;
    } = {}): Promise<Application[]> {
        const conditions = [];

        if (filters.submittedBy) conditions.push(eq(applications.submittedBy, filters.submittedBy));
        if (filters.status) conditions.push(eq(applications.status, filters.status));
        if (filters.type) conditions.push(eq(applications.type, filters.type));
        if (filters.departmentId) conditions.push(eq(applications.departmentId, filters.departmentId));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return db.select().from(applications)
            .where(whereClause)
            .orderBy(desc(applications.submittedAt))
            .limit(filters.limit || 50)
            .offset(filters.offset || 0);
    }

    // Get application by ID
    async getApplication(id: string): Promise<Application | undefined> {
        const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
        return result[0];
    }

    // Create new application
    async createApplication(insertApplication: InsertApplication, submittedBy: string): Promise<Application> {
        const result = await db.insert(applications).values({
            ...insertApplication,
            submittedBy
        }).returning();

        return result[0];
    }

    // Update application status
    async updateApplicationStatus(
        id: string,
        status: string,
        updates: Partial<Application> = {}
    ): Promise<Application | undefined> {
        const result = await db.update(applications)
            .set({
                status,
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(applications.id, id))
            .returning();
        return result[0];
    }

    // Get applications with pagination
    async getApplicationsWithPagination(options: {
        page?: number;
        limit?: number;
        submittedBy?: string;
        status?: string;
        type?: string;
        departmentId?: string;
    } = {}): Promise<{ applications: Application[]; total: number }> {
        const { page = 1, limit = 20, ...filters } = options;
        const offset = (page - 1) * limit;

        const conditions = [];
        if (filters.submittedBy) conditions.push(eq(applications.submittedBy, filters.submittedBy));
        if (filters.status) conditions.push(eq(applications.status, filters.status));
        if (filters.type) conditions.push(eq(applications.type, filters.type));
        if (filters.departmentId) conditions.push(eq(applications.departmentId, filters.departmentId));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [applicationList, totalCount] = await Promise.all([
            db.select().from(applications)
                .where(whereClause)
                .limit(limit)
                .offset(offset)
                .orderBy(desc(applications.submittedAt)),
            db.select({ count: count() }).from(applications).where(whereClause)
        ]);

        return {
            applications: applicationList,
            total: totalCount[0].count
        };
    }

    // Update application
    async updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined> {
        const result = await db.update(applications)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(applications.id, id))
            .returning();
        return result[0];
    }

    // Delete application (soft delete if needed or hard delete)
    async deleteApplication(id: string): Promise<boolean> {
        const result = await db.delete(applications)
            .where(eq(applications.id, id))
            .returning();
        return result.length > 0;
    }

    // Get application statistics
    async getApplicationStats(filters: {
        departmentId?: string;
        submittedBy?: string;
        dateFrom?: Date;
        dateTo?: Date;
    } = {}): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        byStatus: Record<string, number>;
    }> {
        const conditions = [];
        if (filters.departmentId) conditions.push(eq(applications.departmentId, filters.departmentId));
        if (filters.submittedBy) conditions.push(eq(applications.submittedBy, filters.submittedBy));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const allApplications = await db.select().from(applications).where(whereClause);

        const stats = {
            total: allApplications.length,
            pending: 0,
            approved: 0,
            rejected: 0,
            byStatus: {} as Record<string, number>
        };

        allApplications.forEach(app => {
            const status = app.status.toLowerCase();
            stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;

            if (status.includes('pending') || status === 'submitted') {
                stats.pending++;
            } else if (status.includes('approved') || status === 'accepted') {
                stats.approved++;
            } else if (status.includes('rejected') || status === 'declined') {
                stats.rejected++;
            }
        });

        return stats;
    }
}

export const applicationService = new ApplicationService();