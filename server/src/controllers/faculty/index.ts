/**
 * Faculty Controller
 * 
 * This controller handles all faculty/HOD-specific operations including:
 * - Faculty information and statistics
 * - Form management (create, delete, view submissions)
 * - Notice management (create, update, delete)
 * - Event management (create, update, delete)
 * - Application reviews
 */

import { Request, Response } from 'express';
import { getDatabase } from '../../config/database.js';
import {
    users,
    departments,
    profiles,
    applications,
    forms,
    formSubmissions,
    notices,
    noticeReads,
    events,
} from '../../schema/complete.js';
import { eq, and, or, desc, sql } from 'drizzle-orm';

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
 * Get list of mentees assigned to faculty
 */
export async function getMenteeList(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        if (!user?.userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Check if user is faculty or HOD
        if (!['FACULTY', 'HOD'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty and HOD can view mentees'
            });
            return;
        }

        // Fetch mentees with their user and department information
        // Using the indexed mentor_id column for efficient query
        const mentees = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
                enrollmentNumber: users.enrollmentNumber,
                departmentId: users.departmentId,
                profile: {
                    section: profiles.section,
                    semester: profiles.semester,
                    cgpa: profiles.cgpa,
                    batch: profiles.batch,
                    rollNumber: profiles.rollNumber,
                    bloodGroup: profiles.bloodGroup,
                    altEmail: profiles.altEmail,
                    guardianName: profiles.guardianName,
                    guardianContact: profiles.guardianContact,
                },
                department: {
                    id: departments.id,
                    name: departments.name,
                    code: departments.code,
                }
            })
            .from(profiles)
            .innerJoin(users, eq(profiles.userId, users.id))
            .leftJoin(departments, eq(users.departmentId, departments.id))
            .where(eq(profiles.mentorId, user.userId))
            .orderBy(users.name);

        res.json({
            success: true,
            message: 'Mentees retrieved successfully',
            data: mentees,
            count: mentees.length
        });

    } catch (error) {
        console.error('Get mentee list error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error fetching mentee list',
            code: 'MENTEE_LIST_ERROR'
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

        // Count notices created by this faculty
        const noticesCount = await db
            .select({ count: notices.id })
            .from(notices)
            .where(eq(notices.createdBy, user.userId));

        // Count upcoming events created by this faculty
        const today = new Date().toISOString().split('T')[0];
        const upcomingEventsCount = await db
            .select({ count: events.id })
            .from(events)
            .where(
                and(
                    eq(events.createdBy, user.userId),
                    sql`${events.startDate} >= ${today}`
                )
            );

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
                notices: noticesCount.length || 0,
                upcomingEvents: upcomingEventsCount.length || 0,
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

// =================== FORMS MANAGEMENT ===================

/**
 * Create a new form (Faculty/HOD/DEAN/ADMIN only)
 */
export const createForm = async (req: Request, res: Response): Promise<any> => {
    try {
        const { db } = getDatabase();
        const user = req.user;

        if (!user?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if user has permission to create forms
        if (user.role === 'STUDENT') {
            return res.status(403).json({
                success: false,
                message: 'Only faculty and administrators can create forms'
            });
        }

        const {
            title,
            description,
            deadline,
            formData,
            targetYears,
            targetDepartments,
            targetRoles,
            departmentId,
            maxSubmissions,
            allowMultipleSubmissions,
            requiresApproval,
            status
        } = req.body;

        if (!title || !description || !deadline || !formData) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, deadline, and form data are required'
            });
        }

        const [newForm] = await db
            .insert(forms)
            .values({
                title,
                description,
                deadline: new Date(deadline),
                formData,
                createdBy: user.userId,
                targetYears: targetYears && targetYears.length > 0 ? targetYears : null,
                targetDepartments: targetDepartments && targetDepartments.length > 0 ? targetDepartments : null,
                targetRoles: targetRoles && targetRoles.length > 0 ? targetRoles : null,
                departmentId: departmentId || null,
                maxSubmissions: maxSubmissions !== undefined && maxSubmissions !== null ? maxSubmissions : null,
                allowMultipleSubmissions: allowMultipleSubmissions === true,
                requiresApproval: requiresApproval === true,
                status: status || 'DRAFT'
            })
            .returning();

        res.status(201).json({
            success: true,
            message: 'Form created successfully',
            data: newForm
        });

    } catch (error) {
        console.error('Create form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create form',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};

/**
 * Get forms created by the current faculty member
 */
export const getMyForms = async (req: Request, res: Response): Promise<any> => {
    try {
        const { db } = getDatabase();
        const user = req.user;

        if (!user?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if user has permission
        if (user.role === 'STUDENT') {
            return res.status(403).json({
                success: false,
                message: 'Only faculty and administrators can access this endpoint'
            });
        }

        const myForms = await db
            .select({
                form: forms,
                department: {
                    id: departments.id,
                    name: departments.name,
                    code: departments.code
                },
                submissionCount: sql<number>`(
                    SELECT COUNT(*)
                    FROM ${formSubmissions}
                    WHERE ${formSubmissions.formId} = ${forms.id}
                )`
            })
            .from(forms)
            .leftJoin(departments, eq(forms.departmentId, departments.id))
            .where(eq(forms.createdBy, user.userId))
            .orderBy(desc(forms.createdAt));

        const formattedForms = myForms.map(item => ({
            id: item.form.id,
            title: item.form.title,
            description: item.form.description,
            createdAt: item.form.createdAt,
            deadline: item.form.deadline,
            status: item.form.status,
            department: item.department?.name,
            departmentCode: item.department?.code,
            formData: item.form.formData,
            maxSubmissions: item.form.maxSubmissions,
            allowMultipleSubmissions: item.form.allowMultipleSubmissions,
            requiresApproval: item.form.requiresApproval,
            targetYears: item.form.targetYears,
            targetDepartments: item.form.targetDepartments,
            targetRoles: item.form.targetRoles,
            submissionCount: Number(item.submissionCount) || 0
        }));

        res.json({
            success: true,
            message: 'Your forms retrieved successfully',
            data: formattedForms
        });

    } catch (error) {
        console.error('Get my forms error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve your forms',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};

/**
 * Get all submissions for a specific form (Creator/Admin only)
 */
export const getFormSubmissions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { db } = getDatabase();
        const user = req.user;
        const { id } = req.params;

        if (!user?.userId || !id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if form exists
        const [form] = await db
            .select()
            .from(forms)
            .where(eq(forms.id, id))
            .limit(1);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }

        // Only creator or admin can view submissions
        if (form.createdBy !== user.userId && !['ADMIN', 'DEAN'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view these submissions'
            });
        }

        const submissions = await db
            .select({
                submission: formSubmissions,
                submittedByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    enrollmentNumber: users.enrollmentNumber,
                    departmentId: users.departmentId
                },
                department: {
                    id: departments.id,
                    name: departments.name,
                    code: departments.code
                }
            })
            .from(formSubmissions)
            .leftJoin(users, eq(formSubmissions.submittedBy, users.id))
            .leftJoin(departments, eq(users.departmentId, departments.id))
            .where(eq(formSubmissions.formId, id))
            .orderBy(desc(formSubmissions.submittedAt));

        const formattedSubmissions = submissions.map(item => ({
            id: item.submission.id,
            formId: item.submission.formId,
            submissionData: item.submission.submissionData,
            submittedAt: item.submission.submittedAt,
            submittedBy: {
                id: item.submittedByUser?.id,
                name: item.submittedByUser?.name,
                email: item.submittedByUser?.email,
                enrollmentNumber: item.submittedByUser?.enrollmentNumber,
                department: item.department?.name,
                departmentCode: item.department?.code
            }
        }));

        res.json({
            success: true,
            message: 'Form submissions retrieved successfully',
            data: formattedSubmissions,
            form: {
                id: form.id,
                title: form.title,
                description: form.description
            }
        });

    } catch (error) {
        console.error('Get form submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve form submissions',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};

/**
 * Delete a form (Faculty/HOD/DEAN/ADMIN only)
 */
export const deleteForm = async (req: Request, res: Response): Promise<any> => {
    try {
        const { db } = getDatabase();
        const user = req.user;
        const { id } = req.params;

        if (!user?.userId || !id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if user has permission to delete forms
        if (user.role === 'STUDENT') {
            return res.status(403).json({
                success: false,
                message: 'Only faculty and administrators can delete forms'
            });
        }

        const [deletedForm] = await db
            .delete(forms)
            .where(eq(forms.id, id))
            .returning();

        if (!deletedForm) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }

        res.json({
            success: true,
            message: 'Form deleted successfully',
            data: deletedForm
        });

    } catch (error) {
        console.error('Delete form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete form',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};

// =================== NOTICES MANAGEMENT ===================

/**
 * Create a new notice (Faculty/HOD/DEAN/ADMIN only)
 */
export async function createNotice(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can create notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        const {
            title,
            content,
            type = 'general',
            scope = 'GLOBAL',
            targetYears,
            targetDepartments,
            targetRoles,
            expiresAt,
            attachmentUrl
        } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            res.status(400).json({
                success: false,
                message: 'Title is required',
                code: 'MISSING_TITLE'
            });
            return;
        }

        if (!content || !content.trim()) {
            res.status(400).json({
                success: false,
                message: 'Content is required',
                code: 'MISSING_CONTENT'
            });
            return;
        }

        // Validate type
        if (!['urgent', 'important', 'general'].includes(type)) {
            res.status(400).json({
                success: false,
                message: 'Invalid notice type',
                code: 'INVALID_TYPE'
            });
            return;
        }

        // Validate scope
        if (!['GLOBAL', 'DEPARTMENT', 'YEAR'].includes(scope)) {
            res.status(400).json({
                success: false,
                message: 'Invalid scope',
                code: 'INVALID_SCOPE'
            });
            return;
        }

        // Create notice
        const [newNotice] = await db
            .insert(notices)
            .values({
                title: title.trim(),
                content: content.trim(),
                type: type as any,
                scope: scope as any,
                targetYears: targetYears || [],
                targetDepartments: targetDepartments || [],
                targetRoles: targetRoles || [],
                createdBy: user.userId,
                attachmentUrl: attachmentUrl || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: true,
                publishedAt: new Date()
            })
            .returning();

        if (!newNotice) {
            res.status(500).json({
                success: false,
                message: 'Failed to create notice',
                code: 'NOTICE_CREATE_FAILED'
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            data: {
                id: newNotice.id,
                title: newNotice.title,
                content: newNotice.content,
                type: newNotice.type,
                scope: newNotice.scope,
                publishedAt: newNotice.publishedAt,
                expiresAt: newNotice.expiresAt
            }
        });

    } catch (error) {
        console.error('Create notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating notice',
            code: 'NOTICE_CREATE_ERROR'
        });
    }
}

/**
 * Get notices created by the current user (Faculty/HOD/Admin)
 */
export async function getMyNotices(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can access this endpoint',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Fetch notices created by this user
        const userNotices = await db
            .select({
                notice: notices,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(notices)
            .leftJoin(users, eq(notices.createdBy, users.id))
            .where(eq(notices.createdBy, user.userId))
            .orderBy(desc(notices.createdAt));

        // Format the response
        const formattedNotices = userNotices.map(row => ({
            id: row.notice.id,
            title: row.notice.title,
            content: row.notice.content,
            type: row.notice.type,
            scope: row.notice.scope,
            targetYears: row.notice.targetYears,
            targetDepartments: row.notice.targetDepartments,
            targetRoles: row.notice.targetRoles,
            attachmentUrl: row.notice.attachmentUrl,
            publishedAt: row.notice.publishedAt,
            expiresAt: row.notice.expiresAt,
            isActive: row.notice.isActive,
            createdBy: row.createdByUser?.name || 'Unknown',
            createdByEmail: row.createdByUser?.email,
            createdAt: row.notice.createdAt,
            updatedAt: row.notice.updatedAt
        }));

        res.json({
            success: true,
            message: 'Your notices retrieved successfully',
            data: formattedNotices,
            count: formattedNotices.length
        });

    } catch (error) {
        console.error('Get my notices error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching your notices',
            code: 'MY_NOTICES_FETCH_ERROR'
        });
    }
}

/**
 * Update a notice (Creator/ADMIN only)
 */
export async function updateNotice(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const id = req.params.id as string;
        const {
            title,
            content,
            type,
            scope,
            targetYears,
            targetDepartments,
            targetRoles,
            expiresAt,
            attachmentUrl
        } = req.body;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can update notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Check if notice exists
        const [existingNotice] = await db
            .select()
            .from(notices)
            .where(eq(notices.id, id))
            .limit(1);

        if (!existingNotice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found',
                code: 'NOTICE_NOT_FOUND'
            });
            return;
        }

        // Check if user is the creator or admin
        if (existingNotice.createdBy !== user.userId && user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'You can only update your own notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (type !== undefined) updateData.type = type;
        if (scope !== undefined) updateData.scope = scope;
        if (targetYears !== undefined) updateData.targetYears = targetYears;
        if (targetDepartments !== undefined) updateData.targetDepartments = targetDepartments;
        if (targetRoles !== undefined) updateData.targetRoles = targetRoles;
        if (attachmentUrl !== undefined) updateData.attachmentUrl = attachmentUrl || null;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

        // Update the notice
        const [updatedNotice] = await db
            .update(notices)
            .set(updateData)
            .where(eq(notices.id, id))
            .returning();

        res.json({
            success: true,
            message: 'Notice updated successfully',
            data: updatedNotice
        });

    } catch (error) {
        console.error('Update notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating notice',
            code: 'NOTICE_UPDATE_ERROR'
        });
    }
}

