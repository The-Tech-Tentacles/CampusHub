import { Router } from 'express';
import {
    getForms,
    getFormById,
    createForm,
    submitForm,
    deleteForm,
    getMyForms,
    getFormSubmissions
} from '../controllers/forms.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/forms
 * @desc    Get all forms (filtered by user role and permissions)
 * @access  Private
 */
router.get('/', getForms);

/**
 * @route   GET /api/forms/my
 * @desc    Get forms created by current user
 * @access  Private (Faculty+)
 */
router.get('/my', getMyForms);

/**
 * @route   GET /api/forms/:id
 * @desc    Get a single form by ID
 * @access  Private
 */
router.get('/:id', getFormById);

/**
 * @route   GET /api/forms/:id/submissions
 * @desc    Get all submissions for a form
 * @access  Private (Creator/Admin only)
 */
router.get('/:id/submissions', getFormSubmissions);

/**
 * @route   POST /api/forms
 * @desc    Create a new form (Faculty/HOD/DEAN/ADMIN only)
 * @access  Private (Faculty+)
 */
router.post('/', createForm);

/**
 * @route   POST /api/forms/:id/submit
 * @desc    Submit a form
 * @access  Private
 */
router.post('/:id/submit', submitForm);

/**
 * @route   DELETE /api/forms/:id
 * @desc    Delete a form (Faculty/HOD/DEAN/ADMIN only)
 * @access  Private (Faculty+)
 */
router.delete('/:id', deleteForm);

export default router;
