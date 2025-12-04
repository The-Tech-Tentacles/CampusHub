import { Router } from 'express';
import {
    login,
    register,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    getFacultyList,
    getFacultyStats
} from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    User registration
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Public (stateless JWT - mainly client-side)
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticateToken, changePassword);

/**
 * @route   GET /api/auth/faculty
 * @desc    Get list of faculty members for mentor selection
 * @access  Private
 */
router.get('/faculty', authenticateToken, getFacultyList);

/**
 * @route   GET /api/auth/faculty-stats
 * @desc    Get faculty dashboard statistics (mentees, pending reviews)
 * @access  Private (Faculty/HOD only)
 */
router.get('/faculty-stats', authenticateToken, getFacultyStats);

export default router;