import { Router } from 'express';
import {
    getEvents,
    getEventById,
    getAcademicEvents,
    getAcademicEventById
} from '../controllers/schedule.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// =================== EVENTS ROUTES ===================

/**
 * @route   GET /api/schedule/events
 * @desc    Get all events with optional filters (month, year, type, department)
 * @access  Private (requires authentication)
 * @query   month - Filter by month (0-11)
 * @query   year - Filter by year (e.g., 2025)
 * @query   type - Filter by event type (LECTURE, LAB, EXAM, SEMINAR, WORKSHOP, SPORTS, CULTURAL, GENERIC)
 * @query   department - Filter by department
 */
router.get('/events', authenticateToken, getEvents);

/**
 * @route   GET /api/schedule/events/:id
 * @desc    Get a single event by ID
 * @access  Private (requires authentication)
 */
router.get('/events/:id', authenticateToken, getEventById);

// =================== ACADEMIC EVENTS ROUTES ===================

/**
 * @route   GET /api/schedule/academic-events
 * @desc    Get all academic events with optional filters (year, month, semester, type)
 * @access  Private (requires authentication)
 * @query   year - Filter by academic year (e.g., 2025)
 * @query   month - Filter by month (0-11) - shows events that overlap with this month
 * @query   semester - Filter by semester (1 or 2)
 * @query   type - Filter by event type (SEMESTER_START, SEMESTER_END, EXAM_WEEK, HOLIDAY, REGISTRATION, ORIENTATION, BREAK, OTHER)
 */
router.get('/academic-events', authenticateToken, getAcademicEvents);

/**
 * @route   GET /api/schedule/academic-events/:id
 * @desc    Get a single academic event by ID
 * @access  Private (requires authentication)
 */
router.get('/academic-events/:id', authenticateToken, getAcademicEventById);

export default router;
