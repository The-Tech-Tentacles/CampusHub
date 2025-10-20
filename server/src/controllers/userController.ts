import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// =================== USER CONTROLLER ===================

export class UserController {
    // Get all users (admin only)
    getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { page = 1, limit = 20, role, department, isActive } = req.query;

        const result = await userService.listUsers({
            page: Number(page),
            limit: Number(limit),
            role: role as string,
            department: department as string,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
        });

        // Remove passwords from all users
        const users = result.users.map(user => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: result.total,
                    pages: Math.ceil(result.total / Number(limit))
                }
            }
        });
    });

    // Get user by ID
    getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const user = await userService.getUser(id);
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        // Remove password from response
        const { passwordHash, ...userResponse } = user;

        res.json({
            success: true,
            data: {
                user: userResponse
            }
        });
    });

    // Update user (admin only)
    updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const updates = req.body;

        // Prevent updating password through this endpoint
        delete updates.passwordHash;

        const updatedUser = await userService.updateUser(id, updates);
        if (!updatedUser) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        // Remove password from response
        const { passwordHash, ...userResponse } = updatedUser;

        res.json({
            success: true,
            data: {
                user: userResponse
            }
        });
    });

    // Deactivate user (admin only)
    deactivateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const success = await userService.deactivateUser(id);
        if (!success) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    });

    // Activate user (admin only)
    activateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        const success = await userService.activateUser(id);
        if (!success) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'User activated successfully'
        });
    });

    // Get users by department (faculty/HOD access)
    getUsersByDepartment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { department } = req.params;
        const { role } = req.query;

        // Check if user can access this department
        if (req.user.role !== 'ADMIN' && req.user.role !== 'DEAN' && req.user.department !== department) {
            throw new AppError('Insufficient permissions to access this department', 403, 'INSUFFICIENT_PERMISSIONS');
        }

        let users;
        if (role) {
            users = await userService.getUsersByRole(role as string);
            // Filter by department
            users = users.filter(user => user.department === department);
        } else {
            users = await userService.getUsersByDepartment(department);
        }

        // Remove passwords from all users
        const usersWithoutPasswords = users.map(user => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            data: {
                users: usersWithoutPasswords,
                department,
                total: usersWithoutPasswords.length
            }
        });
    });

    // Get users by role (admin/dean access)
    getUsersByRole = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { role } = req.params;

        const users = await userService.getUsersByRole(role);

        // Remove passwords from all users
        const usersWithoutPasswords = users.map(user => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            data: {
                users: usersWithoutPasswords,
                role,
                total: usersWithoutPasswords.length
            }
        });
    });

    // Search users
    searchUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { query, department, role, limit = 10 } = req.query;

        if (!query || typeof query !== 'string' || query.length < 2) {
            throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_SEARCH_QUERY');
        }

        // For now, get all users and filter
        // In production, you'd want to implement proper search in the database
        const allUsers = await userService.listUsers({
            department: department as string,
            role: role as string,
            limit: Number(limit) * 2 // Get more results to filter
        });

        // Simple text search in name and email
        const searchTerm = query.toLowerCase();
        const filteredUsers = allUsers.users.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.enrollmentNumber && user.enrollmentNumber.toLowerCase().includes(searchTerm))
        ).slice(0, Number(limit));

        // Remove passwords from all users
        const usersWithoutPasswords = filteredUsers.map(user => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            data: {
                users: usersWithoutPasswords,
                query,
                total: usersWithoutPasswords.length
            }
        });
    });
}

export const userController = new UserController();