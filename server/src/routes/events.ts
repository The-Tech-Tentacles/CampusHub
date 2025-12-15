import { Router } from 'express';
import {
    getEvents,
    getEventById,
    getAcademicEvents
} from '../controllers/events.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Private
 */
router.get('/', authenticateToken, getEvents);

/**
 * @route   GET /api/events/academic
 * @desc    Get all academic events with optional filters
 * @access  Private
 */
router.get('/academic', authenticateToken, getAcademicEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getEventById);

// NOTE: Faculty routes (getMyEvents, createEvent, createAcademicEvent, updateEvent, deleteEvent) moved to /api/faculty/events

export default router;
