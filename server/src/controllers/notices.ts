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

/**
 * Create a new notice (Faculty/HOD/Admin only)
 */
export async function createNotice(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can create notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        const {
            title,
            content,
            type = 'general',
            scope = 'GLOBAL',
            targetYears,
            targetDepartments,
            targetRoles,
            expiresAt
        } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            res.status(400).json({
                success: false,
                message: 'Title is required',
                code: 'MISSING_TITLE'
            });
            return;
        }

        if (!content || !content.trim()) {
            res.status(400).json({
                success: false,
                message: 'Content is required',
                code: 'MISSING_CONTENT'
            });
            return;
        }

        // Validate type
        if (!['urgent', 'important', 'general'].includes(type)) {
            res.status(400).json({
                success: false,
                message: 'Invalid notice type',
                code: 'INVALID_TYPE'
            });
            return;
        }

        // Validate scope
        if (!['GLOBAL', 'DEPARTMENT', 'YEAR'].includes(scope)) {
            res.status(400).json({
                success: false,
                message: 'Invalid scope',
                code: 'INVALID_SCOPE'
            });
            return;
        }

        // Create notice
        const [newNotice] = await db
            .insert(notices)
            .values({
                title: title.trim(),
                content: content.trim(),
                type: type as any,
                scope: scope as any,
                targetYears: targetYears || [],
                targetDepartments: targetDepartments || [],
                targetRoles: targetRoles || [],
                createdBy: user.userId,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: true,
                publishedAt: new Date()
            })
            .returning();

        if (!newNotice) {
            res.status(500).json({
                success: false,
                message: 'Failed to create notice',
                code: 'NOTICE_CREATE_FAILED'
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            data: {
                id: newNotice.id,
                title: newNotice.title,
                content: newNotice.content,
                type: newNotice.type,
                scope: newNotice.scope,
                publishedAt: newNotice.publishedAt,
                expiresAt: newNotice.expiresAt
            }
        });

    } catch (error) {
        console.error('Create notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating notice',
            code: 'NOTICE_CREATE_ERROR'
        });
    }
}

/**
 * Get notices created by the current user (Faculty/HOD/Admin)
 */
export async function getMyNotices(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can access this endpoint',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Fetch notices created by this user
        const userNotices = await db
            .select({
                notice: notices,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(notices)
            .leftJoin(users, eq(notices.createdBy, users.id))
            .where(eq(notices.createdBy, user.userId))
            .orderBy(desc(notices.createdAt));

        // Format the response
        const formattedNotices = userNotices.map(row => ({
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
            createdAt: row.notice.createdAt,
            updatedAt: row.notice.updatedAt
        }));

        res.json({
            success: true,
            message: 'Your notices retrieved successfully',
            data: formattedNotices,
            count: formattedNotices.length
        });

    } catch (error) {
        console.error('Get my notices error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching your notices',
            code: 'MY_NOTICES_FETCH_ERROR'
        });
    }
}

/**
 * Update a notice
 * Only the creator or admin can update a notice
 */
export async function updateNotice(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { id } = req.params;
        const {
            title,
            content,
            type,
            scope,
            targetYears,
            targetDepartments,
            targetRoles,
            expiresAt
        } = req.body;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can update notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Check if notice exists
        const [existingNotice] = await db
            .select()
            .from(notices)
            .where(eq(notices.id, id))
            .limit(1);

        if (!existingNotice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found',
                code: 'NOTICE_NOT_FOUND'
            });
            return;
        }

        // Check if user is the creator or admin
        if (existingNotice.createdBy !== user.userId && user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'You can only update your own notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (type !== undefined) updateData.type = type;
        if (scope !== undefined) updateData.scope = scope;
        if (targetYears !== undefined) updateData.targetYears = targetYears;
        if (targetDepartments !== undefined) updateData.targetDepartments = targetDepartments;
        if (targetRoles !== undefined) updateData.targetRoles = targetRoles;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

        // Update the notice
        const [updatedNotice] = await db
            .update(notices)
            .set(updateData)
            .where(eq(notices.id, id))
            .returning();

        res.json({
            success: true,
            message: 'Notice updated successfully',
            data: updatedNotice
        });

    } catch (error) {
        console.error('Update notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating notice',
            code: 'NOTICE_UPDATE_ERROR'
        });
    }
}

/**
 * Delete a notice
 * Only the creator or admin can delete a notice
 */
export async function deleteNotice(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { id } = req.params;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can delete notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Check if notice exists
        const [existingNotice] = await db
            .select()
            .from(notices)
            .where(eq(notices.id, id))
            .limit(1);

        if (!existingNotice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found',
                code: 'NOTICE_NOT_FOUND'
            });
            return;
        }

        // Check if user is the creator or admin
        if (existingNotice.createdBy !== user.userId && user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'You can only delete your own notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Soft delete by setting isActive to false
        await db
            .update(notices)
            .set({
                isActive: false,
                updatedAt: new Date()
            })
            .where(eq(notices.id, id));

        res.json({
            success: true,
            message: 'Notice deleted successfully'
        });

    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting notice',
            code: 'NOTICE_DELETE_ERROR'
        });
    }
}
