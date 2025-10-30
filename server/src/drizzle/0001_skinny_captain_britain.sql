DO $$ BEGIN
 CREATE TYPE "academic_level" AS ENUM('UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA', 'CERTIFICATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "gender" AS ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(20) NOT NULL,
	"level" "academic_level" NOT NULL,
	"sequence_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_years_name_unique" UNIQUE("name"),
	CONSTRAINT "academic_years_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "student_profiles" RENAME TO "profiles";--> statement-breakpoint
ALTER TABLE "timetable_slots" RENAME COLUMN "room" TO "room_id";--> statement-breakpoint
ALTER TABLE "timetable_slots" RENAME COLUMN "academic_year" TO "academic_year_id";--> statement-breakpoint
ALTER TABLE "timetable_slots" RENAME COLUMN "year" TO "batch";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "department" TO "department_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "year" TO "academic_year_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "student_profiles_user_id_unique";--> statement-breakpoint
ALTER TABLE "departments" DROP CONSTRAINT "departments_hod_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "student_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "student_profiles_mentor_id_users_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_timetable_department_year";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_users_department";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_student_profiles_user";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_student_profiles_mentor";--> statement-breakpoint
ALTER TABLE "timetable_slots" ALTER COLUMN "room_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "timetable_slots" ALTER COLUMN "academic_year_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "timetable_slots" ALTER COLUMN "academic_year_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "department_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "academic_year_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "prefix" varchar(10);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cabin_location_id" uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "office_hours" varchar(200);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "research_interests" text[];--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "qualifications" text[];--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "experience_years" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academic_years_code" ON "academic_years" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academic_years_level" ON "academic_years" ("level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academic_years_order" ON "academic_years" ("sequence_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_room" ON "timetable_slots" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_department_academic_year" ON "timetable_slots" ("department_id","academic_year_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_batch" ON "timetable_slots" ("batch");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_section_batch" ON "timetable_slots" ("section","batch");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timetable_academic_year" ON "timetable_slots" ("academic_year_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_department_id" ON "users" ("department_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_academic_year_id" ON "users" ("academic_year_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_dept_year" ON "users" ("department_id","academic_year_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_user" ON "profiles" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_mentor" ON "profiles" ("mentor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_cabin_location" ON "profiles" ("cabin_location_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_cabin_location_id_rooms_id_fk" FOREIGN KEY ("cabin_location_id") REFERENCES "rooms"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "achievements";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "hobbies";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id");