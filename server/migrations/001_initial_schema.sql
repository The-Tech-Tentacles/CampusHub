-- Initial database schema for CampusHub
-- Generated: 2024-01-15
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create custom types
CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'HOD', 'DEAN', 'ADMIN');
CREATE TYPE notice_type AS ENUM (
    'ANNOUNCEMENT',
    'CIRCULAR',
    'NEWS',
    'EVENT',
    'URGENT'
);
CREATE TYPE notice_scope AS ENUM ('GLOBAL', 'DEPARTMENT', 'COURSE', 'YEAR');
CREATE TYPE application_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);
CREATE TYPE notification_type AS ENUM (
    'NOTICE',
    'FORM',
    'APPLICATION',
    'SYSTEM',
    'ALERT'
);
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    department VARCHAR(100),
    year VARCHAR(20),
    enrollment_number VARCHAR(50) UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    hod_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
);
-- Notices table
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type notice_type NOT NULL DEFAULT 'ANNOUNCEMENT',
    scope notice_scope NOT NULL DEFAULT 'GLOBAL',
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    target_departments TEXT [],
    -- JSON array for multiple departments
    target_roles user_role [],
    -- Array for multiple roles  
    target_years TEXT [],
    -- Array for specific years
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attachment_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
-- Notice reads tracking
CREATE TABLE IF NOT EXISTS notice_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notice_id, user_id)
);
-- Forms table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL,
    -- Form field definitions
    department_id UUID REFERENCES departments(id) ON DELETE
    SET NULL,
        allowed_roles user_role [] DEFAULT '{STUDENT}',
        is_active BOOLEAN DEFAULT true,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
);
-- Applications table  
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    -- User submitted data
    status application_status DEFAULT 'DRAFT',
    reviewer_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        reviewer_notes TEXT,
        type VARCHAR(100),
        -- Application type/category
        department_id UUID REFERENCES departments(id) ON DELETE
    SET NULL,
        submitted_at TIMESTAMP WITH TIME ZONE,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
);
-- Form submissions (for tracking multiple submissions)
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'SYSTEM',
    data JSONB,
    -- Additional notification data
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Schedule/Timetable table
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    type VARCHAR(100) NOT NULL,
    -- 'class', 'exam', 'meeting', 'event'
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    course_code VARCHAR(20),
    faculty_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        target_years TEXT [],
        is_recurring BOOLEAN DEFAULT false,
        recurrence_pattern JSONB,
        -- For recurring events
        is_active BOOLEAN DEFAULT true,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
);
-- User sessions table (for tracking active sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    path VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50),
    -- 'notice', 'application', 'form'
    entity_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_enrollment ON users(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_notices_type ON notices(type);
CREATE INDEX IF NOT EXISTS idx_notices_scope ON notices(scope);
CREATE INDEX IF NOT EXISTS idx_notices_department ON notices(department_id);
CREATE INDEX IF NOT EXISTS idx_notices_created_by ON notices(created_by);
CREATE INDEX IF NOT EXISTS idx_notices_published_at ON notices(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active);
CREATE INDEX IF NOT EXISTS idx_notice_reads_notice ON notice_reads(notice_id);
CREATE INDEX IF NOT EXISTS idx_notice_reads_user ON notice_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_form ON applications(form_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_by ON applications(submitted_by);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_department ON applications(department_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_department ON schedules(department_id);
CREATE INDEX IF NOT EXISTS idx_schedules_faculty ON schedules(faculty_id);
CREATE INDEX IF NOT EXISTS idx_schedules_time ON schedules(start_time, end_time);
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE
UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE
UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE
UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE
UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE
UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
        'System Administrator',
        'admin@campushub.edu',
        '$2a$12$rQv8W6gxfJ.TzeLG8QY8v.tq6h1QZH3K8QZ5J8QY8v.tq6h1QZH3K8',
        'ADMIN',
        true
    ) ON CONFLICT (email) DO NOTHING;
-- Insert sample departments
INSERT INTO departments (name, code, description)
VALUES (
        'Computer Science & Engineering',
        'CSE',
        'Department of Computer Science & Engineering'
    ),
    (
        'Electronics & Communication Engineering',
        'ECE',
        'Department of Electronics & Communication Engineering'
    ),
    (
        'Mechanical Engineering',
        'ME',
        'Department of Mechanical Engineering'
    ),
    (
        'Civil Engineering',
        'CE',
        'Department of Civil Engineering'
    ),
    (
        'Electrical Engineering',
        'EE',
        'Department of Electrical Engineering'
    ) ON CONFLICT (code) DO NOTHING;