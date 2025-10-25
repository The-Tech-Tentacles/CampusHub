import { Router } from 'express';
import { getDatabase } from '../config/database.js';
import { departments } from '../schema/complete.js';
import { asc, eq } from 'drizzle-orm';

const router = Router();

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { db } = getDatabase();

        const allDepartments = await db
            .select({
                id: departments.id,
                name: departments.name,
                code: departments.code,
                description: departments.description,
                isActive: departments.isActive
            })
            .from(departments)
            .where(eq(departments.isActive, true))
            .orderBy(asc(departments.name));

        res.json({
            success: true,
            message: 'Departments retrieved successfully',
            data: allDepartments
        });

    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching departments',
            code: 'DEPARTMENTS_FETCH_ERROR'
        });
    }
});

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { db } = getDatabase();
        const { id } = req.params;

        const [department] = await db
            .select()
            .from(departments)
            .where(eq(departments.id, id))
            .limit(1);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found',
                code: 'DEPARTMENT_NOT_FOUND'
            });
        }

        return res.json({
            success: true,
            message: 'Department retrieved successfully',
            data: department
        });

    } catch (error) {
        console.error('Get department error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching department',
            code: 'DEPARTMENT_FETCH_ERROR'
        });
    }
});

export default router;