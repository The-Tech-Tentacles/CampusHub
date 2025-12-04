import { Router } from 'express';
import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    getAcademicEvents,
    createAcademicEvent
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
 * @route   GET /api/events/my
 * @desc    Get events created by the current user
 * @access  Private (Faculty/HOD/Dean/Admin only)
 */
router.get('/my', authenticateToken, getMyEvents);

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

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Faculty/HOD/Dean/Admin only)
 */
router.post('/', authenticateToken, createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Creator/Dean/Admin only)
 */
router.put('/:id', authenticateToken, updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event (soft delete)
 * @access  Private (Creator/Dean/Admin only)
 */
router.delete('/:id', authenticateToken, deleteEvent);

/**
 * @route   POST /api/events/academic
 * @desc    Create a new academic event
 * @access  Private (Dean/Admin only)
 */
router.post('/academic', authenticateToken, createAcademicEvent);

export default router;