/**
 * Delete a notice (Creator/ADMIN only)
 */
export async function deleteNotice(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const id = req.params.id as string;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can delete notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Check if notice exists
        const [existingNotice] = await db
            .select()
            .from(notices)
            .where(eq(notices.id, id))
            .limit(1);

        if (!existingNotice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found',
                code: 'NOTICE_NOT_FOUND'
            });
            return;
        }

        // Check if user is the creator or admin
        if (existingNotice.createdBy !== user.userId && user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                message: 'You can only delete your own notices',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        // Soft delete by setting isActive to false
        await db
            .update(notices)
            .set({
                isActive: false,
                updatedAt: new Date()
            })
            .where(eq(notices.id, id));

        res.json({
            success: true,
            message: 'Notice deleted successfully'
        });

    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting notice',
            code: 'NOTICE_DELETE_ERROR'
        });
    }
}

// =================== EVENTS MANAGEMENT ===================

/**
 * Create a new event (Faculty/HOD/DEAN/ADMIN only)
 */
export async function createEvent(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can create events',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        const {
            title,
            description,
            eventCategory = 'REGULAR',
            type = 'GENERIC',
            startDate,
            endDate,
            location,
            instructor,
            linkUrl,
            isHoliday = false,
            academicYear,
            semester,
            targetYears,
            targetDepartments,
            targetRoles
        } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            res.status(400).json({
                success: false,
                message: 'Title is required',
                code: 'MISSING_TITLE'
            });
            return;
        }

        if (!startDate) {
            res.status(400).json({
                success: false,
                message: 'Start date is required',
                code: 'MISSING_START_DATE'
            });
            return;
        }

        if (!endDate) {
            res.status(400).json({
                success: false,
                message: 'End date is required',
                code: 'MISSING_END_DATE'
            });
            return;
        }

        // Validate event category
        if (!['REGULAR', 'ACADEMIC'].includes(eventCategory)) {
            res.status(400).json({
                success: false,
                message: 'Invalid event category. Must be REGULAR or ACADEMIC',
                code: 'INVALID_EVENT_CATEGORY'
            });
            return;
        }

        // Category-specific validation
        if (eventCategory === 'ACADEMIC' && !academicYear) {
            res.status(400).json({
                success: false,
                message: 'Academic year is required for academic events',
                code: 'MISSING_ACADEMIC_YEAR'
            });
            return;
        }

        // Create event
        const [newEvent] = await db
            .insert(events)
            .values({
                title: title.trim(),
                description: description?.trim() || null,
                eventCategory: eventCategory,
                type: type,
                startDate: startDate,
                endDate: endDate,
                location: location?.trim() || null,
                instructor: instructor?.trim() || null,
                isHoliday: isHoliday,
                academicYear: academicYear || null,
                semester: semester || null,
                linkUrl: linkUrl?.trim() || null,
                targetYears: targetYears || [],
                targetDepartments: targetDepartments || [],
                targetRoles: targetRoles || [],
                createdBy: user.userId,
                isActive: true
            })
            .returning();

        if (!newEvent) {
            res.status(500).json({
                success: false,
                message: 'Failed to create event',
                code: 'EVENT_CREATE_FAILED'
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: {
                id: newEvent.id,
                title: newEvent.title,
                eventCategory: newEvent.eventCategory,
                type: newEvent.type,
                startDate: newEvent.startDate,
                endDate: newEvent.endDate
            }
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating event',
            code: 'EVENT_CREATE_ERROR'
        });
    }
}

