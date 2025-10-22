import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  boolean,
  integer,
  date,
  time,
  bigint,
  jsonb,
  unique,
  pgEnum,
  decimal,
  inet,
  check
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// =================== ENUMS ===================
export const userRoleEnum = pgEnum('user_role', ['STUDENT', 'FACULTY', 'HOD', 'DEAN', 'ADMIN']);
export const noticeTypeEnum = pgEnum('notice_type', ['urgent', 'important', 'general']);
export const noticeScopeEnum = pgEnum('notice_scope', ['GLOBAL', 'DEPARTMENT', 'YEAR']);
export const applicationStatusEnum = pgEnum('application_status', ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED']);
export const workflowLevelEnum = pgEnum('workflow_level', ['MENTOR', 'HOD', 'DEAN', 'COMPLETED']);
export const formStatusEnum = pgEnum('form_status', ['ACTIVE', 'INACTIVE', 'DRAFT']);
export const notificationTypeEnum = pgEnum('notification_type', ['NOTICE', 'FORM', 'APPLICATION', 'SYSTEM', 'ALERT', 'UPDATE']);
export const eventTypeEnum = pgEnum('event_type', ['LECTURE', 'LAB', 'EXAM', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'CULTURAL', 'GENERIC']);
export const academicEventTypeEnum = pgEnum('academic_event_type', ['SEMESTER_START', 'SEMESTER_END', 'EXAM_WEEK', 'HOLIDAY', 'REGISTRATION', 'ORIENTATION', 'BREAK', 'OTHER']);
export const slotTypeEnum = pgEnum('slot_type', ['Lecture', 'Lab', 'Seminar', 'Break', 'Other']);

// =================== USERS TABLE ===================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default('STUDENT'),
  department: varchar("department", { length: 100 }),
  year: varchar("year", { length: 20 }),
  enrollmentNumber: varchar("enrollment_number", { length: 50 }).unique(),
  employeeId: varchar("employee_id", { length: 50 }).unique(),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== DEPARTMENTS TABLE ===================
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar("name", { length: 200 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  hodId: uuid("hod_id").references(() => users.id, { onDelete: 'set null' }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== STUDENT PROFILES TABLE ===================
export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  // Academic Info
  section: varchar("section", { length: 10 }),
  semester: varchar("semester", { length: 10 }),
  cgpa: decimal("cgpa", { precision: 3, scale: 2 }),
  batch: varchar("batch", { length: 20 }),
  rollNumber: varchar("roll_number", { length: 50 }),
  specialization: varchar("specialization", { length: 200 }),
  // Personal Info
  dateOfBirth: date("date_of_birth"),
  bloodGroup: varchar("blood_group", { length: 5 }),
  altEmail: varchar("alt_email", { length: 255 }),
  address: text("address"),
  permanentAddress: text("permanent_address"),
  // Guardian Info
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianContact: varchar("guardian_contact", { length: 20 }),
  guardianEmail: varchar("guardian_email", { length: 255 }),
  guardianRelation: varchar("guardian_relation", { length: 50 }),
  guardianOccupation: varchar("guardian_occupation", { length: 200 }),
  // Academic Details
  previousEducation: varchar("previous_education", { length: 255 }),
  admissionYear: integer("admission_year"),
  mentorId: uuid("mentor_id").references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== NOTICES TABLE ===================
export const notices = pgTable("notices", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: noticeTypeEnum("type").notNull().default('general'),
  scope: noticeScopeEnum("scope").notNull().default('GLOBAL'),

  // Advanced targeting system with arrays
  targetYears: varchar("target_years", { length: 20 }).array(),
  targetDepartments: uuid("target_departments").array(),
  targetRoles: userRoleEnum("target_roles").array(),
  targetUsers: uuid("target_users").array(), // Specific users

  // Legacy single targets (for backward compatibility)
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: 'set null' }),
  targetYear: varchar("target_year", { length: 20 }),

  // Attachments and metadata
  fileUrl: text("file_url"),
  linkUrl: text("link_url"),
  priority: integer("priority").default(0),

  // Lifecycle
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== NOTICE READS TABLE ===================
export const noticeReads = pgTable("notice_reads", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  noticeId: uuid("notice_id").notNull().references(() => notices.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  unique: unique().on(table.noticeId, table.userId)
}));

// =================== APPLICATIONS TABLE ===================
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  submittedBy: uuid("submitted_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: 'set null' }),

  // Comprehensive workflow system
  // Mentor Level (Level 1)
  mentorId: uuid("mentor_id").references(() => users.id, { onDelete: 'set null' }),
  mentorReviewedAt: timestamp("mentor_reviewed_at", { withTimezone: true }),
  mentorApproved: boolean("mentor_approved"),
  mentorComments: text("mentor_comments"),

  // HOD Level (Level 2)  
  hodId: uuid("hod_id").references(() => users.id, { onDelete: 'set null' }),
  hodReviewedAt: timestamp("hod_reviewed_at", { withTimezone: true }),
  hodApproved: boolean("hod_approved"),
  hodComments: text("hod_comments"),

  // Dean Level (Level 3) - for escalations
  deanId: uuid("dean_id").references(() => users.id, { onDelete: 'set null' }),
  deanReviewedAt: timestamp("dean_reviewed_at", { withTimezone: true }),
  deanApproved: boolean("dean_approved"),
  deanComments: text("dean_comments"),
  escalationReason: text("escalation_reason"),

  // Overall workflow tracking
  currentLevel: workflowLevelEnum("current_level").default('MENTOR'),
  finalDecision: applicationStatusEnum("final_decision").default('PENDING'),

  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== APPLICATION FILES TABLE ===================
export const applicationFiles = pgTable("application_files", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow()
});

// =================== FORMS TABLE ===================
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Advanced targeting system
  targetYears: varchar("target_years", { length: 20 }).array(),
  targetDepartments: uuid("target_departments").array(),
  targetRoles: userRoleEnum("target_roles").array(),
  targetUsers: uuid("target_users").array(),

  // Legacy targeting
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: 'set null' }),

  status: formStatusEnum("status").notNull().default("ACTIVE"),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  maxSubmissions: integer("max_submissions"),
  formData: jsonb("form_data").notNull(),

  // Form settings
  allowMultipleSubmissions: boolean("allow_multiple_submissions").default(false),
  requiresApproval: boolean("requires_approval").default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== FORM SUBMISSIONS TABLE ===================
