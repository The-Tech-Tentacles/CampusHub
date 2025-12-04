import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    date,
    decimal,
    jsonb,
    integer,
    time,
    unique,
    index
} from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

// All enums in one place
export const userRoleEnum = pgEnum('user_role', ['STUDENT', 'FACULTY', 'HOD', 'DEAN', 'ADMIN']);
export const noticeTypeEnum = pgEnum('notice_type', ['urgent', 'important', 'general']);
export const noticeScopeEnum = pgEnum('notice_scope', ['GLOBAL', 'DEPARTMENT', 'YEAR']);
export const applicationStatusEnum = pgEnum('application_status', ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED']);
export const workflowLevelEnum = pgEnum('workflow_level', ['MENTOR', 'HOD', 'DEAN', 'COMPLETED']);
export const formStatusEnum = pgEnum('form_status', ['ACTIVE', 'INACTIVE', 'DRAFT']);
export const notificationTypeEnum = pgEnum('notification_type', ['NOTICE', 'FORM', 'APPLICATION', 'SYSTEM', 'ALERT', 'UPDATE']);
export const academicLevelEnum = pgEnum('academic_level', ['UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA', 'CERTIFICATE']);
export const eventTypeEnum = pgEnum('event_type', ['LECTURE', 'LAB', 'EXAM', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'CULTURAL', 'GENERIC']);
export const academicEventTypeEnum = pgEnum('academic_event_type', ['SEMESTER_START', 'SEMESTER_END', 'EXAM_WEEK', 'HOLIDAY', 'REGISTRATION', 'ORIENTATION', 'BREAK', 'OTHER']);
export const slotTypeEnum = pgEnum('slot_type', ['Lecture', 'Lab', 'Seminar', 'Break', 'Other']);
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);

// =================== CORE TABLES ===================

// Academic Years table (standardized year structure)
export const academicYears = pgTable('academic_years', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    level: academicLevelEnum('level').notNull(),
    sequenceOrder: integer('sequence_order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    codeIdx: index('idx_academic_years_code').on(table.code),
    levelIdx: index('idx_academic_years_level').on(table.level),
    orderIdx: index('idx_academic_years_order').on(table.sequenceOrder),
}));

// Departments table (moved before users to avoid circular reference)
export const departments = pgTable('departments', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull().unique(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    hodId: uuid('hod_id'), // Will be updated after users table is defined
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    codeIdx: index('idx_departments_code').on(table.code),
    hodIdx: index('idx_departments_hod').on(table.hodId),
}));

// Users table (core authentication and basic info)
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('STUDENT'),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    academicYearId: uuid('academic_year_id').references(() => academicYears.id, { onDelete: 'set null' }),
    enrollmentNumber: varchar('enrollment_number', { length: 50 }).unique(),
    employeeId: varchar('employee_id', { length: 50 }).unique(),
    phone: varchar('phone', { length: 20 }),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    // Indexes for users table
    emailIdx: index('idx_users_email').on(table.email),
    enrollmentIdx: index('idx_users_enrollment').on(table.enrollmentNumber),
    roleIdx: index('idx_users_role').on(table.role),
    departmentIdx: index('idx_users_department_id').on(table.departmentId),
    academicYearIdx: index('idx_users_academic_year_id').on(table.academicYearId),
    deptYearIdx: index('idx_users_dept_year').on(table.departmentId, table.academicYearId),
}));