/**
 * Get events created by the current user
 */
export async function getMyEvents(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Validate user role
        if (!['FACULTY', 'HOD', 'DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only faculty, HOD, dean, and admin can access this endpoint',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        const userEvents = await db
            .select({
                event: events,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(events)
            .leftJoin(users, eq(events.createdBy, users.id))
            .where(and(
                eq(events.createdBy, user.userId),
                eq(events.isActive, true)
            ))
            .orderBy(desc(events.startDate));

        const formattedEvents = userEvents.map(row => ({
            id: row.event.id,
            title: row.event.title,
            description: row.event.description,
            type: row.event.type,
            startDate: row.event.startDate,
            endDate: row.event.endDate,
            location: row.event.location,
            instructor: row.event.instructor,
            linkUrl: row.event.linkUrl,
            targetYears: row.event.targetYears,
            targetDepartments: row.event.targetDepartments,
            targetRoles: row.event.targetRoles,
            isActive: row.event.isActive,
            createdBy: row.createdByUser?.name || 'Unknown',
            createdByEmail: row.createdByUser?.email,
            createdAt: row.event.createdAt,
            updatedAt: row.event.updatedAt
        }));

        res.json({
            success: true,
            message: 'Your events retrieved successfully',
            data: formattedEvents,
            count: formattedEvents.length
        });

    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching your events',
            code: 'MY_EVENTS_FETCH_ERROR'
        });
    }
}

/**
 * Create a new academic event (DEAN/ADMIN only)
 */
/**
 * Update an event (Creator/ADMIN/DEAN only)
 */
export async function updateEvent(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Event ID is required',
                code: 'INVALID_EVENT_ID'
            });
            return;
        }

        // Check if event exists and user owns it
        const [existingEvent] = await db
            .select()
            .from(events)
            .where(eq(events.id, id))
            .limit(1);

        if (!existingEvent) {
            res.status(404).json({
                success: false,
                message: 'Event not found',
                code: 'EVENT_NOT_FOUND'
            });
            return;
        }

        // Only the creator or admin/dean can update
        if (existingEvent.createdBy !== user.userId && !['ADMIN', 'DEAN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to update this event',
                code: 'UPDATE_FORBIDDEN'
            });
            return;
        }

        const updateData: any = {};
        const { title, description, type, date, startTime, endTime, location, instructor, linkUrl } = req.body;

        if (title) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (type) updateData.type = type;
        if (date) updateData.date = date;
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (location) updateData.location = location.trim();
        if (instructor !== undefined) updateData.instructor = instructor?.trim() || null;
        if (linkUrl !== undefined) updateData.linkUrl = linkUrl?.trim() || null;

        const [updatedEvent] = await db
            .update(events)
            .set(updateData)
            .where(eq(events.id, id))
            .returning();

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating event',
            code: 'EVENT_UPDATE_ERROR'
        });
    }
}

