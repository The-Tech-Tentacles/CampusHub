import { Router } from 'express';
import {
    getForms,
    getFormById,
    submitForm
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
 * @route   GET /api/forms/:id
 * @desc    Get a single form by ID
 * @access  Private
 */
router.get('/:id', getFormById);

/**
 * @route   POST /api/forms/:id/submit
 * @desc    Submit a form
 * @access  Private
 */
router.post('/:id/submit', submitForm);

// NOTE: Faculty routes (getMyForms, getFormSubmissions, createForm, deleteForm) moved to /api/faculty/forms

export default router;
