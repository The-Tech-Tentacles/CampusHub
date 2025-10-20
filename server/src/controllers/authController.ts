import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { generateToken, generateRefreshToken, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError, createAuthenticationError, createValidationError } from '../middleware/errorHandler';
import { serverConfig } from '../config';
import type { InsertUser } from '../../../shared/schema';

// =================== AUTH CONTROLLER ===================

export class AuthController {
    // User registration
    register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const userData: InsertUser = req.body;

        // Check if user already exists
        const existingUser = await userService.getUserByEmail(userData.email);
        if (existingUser) {
            throw new AppError('User already exists with this email', 409, 'USER_EXISTS');
        }

        // Check enrollment number if provided
        if (userData.enrollmentNumber) {
            const existingEnrollment = await userService.getUserByEnrollment(userData.enrollmentNumber);
            if (existingEnrollment) {
                throw new AppError('User already exists with this enrollment number', 409, 'ENROLLMENT_EXISTS');
            }
        }

        // Create user
        const user = await userService.createUser(userData);

        // Generate tokens
        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Create welcome notification
        await notificationService.createNotification({
            userId: user.id,
            title: 'Welcome to CampusHub!',
            body: 'Your account has been created successfully. Start exploring the features.',
            type: 'SYSTEM'
        });

        // Remove password from response
        const { passwordHash, ...userResponse } = user;

        res.status(201).json({
            success: true,
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    });

    // User login
    login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        // Get user by email
        const user = await userService.getUserByEmail(email);
        if (!user) {
            throw createAuthenticationError('Invalid email or password');
        }

        // Check if account is active
        if (!user.isActive) {
            throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
        }

        // Verify password
        const isValidPassword = await userService.verifyPassword(user, password);
        if (!isValidPassword) {
            throw createAuthenticationError('Invalid email or password');
        }

        // Generate tokens
        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Remove password from response
        const { passwordHash, ...userResponse } = user;

        res.json({
            success: true,
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    });

    // Get current user profile
    profile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { passwordHash, ...userResponse } = req.user;

        res.json({
            success: true,
            data: {
                user: userResponse
            }
        });
    });

    // Update user profile
    updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const updates = req.body;

        // Prevent updating sensitive fields
        delete updates.passwordHash;
        delete updates.role;
        delete updates.isActive;
        delete updates.email; // Email changes might need verification

        const updatedUser = await userService.updateUser(req.userId, updates);
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

    // Change password
    changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isValidPassword = await userService.verifyPassword(req.user, currentPassword);
        if (!isValidPassword) {
            throw createAuthenticationError('Current password is incorrect');
        }

        // Update password
        const success = await userService.updatePassword(req.userId, newPassword);
        if (!success) {
            throw new AppError('Failed to update password', 500, 'PASSWORD_UPDATE_FAILED');
        }

        // Create notification
        await notificationService.createNotification({
            userId: req.userId,
            title: 'Password Changed',
            body: 'Your password has been successfully updated.',
            type: 'SYSTEM'
        });

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    });

    // Logout (client-side token removal, server could maintain blacklist)
    logout = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        // In a production app, you might want to blacklist the token
        // or store refresh tokens and revoke them here

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
}

export const authController = new AuthController();