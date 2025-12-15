import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { users, userRoleEnum, departments, academicYears, profiles, applications, events, rooms } from '../schema/complete.js';
import { eq, and, or } from 'drizzle-orm';
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

        // Fetch user with profile data
        const [userProfile] = await db
            .select({
                // User fields
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                departmentId: users.departmentId,
                academicYearId: users.academicYearId,
                enrollmentNumber: users.enrollmentNumber,
                employeeId: users.employeeId,
                phone: users.phone,
                avatarUrl: users.avatarUrl,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,

                // Profile fields
                profileId: profiles.id,
                prefix: profiles.prefix,
                dateOfBirth: profiles.dateOfBirth,
                gender: profiles.gender,
                bloodGroup: profiles.bloodGroup,
                altEmail: profiles.altEmail,
                address: profiles.address,
                permanentAddress: profiles.permanentAddress,
                bio: profiles.bio,

                // Academic Info (Students)
                section: profiles.section,
                semester: profiles.semester,
                cgpa: profiles.cgpa,
                batch: profiles.batch,
                rollNumber: profiles.rollNumber,
                specialization: profiles.specialization,
                admissionDate: profiles.admissionDate,
                expectedGraduation: profiles.expectedGraduation,
                previousEducation: profiles.previousEducation,

                // Faculty/Staff Info
                cabinLocationId: profiles.cabinLocationId,
                officeHours: profiles.officeHours,
                researchInterests: profiles.researchInterests,
                qualifications: profiles.qualifications,
                experienceYears: profiles.experienceYears,

                // Guardian Info
                guardianName: profiles.guardianName,
                guardianContact: profiles.guardianContact,
                guardianEmail: profiles.guardianEmail,
                guardianRelation: profiles.guardianRelation,
                guardianOccupation: profiles.guardianOccupation,

                // Mentor Info
                mentorId: profiles.mentorId,

                // Social and Skills
                socialLinks: profiles.socialLinks,
                skills: profiles.skills,
                hobbies: profiles.hobbies,
                achievements: profiles.achievements,
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!userProfile) {
            res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        // Fetch mentor details if mentorId exists
        let mentorInfo = null;
        if (userProfile.mentorId) {
            const [mentor] = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    phone: users.phone,
                    departmentId: users.departmentId,
                    employeeId: users.employeeId,
                    officeHours: profiles.officeHours,
                    cabinLocationId: profiles.cabinLocationId,
                    bio: profiles.bio,
                    researchInterests: profiles.researchInterests,
                    qualifications: profiles.qualifications,
                    experienceYears: profiles.experienceYears,
                })
                .from(users)
                .leftJoin(profiles, eq(profiles.userId, users.id))
                .where(eq(users.id, userProfile.mentorId))
                .limit(1);

            if (mentor) {
                // Fetch cabin location if exists
                let cabinLocation = null;
                if (mentor.cabinLocationId) {
                    const [room] = await db
                        .select({
                            name: rooms.name,
                            code: rooms.code,
                            building: rooms.building,
                            floorNumber: rooms.floorNumber,
                        })
                        .from(rooms)
                        .where(eq(rooms.id, mentor.cabinLocationId))
                        .limit(1);
                    if (room) {
                        cabinLocation = `${room.name} (${room.code}) - ${room.building}, Floor ${room.floorNumber}`;
                    }
                }

                // Fetch mentor department name
                let mentorDepartmentName = null;
                if (mentor.departmentId) {
                    const [dept] = await db
                        .select({ name: departments.name })
                        .from(departments)
                        .where(eq(departments.id, mentor.departmentId))
                        .limit(1);
                    mentorDepartmentName = dept?.name || null;
                }

                mentorInfo = {
                    id: mentor.id,
                    name: mentor.name,
                    email: mentor.email,
                    phone: mentor.phone,
                    employeeId: mentor.employeeId,
                    department: mentorDepartmentName,
                    officeHours: mentor.officeHours,
                    cabinLocation: cabinLocation,
                    bio: mentor.bio,
                    researchInterests: mentor.researchInterests || [],
                    qualifications: mentor.qualifications || [],
                    experienceYears: mentor.experienceYears,
                };
            }
        }

        // Fetch department and academic year names
        let departmentName = null;
        let academicYearName = null;

        if (userProfile.departmentId) {
            const [dept] = await db
                .select({ name: departments.name, code: departments.code })
                .from(departments)
                .where(eq(departments.id, userProfile.departmentId))
                .limit(1);
            departmentName = dept?.name || null;
        }

        if (userProfile.academicYearId) {
            const [year] = await db
                .select({ name: academicYears.name, code: academicYears.code })
                .from(academicYears)
                .where(eq(academicYears.id, userProfile.academicYearId))
                .limit(1);
            academicYearName = year?.name || null;
        }

        res.json({
            success: true,
            data: {
                profile: {
                    ...userProfile,
                    department: departmentName,
                    year: academicYearName,
                    mentor: mentorInfo,
                }
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
        const profileData = req.body;

        // Prepare users table update
        const userUpdateData: any = {
            updatedAt: new Date()
        };

        if (profileData.name !== undefined) {
            userUpdateData.name = profileData.name.trim();
        }
        if (profileData.phone !== undefined) {
            userUpdateData.phone = profileData.phone?.trim() || null;
        }
        if (profileData.avatarUrl !== undefined) {
            userUpdateData.avatarUrl = profileData.avatarUrl?.trim() || null;
        }
        if (profileData.enrollmentNumber !== undefined) {
            userUpdateData.enrollmentNumber = profileData.enrollmentNumber?.trim() || null;
        }
        if (profileData.academicYearId !== undefined) {
            userUpdateData.academicYearId = profileData.academicYearId?.trim() || null;
        }

        // Update users table if there are changes
        if (Object.keys(userUpdateData).length > 1) { // More than just updatedAt
            await db
                .update(users)
                .set(userUpdateData)
                .where(eq(users.id, user.userId));
        }

        // Prepare profiles table update
        const profileUpdateData: any = {
            updatedAt: new Date()
        };

        // Personal Info
        if (profileData.prefix !== undefined) profileUpdateData.prefix = profileData.prefix?.trim() || null;
        if (profileData.dateOfBirth !== undefined) profileUpdateData.dateOfBirth = profileData.dateOfBirth || null;
        if (profileData.gender !== undefined) profileUpdateData.gender = profileData.gender || null;
        if (profileData.bloodGroup !== undefined) profileUpdateData.bloodGroup = profileData.bloodGroup?.trim() || null;
        if (profileData.altEmail !== undefined) profileUpdateData.altEmail = profileData.altEmail?.trim() || null;
        if (profileData.address !== undefined) profileUpdateData.address = profileData.address?.trim() || null;
        if (profileData.permanentAddress !== undefined) profileUpdateData.permanentAddress = profileData.permanentAddress?.trim() || null;
        if (profileData.bio !== undefined) profileUpdateData.bio = profileData.bio?.trim() || null;

        // Academic Info (Students)
        if (profileData.section !== undefined) profileUpdateData.section = profileData.section?.trim() || null;
        if (profileData.semester !== undefined) profileUpdateData.semester = profileData.semester?.trim() || null;
        if (profileData.cgpa !== undefined) profileUpdateData.cgpa = profileData.cgpa ? parseFloat(profileData.cgpa) : null;
        if (profileData.batch !== undefined) profileUpdateData.batch = profileData.batch?.trim() || null;
        if (profileData.rollNumber !== undefined) profileUpdateData.rollNumber = profileData.rollNumber?.trim() || null;
        if (profileData.specialization !== undefined) profileUpdateData.specialization = profileData.specialization?.trim() || null;
        if (profileData.admissionDate !== undefined) profileUpdateData.admissionDate = profileData.admissionDate || null;
        if (profileData.expectedGraduation !== undefined) profileUpdateData.expectedGraduation = profileData.expectedGraduation || null;
        if (profileData.previousEducation !== undefined) profileUpdateData.previousEducation = profileData.previousEducation?.trim() || null;

        // Faculty/Staff Info
        if (profileData.officeHours !== undefined) profileUpdateData.officeHours = profileData.officeHours?.trim() || null;
        if (profileData.researchInterests !== undefined) profileUpdateData.researchInterests = profileData.researchInterests || null;
        if (profileData.qualifications !== undefined) profileUpdateData.qualifications = profileData.qualifications || null;
        if (profileData.experienceYears !== undefined) profileUpdateData.experienceYears = profileData.experienceYears ? parseInt(profileData.experienceYears) : null;

        // Guardian Info
        if (profileData.guardianName !== undefined) profileUpdateData.guardianName = profileData.guardianName?.trim() || null;
        if (profileData.guardianContact !== undefined) profileUpdateData.guardianContact = profileData.guardianContact?.trim() || null;
        if (profileData.guardianEmail !== undefined) profileUpdateData.guardianEmail = profileData.guardianEmail?.trim() || null;
        if (profileData.guardianRelation !== undefined) profileUpdateData.guardianRelation = profileData.guardianRelation?.trim() || null;
        if (profileData.guardianOccupation !== undefined) profileUpdateData.guardianOccupation = profileData.guardianOccupation?.trim() || null;

        // Mentor Info - Only allow setting mentor once for students
        if (profileData.mentorId !== undefined && user.role === 'STUDENT') {
            // Check if student already has a mentor
            const [existingProfile] = await db
                .select({ mentorId: profiles.mentorId })
                .from(profiles)
                .where(eq(profiles.userId, user.userId))
                .limit(1);

            if (existingProfile && existingProfile.mentorId) {
                // Student already has a mentor, don't allow change
                console.log(`Student ${user.userId} attempted to change mentor from ${existingProfile.mentorId} to ${profileData.mentorId}`);
            } else {
                // Student doesn't have a mentor yet, allow setting it
                profileUpdateData.mentorId = profileData.mentorId || null;
            }
        } else if (profileData.mentorId !== undefined && user.role !== 'STUDENT') {
            // Non-students can update mentor freely (for admin purposes)
            profileUpdateData.mentorId = profileData.mentorId || null;
        }

        // Social Links and Skills
        if (profileData.socialLinks !== undefined) profileUpdateData.socialLinks = profileData.socialLinks || {};
        if (profileData.skills !== undefined) profileUpdateData.skills = profileData.skills || [];
        if (profileData.hobbies !== undefined) profileUpdateData.hobbies = profileData.hobbies || [];
        if (profileData.achievements !== undefined) profileUpdateData.achievements = profileData.achievements || [];

        // Check if profile exists
        const [existingProfile] = await db
            .select({ id: profiles.id })
            .from(profiles)
            .where(eq(profiles.userId, user.userId))
            .limit(1);

        if (existingProfile) {
            // Update existing profile
            if (Object.keys(profileUpdateData).length > 1) { // More than just updatedAt
                await db
                    .update(profiles)
                    .set(profileUpdateData)
                    .where(eq(profiles.userId, user.userId));
            }
        } else {
            // Create new profile
            profileUpdateData.userId = user.userId;
            await db.insert(profiles).values(profileUpdateData);
        }

        // Fetch updated profile
        const [updatedProfile] = await db
            .select()
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!updatedProfile) {
            res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                profile: updatedProfile
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

/**
 * Get faculty members for mentor selection
 */
export async function getFacultyList(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();

        // Fetch all active faculty members
        const facultyMembers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
                departmentId: users.departmentId,
                employeeId: users.employeeId,
                role: users.role,
            })
            .from(users)
            .leftJoin(departments, eq(departments.id, users.departmentId))
            .where(eq(users.role, 'FACULTY'))
            .orderBy(users.name);

        // Fetch department names for each faculty
        const facultyWithDepartments = await Promise.all(
            facultyMembers.map(async (faculty) => {
                let departmentName = null;
                if (faculty.departmentId) {
                    const [dept] = await db
                        .select({ name: departments.name })
                        .from(departments)
                        .where(eq(departments.id, faculty.departmentId))
                        .limit(1);
                    departmentName = dept?.name || null;
                }
                return {
                    ...faculty,
                    department: departmentName,
                };
            })
        );

        res.json({
            success: true,
            data: { faculty: facultyWithDepartments }
        });

    } catch (error) {
        console.error('Get faculty list error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error fetching faculty list',
            code: 'FACULTY_LIST_ERROR'
        });
    }
}

