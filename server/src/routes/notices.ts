import { Router } from 'express';
import {
    getNotices,
    getNoticeById,
    markNoticeAsRead,
    createNotice,
    getMyNotices,
    updateNotice,
    deleteNotice
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
 * @route   GET /api/notices/my
 * @desc    Get notices created by the current user
 * @access  Private (Faculty/HOD/Dean/Admin only)
 */
router.get('/my', authenticateToken, getMyNotices);

/**
 * @route   GET /api/notices/:id
 * @desc    Get a single notice by ID
 * @access  Private (requires authentication)
 */
router.get('/:id', authenticateToken, getNoticeById);

/**
 * @route   POST /api/notices
 * @desc    Create a new notice
 * @access  Private (Faculty/HOD/Dean/Admin only)
 */
router.post('/', authenticateToken, createNotice);

/**
 * @route   PUT /api/notices/:id
 * @desc    Update a notice
 * @access  Private (Creator or Admin only)
 */
router.put('/:id', authenticateToken, updateNotice);

/**
 * @route   DELETE /api/notices/:id
 * @desc    Delete a notice (soft delete)
 * @access  Private (Creator or Admin only)
 */
router.delete('/:id', authenticateToken, deleteNotice);

/**
 * @route   PATCH /api/notices/:id/read
 * @desc    Mark a notice as read
 * @access  Private (requires authentication)
 */
router.patch('/:id/read', authenticateToken, markNoticeAsRead);

export default router;
