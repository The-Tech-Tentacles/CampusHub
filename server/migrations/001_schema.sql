-- CampusHub Database Schema - Production Ready
-- Updated: 2025-10-23
-- Note: Using gen_random_uuid() instead of uuid-ossp for modern PostgreSQL compatibility
-- Create custom types
CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'HOD', 'DEAN', 'ADMIN');
CREATE TYPE notice_type AS ENUM ('urgent', 'important', 'general');
CREATE TYPE notice_scope AS ENUM ('GLOBAL', 'DEPARTMENT', 'YEAR');
CREATE TYPE application_status AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'ESCALATED'
);
CREATE TYPE workflow_level AS ENUM ('MENTOR', 'HOD', 'DEAN', 'COMPLETED');
CREATE TYPE form_status AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
CREATE TYPE notification_type AS ENUM (
    'NOTICE',
    'FORM',
    'APPLICATION',
    'SYSTEM',
    'ALERT',
    'UPDATE'
);
CREATE TYPE event_type AS ENUM (
    'LECTURE',
    'LAB',
    'EXAM',
    'SEMINAR',
    'WORKSHOP',
    'SPORTS',
    'CULTURAL',
    'GENERIC'
);
CREATE TYPE academic_event_type AS ENUM (
    'SEMESTER_START',
    'SEMESTER_END',
    'EXAM_WEEK',
    'HOLIDAY',
    'REGISTRATION',
    'ORIENTATION',
    'BREAK',
    'OTHER'
);
CREATE TYPE slot_type AS ENUM ('Lecture', 'Lab', 'Seminar', 'Break', 'Other');
CREATE TYPE academic_level AS ENUM (
    'UNDERGRADUATE',
    'POSTGRADUATE',
    'DIPLOMA',
    'CERTIFICATE'
);
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
-- Users table (core authentication and basic info)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    department VARCHAR(100),
    year VARCHAR(20),
    department_id UUID,
    academic_year_id UUID,
    enrollment_number VARCHAR(50) UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    hod_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Academic years table
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    level academic_level NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Profiles table (detailed information for all user types)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    -- Personal Info (All users)
    prefix VARCHAR(10),
    -- Dr., Prof., Mr., Ms., etc.
    date_of_birth DATE,
    gender gender,
    blood_group VARCHAR(5),
    alt_email VARCHAR(255),
    address TEXT,
    permanent_address TEXT,
    bio TEXT,
    -- Academic Info (Students)
    section VARCHAR(10),
    semester VARCHAR(10),
    cgpa DECIMAL(3, 2),
    batch VARCHAR(20),
    roll_number VARCHAR(50),
    specialization VARCHAR(200),
    admission_date DATE,
    expected_graduation DATE,
    previous_education VARCHAR(255),
    -- Faculty/Staff Info
    cabin_location_id UUID REFERENCES rooms(id) ON DELETE
    SET NULL,
        office_hours VARCHAR(200),
        research_interests TEXT [],
        qualifications TEXT [],
        experience_years INTEGER,
        -- Guardian Info (Students)
        guardian_name VARCHAR(255),
        guardian_contact VARCHAR(20),
        guardian_email VARCHAR(255),
        guardian_relation VARCHAR(50),
        guardian_occupation VARCHAR(200),
        -- Mentor Info (Students)
        mentor_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        -- Social Links (JSON)
        social_links JSONB DEFAULT '{}',
        -- Skills and Interests (All users)
        skills TEXT [],
        -- Array of skills
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Notices table
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type notice_type NOT NULL DEFAULT 'general',
    scope notice_scope NOT NULL DEFAULT 'GLOBAL',
    -- Targeting options for specific notice delivery
    target_years VARCHAR(20) [],
    -- Array for multiple years (e.g., ["1st", "2nd", "B. Tech"])
    target_departments UUID [],
    -- Array of department IDs for multi-department notices
    target_roles user_role [],
    -- Array of user roles for role-specific notices
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attachment_url TEXT,
    -- File attachment URL
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Notice reads tracking
CREATE TABLE IF NOT EXISTS notice_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notice_id, user_id)
);
-- Forms table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Targeting options for form availability
    target_years VARCHAR(20) [],
    -- Array for multiple years (e.g., ["1st", "2nd", "B. Tech"])
    target_departments UUID [],
    -- Array of department IDs for multi-department forms
    target_roles user_role [],
    -- Array of user roles for role-specific forms
    -- Optional department association
    department_id UUID REFERENCES departments(id) ON DELETE
    SET NULL,
        -- Form configuration
        max_submissions INTEGER,
        allow_multiple_submissions BOOLEAN DEFAULT false,
        requires_approval BOOLEAN DEFAULT false,
        status form_status NOT NULL DEFAULT 'DRAFT',
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        form_data JSONB NOT NULL,
        -- Store form structure as JSON
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE
    SET NULL,
        status application_status NOT NULL DEFAULT 'PENDING',
        -- File attachment (single file like notices)
        proof_file_url TEXT,
        -- Multi-level approval workflow (Mentor → HOD → DEAN)
        mentor_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        mentor_status application_status DEFAULT 'PENDING',
        mentor_notes TEXT,
        mentor_reviewed_at TIMESTAMP WITH TIME ZONE,
        hod_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        hod_status application_status DEFAULT 'PENDING',
        hod_notes TEXT,
        hod_reviewed_at TIMESTAMP WITH TIME ZONE,
        -- DEAN level (only if HOD escalates)
        requires_dean_approval BOOLEAN DEFAULT false,
        -- HOD sets this to escalate
        dean_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        dean_status application_status DEFAULT 'PENDING',
        dean_notes TEXT,
        dean_reviewed_at TIMESTAMP WITH TIME ZONE,
        escalation_reason TEXT,
        -- Why HOD escalated to DEAN
        -- Overall workflow tracking
        current_level workflow_level DEFAULT 'MENTOR',
        final_decision application_status DEFAULT 'PENDING',
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL,
    -- Store form responses as JSON
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(form_id, submitted_by) -- One submission per user per form
);
-- Subjects/Courses table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    semester INTEGER CHECK (
        semester BETWEEN 1 AND 8
    ),
    credits INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'CLASSROOM',
    capacity INTEGER NOT NULL DEFAULT 50,
    department_id UUID REFERENCES departments(id) ON DELETE
    SET NULL,
        floor_number INTEGER,
        building VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Timetable slots table