/**
 * Get faculty dashboard statistics
 */
export async function getFacultyStats(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Count mentees (students who have selected this faculty as mentor)
        const menteeCount = await db
            .select({ count: profiles.id })
            .from(profiles)
            .where(eq(profiles.mentorId, user.userId));

        // Count pending applications for this faculty/HOD
        let pendingReviews = 0;
        try {
            const pendingApps = await db
                .select()
                .from(applications)
                .where(
                    user.role === 'HOD'
                        ? and(
                            eq(applications.departmentId, user.departmentId),
                            eq(applications.currentLevel, 'HOD'),
                            eq(applications.status, 'UNDER_REVIEW')
                        )
                        : and(
                            eq(applications.mentorId, user.userId),
                            eq(applications.currentLevel, 'MENTOR'),
                            eq(applications.status, 'PENDING')
                        )
                );
            pendingReviews = pendingApps.length || 0;
        } catch (err) {
            // Applications table might not exist or not accessible
            console.log('Applications count skipped:', err);
        }

        // For HOD, get additional department stats
        let departmentStudents = 0;
        let departmentFaculty = 0;
        let activeCourses = 0;

        if (user.role === 'HOD' && user.departmentId) {
            // Count students in department
            const studentCount = await db
                .select({ count: users.id })
                .from(users)
                .where(
                    and(
                        eq(users.departmentId, user.departmentId),
                        eq(users.role, 'STUDENT')
                    )
                );
            departmentStudents = studentCount.length || 0;

            // Count faculty in department
            const facultyCount = await db
                .select({ count: users.id })
                .from(users)
                .where(
                    and(
                        eq(users.departmentId, user.departmentId),
                        or(
                            eq(users.role, 'FACULTY'),
                            eq(users.role, 'HOD')
                        )
                    )
                );
            departmentFaculty = facultyCount.length || 0;

            // Count active courses/events for department
            // Note: Events table doesn't have departmentId, so we'll set this to 0 for now
            // TODO: Add departmentId to events table or create a separate course tracking system
            activeCourses = 0;
        }

        res.json({
            success: true,
            data: {
                mentees: menteeCount.length || 0,
                pendingReviews: pendingReviews,
                departmentStudents: departmentStudents,
                departmentFaculty: departmentFaculty,
                activeCourses: activeCourses,
            }
        });

    } catch (error) {
        console.error('Get faculty stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error fetching faculty stats',
            code: 'FACULTY_STATS_ERROR'
        });
    }
}