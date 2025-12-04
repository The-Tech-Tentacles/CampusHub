import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { events, academicEvents, users } from '../schema/complete.js';
import { and, eq, gte, lte, inArray, or, SQL } from 'drizzle-orm';

/**
 * Get all events with optional filters
 * Supports filtering by month, year, type, and department
 * Automatically filters based on user's role, department, and academic year
 */
export const getEvents = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { month, year, type, department } = req.query;
        const user = req.user;

        // Base conditions - only active events
        const conditions: SQL[] = [eq(events.isActive, true)];

        // Filter by month and year if provided
        if (month !== undefined && year !== undefined) {
            const monthNum = parseInt(month as string);
            const yearNum = parseInt(year as string);

            if (!isNaN(monthNum) && !isNaN(yearNum)) {
                const startDate = new Date(yearNum, monthNum, 1);
                const endDate = new Date(yearNum, monthNum + 1, 0);

                const startDateStr = startDate.toISOString().split('T')[0] as string;
                const endDateStr = endDate.toISOString().split('T')[0] as string;

                const dateCondition = and(
                    gte(events.date, startDateStr),
                    lte(events.date, endDateStr)
                );
                if (dateCondition) {
                    conditions.push(dateCondition);
                }
            }
        }

        // Filter by type if provided
        if (type) {
            conditions.push(eq(events.type, type as any));
        }

        // Fetch all events matching base conditions
        let allEvents = await db
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
            .where(and(...conditions));

        // Filter events based on targeting
        const filteredEvents = allEvents.filter(({ event }: any) => {
            // If no targeting specified, event is visible to everyone
            const hasTargeting =
                event.targetDepartments?.length ||
                event.targetYears?.length ||
                event.targetRoles?.length;

            if (!hasTargeting) {
                return true;
            }

            // Check role targeting
            if (event.targetRoles?.length && !event.targetRoles.includes(user!.role)) {
                return false;
            }

            // Check department targeting
            if (event.targetDepartments?.length && user!.departmentId) {
                if (!event.targetDepartments.includes(user!.departmentId)) {
                    return false;
                }
            }

            // Check academic year targeting
            if (event.targetYears?.length && user!.academicYearId) {
                if (!event.targetYears.includes(user!.academicYearId)) {
                    return false;
                }
            }

            return true;
        });

        // Additional department filter from query params
        let finalEvents = filteredEvents;
        if (department) {
            finalEvents = filteredEvents.filter(({ event }: any) => {
                if (!event.targetDepartments?.length) return true;
                return event.targetDepartments.includes(department as string);
            });
        }

        // Format the response
        const formattedEvents = finalEvents.map(({ event, createdByUser }: any) => ({
            ...event,
            createdByEmail: createdByUser?.email
        }));

        return res.status(200).json({
            success: true,
            data: formattedEvents,
            message: 'Events retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
};

/**
 * Get a single event by ID
 */
export const getEventById = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        const user = req.user;

        // Fetch the event
        const result = await db
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
                eq(events.id, id),
                eq(events.isActive, true)
            ))
            .limit(1);

        if (!result.length || !result[0]) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const { event, createdByUser } = result[0] as any;

        // Check if user has access to this event
        const hasTargeting =
            event.targetDepartments?.length ||
            event.targetYears?.length ||
            event.targetRoles?.length;

        if (hasTargeting) {
            const hasAccess =
                (!event.targetRoles?.length || event.targetRoles.includes(user!.role)) &&
                (!event.targetDepartments?.length || !user!.departmentId || event.targetDepartments.includes(user!.departmentId)) &&
                (!event.targetYears?.length || !user!.academicYearId || event.targetYears.includes(user!.academicYearId));

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this event'
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                ...event,
                createdByEmail: createdByUser?.email
            },
            message: 'Event retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch event'
        });
    }
};

/**
 * Get all academic events (calendar) with optional filters
 * Supports filtering by year, month, semester, and type
 * Automatically filters based on user's role, department, and academic year
 */