CREATE TABLE IF NOT EXISTS timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE
    SET NULL,
        room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
        faculty_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        day_of_week VARCHAR(10) NOT NULL,
        -- 'Monday', 'Tuesday', etc.
        time_slot VARCHAR(20) NOT NULL,
        -- '9:15 AM', '10:15 AM', etc.
        slot_type slot_type NOT NULL DEFAULT 'Lecture',
        -- For class/year specific schedules
        department_id UUID REFERENCES departments(id) ON DELETE
    SET NULL,
        academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
        section VARCHAR(10),
        batch VARCHAR(20),
        semester INTEGER CHECK (semester IN (1, 2)) DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Events table (campus events)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type event_type NOT NULL DEFAULT 'GENERIC',
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    instructor VARCHAR(255),
    link_url TEXT,
    -- Event link (registration, meeting, etc.)
    -- Targeting options for event visibility
    target_years VARCHAR(20) [],
    -- Array for multiple years (e.g., ["1st", "2nd", "B. Tech"])
    target_departments UUID [],
    -- Array of department IDs for multi-department events
    target_roles user_role [],
    -- Array of user roles for role-specific events
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Academic events table (semester dates, holidays, etc.)
CREATE TABLE IF NOT EXISTS academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type academic_event_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_holiday BOOLEAN DEFAULT false,
    link_url TEXT,
    -- Event link (calendar, details, registration, etc.)
    -- Targeting options for academic event visibility
    target_years VARCHAR(20) [],
    -- Array for multiple years (e.g., ["1st", "2nd", "B. Tech"])
    target_departments UUID [],
    -- Array of department IDs for multi-department events
    target_roles user_role [],
    -- Array of user roles for role-specific events
    academic_year INTEGER NOT NULL DEFAULT 2024,
    semester INTEGER CHECK (semester IN (1, 2)),
    can_edit BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Notification templates (scalable notification system - store once, reference many times)
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'SYSTEM',
    -- Reference to source entity (notice, form, application, etc.)
    source_type VARCHAR(50),
    -- 'notice', 'form', 'application', 'system'
    source_id UUID,
    -- ID of the source record
    -- Targeting options (who should receive this notification)
    target_users UUID [],
    -- Specific users (for small targeted groups)
    target_roles user_role [],
    -- Role-based targeting
    target_departments UUID [],
    -- Department-based targeting
    target_years VARCHAR(20) [],
    -- Year-based targeting
    -- Notification content and behavior
    data JSONB DEFAULT '{}',
    -- Additional notification data
    action_url TEXT,
    -- Deep link URL for navigation
    priority INTEGER DEFAULT 0,
    -- Notification priority (0=normal, 1=high, 2=urgent)
    -- Lifecycle management
    expires_at TIMESTAMP WITH TIME ZONE,
    -- Auto-expire old notifications
    created_by UUID REFERENCES users(id) ON DELETE
    SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- User notification status (lightweight per-user tracking)
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES notification_templates(id) ON DELETE CASCADE,
    -- User-specific interaction state
    read_at TIMESTAMP WITH TIME ZONE,
    -- When user read the notification
    dismissed_at TIMESTAMP WITH TIME ZONE,
    -- When user dismissed/deleted it
    clicked_at TIMESTAMP WITH TIME ZONE,
    -- When user clicked the action
    -- Delivery tracking
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- When notification was created for user
    -- Prevent duplicate notifications for same user+template
    UNIQUE(user_id, template_id)
);
-- User sessions table (for authentication)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
-- Add foreign key constraints for enhanced normalization
ALTER TABLE users
ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE
SET NULL;
ALTER TABLE users
ADD CONSTRAINT fk_users_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE
SET NULL;
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_enrollment ON users(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_academic_year_id ON users(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_code ON academic_years(code);
CREATE INDEX IF NOT EXISTS idx_academic_years_level ON academic_years(level);
CREATE INDEX IF NOT EXISTS idx_academic_years_sequence ON academic_years(sequence_order);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_mentor ON profiles(mentor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_cabin_location ON profiles(cabin_location_id);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_hod ON departments(hod_id);
CREATE INDEX IF NOT EXISTS idx_notices_type ON notices(type);
CREATE INDEX IF NOT EXISTS idx_notices_scope ON notices(scope);
CREATE INDEX IF NOT EXISTS idx_notices_created_by ON notices(created_by);
CREATE INDEX IF NOT EXISTS idx_notices_published_at ON notices(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active);
CREATE INDEX IF NOT EXISTS idx_notices_target_years ON notices USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_notices_target_departments ON notices USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_notices_target_roles ON notices USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_notice_reads_notice ON notice_reads(notice_id);
CREATE INDEX IF NOT EXISTS idx_notice_reads_user ON notice_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_deadline ON forms(deadline);
CREATE INDEX IF NOT EXISTS idx_forms_department ON forms(department_id);
CREATE INDEX IF NOT EXISTS idx_forms_target_years ON forms USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_forms_target_departments ON forms USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_forms_target_roles ON forms USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user ON form_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_by ON applications(submitted_by);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_department ON applications(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_department ON rooms(department_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day_time ON timetable_slots(day_of_week, time_slot);
CREATE INDEX IF NOT EXISTS idx_timetable_subject ON timetable_slots(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty ON timetable_slots(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_room ON timetable_slots(room_id);
CREATE INDEX IF NOT EXISTS idx_timetable_department_academic_year ON timetable_slots(department_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_timetable_academic_year ON timetable_slots(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_timetable_batch ON timetable_slots(batch);
CREATE INDEX IF NOT EXISTS idx_timetable_section_batch ON timetable_slots(section, batch);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_target_years ON events USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_events_target_departments ON events USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_events_target_roles ON events USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_academic_events_dates ON academic_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_academic_events_type ON academic_events(type);
CREATE INDEX IF NOT EXISTS idx_academic_events_year ON academic_events(academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_academic_events_target_years ON academic_events USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_academic_events_target_departments ON academic_events USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_academic_events_target_roles ON academic_events USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_source ON notification_templates(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_created ON notification_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_templates_expires ON notification_templates(expires_at);
CREATE INDEX IF NOT EXISTS idx_notification_templates_priority ON notification_templates(priority DESC);
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_roles ON notification_templates USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_departments ON notification_templates USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_years ON notification_templates USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_users ON notification_templates USING GIN(target_users);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_template ON user_notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id)
WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_notifications_delivered ON user_notifications(delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE
UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE
UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE
UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE
UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_submissions_updated_at BEFORE
UPDATE ON form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE
UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE
UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE
UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timetable_slots_updated_at BEFORE
UPDATE ON timetable_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE
UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_events_updated_at BEFORE
UPDATE ON academic_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE
UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notifications_updated_at BEFORE
UPDATE ON user_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();