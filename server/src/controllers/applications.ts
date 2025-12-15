import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { applications, users, departments, profiles } from '../schema/complete.js';
import { eq, and, or, desc, sql } from 'drizzle-orm';

/**
 * Get all applications for the current user
 * Students see their own applications
 * Faculty/HOD/DEAN/ADMIN see applications they need to review
 */
export const getApplications = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const user = req.user;

        if (!user?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        let applicationsData;

        if (user.role === 'STUDENT') {
            // Students see only their own applications
            applicationsData = await db
                .select({
                    application: applications,
                    submittedByUser: {
                        id: users.id,
                        name: users.name,
                        email: users.email
                    },
                    department: {
                        id: departments.id,
                        name: departments.name,
                        code: departments.code
                    }
                })
                .from(applications)
                .leftJoin(users, eq(applications.submittedBy, users.id))
                .leftJoin(departments, eq(applications.departmentId, departments.id))
                .where(eq(applications.submittedBy, user.userId))
                .orderBy(desc(applications.submittedAt));
        } else {
            // Faculty/HOD/DEAN/ADMIN see applications they need to review
            const conditions: any[] = [];

            if (user.role === 'FACULTY') {
                // Faculty sees applications where they are the mentor
                conditions.push(eq(applications.mentorId, user.userId));
            } else if (user.role === 'HOD') {
                // HOD sees applications in their department
                if (user.departmentId) {
                    conditions.push(eq(applications.departmentId, user.departmentId));
                }
            } else if (user.role === 'DEAN') {
                // DEAN sees escalated applications
                conditions.push(eq(applications.requiresDeanApproval, true));
            }
            // ADMIN sees all applications

            applicationsData = await db
                .select({
                    application: applications,
                    submittedByUser: {
                        id: users.id,
                        name: users.name,
                        email: users.email
                    },
                    department: {
                        id: departments.id,
                        name: departments.name,
                        code: departments.code
                    }
                })
                .from(applications)
                .leftJoin(users, eq(applications.submittedBy, users.id))
                .leftJoin(departments, eq(applications.departmentId, departments.id))
                .where(conditions.length > 0 ? or(...conditions) : undefined)
                .orderBy(desc(applications.submittedAt));
        }

        // Format the response
        const formattedApplications = applicationsData.map(({ application, submittedByUser, department }: any) => ({
            id: application.id,
            title: application.title,
            type: application.type,
            description: application.description,
            status: application.status,
            submittedBy: submittedByUser?.name || 'Unknown',
            submittedByEmail: submittedByUser?.email,
            department: department?.name,
            departmentCode: department?.code,
            proofFileUrl: application.proofFileUrl,
            mentorStatus: application.mentorStatus,
            mentorNotes: application.mentorNotes,
            mentorReviewedAt: application.mentorReviewedAt,
            hodStatus: application.hodStatus,
            hodNotes: application.hodNotes,
            hodReviewedAt: application.hodReviewedAt,
            requiresDeanApproval: application.requiresDeanApproval,
            deanStatus: application.deanStatus,
            deanNotes: application.deanNotes,
            deanReviewedAt: application.deanReviewedAt,
            escalationReason: application.escalationReason,
            currentLevel: application.currentLevel,
            finalDecision: application.finalDecision,
            submittedAt: application.submittedAt,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
        }));

        return res.status(200).json({
            success: true,
            data: formattedApplications,
            message: 'Applications retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch applications'
        });
    }
};

/**
 * Get a single application by ID
 */
export const getApplicationById = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const user = req.user;
        const { id } = req.params;

        if (!user?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        const result = await db
            .select({
                application: applications,
                submittedByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                },
                department: {
                    id: departments.id,
                    name: departments.name,
                    code: departments.code
                }
            })
            .from(applications)
            .leftJoin(users, eq(applications.submittedBy, users.id))
            .leftJoin(departments, eq(applications.departmentId, departments.id))
            .where(eq(applications.id, id))
            .limit(1);

        if (!result.length || !result[0]) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const { application, submittedByUser, department } = result[0] as any;

        // Check access permissions
        const hasAccess =
            user.role === 'ADMIN' ||
            application.submittedBy === user.userId ||
            (user.role === 'FACULTY' && application.mentorId === user.userId) ||
            (user.role === 'HOD' && application.departmentId === user.departmentId) ||
            (user.role === 'DEAN' && application.requiresDeanApproval);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this application'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: application.id,
                title: application.title,
                type: application.type,
                description: application.description,
                status: application.status,
                submittedBy: submittedByUser?.name || 'Unknown',
                submittedByEmail: submittedByUser?.email,
                department: department?.name,
                departmentCode: department?.code,
                proofFileUrl: application.proofFileUrl,
                mentorStatus: application.mentorStatus,
                mentorNotes: application.mentorNotes,
                mentorReviewedAt: application.mentorReviewedAt,
                hodStatus: application.hodStatus,
                hodNotes: application.hodNotes,
                hodReviewedAt: application.hodReviewedAt,
                requiresDeanApproval: application.requiresDeanApproval,
                deanStatus: application.deanStatus,
                deanNotes: application.deanNotes,
                deanReviewedAt: application.deanReviewedAt,
                escalationReason: application.escalationReason,
                currentLevel: application.currentLevel,
                finalDecision: application.finalDecision,
                submittedAt: application.submittedAt,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt
            },
            message: 'Application retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching application:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch application'
        });
    }
};

/**
 * Create a new application (Students only)
 */
export const createApplication = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const user = req.user;

        if (!user?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (user.role !== 'STUDENT') {
            return res.status(403).json({
                success: false,
                message: 'Only students can create applications'
            });
        }

        const { title, type, description, proofFileUrl } = req.body;

        if (!title || !type || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title, type, and description are required'
            });
        }

        // Get user's department and find their mentor from profiles table
        const [currentUser] = await db
            .select({
                departmentId: users.departmentId,
                mentorId: profiles.mentorId
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create the application
        const [newApplication] = await db
            .insert(applications)
            .values({
                title,
                type,
                description,
                submittedBy: user.userId,
                departmentId: currentUser.departmentId || null,
                mentorId: currentUser.mentorId || null,
                proofFileUrl: proofFileUrl || null,
                status: 'PENDING',
                currentLevel: 'MENTOR',
                finalDecision: 'PENDING'
            })
            .returning();

        return res.status(201).json({
            success: true,
            data: newApplication,
            message: 'Application created successfully'
        });

    } catch (error) {
        console.error('Error creating application:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create application'
        });
    }
};

/**
 * Delete/Cancel an application
 * Students can only cancel their own pending applications
 * Admins can delete any application
 */
export const deleteApplication = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const user = req.user;
        const { id } = req.params;

        if (!user?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        // Get the application
        const [application] = await db
            .select()
            .from(applications)
            .where(eq(applications.id, id))
            .limit(1);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Only students can cancel their own applications, and only if pending
        if (user.role === 'STUDENT') {
            if (application.submittedBy !== user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only cancel your own applications'
                });
            }

            if (application.status !== 'PENDING') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only cancel pending applications'
                });
            }
        } else if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only students can cancel applications or admins can delete them'
            });
        }

        // Delete the application
        await db
            .delete(applications)
            .where(eq(applications.id, id));

        return res.status(200).json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting application:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete application'
        });
    }
};

// NOTE: updateApplicationStatus moved to faculty controller (faculty/index.ts)
