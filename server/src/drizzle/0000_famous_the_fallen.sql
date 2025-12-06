DO $$ BEGIN CREATE TYPE "academic_event_type" AS ENUM(
	'SEMESTER_START',
	'SEMESTER_END',
	'EXAM_WEEK',
	'HOLIDAY',
	'REGISTRATION',
	'ORIENTATION',
	'BREAK',
	'OTHER'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "application_status" AS ENUM(
	'PENDING',
	'UNDER_REVIEW',
	'APPROVED',
	'REJECTED',
	'ESCALATED'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "event_type" AS ENUM(
	'LECTURE',
	'LAB',
	'EXAM',
	'SEMINAR',
	'WORKSHOP',
	'SPORTS',
	'CULTURAL',
	'GENERIC'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "form_status" AS ENUM('ACTIVE', 'INACTIVE', 'DRAFT');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "notice_scope" AS ENUM('GLOBAL', 'DEPARTMENT', 'YEAR');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "notice_type" AS ENUM('urgent', 'important', 'general');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "notification_type" AS ENUM(
	'NOTICE',
	'FORM',
	'APPLICATION',
	'SYSTEM',
	'ALERT',
	'UPDATE'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "slot_type" AS ENUM('Lecture', 'Lab', 'Seminar', 'Break', 'Other');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "user_role" AS ENUM('STUDENT', 'FACULTY', 'HOD', 'DEAN', 'ADMIN');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "workflow_level" AS ENUM('MENTOR', 'HOD', 'DEAN', 'COMPLETED');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academic_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"type" "academic_event_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_holiday" boolean DEFAULT false,
	"link_url" text,
	"target_years" varchar(20) [],
	"target_departments" uuid [],
	"target_roles" user_role [],
	"academic_year" integer DEFAULT 2024 NOT NULL,
	"semester" integer,
	"can_edit" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"submitted_by" uuid NOT NULL,
	"department_id" uuid,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"proof_file_url" text,
	"mentor_id" uuid,
	"mentor_status" "application_status" DEFAULT 'PENDING',
	"mentor_notes" text,
	"mentor_reviewed_at" timestamp with time zone,
	"hod_id" uuid,
	"hod_status" "application_status" DEFAULT 'PENDING',
	"hod_notes" text,
	"hod_reviewed_at" timestamp with time zone,
	"requires_dean_approval" boolean DEFAULT false,
	"dean_id" uuid,
	"dean_status" "application_status" DEFAULT 'PENDING',
	"dean_notes" text,
	"dean_reviewed_at" timestamp with time zone,
	"escalation_reason" text,
	"current_level" "workflow_level" DEFAULT 'MENTOR',
	"final_decision" "application_status" DEFAULT 'PENDING',
	"submitted_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(20) NOT NULL,
	"hod_id" uuid,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name"),
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"type" "event_type" DEFAULT 'GENERIC' NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" varchar(255) NOT NULL,
	"instructor" varchar(255),
	"link_url" text,
	"target_years" varchar(20) [],
	"target_departments" uuid [],
	"target_roles" user_role [],
	"created_by" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"submitted_by" uuid NOT NULL,
	"submission_data" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_submissions_form_id_submitted_by_unique" UNIQUE("form_id", "submitted_by")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"created_by" uuid NOT NULL,
	"target_years" varchar(20) [],
	"target_departments" uuid [],
	"target_roles" user_role [],
	"status" "form_status" DEFAULT 'DRAFT' NOT NULL,
	"deadline" timestamp with time zone NOT NULL,
	"form_data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notice_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "notice_reads_notice_id_user_id_unique" UNIQUE("notice_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"type" "notice_type" DEFAULT 'general' NOT NULL,
	"scope" "notice_scope" DEFAULT 'GLOBAL' NOT NULL,
	"target_years" varchar(20) [],
	"target_departments" uuid [],
	"target_roles" user_role [],
	"created_by" uuid NOT NULL,
	"attachment_url" text,
	"is_active" boolean DEFAULT true,
	"published_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"type" "notification_type" DEFAULT 'SYSTEM' NOT NULL,
	"source_type" varchar(50),
	"source_id" uuid,
	"target_users" uuid [],
	"target_roles" user_role [],
	"target_departments" uuid [],
	"target_years" varchar(20) [],
	"data" jsonb DEFAULT '{}',
	"action_url" text,
	"priority" integer DEFAULT 0,
	"expires_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL,
	"type" varchar(50) DEFAULT 'CLASSROOM' NOT NULL,
	"capacity" integer DEFAULT 50 NOT NULL,
	"department_id" uuid,
	"floor_number" integer,
	"building" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"section" varchar(10),
	"semester" varchar(10),
	"cgpa" numeric(3, 2),
	"batch" varchar(20),
	"roll_number" varchar(50),
	"specialization" varchar(200),
	"date_of_birth" date,
	"blood_group" varchar(5),
	"alt_email" varchar(255),
	"address" text,
	"permanent_address" text,
	"guardian_name" varchar(255),
	"guardian_contact" varchar(20),
	"guardian_email" varchar(255),
	"guardian_relation" varchar(50),
	"guardian_occupation" varchar(200),
	"previous_education" text,
	"admission_date" date,
	"expected_graduation" date,
	"mentor_id" uuid,
	"social_links" jsonb DEFAULT '{}',
	"skills" text [],
	"achievements" text [],
	"hobbies" text [],
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	"department_id" uuid NOT NULL,
	"semester" integer,
	"credits" integer DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timetable_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid,
	"room" varchar(100) NOT NULL,
	"faculty_id" uuid,
	"day_of_week" varchar(10) NOT NULL,
	"time_slot" varchar(20) NOT NULL,
	"slot_type" "slot_type" DEFAULT 'Lecture' NOT NULL,
	"department_id" uuid,
	"year" varchar(20),
	"section" varchar(10),
	"academic_year" varchar(20) DEFAULT '2024-25' NOT NULL,
	"semester" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"read_at" timestamp with time zone,
	"dismissed_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"delivered_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_notifications_user_id_template_id_unique" UNIQUE("user_id", "template_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"refresh_token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp with time zone DEFAULT now(),
	"ip_address" varchar(45),
	"user_agent" text,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token"),
	CONSTRAINT "user_sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"department" varchar(100),
	"year" varchar(20),
	"enrollment_number" varchar(50),
	"employee_id" varchar(50),
	"phone" varchar(20),
	"avatar_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_enrollment_number_unique" UNIQUE("enrollment_number"),
	CONSTRAINT "users_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academic_events_dates" ON "academic_events" ("start_date", "end_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academic_events_type" ON "academic_events" ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academic_events_year" ON "academic_events" ("academic_year", "semester");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_submitted_by" ON "applications" ("submitted_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_status" ON "applications" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_type" ON "applications" ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_applications_department" ON "applications" ("department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_departments_code" ON "departments" ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_departments_hod" ON "departments" ("hod_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_date" ON "events" ("date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_type" ON "events" ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_form_submissions_form" ON "form_submissions" ("form_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_form_submissions_user" ON "form_submissions" ("submitted_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_forms_created_by" ON "forms" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_forms_status" ON "forms" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_forms_deadline" ON "forms" ("deadline");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notice_reads_notice" ON "notice_reads" ("notice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notice_reads_user" ON "notice_reads" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notices_type" ON "notices" ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notices_scope" ON "notices" ("scope");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notices_created_by" ON "notices" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notices_published_at" ON "notices" ("published_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notices_active" ON "notices" ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notification_templates_type" ON "notification_templates" ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notification_templates_source" ON "notification_templates" ("source_type", "source_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notification_templates_created" ON "notification_templates" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notification_templates_expires" ON "notification_templates" ("expires_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notification_templates_priority" ON "notification_templates" ("priority");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rooms_code" ON "rooms" ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rooms_department" ON "rooms" ("department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_student_profiles_user" ON "student_profiles" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_student_profiles_mentor" ON "student_profiles" ("mentor_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subjects_code" ON "subjects" ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subjects_department" ON "subjects" ("department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_day_time" ON "timetable_slots" ("day_of_week", "time_slot");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_subject" ON "timetable_slots" ("subject_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_faculty" ON "timetable_slots" ("faculty_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_department_year" ON "timetable_slots" ("department_id", "year");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_notifications_user" ON "user_notifications" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_notifications_template" ON "user_notifications" ("template_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_notifications_delivered" ON "user_notifications" ("delivered_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_user" ON "user_sessions" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_token" ON "user_sessions" ("session_token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_expires" ON "user_sessions" ("expires_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_enrollment" ON "users" ("enrollment_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_department" ON "users" ("department");
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "academic_events"
ADD CONSTRAINT "academic_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "applications"
ADD CONSTRAINT "applications_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "applications"
ADD CONSTRAINT "applications_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "applications"
ADD CONSTRAINT "applications_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "applications"
ADD CONSTRAINT "applications_hod_id_users_id_fk" FOREIGN KEY ("hod_id") REFERENCES "users"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "applications"
ADD CONSTRAINT "applications_dean_id_users_id_fk" FOREIGN KEY ("dean_id") REFERENCES "users"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "departments"
ADD CONSTRAINT "departments_hod_id_users_id_fk" FOREIGN KEY ("hod_id") REFERENCES "users"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "events"
ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "form_submissions"
ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "form_submissions"
ADD CONSTRAINT "form_submissions_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "forms"
ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "notice_reads"
ADD CONSTRAINT "notice_reads_notice_id_notices_id_fk" FOREIGN KEY ("notice_id") REFERENCES "notices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "notice_reads"
ADD CONSTRAINT "notice_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "notices"
ADD CONSTRAINT "notices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "notification_templates"
ADD CONSTRAINT "notification_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "rooms"
ADD CONSTRAINT "rooms_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "student_profiles"
ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "student_profiles"
ADD CONSTRAINT "student_profiles_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "subjects"
ADD CONSTRAINT "subjects_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "timetable_slots"
ADD CONSTRAINT "timetable_slots_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "timetable_slots"
ADD CONSTRAINT "timetable_slots_faculty_id_users_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "users"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "timetable_slots"
ADD CONSTRAINT "timetable_slots_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE
set null ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "user_notifications"
ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "user_notifications"
ADD CONSTRAINT "user_notifications_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "user_sessions"
ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;