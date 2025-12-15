import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { events, users } from '../schema/complete.js';
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

            // Event overlaps with month if: start_date <= month_end AND end_date >= month_start
            conditions.push(
                sql`${events.startDate} <= ${endDate.toISOString().split('T')[0]} AND ${events.endDate} >= ${startDate.toISOString().split('T')[0]}`
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
            .orderBy(desc(events.startDate));

        // Format the response
        const formattedEvents = allEvents.map(row => ({
            id: row.event.id,
            title: row.event.title,
            description: row.event.description,
            eventCategory: row.event.eventCategory,
            type: row.event.type,
            startDate: row.event.startDate,
            endDate: row.event.endDate,
            location: row.event.location,
            instructor: row.event.instructor,
            isHoliday: row.event.isHoliday,
            academicYear: row.event.academicYear,
            semester: row.event.semester,
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
 * Get academic events with optional filters (year, semester, type)
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

        // Base condition - filter by eventCategory
        conditions.push(eq(events.eventCategory, 'ACADEMIC'));

        // Filter by academic year
        if (year) {
            conditions.push(eq(events.academicYear, Number(year)));
        }

        // Filter by semester
        if (semester) {
            conditions.push(eq(events.semester, Number(semester)));
        }

        // Filter by type
        if (type) {
            conditions.push(eq(events.type, type as any));
        }

        const query = conditions.length > 0
            ? db.select({
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
                .orderBy(events.startDate)
            : db.select({
                event: events,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
                .from(events)
                .leftJoin(users, eq(events.createdBy, users.id))
                .where(eq(events.eventCategory, 'ACADEMIC'))
                .orderBy(events.startDate);

        const allAcademicEvents = await query;

        const formattedEvents = allAcademicEvents.map(row => ({
            id: row.event.id,
            title: row.event.title,
            description: row.event.description,
            eventCategory: row.event.eventCategory,
            type: row.event.type,
            startDate: row.event.startDate,
            endDate: row.event.endDate,
            isHoliday: row.event.isHoliday,
            linkUrl: row.event.linkUrl,
            targetYears: row.event.targetYears,
            targetDepartments: row.event.targetDepartments,
            targetRoles: row.event.targetRoles,
            academicYear: row.event.academicYear,
            semester: row.event.semester,
            createdBy: row.createdByUser?.name || 'Unknown',
            createdByEmail: row.createdByUser?.email,
            createdAt: row.event.createdAt,
            updatedAt: row.event.updatedAt
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

// NOTE: createEvent, getMyEvents, createAcademicEvent, updateEvent, and deleteEvent moved to faculty controller (faculty/index.ts)
