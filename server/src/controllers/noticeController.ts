import { Request, Response } from 'express';
import { noticeService } from '../services/noticeService';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { InsertNotice } from '../../../shared/schema';

// =================== NOTICE CONTROLLER ===================

export class NoticeController {
    // Get all notices with pagination and filters
    getNotices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const {
            page = 1,
            limit = 20,
            type,
            scope,
            department,
            isActive = true
        } = req.query;

        const result = await noticeService.getNoticesWithPagination({
            page: Number(page),
            limit: Number(limit),
            type: type as string,
            scope: scope as string,
            departmentId: department as string,
            isActive: isActive === 'true',
            userId: (req as any).userId // For read status if user is authenticated
        });

        res.json({
            success: true,
            data: {
                notices: result.notices,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: result.total,
                    pages: Math.ceil(result.total / Number(limit))
                },
                unreadCount: result.unreadCount
            }
        });
    });

    // Get notice by ID
    getNotice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const userId = (req as any).userId;

        const notice = await noticeService.getNotice(id);
        if (!notice) {
            throw new AppError('Notice not found', 404, 'NOTICE_NOT_FOUND');
        }

        // Check if user has read this notice
        let isRead = false;
        if (userId) {
            isRead = await noticeService.isNoticeReadByUser(id, userId);
        }

        res.json({
            success: true,
            data: {
                notice,
                isRead
            }
        });
    });

    // Create new notice (faculty+ access)
    createNotice = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const noticeData: InsertNotice = req.body;

        const notice = await noticeService.createNotice(noticeData, req.userId);

        // Create notifications for relevant users based on scope
        if (notice.scope === 'GLOBAL') {
            // For global notices, you might want to create notifications for all active users
            // This could be done as a background job for performance
        } else if (notice.scope === 'DEPARTMENT' && notice.departmentId) {
            // Create notifications for department users
            const departmentUsers = await userService.getUsersByDepartment(notice.departmentId);
            const userIds = departmentUsers
                .filter(user => user.isActive && user.id !== req.userId)
                .map(user => user.id);

            if (userIds.length > 0) {
                await notificationService.createBulkNotifications(userIds, {
                    title: `New ${notice.type}: ${notice.title}`,
                    body: `A new ${notice.type.toLowerCase()} has been posted in your department.`,
                    type: 'NOTICE',
                    data: { noticeId: notice.id, noticeType: notice.type }
                });
            }
        }

        res.status(201).json({
            success: true,
            data: {
                notice
            }
        });
    });

    // Update notice (creator or admin access)
    updateNotice = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const updates = req.body;

        // Get existing notice to check permissions
        const existingNotice = await noticeService.getNotice(id);
        if (!existingNotice) {
            throw new AppError('Notice not found', 404, 'NOTICE_NOT_FOUND');
        }

        // Check if user can update this notice
        const canUpdate = req.user.role === 'ADMIN' ||
            req.user.role === 'DEAN' ||
            existingNotice.createdBy === req.userId ||
            (req.user.role === 'HOD' && req.user.department === existingNotice.departmentId);

        if (!canUpdate) {
            throw new AppError('Insufficient permissions to update this notice', 403, 'INSUFFICIENT_PERMISSIONS');
        }

        const updatedNotice = await noticeService.updateNotice(id, updates);

        res.json({
            success: true,
            data: {
                notice: updatedNotice
            }
        });
    });

    // Delete notice (soft delete)
    deleteNotice = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        // Get existing notice to check permissions
        const existingNotice = await noticeService.getNotice(id);
        if (!existingNotice) {
            throw new AppError('Notice not found', 404, 'NOTICE_NOT_FOUND');
        }

        // Check if user can delete this notice
        const canDelete = req.user.role === 'ADMIN' ||
            req.user.role === 'DEAN' ||
            existingNotice.createdBy === req.userId ||
            (req.user.role === 'HOD' && req.user.department === existingNotice.departmentId);

        if (!canDelete) {
            throw new AppError('Insufficient permissions to delete this notice', 403, 'INSUFFICIENT_PERMISSIONS');
        }

        const success = await noticeService.deleteNotice(id);
        if (!success) {
            throw new AppError('Failed to delete notice', 500, 'DELETE_FAILED');
        }

        res.json({
            success: true,
            message: 'Notice deleted successfully'
        });
    });

    // Mark notice as read
    markAsRead = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        // Check if notice exists
        const notice = await noticeService.getNotice(id);
        if (!notice) {
            throw new AppError('Notice not found', 404, 'NOTICE_NOT_FOUND');
        }

        const noticeRead = await noticeService.markNoticeAsRead(id, req.userId);

        res.json({
            success: true,
            data: {
                noticeRead
            }
        });
    });

    // Get unread notices for current user
    getUnreadNotices = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const unreadNotices = await noticeService.getUnreadNotices(req.userId, req.user.department || undefined);

        res.json({
            success: true,
            data: {
                notices: unreadNotices,
                count: unreadNotices.length
            }
        });
    });

    // Get notice read statistics (faculty+ access)
    getNoticeStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        // Check if notice exists
        const notice = await noticeService.getNotice(id);
        if (!notice) {
            throw new AppError('Notice not found', 404, 'NOTICE_NOT_FOUND');
        }

        // Check if user can view stats
        const canViewStats = req.user.role === 'ADMIN' ||
            req.user.role === 'DEAN' ||
            notice.createdBy === req.userId ||
            (req.user.role === 'HOD' && req.user.department === notice.departmentId);

        if (!canViewStats) {
            throw new AppError('Insufficient permissions to view notice statistics', 403, 'INSUFFICIENT_PERMISSIONS');
        }

        const stats = await noticeService.getNoticeReadStats(id);

        res.json({
            success: true,
            data: {
                noticeId: id,
                stats
            }
        });
    });
}

export const noticeController = new NoticeController();