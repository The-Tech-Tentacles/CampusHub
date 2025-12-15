import { Router } from 'express';
import {
    getNotices,
    getNoticeById,
    markNoticeAsRead
} from '../controllers/notices.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/notices
 * @desc    Get all notices with optional filters (type, scope, department, isRead, today)
 * @access  Private (requires authentication)
 * @query   type - Filter by notice type (urgent, important, general)
 * @query   scope - Filter by scope (GLOBAL, DEPARTMENT, YEAR)
 * @query   department - Filter by department
 * @query   isRead - Filter by read status (true/false)
 * @query   today - Filter for today's notices only (true/false)
 */
router.get('/', authenticateToken, getNotices);

/**
 * @route   GET /api/notices/:id
 * @desc    Get a single notice by ID
 * @access  Private (requires authentication)
 */
router.get('/:id', authenticateToken, getNoticeById);

/**
 * @route   PATCH /api/notices/:id/read
 * @desc    Mark a notice as read
 * @access  Private (requires authentication)
 */
router.patch('/:id/read', authenticateToken, markNoticeAsRead);

// NOTE: Faculty routes (getMyNotices, createNotice, updateNotice, deleteNotice) moved to /api/faculty/notices

export default router;
