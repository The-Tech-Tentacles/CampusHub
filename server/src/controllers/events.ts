import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { events, academicEvents, users } from '../schema/complete.js';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

/**
 * Get all events with filters
 */
export async function getEvents(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        const {
            month,
            year,
            type,
            department
        } = req.query;

        // Build query conditions
        const conditions: any[] = [
            eq(events.isActive, true)
        ];

        // Filter by month/year if provided
        if (month && year) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0);

            conditions.push(
                sql`${events.date} >= ${startDate.toISOString().split('T')[0]} AND ${events.date} <= ${endDate.toISOString().split('T')[0]}`
            );
        }

        // Filter by type if provided
        if (type && ['LECTURE', 'LAB', 'EXAM', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'CULTURAL', 'GENERIC'].includes(type as string)) {
            conditions.push(eq(events.type, type as any));
        }

        // Fetch all events
        const allEvents = await db
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
            .where(and(...conditions))
            .orderBy(desc(events.date), events.startTime);

        // Format the response
        const formattedEvents = allEvents.map(row => ({
            id: row.event.id,
            title: row.event.title,
            description: row.event.description,
            type: row.event.type,
            date: row.event.date,
            startTime: row.event.startTime,
            endTime: row.event.endTime,
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
            message: 'Events retrieved successfully',
            data: formattedEvents,
            count: formattedEvents.length
        });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching events',
            code: 'EVENTS_FETCH_ERROR'
        });
    }
}

/**
 * Get event by ID
 */
export async function getEventById(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Event ID is required',
                code: 'MISSING_EVENT_ID'
            });
            return;
        }

        const [eventData] = await db
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
            .where(eq(events.id, id))
            .limit(1);

        if (!eventData) {
            res.status(404).json({
                success: false,
                message: 'Event not found',
                code: 'EVENT_NOT_FOUND'
            });
            return;
        }

        const formattedEvent = {
            id: eventData.event.id,
            title: eventData.event.title,
            description: eventData.event.description,
            type: eventData.event.type,
            date: eventData.event.date,
            startTime: eventData.event.startTime,
            endTime: eventData.event.endTime,
            location: eventData.event.location,
            instructor: eventData.event.instructor,
            linkUrl: eventData.event.linkUrl,
            targetYears: eventData.event.targetYears,
            targetDepartments: eventData.event.targetDepartments,
            targetRoles: eventData.event.targetRoles,
            isActive: eventData.event.isActive,
            createdBy: eventData.createdByUser?.name || 'Unknown',
            createdByEmail: eventData.createdByUser?.email,
            createdAt: eventData.event.createdAt,
            updatedAt: eventData.event.updatedAt
        };

        res.json({
            success: true,
            message: 'Event retrieved successfully',
            data: formattedEvent
        });

    } catch (error) {
        console.error('Get event by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching event',
            code: 'EVENT_FETCH_ERROR'
        });
    }
}

/**
 * Create a new event (Faculty/HOD/Admin only)
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
            type = 'GENERIC',
            date,
            startTime,
            endTime,
            location,
            instructor,
            linkUrl,
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

        if (!date) {
            res.status(400).json({
                success: false,
                message: 'Date is required',
                code: 'MISSING_DATE'
            });
            return;
        }

        if (!startTime) {
            res.status(400).json({
                success: false,
                message: 'Start time is required',
                code: 'MISSING_START_TIME'
            });
            return;
        }

        if (!endTime) {
            res.status(400).json({
                success: false,
                message: 'End time is required',
                code: 'MISSING_END_TIME'
            });
            return;
        }

        if (!location || !location.trim()) {
            res.status(400).json({
                success: false,
                message: 'Location is required',
                code: 'MISSING_LOCATION'
            });
            return;
        }

        // Validate type
        if (!['LECTURE', 'LAB', 'EXAM', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'CULTURAL', 'GENERIC'].includes(type)) {
            res.status(400).json({
                success: false,
                message: 'Invalid event type',
                code: 'INVALID_TYPE'
            });
            return;
        }

        // Create event
        const [newEvent] = await db
            .insert(events)
            .values({
                title: title.trim(),
                description: description?.trim() || null,
                type: type as any,
                date: date,
                startTime: startTime,
                endTime: endTime,
                location: location.trim(),
                instructor: instructor?.trim() || null,
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
                type: newEvent.type,
                date: newEvent.date,
                startTime: newEvent.startTime,
                endTime: newEvent.endTime,
                location: newEvent.location
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
            .orderBy(desc(events.date), events.startTime);

        const formattedEvents = userEvents.map(row => ({
            id: row.event.id,
            title: row.event.title,
            description: row.event.description,
            type: row.event.type,
            date: row.event.date,
            startTime: row.event.startTime,
            endTime: row.event.endTime,
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
 * Get all academic events with filters
 */