// Profiles table (detailed information for all user types)
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

    // Personal Info (All users)
    prefix: varchar('prefix', { length: 10 }), // Dr., Prof., Mr., Ms., etc.
    dateOfBirth: date('date_of_birth'),
    gender: genderEnum('gender'),
    bloodGroup: varchar('blood_group', { length: 5 }),
    altEmail: varchar('alt_email', { length: 255 }),
    address: text('address'),
    permanentAddress: text('permanent_address'),
    bio: text('bio'),

    // Academic Info (Students)
    section: varchar('section', { length: 10 }),
    semester: varchar('semester', { length: 10 }),
    cgpa: decimal('cgpa', { precision: 3, scale: 2 }),
    batch: varchar('batch', { length: 20 }),
    rollNumber: varchar('roll_number', { length: 50 }),
    specialization: varchar('specialization', { length: 200 }),
    admissionDate: date('admission_date'),
    expectedGraduation: date('expected_graduation'),
    previousEducation: varchar('previous_education', { length: 255 }),

    // Faculty/Staff Info
    cabinLocationId: uuid('cabin_location_id').references(() => rooms.id, { onDelete: 'set null' }),
    officeHours: varchar('office_hours', { length: 200 }),
    researchInterests: text('research_interests').array(),
    qualifications: text('qualifications').array(),
    experienceYears: integer('experience_years'),

    // Guardian Info (Students)
    guardianName: varchar('guardian_name', { length: 255 }),
    guardianContact: varchar('guardian_contact', { length: 20 }),
    guardianEmail: varchar('guardian_email', { length: 255 }),
    guardianRelation: varchar('guardian_relation', { length: 50 }),
    guardianOccupation: varchar('guardian_occupation', { length: 200 }),

    // Mentor Info (Students)
    mentorId: uuid('mentor_id').references(() => users.id, { onDelete: 'set null' }),

    // Social Links (JSON)
    socialLinks: jsonb('social_links').default('{}'),

    // Skills and Interests (All users)
    skills: text('skills').array(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdx: index('idx_profiles_user').on(table.userId),
    mentorIdx: index('idx_profiles_mentor').on(table.mentorId),
    cabinLocationIdx: index('idx_profiles_cabin_location').on(table.cabinLocationId),
}));

// =================== ACADEMIC TABLES ===================

// Subjects/Courses table
export const subjects = pgTable('subjects', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    departmentId: uuid('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
    semester: integer('semester'), // CHECK constraint: semester BETWEEN 1 AND 8
    credits: integer('credits').notNull().default(3),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    codeIdx: index('idx_subjects_code').on(table.code),
    departmentIdx: index('idx_subjects_department').on(table.departmentId),
}));

// Rooms table
export const rooms = pgTable('rooms', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull().default('CLASSROOM'),
    capacity: integer('capacity').notNull().default(50),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    floorNumber: integer('floor_number'),
    building: varchar('building', { length: 100 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    codeIdx: index('idx_rooms_code').on(table.code),
    departmentIdx: index('idx_rooms_department').on(table.departmentId),
}));

// Timetable slots table
export const timetableSlots = pgTable('timetable_slots', {
    id: uuid('id').primaryKey().defaultRandom(),
    subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
    roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'restrict' }),
    facultyId: uuid('faculty_id').references(() => users.id, { onDelete: 'set null' }),
    dayOfWeek: varchar('day_of_week', { length: 10 }).notNull(),
    timeSlot: varchar('time_slot', { length: 20 }).notNull(),
    slotType: slotTypeEnum('slot_type').notNull().default('Lecture'),

    // For class/year specific schedules
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    academicYearId: uuid('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'restrict' }),
    section: varchar('section', { length: 10 }),
    batch: varchar('batch', { length: 20 }), // Batch number (1, 2, 3, 4, etc.) 
    semester: integer('semester').default(1), // CHECK constraint: semester IN (1, 2)

    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    dayTimeIdx: index('idx_timetable_day_time').on(table.dayOfWeek, table.timeSlot),
    subjectIdx: index('idx_timetable_subject').on(table.subjectId),
    facultyIdx: index('idx_timetable_faculty').on(table.facultyId),
    roomIdx: index('idx_timetable_room').on(table.roomId),
    departmentAcademicYearIdx: index('idx_timetable_department_academic_year').on(table.departmentId, table.academicYearId),
    batchIdx: index('idx_timetable_batch').on(table.batch),
    sectionBatchIdx: index('idx_timetable_section_batch').on(table.section, table.batch),
    academicYearIdx: index('idx_timetable_academic_year').on(table.academicYearId),
}));

