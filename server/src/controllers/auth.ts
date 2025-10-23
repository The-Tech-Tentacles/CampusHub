import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { users, userRoleEnum, departments, academicYears } from '../schema/complete.js';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword, validatePassword } from '../services/password.js';
import { generateTokenPair, verifyToken } from '../services/jwt.js';

type UserRole = typeof userRoleEnum.enumValues[number];

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    departmentId?: string;
    academicYearId?: string;
    enrollmentNumber?: string;
    employeeId?: string;
    phone?: string;
    avatarUrl?: string;
}

interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * User login endpoint
 */
export async function login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
                code: 'MISSING_CREDENTIALS'
            });
            return;
        }

        // Find user by email with department and academic year info
        const [userWithRefs] = await db
            .select({
                user: users,
                department: departments,
                academicYear: academicYears
            })
            .from(users)
            .leftJoin(departments, eq(users.departmentId, departments.id))
            .leftJoin(academicYears, eq(users.academicYearId, academicYears.id))
            .where(eq(users.email, email.toLowerCase().trim()))
            .limit(1);

        if (!userWithRefs) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
            return;
        }

        const user = userWithRefs.user;



        // Check if user account is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'Account is not active',
                code: 'ACCOUNT_INACTIVE'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
            return;
        }

        // Update user record
        await db
            .update(users)
            .set({
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));

        // Generate tokens with user data
        const tokenPayload: any = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        // Add department info if available
        if (userWithRefs.department) {
            tokenPayload.departmentId = userWithRefs.department.id;
            tokenPayload.departmentCode = userWithRefs.department.code;
            tokenPayload.department = userWithRefs.department.name; // Keep for backward compatibility
        }

        // Add academic year info if available
        if (userWithRefs.academicYear) {
            tokenPayload.academicYearId = userWithRefs.academicYear.id;
            tokenPayload.academicYearCode = userWithRefs.academicYear.code;
            tokenPayload.academicLevel = userWithRefs.academicYear.level;
            tokenPayload.year = userWithRefs.academicYear.name; // Keep for backward compatibility
        }
        const tokenPair = generateTokenPair(tokenPayload);

        // Return success response (exclude sensitive data)
        const { passwordHash, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                tokens: tokenPair
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            code: 'LOGIN_ERROR'
        });
    }
}

/**
 * User registration endpoint
 */
export async function register(req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const {
            email,
            password,
            name,
            role = 'STUDENT',
            departmentId,
            academicYearId,
            enrollmentNumber,
            employeeId,
            phone,
            avatarUrl
        } = req.body;        // Validate required fields
        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                message: 'Email, password, and name are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
            return;
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                code: 'WEAK_PASSWORD',
                requirements: passwordValidation.errors
            });
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists',
                code: 'EMAIL_EXISTS'
            });
            return;
        }

        // Check if enrollment number already exists (if provided)
        if (enrollmentNumber) {
            const [existingStudent] = await db
                .select()
                .from(users)
                .where(eq(users.enrollmentNumber, enrollmentNumber))
                .limit(1);

            if (existingStudent) {
                res.status(409).json({
                    success: false,
                    message: 'Enrollment number already exists',
                    code: 'ENROLLMENT_EXISTS'
                });
                return;
            }
        }

        if (employeeId) {
            const [existingEmployee] = await db
                .select()
                .from(users)
                .where(eq(users.employeeId, employeeId))
                .limit(1);

            if (existingEmployee) {
                res.status(409).json({
                    success: false,
                    message: 'Employee ID already exists',
                    code: 'EMPLOYEE_ID_EXISTS'
                });
                return;
            }
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                email: normalizedEmail,
                passwordHash,
                name: name.trim(),
                role,
                departmentId: departmentId?.trim() || null,
                academicYearId: academicYearId?.trim() || null,
                enrollmentNumber: enrollmentNumber?.trim() || null,
                employeeId: employeeId?.trim() || null,
                phone: phone?.trim() || null,
                avatarUrl: avatarUrl?.trim() || null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning();

        if (!newUser) {
            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                code: 'USER_CREATION_FAILED'
            });
            return;
        }

        // Fetch user with department and academic year info for token generation
        let newUserWithRefs = null;
        if (newUser.departmentId || newUser.academicYearId) {
            const [userRefData] = await db
                .select({
                    user: users,
                    department: departments,
                    academicYear: academicYears
                })
                .from(users)
                .leftJoin(departments, eq(users.departmentId, departments.id))
                .leftJoin(academicYears, eq(users.academicYearId, academicYears.id))
                .where(eq(users.id, newUser.id))
                .limit(1);
            newUserWithRefs = userRefData;
        }

        // Generate tokens
        const newUserTokenPayload: any = {
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
        };

        // Add department info if available
        if (newUserWithRefs?.department) {
            newUserTokenPayload.departmentId = newUserWithRefs.department.id;
            newUserTokenPayload.departmentCode = newUserWithRefs.department.code;
            newUserTokenPayload.department = newUserWithRefs.department.name; // Keep for backward compatibility
        }

        // Add academic year info if available
        if (newUserWithRefs?.academicYear) {
            newUserTokenPayload.academicYearId = newUserWithRefs.academicYear.id;
            newUserTokenPayload.academicYearCode = newUserWithRefs.academicYear.code;
            newUserTokenPayload.academicLevel = newUserWithRefs.academicYear.level;
            newUserTokenPayload.year = newUserWithRefs.academicYear.name; // Keep for backward compatibility
        }
        const tokenPair = generateTokenPair(newUserTokenPayload);

        // Return success response (exclude sensitive data)
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: userWithoutPassword,
                tokens: tokenPair
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            code: 'REGISTRATION_ERROR'
        });
    }
}

