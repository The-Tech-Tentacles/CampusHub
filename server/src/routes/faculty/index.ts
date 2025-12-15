import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';

// Import all faculty functions from the centralized faculty controller
import {
    getFacultyList,
    getFacultyStats,
    getMenteeList,
    createForm,
    deleteForm,
    getMyForms,
    getFormSubmissions,
    createNotice,
    getMyNotices,
    updateNotice,
    deleteNotice,
    createEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    updateApplicationStatus
} from '../../controllers/faculty/index.js';

// Import profile controller
import { getFacultyProfile, updateFacultyProfile } from '../../controllers/faculty/profile.js';

const router = Router();

// =================== FACULTY INFO & STATS ===================

/**
 * @route   GET /api/faculty
 * @desc    Get list of faculty members for mentor selection
 * @access  Private
 */
router.get('/', authenticateToken, getFacultyList);

/**
 * @route   GET /api/faculty/stats
 * @desc    Get faculty dashboard statistics (mentees, pending reviews)
 * @access  Private (Faculty/HOD only)
 */
router.get('/stats', authenticateToken, getFacultyStats);

/**
 * @route   GET /api/faculty/mentees
 * @desc    Get list of mentees assigned to faculty
 * @access  Private (Faculty/HOD only)
 */
router.get('/mentees', authenticateToken, getMenteeList);

// =================== PROFILE MANAGEMENT ===================

/**
 * @route   GET /api/faculty/profile
 * @desc    Get faculty profile information
 * @access  Private (Faculty only)
 */
router.get('/profile', authenticateToken, getFacultyProfile);

/**
 * @route   PUT /api/faculty/profile
 * @desc    Update faculty profile information
 * @access  Private (Faculty only)
 */
router.put('/profile', authenticateToken, updateFacultyProfile);

// =================== FORMS MANAGEMENT ===================

/**
 * @route   POST /api/faculty/forms
 * @desc    Create a new form (Faculty/HOD/DEAN/ADMIN only)
 * @access  Private
 */
router.post('/forms', authenticateToken, createForm);

/**
 * @route   GET /api/faculty/forms
 * @desc    Get forms created by current faculty member
 * @access  Private (Faculty/HOD/DEAN/ADMIN only)
 */
router.get('/forms', authenticateToken, getMyForms);

/**
 * @route   GET /api/faculty/forms/:id/submissions
 * @desc    Get all submissions for a specific form
 * @access  Private (Form creator/ADMIN only)
 */
router.get('/forms/:id/submissions', authenticateToken, getFormSubmissions);

/**
 * @route   DELETE /api/faculty/forms/:id
 * @desc    Delete a form
 * @access  Private (Faculty/HOD/DEAN/ADMIN only)
 */
router.delete('/forms/:id', authenticateToken, deleteForm);

// =================== NOTICES MANAGEMENT ===================

/**
 * @route   POST /api/faculty/notices
 * @desc    Create a new notice (Faculty/HOD/DEAN/ADMIN only)
 * @access  Private
 */
router.post('/notices', authenticateToken, createNotice);

/**
 * @route   GET /api/faculty/notices
 * @desc    Get notices created by current faculty member
 * @access  Private (Faculty/HOD/DEAN/ADMIN only)
 */
router.get('/notices', authenticateToken, getMyNotices);

/**
 * @route   PUT /api/faculty/notices/:id
 * @desc    Update a notice
 * @access  Private (Creator/ADMIN only)
 */
router.put('/notices/:id', authenticateToken, updateNotice);

/**
 * @route   DELETE /api/faculty/notices/:id
 * @desc    Delete a notice
 * @access  Private (Creator/ADMIN only)
 */
router.delete('/notices/:id', authenticateToken, deleteNotice);

// =================== EVENTS MANAGEMENT ===================

/**
 * @route   POST /api/faculty/events
 * @desc    Create a new event (Faculty/HOD/DEAN/ADMIN only)
 * @access  Private
 */
router.post('/events', authenticateToken, createEvent);

/**
 * @route   GET /api/faculty/events
 * @desc    Get events created by current faculty member
 * @access  Private (Faculty/HOD/DEAN/ADMIN only)
 */
router.get('/events', authenticateToken, getMyEvents);

/**
 * @route   PUT /api/faculty/events/:id
 * @desc    Update an event
 * @access  Private (Creator/ADMIN/DEAN only)
 */
router.put('/events/:id', authenticateToken, updateEvent);

/**
 * @route   DELETE /api/faculty/events/:id
 * @desc    Delete an event
 * @access  Private (Creator/ADMIN/DEAN only)
 */
router.delete('/events/:id', authenticateToken, deleteEvent);

// =================== APPLICATION REVIEWS ===================

/**
 * @route   PATCH /api/faculty/applications/:id/review
 * @desc    Review and update application status (Faculty/HOD/DEAN only)
 * @access  Private
 */
router.patch('/applications/:id/review', authenticateToken, updateApplicationStatus);

export default router;