// Events table (campus events)
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    type: eventTypeEnum('type').notNull().default('GENERIC'),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    instructor: varchar('instructor', { length: 255 }),
    linkUrl: text('link_url'),

    // Targeting options for event visibility
    targetYears: varchar('target_years', { length: 20 }).array(),
    targetDepartments: uuid('target_departments').array(),
    targetRoles: userRoleEnum('target_roles').array(),

    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    dateIdx: index('idx_events_date').on(table.date),
    typeIdx: index('idx_events_type').on(table.type),
    // Note: GIN indexes for arrays will be in raw SQL
}));

// Academic events table (semester dates, holidays, etc.)
export const academicEvents = pgTable('academic_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    type: academicEventTypeEnum('type').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isHoliday: boolean('is_holiday').default(false),
    linkUrl: text('link_url'),

    // Targeting options for academic event visibility
    targetYears: varchar('target_years', { length: 20 }).array(),
    targetDepartments: uuid('target_departments').array(),
    targetRoles: userRoleEnum('target_roles').array(),

    academicYear: integer('academic_year').notNull().default(2024),
    semester: integer('semester'), // CHECK constraint: semester IN (1, 2)
    canEdit: boolean('can_edit').default(false),

    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    datesIdx: index('idx_academic_events_dates').on(table.startDate, table.endDate),
    typeIdx: index('idx_academic_events_type').on(table.type),
    yearIdx: index('idx_academic_events_year').on(table.academicYear, table.semester),
}));

// =================== APPLICATION TABLES ===================

// Notices table
export const notices = pgTable('notices', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    content: text('content').notNull(),
    type: noticeTypeEnum('type').notNull().default('general'),
    scope: noticeScopeEnum('scope').notNull().default('GLOBAL'),

    // Targeting options for specific notice delivery
    targetYears: varchar('target_years', { length: 20 }).array(),
    targetDepartments: uuid('target_departments').array(),
    targetRoles: userRoleEnum('target_roles').array(),

    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    attachmentUrl: text('attachment_url'),

    isActive: boolean('is_active').default(true),
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    typeIdx: index('idx_notices_type').on(table.type),
    scopeIdx: index('idx_notices_scope').on(table.scope),
    createdByIdx: index('idx_notices_created_by').on(table.createdBy),
    publishedAtIdx: index('idx_notices_published_at').on(table.publishedAt),
    activeIdx: index('idx_notices_active').on(table.isActive),
}));

// Notice reads tracking
export const noticeReads = pgTable('notice_reads', {
    id: uuid('id').primaryKey().defaultRandom(),
    noticeId: uuid('notice_id').notNull().references(() => notices.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    unq: unique().on(table.noticeId, table.userId),
    noticeIdx: index('idx_notice_reads_notice').on(table.noticeId),
    userIdx: index('idx_notice_reads_user').on(table.userId),
}));

// Forms table
export const forms = pgTable('forms', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description').notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Targeting options for form availability
    targetYears: varchar('target_years', { length: 20 }).array(),
    targetDepartments: uuid('target_departments').array(),
    targetRoles: userRoleEnum('target_roles').array(),

    // Optional department association
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),

    // Form configuration
    maxSubmissions: integer('max_submissions'),
    allowMultipleSubmissions: boolean('allow_multiple_submissions').default(false),
    requiresApproval: boolean('requires_approval').default(false),

    status: formStatusEnum('status').notNull().default('DRAFT'),
    deadline: timestamp('deadline', { withTimezone: true }).notNull(),
    formData: jsonb('form_data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    createdByIdx: index('idx_forms_created_by').on(table.createdBy),
    statusIdx: index('idx_forms_status').on(table.status),
    deadlineIdx: index('idx_forms_deadline').on(table.deadline),
    departmentIdx: index('idx_forms_department').on(table.departmentId),
}));

