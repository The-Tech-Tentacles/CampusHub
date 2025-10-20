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
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// =================== USERS TABLE ===================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // STUDENT, FACULTY, HOD, DEAN, ADMIN
  department: varchar("department", { length: 100 }),
  year: varchar("year", { length: 20 }), // For students: "B. Tech", "M. Tech", etc.
  enrollmentNumber: varchar("enrollment_number", { length: 50 }).unique(),
  employeeId: varchar("employee_id", { length: 50 }).unique(),
  joiningDate: date("joining_date"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== DEPARTMENTS TABLE ===================
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  description: text("description"),
  hodId: uuid("hod_id").references(() => users.id),
  establishedYear: integer("established_year"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== NOTICES TABLE ===================
export const notices = pgTable("notices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(), // urgent, important, general
  scope: varchar("scope", { length: 20 }).notNull(), // GLOBAL, DEPARTMENT, YEAR, CLASS
  departmentId: uuid("department_id").references(() => departments.id),
  targetYear: varchar("target_year", { length: 20 }),
  targetClass: varchar("target_class", { length: 50 }),
  fileUrl: text("file_url"), // Optional file attachment
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// =================== NOTICE READS TABLE ===================
export const noticeReads = pgTable("notice_reads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  noticeId: uuid("notice_id").notNull().references(() => notices.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true }).defaultNow()
}, (table) => ({
  unique: unique().on(table.noticeId, table.userId)
}));

// =================== APPLICATIONS TABLE ===================
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  submittedBy: uuid("submitted_by").notNull().references(() => users.id),
  departmentId: uuid("department_id").references(() => departments.id),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, UNDER_REVIEW

  // Approval workflow
  mentorTeacherId: uuid("mentor_teacher_id").references(() => users.id),
  mentorApprovedAt: timestamp("mentor_approved_at", { withTimezone: true }),
  mentorComments: text("mentor_comments"),

  hodId: uuid("hod_id").references(() => users.id),
  hodApprovedAt: timestamp("hod_approved_at", { withTimezone: true }),
  hodComments: text("hod_comments"),

  // Rejection details
  rejectedBy: varchar("rejected_by", { length: 10 }), // MENTOR, HOD
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),

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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  departmentId: uuid("department_id").references(() => departments.id),
  status: varchar("status", { length: 20 }).notNull().default("ACTIVE"), // ACTIVE, INACTIVE, DRAFT
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  maxSubmissions: integer("max_submissions"),
  formData: jsonb("form_data").notNull(), // Store form structure as JSON
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

// =================== NOTIFICATIONS TABLE ===================
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // NOTICE, FORM, APPLICATION, SYSTEM, ALERT
  title: varchar("title", { length: 500 }).notNull(),
  body: text("body").notNull(),
  data: jsonb("data"), // Additional notification data
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// =================== USER SESSIONS TABLE ===================
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  refreshToken: varchar("refresh_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent")
});

// =================== RELATIONS ===================
export const usersRelations = relations(users, ({ many, one }) => ({
  notices: many(notices),
  applications: many(applications),
  forms: many(forms),
  formSubmissions: many(formSubmissions),
  notifications: many(notifications),
  sessions: many(userSessions),
  noticeReads: many(noticeReads),
  departmentAsHod: one(departments, {
    fields: [users.id],
    references: [departments.hodId]
  })
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  hod: one(users, {
    fields: [departments.hodId],
    references: [users.id]
  }),
  notices: many(notices),
  applications: many(applications),
  forms: many(forms)
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

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  submittedBy: one(users, {
    fields: [applications.submittedBy],
    references: [users.id]
  }),
  department: one(departments, {
    fields: [applications.departmentId],
    references: [departments.id]
  }),
  mentorTeacher: one(users, {
    fields: [applications.mentorTeacherId],
    references: [users.id]
  }),
  hod: one(users, {
    fields: [applications.hodId],
    references: [users.id]
  }),
  files: many(applicationFiles)
}));

// =================== ZOD SCHEMAS ===================
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  role: z.enum(["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"]),
  name: z.string().min(2).max(255),
}).pick({
  name: true,
  email: true,
  passwordHash: true,
  role: true,
  department: true,
  year: true,
  enrollmentNumber: true,
  employeeId: true,
  joiningDate: true,
});

export const insertNoticeSchema = createInsertSchema(notices, {
  title: z.string().min(5).max(500),
  content: z.string().min(10),
  type: z.enum(["urgent", "important", "general"]),
  scope: z.enum(["GLOBAL", "DEPARTMENT", "YEAR", "CLASS"]),
}).pick({
  title: true,
  content: true,
  type: true,
  scope: true,
  departmentId: true,
  targetYear: true,
  targetClass: true,
  fileUrl: true,
  expiresAt: true,
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

export const insertNotificationSchema = createInsertSchema(notifications, {
  type: z.enum(["NOTICE", "FORM", "APPLICATION", "SYSTEM", "ALERT"]),
  title: z.string().min(1).max(500),
  body: z.string().min(1),
}).pick({
  userId: true,
  type: true,
  title: true,
  body: true,
  data: true,
});

// =================== TYPE EXPORTS ===================
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type NoticeRead = typeof noticeReads.$inferSelect;
export type Form = typeof forms.$inferSelect;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type Department = typeof departments.$inferSelect;

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
  YEAR: "YEAR",
  CLASS: "CLASS"
} as const;

export const ApplicationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  UNDER_REVIEW: "UNDER_REVIEW"
} as const;

export const NotificationType = {
  NOTICE: "NOTICE",
  FORM: "FORM",
  APPLICATION: "APPLICATION",
  SYSTEM: "SYSTEM",
  ALERT: "ALERT"
} as const;
