# CampusHub Database Schema

## Overview

This document outlines the PostgreSQL database schema for the CampusHub application. The schema is designed to support a comprehensive campus management system with user management, notices, applications, forms, timetables, events, and notifications.

## Database Design Principles

- **Normalization**: Tables are normalized to reduce redundancy
- **Referential Integrity**: Foreign keys maintain data consistency
- **Scalability**: Schema supports horizontal and vertical scaling
- **Security**: Sensitive data is properly handled with appropriate constraints
- **Audit Trail**: Created/updated timestamps for tracking changes

---

## Table Definitions

### 1. Users Table

Core user information for all system users (students, faculty, admins, etc.)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'HOD', 'DEAN', 'ADMIN')),
    department VARCHAR(100),
    year VARCHAR(20), -- For students: "B. Tech", "M. Tech", etc.
    enrollment_number VARCHAR(50) UNIQUE, -- For students
    employee_id VARCHAR(50) UNIQUE, -- For faculty/staff
    joining_date DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_enrollment ON users(enrollment_number);
```

### 2. Departments Table

Department information for organizational structure

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    hod_id UUID REFERENCES users(id),
    established_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_hod ON departments(hod_id);
```

### 3. Notices Table

System-wide notices and announcements

```sql
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('urgent', 'important', 'general')),
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('GLOBAL', 'DEPARTMENT', 'YEAR')),
    department_id UUID REFERENCES departments(id),
    target_year VARCHAR(20), -- For year-specific notices
    file_url TEXT, -- Optional file attachment URL
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notices_type ON notices(type);
CREATE INDEX idx_notices_scope ON notices(scope);
CREATE INDEX idx_notices_department ON notices(department_id);
CREATE INDEX idx_notices_published ON notices(published_at);
CREATE INDEX idx_notices_active ON notices(is_active);
```

### 4. Notice Reads Table

Track which users have read which notices

```sql
CREATE TABLE notice_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(notice_id, user_id)
);

-- Indexes
CREATE INDEX idx_notice_reads_notice ON notice_reads(notice_id);
CREATE INDEX idx_notice_reads_user ON notice_reads(user_id);
```

### 5. Applications Table

Student applications (leave, hostel change, etc.)

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    submitted_by UUID NOT NULL REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW')),

    -- Approval workflow
    mentor_teacher_id UUID REFERENCES users(id),
    mentor_approved_at TIMESTAMP WITH TIME ZONE,
    mentor_comments TEXT,

    hod_id UUID REFERENCES users(id),
    hod_approved_at TIMESTAMP WITH TIME ZONE,
    hod_comments TEXT,

    -- Rejection details
    rejected_by VARCHAR(10) CHECK (rejected_by IN ('MENTOR', 'HOD')),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_applications_submitted_by ON applications(submitted_by);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(type);
CREATE INDEX idx_applications_department ON applications(department_id);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
```

### 6. Application Files Table

File attachments for applications

```sql
CREATE TABLE application_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_application_files_application ON application_files(application_id);
```

### 7. Forms Table

Digital forms for various purposes

```sql
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'DRAFT')),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    max_submissions INTEGER,
    form_data JSONB NOT NULL, -- Store form structure as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_deadline ON forms(deadline);
CREATE INDEX idx_forms_department ON forms(department_id);
```

### 8. Form Submissions Table

User submissions for forms

```sql
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    submission_data JSONB NOT NULL, -- Store form responses as JSON
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_id, submitted_by) -- One submission per user per form
);

-- Indexes
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_user ON form_submissions(submitted_by);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);
```

### 9. Timetable Subjects Table

Master list of subjects/courses

```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES departments(id),
    semester INTEGER CHECK (semester IN (1, 2, 3, 4, 5, 6, 7, 8)),
    credits INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_department ON subjects(department_id);
CREATE INDEX idx_subjects_semester ON subjects(semester);
```

### 10. Rooms Table

Classroom and lab information

```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CLASSROOM', 'LAB', 'AUDITORIUM', 'SEMINAR_HALL')),
    capacity INTEGER NOT NULL DEFAULT 50,
    department_id UUID REFERENCES departments(id),
    floor_number INTEGER,
    building VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_department ON rooms(department_id);
