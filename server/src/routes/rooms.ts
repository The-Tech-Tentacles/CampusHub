import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { rooms } from '../schema/index.js';
import { eq, or, ilike } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/rooms
 * Get all active rooms with optional search
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const { search } = req.query;

        // Build query with search filter if provided
        let roomsList;
        if (search && typeof search === 'string') {
            const searchPattern = `%${search}%`;
            roomsList = await db
                .select({
                    id: rooms.id,
                    name: rooms.name,
                    code: rooms.code,
                    type: rooms.type,
                    capacity: rooms.capacity,
                    floorNumber: rooms.floorNumber,
                    building: rooms.building,
                })
                .from(rooms)
                .where(
                    or(
                        ilike(rooms.name, searchPattern),
                        ilike(rooms.code, searchPattern),
                        ilike(rooms.building, searchPattern)
                    )
                );
        } else {
            roomsList = await db
                .select({
                    id: rooms.id,
                    name: rooms.name,
                    code: rooms.code,
                    type: rooms.type,
                    capacity: rooms.capacity,
                    floorNumber: rooms.floorNumber,
                    building: rooms.building,
                })
                .from(rooms)
                .where(eq(rooms.isActive, true));
        }

        res.json({
            success: true,
            data: roomsList
        });

    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms'
        });
    }
});

/**
 * GET /api/rooms/:id
 * Get room by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { db } = getDatabase();
        const roomId = req.params.id;

        if (!roomId) {
            res.status(400).json({
                success: false,
                message: 'Room ID is required'
            });
            return;
        }

        const [room] = await db
            .select()
            .from(rooms)
            .where(eq(rooms.id, roomId))
            .limit(1);

        if (!room) {
            res.status(404).json({
                success: false,
                message: 'Room not found'
            });
            return;
        }

        res.json({
            success: true,
            data: room
        });

    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch room'
        });
    }
});

export default router;
