import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { notices, noticeReads, users, departments } from '../schema/complete.js';
import { eq, and, or, isNull, desc, sql, inArray } from 'drizzle-orm';

/**
 * Get all notices with filters
 * Available filters: type, scope, department, isRead, today
 * Supports smart targeting based on user's department, year, and role
 */
export async function getNotices(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Extract filters from query parameters
        const {
            type,
            scope,
            department: filterDepartment,
            isRead,
            today
        } = req.query;

        // Get current user details for targeting
        const [currentUser] = await db
            .select({
                id: users.id,
                role: users.role,
                departmentId: users.departmentId,
                academicYearId: users.academicYearId
            })
            .from(users)
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        // Build query conditions
        const conditions: any[] = [
            eq(notices.isActive, true)
        ];

        // Filter by type if provided
        if (type && ['urgent', 'important', 'general'].includes(type as string)) {
            conditions.push(eq(notices.type, type as any));
        }

        // Filter by scope if provided
        if (scope && ['GLOBAL', 'DEPARTMENT', 'YEAR'].includes(scope as string)) {
            conditions.push(eq(notices.scope, scope as any));
        }

        // Filter by today's date if requested
        if (today === 'true') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            conditions.push(
                sql`${notices.publishedAt} >= ${todayStart.toISOString()} AND ${notices.publishedAt} <= ${todayEnd.toISOString()}`
            );
        }

        // Filter by expiration (only show non-expired notices)
        conditions.push(
            or(
                isNull(notices.expiresAt),
                sql`${notices.expiresAt} > NOW()`
            )
        );

        // Fetch all notices matching base conditions
        let allNotices = await db
            .select({
                notice: notices,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                },
                readStatus: {
                    id: noticeReads.id,
                    readAt: noticeReads.readAt
                }
            })
            .from(notices)
            .leftJoin(users, eq(notices.createdBy, users.id))
            .leftJoin(
                noticeReads,
                and(
                    eq(noticeReads.noticeId, notices.id),
                    eq(noticeReads.userId, user.userId)
                )
            )
            .where(and(...conditions))
            .orderBy(desc(notices.publishedAt));

        // Filter notices based on targeting logic (client-side filtering)
        const filteredNotices = allNotices.filter(row => {
            const notice = row.notice;

            // Global scope notices are always visible
            if (notice.scope === 'GLOBAL' &&
                !notice.targetDepartments?.length &&
                !notice.targetYears?.length &&
                !notice.targetRoles?.length) {
                return true;
            }

            // Check department targeting
            if (notice.targetDepartments && notice.targetDepartments.length > 0) {
                if (!currentUser.departmentId || !notice.targetDepartments.includes(currentUser.departmentId)) {
                    return false;
                }
            }

            // Check year targeting
            if (notice.targetYears && notice.targetYears.length > 0) {
                if (!currentUser.academicYearId) {
                    return false;
                }
                // Note: In a real scenario, you'd fetch the year code/name and match it
                // For now, we'll assume the academicYearId is sufficient
            }

            // Check role targeting
            if (notice.targetRoles && notice.targetRoles.length > 0) {
                if (!notice.targetRoles.includes(currentUser.role)) {
                    return false;
                }
            }

            return true;
        });

        // Apply isRead filter if provided
        let resultNotices = filteredNotices;
        if (isRead !== undefined) {
            const readFilter = isRead === 'true';
            resultNotices = filteredNotices.filter(row => {
                const isNoticeRead = row.readStatus?.readAt !== null;
                return isNoticeRead === readFilter;
            });
        }

        // Format the response
        const formattedNotices = resultNotices.map(row => ({
            id: row.notice.id,
            title: row.notice.title,
            content: row.notice.content,
            type: row.notice.type,
            scope: row.notice.scope,
            targetYears: row.notice.targetYears,
            targetDepartments: row.notice.targetDepartments,
            targetRoles: row.notice.targetRoles,
            attachmentUrl: row.notice.attachmentUrl,
            publishedAt: row.notice.publishedAt,
            expiresAt: row.notice.expiresAt,
            isActive: row.notice.isActive,
            createdBy: row.createdByUser?.name || 'Unknown',
            createdByEmail: row.createdByUser?.email,
            isRead: row.readStatus?.readAt !== null,
            readAt: row.readStatus?.readAt,
            createdAt: row.notice.createdAt,
            updatedAt: row.notice.updatedAt
        }));

        res.json({
            success: true,
            message: 'Notices retrieved successfully',
            data: formattedNotices,
            count: formattedNotices.length
        });

    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching notices',
            code: 'NOTICES_FETCH_ERROR'
        });
    }
}