```

### 11. Timetable Slots Table

Individual timetable entries

```sql
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id),
    room_id UUID REFERENCES rooms(id),
    faculty_id UUID REFERENCES users(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type VARCHAR(20) NOT NULL CHECK (slot_type IN ('Lecture', 'Lab', 'Seminar', 'Break')),

    -- For class/year specific schedules
    department_id UUID REFERENCES departments(id),
    year VARCHAR(20),
    section VARCHAR(10),

    academic_year VARCHAR(20) NOT NULL, -- "2024-25"
    semester INTEGER CHECK (semester IN (1, 2)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_timetable_day_time ON timetable_slots(day_of_week, start_time);
CREATE INDEX idx_timetable_subject ON timetable_slots(subject_id);
CREATE INDEX idx_timetable_room ON timetable_slots(room_id);
CREATE INDEX idx_timetable_faculty ON timetable_slots(faculty_id);
CREATE INDEX idx_timetable_department_year ON timetable_slots(department_id, year);
CREATE INDEX idx_timetable_academic_year ON timetable_slots(academic_year, semester);
```

### 12. Events Table

Campus events and activities

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('LECTURE', 'LAB', 'EXAM', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'CULTURAL', 'GENERIC')),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    instructor VARCHAR(255),
    department_id UUID REFERENCES departments(id),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(20) CHECK (recurring_pattern IN ('WEEKLY', 'MONTHLY')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_department ON events(department_id);
CREATE INDEX idx_events_created_by ON events(created_by);
```

### 13. Academic Events Table

Academic calendar events (semester dates, holidays, etc.)

```sql
CREATE TABLE academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('SEMESTER_START', 'SEMESTER_END', 'EXAM_WEEK', 'HOLIDAY', 'REGISTRATION', 'ORIENTATION', 'BREAK')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_holiday BOOLEAN DEFAULT false,
    department_id UUID REFERENCES departments(id), -- NULL for global events
    academic_year INTEGER NOT NULL,
    semester INTEGER CHECK (semester IN (1, 2)),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_academic_events_dates ON academic_events(start_date, end_date);
CREATE INDEX idx_academic_events_type ON academic_events(type);
CREATE INDEX idx_academic_events_year_sem ON academic_events(academic_year, semester);
CREATE INDEX idx_academic_events_department ON academic_events(department_id);
```

### 14. Notifications Table

System notifications for users

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('NOTICE', 'FORM', 'APPLICATION', 'SYSTEM', 'ALERT', 'UPDATE')),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- Additional notification data
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 15. User Sessions Table

Active user sessions for authentication

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

---

## Views and Functions

### 1. User Dashboard Stats View

Aggregated statistics for user dashboard

```sql
CREATE VIEW user_dashboard_stats AS
SELECT
    u.id as user_id,
    COUNT(DISTINCT n.id) as total_notices,
    COUNT(DISTINCT CASE WHEN nr.read_at IS NULL THEN n.id END) as unread_notices,
    COUNT(DISTINCT a.id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'PENDING' THEN a.id END) as pending_applications,
    COUNT(DISTINCT f.id) as available_forms,
    COUNT(DISTINCT fs.id) as submitted_forms
FROM users u
LEFT JOIN notices n ON (
    n.scope = 'GLOBAL' OR
    (n.scope = 'DEPARTMENT' AND n.department_id = (SELECT id FROM departments WHERE name = u.department)) OR
    (n.scope = 'YEAR' AND n.target_year = u.year)
) AND n.is_active = true
LEFT JOIN notice_reads nr ON n.id = nr.notice_id AND nr.user_id = u.id
LEFT JOIN applications a ON a.submitted_by = u.id
LEFT JOIN forms f ON (
    f.status = 'ACTIVE' AND
    f.deadline > CURRENT_TIMESTAMP AND
    (f.department_id IS NULL OR f.department_id = (SELECT id FROM departments WHERE name = u.department))
)
LEFT JOIN form_submissions fs ON f.id = fs.form_id AND fs.submitted_by = u.id
GROUP BY u.id;
```

### 2. Today's Timetable Function

Get today's schedule for a user

```sql
CREATE OR REPLACE FUNCTION get_today_timetable(p_user_id UUID)
RETURNS TABLE (
    subject_name VARCHAR,
    room_name VARCHAR,
    slot_type VARCHAR,
    faculty_name VARCHAR,
    start_time TIME,
    end_time TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(s.name, 'Break') as subject_name,
        COALESCE(r.name, '-') as room_name,
        ts.slot_type,
        COALESCE(f.name, '') as faculty_name,
        ts.start_time,
        ts.end_time
    FROM timetable_slots ts
    LEFT JOIN subjects s ON ts.subject_id = s.id
    LEFT JOIN rooms r ON ts.room_id = r.id
    LEFT JOIN users f ON ts.faculty_id = f.id
    JOIN users u ON u.id = p_user_id
    WHERE ts.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
    AND ts.department_id = (SELECT id FROM departments WHERE name = u.department)
    AND ts.year = u.year
    AND ts.is_active = true
    ORDER BY ts.start_time;
END;
$$ LANGUAGE plpgsql;
```

### 3. Auto-update Functions

Trigger functions for maintaining data consistency

```sql
-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
    BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add similar triggers for other tables as needed
```

---

## Sample Queries

### 1. Get Unread Notices for a User

```sql
SELECT n.*, u.name as created_by_name
FROM notices n
JOIN users u ON n.created_by = u.id
LEFT JOIN notice_reads nr ON n.id = nr.notice_id AND nr.user_id = $1
WHERE nr.read_at IS NULL
AND n.is_active = true
AND (
    n.scope = 'GLOBAL' OR
    (n.scope = 'DEPARTMENT' AND n.department_id = (
        SELECT d.id FROM departments d
        JOIN users u2 ON u2.department = d.name
        WHERE u2.id = $1
    ))
)
ORDER BY n.published_at DESC;
```

### 2. Get Application Approval Workflow

```sql
SELECT
    a.*,
    submitter.name as submitted_by_name,
    mentor.name as mentor_name,
    hod.name as hod_name,
    d.name as department_name
FROM applications a
JOIN users submitter ON a.submitted_by = submitter.id
LEFT JOIN users mentor ON a.mentor_teacher_id = mentor.id
LEFT JOIN users hod ON a.hod_id = hod.id
LEFT JOIN departments d ON a.department_id = d.id
WHERE a.id = $1;
```

### 3. Get Active Forms for Department

```sql
SELECT f.*,
    u.name as created_by_name,
    COUNT(fs.id) as submission_count,
    CASE WHEN user_fs.id IS NOT NULL THEN true ELSE false END as is_submitted
FROM forms f
JOIN users u ON f.created_by = u.id
LEFT JOIN form_submissions fs ON f.id = fs.form_id
LEFT JOIN form_submissions user_fs ON f.id = user_fs.form_id AND user_fs.submitted_by = $1
WHERE f.status = 'ACTIVE'
AND f.deadline > CURRENT_TIMESTAMP
AND (f.department_id IS NULL OR f.department_id = $2)
GROUP BY f.id, u.name, user_fs.id
ORDER BY f.deadline ASC;
```

---

## Migration Strategy

### Phase 1: Core Tables

1. Users and Departments
2. User Sessions
3. Basic authentication setup

### Phase 2: Content Management

1. Notices and Notice Reads
2. Notifications
3. Basic content delivery

### Phase 3: Academic Features

1. Subjects and Rooms
2. Timetable Slots
3. Academic Events

### Phase 4: Interactive Features

1. Applications and Application Files
2. Forms and Form Submissions
3. Events

### Phase 5: Optimization

1. Add indexes and views
2. Implement stored procedures
3. Performance tuning

---

## Security Considerations

1. **Password Security**: Use bcrypt for password hashing
2. **Data Encryption**: Encrypt sensitive fields at application level
3. **Access Control**: Implement row-level security where needed
4. **Audit Logging**: Consider adding audit tables for sensitive operations
5. **Input Validation**: Validate all inputs at application and database level

---

## Backup and Maintenance

1. **Regular Backups**: Daily automated backups with point-in-time recovery
2. **Archival Strategy**: Archive old notices, applications, and form submissions
3. **Performance Monitoring**: Monitor query performance and optimize indexes
4. **Data Retention**: Implement policies for data retention and cleanup

---

This schema provides a solid foundation for the CampusHub application with room for future enhancements and scalability.