export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  submittedBy: uuid("submitted_by").notNull().references(() => users.id),
  submissionData: jsonb("submission_data").notNull(), // Store form responses as JSON
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  unique: unique().on(table.formId, table.submittedBy) // One submission per user per form
}));

// =================== SUBJECTS TABLE ===================
export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  departmentId: uuid("department_id").notNull().references(() => departments.id, { onDelete: 'cascade' }),
  semester: integer("semester").$type<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(),
  credits: integer("credits").notNull().default(3),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  semesterCheck: check("semester_check", sql`${table.semester} BETWEEN 1 AND 8`)
}));

// =================== ROOMS TABLE ===================
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull().default('CLASSROOM'),
  capacity: integer("capacity").notNull().default(50),
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: 'set null' }),
  floorNumber: integer("floor_number"),
  building: varchar("building", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== TIMETABLE SLOTS TABLE ===================
export const timetableSlots = pgTable("timetable_slots", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: 'set null' }),
  room: varchar("room", { length: 100 }).notNull(),
  facultyId: uuid("faculty_id").references(() => users.id, { onDelete: 'set null' }),
  dayOfWeek: varchar("day_of_week", { length: 10 }).notNull(),
  timeSlot: varchar("time_slot", { length: 20 }).notNull(),
  slotType: slotTypeEnum("slot_type").notNull().default('Lecture'),

  // Class/year specific schedules
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: 'set null' }),
  year: varchar("year", { length: 20 }),
  section: varchar("section", { length: 10 }),
  academicYear: varchar("academic_year", { length: 20 }).notNull().default('2024-25'),
  semester: integer("semester").$type<1 | 2>().default(1),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  semesterCheck: check("semester_check", sql`${table.semester} IN (1, 2)`)
}));