/**
 * Token refresh endpoint
 */
export async function refreshToken(req: Request<{}, {}, RefreshTokenRequest>, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required',
                code: 'MISSING_REFRESH_TOKEN'
            });
            return;
        }

        // Verify refresh token
        const payload = verifyToken(refreshToken);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
            return;
        }

        // Get current user data with department and academic year info
        const [userWithRefs] = await db
            .select({
                user: users,
                department: departments,
                academicYear: academicYears
            })
            .from(users)
            .leftJoin(departments, eq(users.departmentId, departments.id))
            .leftJoin(academicYears, eq(users.academicYearId, academicYears.id))
            .where(eq(users.id, payload.userId))
            .limit(1);

        if (!userWithRefs) {
            res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        const user = userWithRefs.user;



        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'Account is not active',
                code: 'ACCOUNT_INACTIVE'
            });
            return;
        }

        // Generate new token pair
        const refreshTokenPayload: any = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        // Add department info if available
        if (userWithRefs.department) {
            refreshTokenPayload.departmentId = userWithRefs.department.id;
            refreshTokenPayload.departmentCode = userWithRefs.department.code;
            refreshTokenPayload.department = userWithRefs.department.name; // Keep for backward compatibility
        }

        // Add academic year info if available
        if (userWithRefs.academicYear) {
            refreshTokenPayload.academicYearId = userWithRefs.academicYear.id;
            refreshTokenPayload.academicYearCode = userWithRefs.academicYear.code;
            refreshTokenPayload.academicLevel = userWithRefs.academicYear.level;
            refreshTokenPayload.year = userWithRefs.academicYear.name; // Keep for backward compatibility
        }
        const newTokenPair = generateTokenPair(refreshTokenPayload);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                tokens: newTokenPair
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh',
            code: 'TOKEN_REFRESH_ERROR'
        });
    }
}

/**
 * User logout endpoint
 */
export async function logout(req: Request, res: Response): Promise<void> {
    try {
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
            code: 'LOGOUT_ERROR'
        });
    }
}

/**
 * Get current user profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        const { passwordHash, ...userWithoutPassword } = currentUser;

        res.json({
            success: true,
            data: {
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error fetching profile',
            code: 'PROFILE_ERROR'
        });
    }
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { name, phone } = req.body;

        const updateData: any = {
            updatedAt: new Date()
        };

        if (name !== undefined) {
            updateData.name = name.trim();
        }
        if (phone !== undefined) {
            updateData.phone = phone?.trim() || null;
        }

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, user.userId))
            .returning();

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        const { passwordHash, ...userWithoutPassword } = updatedUser;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error updating profile',
            code: 'UPDATE_PROFILE_ERROR'
        });
    }
}

/**
 * Change user password
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
                code: 'MISSING_PASSWORDS'
            });
            return;
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: 'New password does not meet requirements',
                code: 'WEAK_PASSWORD',
                requirements: passwordValidation.errors
            });
            return;
        }

        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.passwordHash);
        if (!isCurrentPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
                code: 'INVALID_CURRENT_PASSWORD'
            });
            return;
        }

        const newPasswordHash = await hashPassword(newPassword);

        await db
            .update(users)
            .set({
                passwordHash: newPasswordHash,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.userId));

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error changing password',
            code: 'CHANGE_PASSWORD_ERROR'
        });
    }
}