export async function getAcademicEvents(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();

        const {
            year,
            semester,
            type
        } = req.query;

        const conditions: any[] = [];

        // Filter by academic year
        if (year) {
            conditions.push(eq(academicEvents.academicYear, Number(year)));
        }

        // Filter by semester
        if (semester) {
            conditions.push(eq(academicEvents.semester, Number(semester)));
        }

        // Filter by type
        if (type) {
            conditions.push(eq(academicEvents.type, type as any));
        }

        const query = conditions.length > 0
            ? db.select({
                academicEvent: academicEvents,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
                .from(academicEvents)
                .leftJoin(users, eq(academicEvents.createdBy, users.id))
                .where(and(...conditions))
                .orderBy(academicEvents.startDate)
            : db.select({
                academicEvent: academicEvents,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
                .from(academicEvents)
                .leftJoin(users, eq(academicEvents.createdBy, users.id))
                .orderBy(academicEvents.startDate);

        const allAcademicEvents = await query;

        const formattedEvents = allAcademicEvents.map(row => ({
            id: row.academicEvent.id,
            title: row.academicEvent.title,
            description: row.academicEvent.description,
            type: row.academicEvent.type,
            startDate: row.academicEvent.startDate,
            endDate: row.academicEvent.endDate,
            isHoliday: row.academicEvent.isHoliday,
            linkUrl: row.academicEvent.linkUrl,
            targetYears: row.academicEvent.targetYears,
            targetDepartments: row.academicEvent.targetDepartments,
            targetRoles: row.academicEvent.targetRoles,
            academicYear: row.academicEvent.academicYear,
            semester: row.academicEvent.semester,
            canEdit: row.academicEvent.canEdit,
            createdBy: row.createdByUser?.name || 'Unknown',
            createdByEmail: row.createdByUser?.email,
            createdAt: row.academicEvent.createdAt,
            updatedAt: row.academicEvent.updatedAt
        }));

        res.json({
            success: true,
            message: 'Academic events retrieved successfully',
            data: formattedEvents,
            count: formattedEvents.length
        });

    } catch (error) {
        console.error('Get academic events error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching academic events',
            code: 'ACADEMIC_EVENTS_FETCH_ERROR'
        });
    }
}

/**
 * Create a new academic event (Admin/Dean only)
 */
export async function createAcademicEvent(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        // Validate user role - only admin and dean can create academic events
        if (!['DEAN', 'ADMIN'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Only dean and admin can create academic events',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
            return;
        }

        const {
            title,
            description,
            type,
            startDate,
            endDate,
            isHoliday = false,
            linkUrl,
            targetYears,
            targetDepartments,
            targetRoles,
            academicYear,
            semester
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

        if (!type) {
            res.status(400).json({
                success: false,
                message: 'Type is required',
                code: 'MISSING_TYPE'
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

        if (!academicYear) {
            res.status(400).json({
                success: false,
                message: 'Academic year is required',
                code: 'MISSING_ACADEMIC_YEAR'
            });
            return;
        }

        // Create academic event
        const [newAcademicEvent] = await db
            .insert(academicEvents)
            .values({
                title: title.trim(),
                description: description?.trim() || null,
                type: type as any,
                startDate: startDate,
                endDate: endDate,
                isHoliday: isHoliday,
                linkUrl: linkUrl?.trim() || null,
                targetYears: targetYears || [],
                targetDepartments: targetDepartments || [],
                targetRoles: targetRoles || [],
                academicYear: academicYear,
                semester: semester || null,
                canEdit: true,
                createdBy: user.userId
            })
            .returning();

        if (!newAcademicEvent) {
            res.status(500).json({
                success: false,
                message: 'Failed to create academic event',
                code: 'ACADEMIC_EVENT_CREATE_FAILED'
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Academic event created successfully',
            data: {
                id: newAcademicEvent.id,
                title: newAcademicEvent.title,
                type: newAcademicEvent.type,
                startDate: newAcademicEvent.startDate,
                endDate: newAcademicEvent.endDate,
                academicYear: newAcademicEvent.academicYear
            }
        });

    } catch (error) {
        console.error('Create academic event error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating academic event',
            code: 'ACADEMIC_EVENT_CREATE_ERROR'
        });
    }
}

/**
 * Update an event
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
 * Delete an event
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
