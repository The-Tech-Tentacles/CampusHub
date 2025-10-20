import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { UserRole, NoticeType, NoticeScope, ApplicationStatus } from '../../../shared/schema';

// Multer file interface
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

// Extend Express Request type to include multer file properties
declare global {
    namespace Express {
        interface Request {
            file?: MulterFile;
            files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
        }
    }
}

// Generic validation error handler
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array().map(error => ({
                field: error.type === 'field' ? (error as any).path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? (error as any).value : undefined
            }))
        });
        return;
    }

    next();
};

// User validation rules
export const validateUserRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('firstName')
        .notEmpty()
        .trim()
        .isLength({ max: 100 })
        .withMessage('First name is required and must be less than 100 characters'),
    body('lastName')
        .notEmpty()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Last name is required and must be less than 100 characters'),
    body('role')
        .isIn(Object.values(UserRole))
        .withMessage('Valid role is required'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
    body('studentId')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Student ID must be less than 20 characters'),
    body('employeeId')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Employee ID must be less than 20 characters'),
    handleValidationErrors
];

export const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

export const validateUserUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('First name must be less than 100 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Last name must be less than 100 characters'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
    body('phone')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Valid phone number is required'),
    handleValidationErrors
];

export const validatePasswordUpdate = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    handleValidationErrors
];

// Notice validation rules
export const validateNoticeCreation = [
    body('title')
        .notEmpty()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    body('content')
        .notEmpty()
        .trim()
        .withMessage('Content is required'),
    body('type')
        .isIn(Object.values(NoticeType))
        .withMessage('Valid notice type is required'),
    body('scope')
        .isIn(Object.values(NoticeScope))
        .withMessage('Valid notice scope is required'),
    body('targetDepartments')
        .optional()
        .isArray()
        .withMessage('Target departments must be an array'),
    body('targetRoles')
        .optional()
        .isArray()
        .withMessage('Target roles must be an array'),
    body('expiresAt')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Valid expiration date is required'),
    body('isPinned')
        .optional()
        .isBoolean()
        .withMessage('isPinned must be a boolean'),
    handleValidationErrors
];

export const validateNoticeUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),
    body('content')
        .optional()
        .trim()
        .withMessage('Content cannot be empty if provided'),
    body('type')
        .optional()
        .isIn(Object.values(NoticeType))
        .withMessage('Valid notice type is required'),
    body('scope')
        .optional()
        .isIn(Object.values(NoticeScope))
        .withMessage('Valid notice scope is required'),
    body('targetDepartments')
        .optional()
        .isArray()
        .withMessage('Target departments must be an array'),
    body('targetRoles')
        .optional()
        .isArray()
        .withMessage('Target roles must be an array'),
    body('expiresAt')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Valid expiration date is required'),
    body('isPinned')
        .optional()
        .isBoolean()
        .withMessage('isPinned must be a boolean'),
    handleValidationErrors
];

// Application validation rules
export const validateApplicationCreation = [
    body('formId')
        .notEmpty()
        .trim()
        .withMessage('Form ID is required'),
    body('formData')
        .notEmpty()
        .isObject()
        .withMessage('Form data is required and must be an object'),
    handleValidationErrors
];

export const validateApplicationUpdate = [
    body('status')
        .optional()
        .isIn(Object.values(ApplicationStatus))
        .withMessage('Valid application status is required'),
    body('reviewerNotes')
        .optional()
        .trim()
        .withMessage('Reviewer notes cannot be empty if provided'),
    handleValidationErrors
];

// Form validation rules
export const validateFormCreation = [
    body('title')
        .notEmpty()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    body('description')
        .optional()
        .trim()
        .withMessage('Description cannot be empty if provided'),
    body('fields')
        .notEmpty()
        .isArray()
        .withMessage('Fields are required and must be an array'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
    body('allowedRoles')
        .optional()
        .isArray()
        .withMessage('Allowed roles must be an array'),
    handleValidationErrors
];

export const validateFormUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),
    body('description')
        .optional()
        .trim()
        .withMessage('Description cannot be empty if provided'),
    body('fields')
        .optional()
        .isArray()
        .withMessage('Fields must be an array'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
    body('allowedRoles')
        .optional()
        .isArray()
        .withMessage('Allowed roles must be an array'),
    handleValidationErrors
];

// Schedule validation rules
export const validateScheduleCreation = [
    body('title')
        .notEmpty()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    body('description')
        .optional()
        .trim()
        .withMessage('Description cannot be empty if provided'),
    body('startTime')
        .notEmpty()
        .isISO8601()
        .toDate()
        .withMessage('Valid start time is required'),
    body('endTime')
        .notEmpty()
        .isISO8601()
        .toDate()
        .withMessage('Valid end time is required'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Location must be less than 200 characters'),
    body('type')
        .notEmpty()
        .trim()
        .withMessage('Schedule type is required'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
    body('isRecurring')
        .optional()
        .isBoolean()
        .withMessage('isRecurring must be a boolean'),
    handleValidationErrors
];

// File upload validation
export const validateFileUpload = (allowedTypes: string[], maxSize: number = 10 * 1024 * 1024) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.file) {
            next();
            return;
        }

        // Check file size
        if (req.file.size > maxSize) {
            res.status(400).json({
                error: 'File too large',
                code: 'FILE_TOO_LARGE',
                maxSize: maxSize,
                actualSize: req.file.size
            });
            return;
        }

        // Check file type
        const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
            res.status(400).json({
                error: 'Invalid file type',
                code: 'INVALID_FILE_TYPE',
                allowedTypes: allowedTypes,
                actualType: fileExtension
            });
            return;
        }

        next();
    };
};

// Generic ID validation
export const validateId = (paramName: string = 'id') => [
    body(paramName)
        .optional()
        .isUUID()
        .withMessage(`${paramName} must be a valid UUID`),
    handleValidationErrors
];

// Pagination validation
export const validatePagination = [
    body('page')
        .optional()
        .isInt({ min: 1 })
        .toInt()
        .withMessage('Page must be a positive integer'),
    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .toInt()
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

// Search validation
export const validateSearch = [
    body('query')
        .optional()
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Search query must be between 1 and 500 characters'),
    handleValidationErrors
];