// Applications table - THE MISSING ONE!
export const applications = pgTable('applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    description: text('description').notNull(),
    submittedBy: uuid('submitted_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    status: applicationStatusEnum('status').notNull().default('PENDING'),

    // File attachment
    proofFileUrl: text('proof_file_url'),

    // Multi-level approval workflow (Mentor → HOD → DEAN)
    mentorId: uuid('mentor_id').references(() => users.id, { onDelete: 'set null' }),
    mentorStatus: applicationStatusEnum('mentor_status').default('PENDING'),
    mentorNotes: text('mentor_notes'),
    mentorReviewedAt: timestamp('mentor_reviewed_at', { withTimezone: true }),

    hodId: uuid('hod_id').references(() => users.id, { onDelete: 'set null' }),
    hodStatus: applicationStatusEnum('hod_status').default('PENDING'),
    hodNotes: text('hod_notes'),
    hodReviewedAt: timestamp('hod_reviewed_at', { withTimezone: true }),

    // DEAN level (only if HOD escalates)
    requiresDeanApproval: boolean('requires_dean_approval').default(false),
    deanId: uuid('dean_id').references(() => users.id, { onDelete: 'set null' }),
    deanStatus: applicationStatusEnum('dean_status').default('PENDING'),
    deanNotes: text('dean_notes'),
    deanReviewedAt: timestamp('dean_reviewed_at', { withTimezone: true }),
    escalationReason: text('escalation_reason'),

    // Overall workflow tracking
    currentLevel: workflowLevelEnum('current_level').default('MENTOR'),
    finalDecision: applicationStatusEnum('final_decision').default('PENDING'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    submittedByIdx: index('idx_applications_submitted_by').on(table.submittedBy),
    statusIdx: index('idx_applications_status').on(table.status),
    typeIdx: index('idx_applications_type').on(table.type),
    departmentIdx: index('idx_applications_department').on(table.departmentId),
}));

// Form submissions table
export const formSubmissions = pgTable('form_submissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
    submittedBy: uuid('submitted_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    submissionData: jsonb('submission_data').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    unq: unique().on(table.formId, table.submittedBy),
    formIdx: index('idx_form_submissions_form').on(table.formId),
    userIdx: index('idx_form_submissions_user').on(table.submittedBy),
}));

// Notification templates
export const notificationTemplates = pgTable('notification_templates', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull(),
    body: text('body').notNull(),
    type: notificationTypeEnum('type').notNull().default('SYSTEM'),

    // Reference to source entity
    sourceType: varchar('source_type', { length: 50 }),
    sourceId: uuid('source_id'),

    // Targeting options
    targetUsers: uuid('target_users').array(),
    targetRoles: userRoleEnum('target_roles').array(),
    targetDepartments: uuid('target_departments').array(),
    targetYears: varchar('target_years', { length: 20 }).array(),

    // Notification content and behavior
    data: jsonb('data').default('{}'),
    actionUrl: text('action_url'),
    priority: integer('priority').default(0),

    // Lifecycle management
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    typeIdx: index('idx_notification_templates_type').on(table.type),
    sourceIdx: index('idx_notification_templates_source').on(table.sourceType, table.sourceId),
    createdIdx: index('idx_notification_templates_created').on(table.createdAt),
    expiresIdx: index('idx_notification_templates_expires').on(table.expiresAt),
    priorityIdx: index('idx_notification_templates_priority').on(table.priority),
}));

// User notification status
export const userNotifications = pgTable('user_notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id').notNull().references(() => notificationTemplates.id, { onDelete: 'cascade' }),

    // User-specific interaction state
    readAt: timestamp('read_at', { withTimezone: true }),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
    clickedAt: timestamp('clicked_at', { withTimezone: true }),

    // Delivery tracking
    deliveredAt: timestamp('delivered_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    unq: unique().on(table.userId, table.templateId),
    userIdx: index('idx_user_notifications_user').on(table.userId),
    templateIdx: index('idx_user_notifications_template').on(table.templateId),
    deliveredIdx: index('idx_user_notifications_delivered').on(table.deliveredAt),
}));

// User sessions table (for authentication)
export const userSessions = pgTable('user_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
    refreshToken: varchar('refresh_token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }).defaultNow(),
    ipAddress: varchar('ip_address', { length: 45 }), // IPv6 max length
    userAgent: text('user_agent'),
}, (table) => ({
    userIdx: index('idx_sessions_user').on(table.userId),
    tokenIdx: index('idx_sessions_token').on(table.sessionToken),
    expiresIdx: index('idx_sessions_expires').on(table.expiresAt),
}));