// =================== EVENTS TABLE ===================
export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: eventTypeEnum("type").notNull().default('GENERIC'),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  instructor: varchar("instructor", { length: 255 }),
  linkUrl: text("link_url"),

  // Advanced targeting
  targetYears: varchar("target_years", { length: 20 }).array(),
  targetDepartments: uuid("target_departments").array(),
  targetRoles: userRoleEnum("target_roles").array(),

  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== ACADEMIC EVENTS TABLE ===================
export const academicEvents = pgTable("academic_events", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: academicEventTypeEnum("type").notNull().default('OTHER'),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  semester: integer("semester").$type<1 | 2>(),

  // Targeting
  targetYears: varchar("target_years", { length: 20 }).array(),
  targetDepartments: uuid("target_departments").array(),
  targetRoles: userRoleEnum("target_roles").array(),

  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  semesterCheck: check("semester_check", sql`${table.semester} IN (1, 2)`)
}));

// =================== NOTIFICATION TEMPLATES TABLE ===================
export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  body: text("body").notNull(),
  data: jsonb("data"),

  // Source tracking
  sourceType: varchar("source_type", { length: 50 }), // 'notice', 'form', 'application', 'event', etc.
  sourceId: uuid("source_id"), // ID of the source record

  // Advanced targeting with arrays
  targetRoles: userRoleEnum("target_roles").array(),
  targetDepartments: uuid("target_departments").array(),
  targetYears: varchar("target_years", { length: 20 }).array(),
  targetUsers: uuid("target_users").array(), // Specific users

  // Metadata
  actionUrl: text("action_url"),
  priority: integer("priority").default(0),

  // Lifecycle
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// =================== USER NOTIFICATIONS TABLE ===================
export const userNotifications = pgTable("user_notifications", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  templateId: uuid("template_id").notNull().references(() => notificationTemplates.id, { onDelete: 'cascade' }),

  // User-specific interaction state
  readAt: timestamp("read_at", { withTimezone: true }),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  clickedAt: timestamp("clicked_at", { withTimezone: true }),

  // Delivery tracking
  deliveredAt: timestamp("delivered_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  unique: unique().on(table.userId, table.templateId)
}));

// =================== USER SESSIONS TABLE ===================
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  refreshToken: varchar("refresh_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).defaultNow(),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent")
});

// =================== RELATIONS ===================
export const usersRelations = relations(users, ({ many, one }) => ({
  // Profile relations
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId]
  }),

  // Content relations
  notices: many(notices),
  applications: many(applications),
  forms: many(forms),
  formSubmissions: many(formSubmissions),
  events: many(events),
  academicEvents: many(academicEvents),

  // Notification relations
  notificationTemplates: many(notificationTemplates),
  userNotifications: many(userNotifications),

  // System relations
  sessions: many(userSessions),
  noticeReads: many(noticeReads),

  // Department relations
  departmentAsHod: one(departments, {
    fields: [users.id],
    references: [departments.hodId]
  }),

  // Mentoring relations
  mentoredStudents: many(studentProfiles),

  // Timetable relations
  timetableSlots: many(timetableSlots)
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id]
  }),
  mentor: one(users, {
    fields: [studentProfiles.mentorId],
    references: [users.id]
  })
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  hod: one(users, {
    fields: [departments.hodId],
    references: [users.id]
  }),
  notices: many(notices),
  applications: many(applications),
  forms: many(forms),
  subjects: many(subjects),
  rooms: many(rooms),
  timetableSlots: many(timetableSlots)
}));

