import { Router } from 'express';
import { getDatabase } from '../config/database.js';
import { academicYears } from '../schema/complete.js';
import { asc, eq } from 'drizzle-orm';

const router = Router();

/**
 * @route   GET /api/academic-years
 * @desc    Get all academic years
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { db } = getDatabase();

        const allAcademicYears = await db
            .select({
                id: academicYears.id,
                name: academicYears.name,
                code: academicYears.code,
                level: academicYears.level,
                sequenceOrder: academicYears.sequenceOrder
            })
            .from(academicYears)
            .orderBy(asc(academicYears.sequenceOrder));

        res.json({
            success: true,
            message: 'Academic years retrieved successfully',
            data: allAcademicYears
        });

    } catch (error) {
        console.error('Get academic years error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching academic years',
            code: 'ACADEMIC_YEARS_FETCH_ERROR'
        });
    }
});

/**
 * @route   GET /api/academic-years/:id
 * @desc    Get academic year by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { db } = getDatabase();
        const { id } = req.params;

        const [academicYear] = await db
            .select()
            .from(academicYears)
            .where(eq(academicYears.id, id))
            .limit(1);

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found',
                code: 'ACADEMIC_YEAR_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            message: 'Academic year retrieved successfully',
            data: academicYear
        });

    } catch (error) {
        console.error('Get academic year error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching academic year',
            code: 'ACADEMIC_YEAR_FETCH_ERROR'
        });
    }
});

export default router;