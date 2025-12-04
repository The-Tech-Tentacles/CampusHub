import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { forms, formSubmissions, users, departments } from '../schema/complete.js';
import { eq, and, or, desc, sql } from 'drizzle-orm';

/**
 * Get all forms for the current user
 * Students see forms available to them
 * Faculty/HOD/DEAN/ADMIN see all forms
 */
export const getForms = async (req: Request, res: Response): Promise<any> => {
    try {
        const { db } = getDatabase();
        const user = req.user;

        if (!user?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Get current user details including academic year code
        const [currentUser] = await db
            .select({
                role: users.role,
                departmentId: users.departmentId,
                academicYearId: users.academicYearId,
                academicYearCode: sql<string>`(
                    SELECT ${sql.identifier('code')}
                    FROM ${sql.identifier('academic_years')}
                    WHERE ${sql.identifier('id')} = ${users.academicYearId}
                )`
            })
            .from(users)
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Build the base query
        const baseQuery = db
            .select({
                form: forms,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                },
                department: {
                    id: departments.id,
                    name: departments.name,
                    code: departments.code
                },
                // Check if user has submitted this form
                isSubmitted: sql<boolean>`EXISTS (
                    SELECT 1 FROM ${formSubmissions}
                    WHERE ${formSubmissions.formId} = ${forms.id}
                    AND ${formSubmissions.submittedBy} = ${user.userId}
                )`,
                submittedAt: sql<string | null>`(
                    SELECT ${formSubmissions.submittedAt}
                    FROM ${formSubmissions}
                    WHERE ${formSubmissions.formId} = ${forms.id}
                    AND ${formSubmissions.submittedBy} = ${user.userId}
                    LIMIT 1
                )`
            })
            .from(forms)
            .leftJoin(users, eq(forms.createdBy, users.id))
            .leftJoin(departments, eq(forms.departmentId, departments.id));

        // Apply visibility filters for students
        let formsData;
        if (currentUser.role === 'STUDENT') {
            // Students can only see ACTIVE forms that are either:
            // 1. Global (no targeting)
            // 2. Targeted to their role, department, or academic year
            formsData = await baseQuery
                .where(
                    and(
                        eq(forms.status, 'ACTIVE'),
                        or(
                            // Global forms (no targeting specified)
                            and(
                                sql`${forms.targetRoles} IS NULL`,
                                sql`${forms.targetDepartments} IS NULL`,
                                sql`${forms.targetYears} IS NULL`
                            ),
                            // Forms targeted to STUDENT role
                            sql`'STUDENT' = ANY(${forms.targetRoles})`,
                            // Forms targeted to user's department (UUID comparison)
                            currentUser.departmentId ? sql`${currentUser.departmentId}::uuid = ANY(${forms.targetDepartments})` : sql`false`,
                            // Forms targeted to user's academic year (string code comparison)
                            currentUser.academicYearCode ? sql`${currentUser.academicYearCode}::text = ANY(${forms.targetYears})` : sql`false`
                        )
                    )
                )
                .orderBy(desc(forms.createdAt));
        } else {
            // Faculty, HOD, DEAN, and ADMIN see all forms
            formsData = await baseQuery.orderBy(desc(forms.createdAt));
        }

        // Format the response
        const formattedForms = formsData.map(item => ({
            id: item.form.id,
            title: item.form.title,
            description: item.form.description,
            createdBy: item.createdByUser?.name || 'Unknown',
            createdByEmail: item.createdByUser?.email,
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
            isSubmitted: item.isSubmitted || false,
            submittedAt: item.submittedAt || undefined
        }));

        res.json({
            success: true,
            message: 'Forms retrieved successfully',
            data: formattedForms
        });

    } catch (error) {
        console.error('Get forms error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve forms',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};

/**
 * Get a single form by ID
 */
export const getFormById = async (req: Request, res: Response): Promise<any> => {
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

        const [formData] = await db
            .select({
                form: forms,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                },
                department: {
                    id: departments.id,
                    name: departments.name,
                    code: departments.code
                },
                isSubmitted: sql<boolean>`EXISTS (
                    SELECT 1 FROM ${formSubmissions}
                    WHERE ${formSubmissions.formId} = ${forms.id}
                    AND ${formSubmissions.submittedBy} = ${user.userId}
                )`,
                submissionData: sql<any>`(
                    SELECT ${formSubmissions.submissionData}
                    FROM ${formSubmissions}
                    WHERE ${formSubmissions.formId} = ${forms.id}
                    AND ${formSubmissions.submittedBy} = ${user.userId}
                    LIMIT 1
                )`,
                submittedAt: sql<string | null>`(
                    SELECT ${formSubmissions.submittedAt}
                    FROM ${formSubmissions}
                    WHERE ${formSubmissions.formId} = ${forms.id}
                    AND ${formSubmissions.submittedBy} = ${user.userId}
                    LIMIT 1
                )`
            })
            .from(forms)
            .leftJoin(users, eq(forms.createdBy, users.id))
            .leftJoin(departments, eq(forms.departmentId, departments.id))
            .where(eq(forms.id, id))
            .limit(1);

        if (!formData) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }

        const formattedForm = {
            id: formData.form.id,
            title: formData.form.title,
            description: formData.form.description,
            createdBy: formData.createdByUser?.name || 'Unknown',
            createdByEmail: formData.createdByUser?.email,
            createdAt: formData.form.createdAt,
            deadline: formData.form.deadline,
            status: formData.form.status,
            department: formData.department?.name,
            departmentCode: formData.department?.code,
            formData: formData.form.formData,
            maxSubmissions: formData.form.maxSubmissions,
            allowMultipleSubmissions: formData.form.allowMultipleSubmissions,
            requiresApproval: formData.form.requiresApproval,
            targetYears: formData.form.targetYears,
            targetDepartments: formData.form.targetDepartments,
            targetRoles: formData.form.targetRoles,
            isSubmitted: formData.isSubmitted || false,
            submissionData: formData.submissionData || undefined,
            submittedAt: formData.submittedAt || undefined
        };

        res.json({
            success: true,
            message: 'Form retrieved successfully',
            data: formattedForm
        });

    } catch (error) {
        console.error('Get form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve form',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};

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
            requiresApproval
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
                targetYears: targetYears || null,
                targetDepartments: targetDepartments || null,
                targetRoles: targetRoles || null,
                departmentId: departmentId || null,
                maxSubmissions: maxSubmissions || null,
                allowMultipleSubmissions: allowMultipleSubmissions || false,
                requiresApproval: requiresApproval || false,
                status: 'ACTIVE'
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
 * Submit a form
 */
export const submitForm = async (req: Request, res: Response): Promise<any> => {
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

        const { submissionData } = req.body;

        if (!submissionData) {
            return res.status(400).json({
                success: false,
                message: 'Submission data is required'
            });
        }

        // Check if form exists and is active
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

        if (form.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Form is not accepting submissions'
            });
        }

        // Check if deadline has passed
        if (new Date() > new Date(form.deadline)) {
            return res.status(400).json({
                success: false,
                message: 'Form deadline has passed'
            });
        }

        // Check if user has already submitted
        const [existingSubmission] = await db
            .select()
            .from(formSubmissions)
            .where(
                and(
                    eq(formSubmissions.formId, id),
                    eq(formSubmissions.submittedBy, user.userId)
                )
            )
            .limit(1);

        if (existingSubmission) {
            if (!form.allowMultipleSubmissions) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already submitted this form'
                });
            }

            // Update existing submission
            const [updatedSubmission] = await db
                .update(formSubmissions)
                .set({
                    submissionData,
                    updatedAt: new Date()
                })
                .where(eq(formSubmissions.id, existingSubmission.id))
                .returning();

            return res.json({
                success: true,
                message: 'Form submission updated successfully',
                data: updatedSubmission
            });
        }

        // Create new submission
        const [newSubmission] = await db
            .insert(formSubmissions)
            .values({
                formId: id,
                submittedBy: user.userId,
                submissionData
            })
            .returning();

        res.status(201).json({
            success: true,
            message: 'Form submitted successfully',
            data: newSubmission
        });

    } catch (error) {
        console.error('Submit form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit form',
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