export const noticesRelations = relations(notices, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [notices.createdBy],
    references: [users.id]
  }),
  department: one(departments, {
    fields: [notices.departmentId],
    references: [departments.id]
  }),
  reads: many(noticeReads)
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [forms.createdBy],
    references: [users.id]
  }),
  department: one(departments, {
    fields: [forms.departmentId],
    references: [departments.id]
  }),
  submissions: many(formSubmissions)
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  submittedBy: one(users, {
    fields: [applications.submittedBy],
    references: [users.id]
  }),
  department: one(departments, {
    fields: [applications.departmentId],
    references: [departments.id]
  }),
  mentor: one(users, {
    fields: [applications.mentorId],
    references: [users.id]
  }),
  hod: one(users, {
    fields: [applications.hodId],
    references: [users.id]
  }),
  dean: one(users, {
    fields: [applications.deanId],
    references: [users.id]
  }),
  files: many(applicationFiles)
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id]
  }),
  timetableSlots: many(timetableSlots)
}));

export const timetableSlotsRelations = relations(timetableSlots, ({ one }) => ({
  subject: one(subjects, {
    fields: [timetableSlots.subjectId],
    references: [subjects.id]
  }),
  faculty: one(users, {
    fields: [timetableSlots.facultyId],
    references: [users.id]
  }),
  department: one(departments, {
    fields: [timetableSlots.departmentId],
    references: [departments.id]
  })
}));

export const eventsRelations = relations(events, ({ one }) => ({
  createdBy: one(users, {
    fields: [events.createdBy],
    references: [users.id]
  })
}));

export const academicEventsRelations = relations(academicEvents, ({ one }) => ({
  createdBy: one(users, {
    fields: [academicEvents.createdBy],
    references: [users.id]
  })
}));

export const notificationTemplatesRelations = relations(notificationTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [notificationTemplates.createdBy],
    references: [users.id]
  }),
  userNotifications: many(userNotifications)
}));

export const userNotificationsRelations = relations(userNotifications, ({ one }) => ({
  user: one(users, {
    fields: [userNotifications.userId],
    references: [users.id]
  }),
  template: one(notificationTemplates, {
    fields: [userNotifications.templateId],
    references: [notificationTemplates.id]
  })
}));

// =================== ZOD SCHEMAS ===================
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(2).max(255),
  phone: z.string().optional(),
}).pick({
  name: true,
  email: true,
  passwordHash: true,
  role: true,
  department: true,
  year: true,
  enrollmentNumber: true,
  employeeId: true,
  phone: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles, {
  cgpa: z.number().min(0).max(10).optional(),
  dateOfBirth: z.string().optional(),
  altEmail: z.string().email().optional(),
  guardianEmail: z.string().email().optional(),
}).pick({
  userId: true,
  section: true,
  semester: true,
  cgpa: true,
  batch: true,
  rollNumber: true,
  specialization: true,
  dateOfBirth: true,
  bloodGroup: true,
  altEmail: true,
  address: true,
  permanentAddress: true,
  guardianName: true,
  guardianContact: true,
  guardianEmail: true,
  guardianRelation: true,
  guardianOccupation: true,
  previousEducation: true,
  admissionYear: true,
  mentorId: true,
});

export const insertNoticeSchema = createInsertSchema(notices, {
  title: z.string().min(5).max(500),
  content: z.string().min(10),
}).pick({
  title: true,
  content: true,
  type: true,
  scope: true,
  targetYears: true,
  targetDepartments: true,
  targetRoles: true,
  targetUsers: true,
  departmentId: true,
  targetYear: true,
  fileUrl: true,
  linkUrl: true,
  priority: true,
  expiresAt: true,
});

export const insertFormSchema = createInsertSchema(forms, {
  title: z.string().min(5).max(500),
  description: z.string().min(10),
  deadline: z.string().datetime(),
}).pick({
  title: true,
  description: true,
  targetYears: true,
  targetDepartments: true,
  targetRoles: true,
  targetUsers: true,
  departmentId: true,
  deadline: true,
  maxSubmissions: true,
  formData: true,
  allowMultipleSubmissions: true,
  requiresApproval: true,
});

export const insertApplicationSchema = createInsertSchema(applications, {
  title: z.string().min(5).max(500),
  type: z.string().min(2).max(100),
  description: z.string().min(10),
}).pick({
  title: true,
  type: true,
  description: true,
  departmentId: true,
});

export const insertSubjectSchema = createInsertSchema(subjects, {
  name: z.string().min(2).max(255),
  code: z.string().min(2).max(20),
  semester: z.number().min(1).max(8),
  credits: z.number().min(1).max(10),
}).pick({
  name: true,
  code: true,
  departmentId: true,
  semester: true,
  credits: true,
});

export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(5).max(500),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().min(2).max(255),
}).pick({
  title: true,
  description: true,
  type: true,
  date: true,
  startTime: true,
  endTime: true,
  location: true,
  instructor: true,
  linkUrl: true,
  targetYears: true,
  targetDepartments: true,
  targetRoles: true,
});

