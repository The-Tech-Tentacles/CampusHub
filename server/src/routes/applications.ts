import { Router } from 'express';
import {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplicationStatus,
    deleteApplication
} from '../controllers/applications.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/applications
 * @desc    Get all applications (filtered by user role)
 * @access  Private (requires authentication)
 */
router.get('/', authenticateToken, getApplications);

/**
 * @route   GET /api/applications/:id
 * @desc    Get a single application by ID
 * @access  Private (requires authentication)
 */
router.get('/:id', authenticateToken, getApplicationById);

/**
 * @route   POST /api/applications
 * @desc    Create a new application (Students only)
 * @access  Private (requires authentication, STUDENT role)
 */
router.post('/', authenticateToken, createApplication);

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update application status (Faculty/HOD/DEAN)
 * @access  Private (requires authentication, reviewer role)
 */
router.patch('/:id/status', authenticateToken, updateApplicationStatus);

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete/Cancel application
 * @access  Private (requires authentication)
 */
router.delete('/:id', authenticateToken, deleteApplication);

export default router;