/**
 * Delete an event (Creator/ADMIN/DEAN only)
 */
export async function deleteEvent(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Event ID is required',
                code: 'INVALID_EVENT_ID'
            });
            return;
        }

        // Check if event exists and user owns it
        const [existingEvent] = await db
            .select()
            .from(events)
            .where(eq(events.id, id))
            .limit(1);

        if (!existingEvent) {
            res.status(404).json({
                success: false,
                message: 'Event not found',
                code: 'EVENT_NOT_FOUND'
            });
            return;
        }

        // Only the creator or admin/dean can delete
        if (existingEvent.createdBy !== user.userId && !['ADMIN', 'DEAN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this event',
                code: 'DELETE_FORBIDDEN'
            });
            return;
        }

        // Soft delete by setting isActive to false
        await db
            .update(events)
            .set({ isActive: false })
            .where(eq(events.id, id));

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting event',
            code: 'EVENT_DELETE_ERROR'
        });
    }
}

// =================== APPLICATION REVIEWS ===================

/**
 * Update application status (Faculty/HOD/DEAN only)
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const user = req.user;
        const { id } = req.params;
        const { status, notes, escalate, escalationReason } = req.body;

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

        if (!status || !['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (APPROVED, REJECTED, UNDER_REVIEW)'
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

        // Determine update based on user role
        let updateData: any = {};

        if (user.role === 'FACULTY' && application.mentorId === user.userId) {
            // Mentor review
            updateData = {
                mentorStatus: status,
                mentorNotes: notes || null,
                mentorReviewedAt: new Date(),
                currentLevel: status === 'APPROVED' ? 'HOD' : 'MENTOR',
                status: status === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW'
            };

            if (status === 'REJECTED') {
                updateData.finalDecision = 'REJECTED';
            }

        } else if (user.role === 'HOD' && application.departmentId === user.departmentId) {
            // HOD review
            updateData = {
                hodStatus: status,
                hodNotes: notes || null,
                hodReviewedAt: new Date(),
                hodId: user.userId
            };

            if (escalate && status === 'APPROVED') {
                // HOD escalates to DEAN
                updateData.requiresDeanApproval = true;
                updateData.escalationReason = escalationReason || 'Requires Dean approval';
                updateData.currentLevel = 'DEAN';
                updateData.status = 'ESCALATED';
            } else {
                updateData.currentLevel = status === 'APPROVED' ? 'COMPLETED' : 'HOD';
                updateData.finalDecision = status;
                updateData.status = status;
            }

        } else if (user.role === 'DEAN' && application.requiresDeanApproval) {
            // DEAN review
            updateData = {
                deanStatus: status,
                deanNotes: notes || null,
                deanReviewedAt: new Date(),
                deanId: user.userId,
                currentLevel: 'COMPLETED',
                finalDecision: status,
                status: status
            };

        } else {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to review this application'
            });
        }

        // Update the application
        const [updatedApplication] = await db
            .update(applications)
            .set(updateData)
            .where(eq(applications.id, id))
            .returning();

        return res.status(200).json({
            success: true,
            data: updatedApplication,
            message: 'Application status updated successfully'
        });

    } catch (error) {
        console.error('Error updating application status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update application status'
        });
    }
};