export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates, {
  title: z.string().min(1).max(500),
  body: z.string().min(1),
}).pick({
  type: true,
  title: true,
  body: true,
  data: true,
  sourceType: true,
  sourceId: true,
  targetRoles: true,
  targetDepartments: true,
  targetYears: true,
  targetUsers: true,
  actionUrl: true,
  priority: true,
  expiresAt: true,
});

// =================== TYPE EXPORTS ===================
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;

export type NoticeRead = typeof noticeReads.$inferSelect;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type AcademicEvent = typeof academicEvents.$inferSelect;
export type UserNotification = typeof userNotifications.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type ApplicationFile = typeof applicationFiles.$inferSelect;

// =================== ENUMS FOR FRONTEND ===================
export const UserRole = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  HOD: "HOD",
  DEAN: "DEAN",
  ADMIN: "ADMIN"
} as const;

export const NoticeType = {
  URGENT: "urgent",
  IMPORTANT: "important",
  GENERAL: "general"
} as const;

export const NoticeScope = {
  GLOBAL: "GLOBAL",
  DEPARTMENT: "DEPARTMENT",
  YEAR: "YEAR"
} as const;

export const ApplicationStatus = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ESCALATED: "ESCALATED"
} as const;

export const WorkflowLevel = {
  MENTOR: "MENTOR",
  HOD: "HOD",
  DEAN: "DEAN",
  COMPLETED: "COMPLETED"
} as const;

export const FormStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DRAFT: "DRAFT"
} as const;

export const NotificationType = {
  NOTICE: "NOTICE",
  FORM: "FORM",
  APPLICATION: "APPLICATION",
  SYSTEM: "SYSTEM",
  ALERT: "ALERT",
  UPDATE: "UPDATE"
} as const;

export const EventType = {
  LECTURE: "LECTURE",
  LAB: "LAB",
  EXAM: "EXAM",
  SEMINAR: "SEMINAR",
  WORKSHOP: "WORKSHOP",
  SPORTS: "SPORTS",
  CULTURAL: "CULTURAL",
  GENERIC: "GENERIC"
} as const;

export const AcademicEventType = {
  SEMESTER_START: "SEMESTER_START",
  SEMESTER_END: "SEMESTER_END",
  EXAM_WEEK: "EXAM_WEEK",
  HOLIDAY: "HOLIDAY",
  REGISTRATION: "REGISTRATION",
  ORIENTATION: "ORIENTATION",
  BREAK: "BREAK",
  OTHER: "OTHER"
} as const;

export const SlotType = {
  LECTURE: "Lecture",
  LAB: "Lab",
  SEMINAR: "Seminar",
  BREAK: "Break",
  OTHER: "Other"
} as const;