export const getAcademicEvents = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { year, month, semester, type } = req.query;
        const user = req.user;

        // Base conditions
        const conditions: SQL[] = [];

        // Filter by academic year if provided
        if (year) {
            const yearNum = parseInt(year as string);
            if (!isNaN(yearNum)) {
                conditions.push(eq(academicEvents.academicYear, yearNum));
            }
        }

        // Filter by month if provided (events that overlap with this month)
        if (month !== undefined && year !== undefined) {
            const monthNum = parseInt(month as string);
            const yearNum = parseInt(year as string);

            if (!isNaN(monthNum) && !isNaN(yearNum)) {
                const monthStart = new Date(yearNum, monthNum, 1);
                const monthEnd = new Date(yearNum, monthNum + 1, 0);

                const monthStartStr = monthStart.toISOString().split('T')[0] as string;
                const monthEndStr = monthEnd.toISOString().split('T')[0] as string;

                // Events that start before month ends AND end after month starts
                const dateCondition = and(
                    lte(academicEvents.startDate, monthEndStr),
                    gte(academicEvents.endDate, monthStartStr)
                );
                if (dateCondition) {
                    conditions.push(dateCondition);
                }
            }
        }

        // Filter by semester if provided
        if (semester) {
            const semesterNum = parseInt(semester as string);
            if (semesterNum === 1 || semesterNum === 2) {
                conditions.push(eq(academicEvents.semester, semesterNum as 1 | 2));
            }
        }

        // Filter by type if provided
        if (type) {
            conditions.push(eq(academicEvents.type, type as any));
        }

        // Fetch all academic events matching base conditions
        let allAcademicEvents = await db
            .select({
                academicEvent: academicEvents,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(academicEvents)
            .leftJoin(users, eq(academicEvents.createdBy, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        // Filter academic events based on targeting
        const filteredAcademicEvents = allAcademicEvents.filter(({ academicEvent }: any) => {
            // If no targeting specified, event is visible to everyone
            const hasTargeting =
                academicEvent.targetDepartments?.length ||
                academicEvent.targetYears?.length ||
                academicEvent.targetRoles?.length;

            if (!hasTargeting) {
                return true;
            }

            // Check role targeting
            if (academicEvent.targetRoles?.length && !academicEvent.targetRoles.includes(user!.role)) {
                return false;
            }

            // Check department targeting
            if (academicEvent.targetDepartments?.length && user!.departmentId) {
                if (!academicEvent.targetDepartments.includes(user!.departmentId)) {
                    return false;
                }
            }

            // Check academic year targeting
            if (academicEvent.targetYears?.length && user!.academicYearId) {
                if (!academicEvent.targetYears.includes(user!.academicYearId)) {
                    return false;
                }
            }

            return true;
        });

        // Format the response
        const formattedAcademicEvents = filteredAcademicEvents.map(({ academicEvent, createdByUser }: any) => ({
            ...academicEvent,
            createdByEmail: createdByUser?.email
        }));

        return res.status(200).json({
            success: true,
            data: formattedAcademicEvents,
            message: 'Academic events retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching academic events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch academic events'
        });
    }
};

/**
 * Get a single academic event by ID
 */
export const getAcademicEventById = async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Academic event ID is required'
            });
        }

        const user = req.user;

        // Fetch the academic event
        const result = await db
            .select({
                academicEvent: academicEvents,
                createdByUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(academicEvents)
            .leftJoin(users, eq(academicEvents.createdBy, users.id))
            .where(eq(academicEvents.id, id))
            .limit(1);

        if (!result.length || !result[0]) {
            return res.status(404).json({
                success: false,
                message: 'Academic event not found'
            });
        }

        const { academicEvent, createdByUser } = result[0] as any;

        // Check if user has access to this academic event
        const hasTargeting =
            academicEvent.targetDepartments?.length ||
            academicEvent.targetYears?.length ||
            academicEvent.targetRoles?.length;

        if (hasTargeting) {
            const hasAccess =
                (!academicEvent.targetRoles?.length || academicEvent.targetRoles.includes(user!.role)) &&
                (!academicEvent.targetDepartments?.length || !user!.departmentId || academicEvent.targetDepartments.includes(user!.departmentId)) &&
                (!academicEvent.targetYears?.length || !user!.academicYearId || academicEvent.targetYears.includes(user!.academicYearId));

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this academic event'
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                ...academicEvent,
                createdByEmail: createdByUser?.email
            },
            message: 'Academic event retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching academic event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch academic event'
        });
    }
};
