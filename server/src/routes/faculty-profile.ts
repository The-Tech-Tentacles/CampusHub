import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getFacultyProfile, updateFacultyProfile } from '../controllers/faculty/profile.js';

const router = Router();

// Faculty profile routes
router.get('/profile', authenticateToken, getFacultyProfile);
router.put('/profile', authenticateToken, updateFacultyProfile);

export default router;