/**
 * Get a single notice by ID
 */
export async function getNoticeById(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Notice ID is required',
                code: 'MISSING_NOTICE_ID'
            });
            return;
        }

        // Fetch the notice with creator info and read status
        const [noticeData] = await db
            .select({
                notice: notices,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                },
                readStatus: {
                    id: noticeReads.id,
                    readAt: noticeReads.readAt
                }
            })
            .from(notices)
            .leftJoin(users, eq(notices.createdBy, users.id))
            .leftJoin(
                noticeReads,
                and(
                    eq(noticeReads.noticeId, notices.id),
                    eq(noticeReads.userId, user.userId)
                )
            )
            .where(eq(notices.id, id))
            .limit(1);

        if (!noticeData) {
            res.status(404).json({
                success: false,
                message: 'Notice not found',
                code: 'NOTICE_NOT_FOUND'
            });
            return;
        }

        // Check if notice is active
        if (!noticeData.notice.isActive) {
            res.status(404).json({
                success: false,
                message: 'Notice not found or inactive',
                code: 'NOTICE_INACTIVE'
            });
            return;
        }

        // Check if notice is expired
        if (noticeData.notice.expiresAt && new Date(noticeData.notice.expiresAt) < new Date()) {
            res.status(404).json({
                success: false,
                message: 'Notice has expired',
                code: 'NOTICE_EXPIRED'
            });
            return;
        }

        // Format the response
        const formattedNotice = {
            id: noticeData.notice.id,
            title: noticeData.notice.title,
            content: noticeData.notice.content,
            type: noticeData.notice.type,
            scope: noticeData.notice.scope,
            targetYears: noticeData.notice.targetYears,
            targetDepartments: noticeData.notice.targetDepartments,
            targetRoles: noticeData.notice.targetRoles,
            attachmentUrl: noticeData.notice.attachmentUrl,
            publishedAt: noticeData.notice.publishedAt,
            expiresAt: noticeData.notice.expiresAt,
            isActive: noticeData.notice.isActive,
            createdBy: noticeData.createdByUser?.name || 'Unknown',
            createdByEmail: noticeData.createdByUser?.email,
            isRead: noticeData.readStatus?.readAt !== null,
            readAt: noticeData.readStatus?.readAt,
            createdAt: noticeData.notice.createdAt,
            updatedAt: noticeData.notice.updatedAt
        };

        res.json({
            success: true,
            message: 'Notice retrieved successfully',
            data: formattedNotice
        });

    } catch (error) {
        console.error('Get notice by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching notice',
            code: 'NOTICE_FETCH_ERROR'
        });
    }
}

/**
 * Mark a notice as read
 */
export async function markNoticeAsRead(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Notice ID is required',
                code: 'MISSING_NOTICE_ID'
            });
            return;
        }

        // Check if notice exists and is active
        const [notice] = await db
            .select({ id: notices.id, isActive: notices.isActive })
            .from(notices)
            .where(eq(notices.id, id))
            .limit(1);

        if (!notice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found',
                code: 'NOTICE_NOT_FOUND'
            });
            return;
        }

        if (!notice.isActive) {
            res.status(400).json({
                success: false,
                message: 'Cannot mark inactive notice as read',
                code: 'NOTICE_INACTIVE'
            });
            return;
        }

        // Check if already marked as read
        const [existingRead] = await db
            .select()
            .from(noticeReads)
            .where(
                and(
                    eq(noticeReads.noticeId, id),
                    eq(noticeReads.userId, user.userId)
                )
            )
            .limit(1);

        if (existingRead) {
            res.json({
                success: true,
                message: 'Notice already marked as read',
                data: {
                    readAt: existingRead.readAt
                }
            });
            return;
        }

        // Insert read record
        const [readRecord] = await db
            .insert(noticeReads)
            .values({
                noticeId: id,
                userId: user.userId,
                readAt: new Date()
            })
            .returning();

        if (!readRecord) {
            res.status(500).json({
                success: false,
                message: 'Failed to mark notice as read',
                code: 'NOTICE_READ_INSERT_FAILED'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Notice marked as read successfully',
            data: {
                readAt: readRecord.readAt
            }
        });

    } catch (error) {
        console.error('Mark notice as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while marking notice as read',
            code: 'NOTICE_READ_ERROR'
        });
    }
}
