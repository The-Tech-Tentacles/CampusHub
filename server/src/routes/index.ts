import { Router } from 'express';
import { authController } from '../controllers/authController';
import { userController } from '../controllers/userController';
import { noticeController } from '../controllers/noticeController';
import {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    requireFaculty,
    requireHOD,
    requireDean
} from '../middleware/auth';
import {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    validatePasswordUpdate,
    validateNoticeCreation,
    validateNoticeUpdate
} from '../middleware/validation';

// =================== ROUTE SETUP ===================

export const setupRoutes = (): Router => {
    const router = Router();

    // =================== AUTH ROUTES ===================
    router.post('/auth/register', validateUserRegistration, authController.register);
    router.post('/auth/login', validateUserLogin, authController.login);
    router.get('/auth/profile', authenticateToken, authController.profile);
    router.put('/auth/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
    router.post('/auth/change-password', authenticateToken, validatePasswordUpdate, authController.changePassword);
    router.post('/auth/logout', authenticateToken, authController.logout);

    // =================== USER ROUTES ===================
    router.get('/users', requireAdmin, userController.getUsers);
    router.get('/users/search', requireFaculty, userController.searchUsers);
    router.get('/users/role/:role', requireDean, userController.getUsersByRole);
    router.get('/users/department/:department', requireFaculty, userController.getUsersByDepartment);
    router.get('/users/:id', requireFaculty, userController.getUser);
    router.put('/users/:id', requireAdmin, validateUserUpdate, userController.updateUser);
    router.post('/users/:id/activate', requireAdmin, userController.activateUser);
    router.post('/users/:id/deactivate', requireAdmin, userController.deactivateUser);

    // =================== NOTICE ROUTES ===================
    router.get('/notices', optionalAuth, noticeController.getNotices);
    router.get('/notices/unread', authenticateToken, noticeController.getUnreadNotices);
    router.get('/notices/:id', optionalAuth, noticeController.getNotice);
    router.get('/notices/:id/stats', requireFaculty, noticeController.getNoticeStats);
    router.post('/notices', requireFaculty, validateNoticeCreation, noticeController.createNotice);
    router.put('/notices/:id', requireFaculty, validateNoticeUpdate, noticeController.updateNotice);
    router.delete('/notices/:id', requireFaculty, noticeController.deleteNotice);
    router.post('/notices/:id/read', authenticateToken, noticeController.markAsRead);

    return router;
};

export default setupRoutes;