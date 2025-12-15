# CampusHub Database Schema - Production Ready

## Overview

This document outlines the production-ready PostgreSQL database schema for the CampusHub application. The schema is designed to support a comprehensive campus management system with role-based access, student profiles, notices, applications, forms, timetables, events, and notifications that directly match the frontend requirements.

## Database Design Principles

- **Production Ready**: Matches exact frontend data requirements
- **Normalized Structure**: Reduced redundancy with proper relationships
- **Role-Based Access**: Supports STUDENT, FACULTY, HOD, DEAN, ADMIN roles
- **File Handling**: Simple file URL columns instead of separate file tables
- **Student Profiles**: Comprehensive student profile data storage
- **Referential Integrity**: Foreign keys maintain data consistency
- **Performance**: Optimized indexes for common queries
- **Audit Trail**: Created/updated timestamps with auto-update triggers

---

## Custom Types

```sql
CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'HOD', 'DEAN', 'ADMIN');
CREATE TYPE notice_type AS ENUM ('urgent', 'important', 'general');
CREATE TYPE notice_scope AS ENUM ('GLOBAL', 'DEPARTMENT', 'YEAR');
CREATE TYPE application_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED');
CREATE TYPE workflow_level AS ENUM ('MENTOR', 'HOD', 'DEAN', 'COMPLETED');
CREATE TYPE form_status AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
CREATE TYPE notification_type AS ENUM ('NOTICE', 'FORM', 'APPLICATION', 'SYSTEM', 'ALERT', 'UPDATE');
CREATE TYPE event_type AS ENUM ('LECTURE', 'LAB', 'EXAM', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'CULTURAL', 'GENERIC');
CREATE TYPE academic_event_type AS ENUM ('SEMESTER_START', 'SEMESTER_END', 'EXAM_WEEK', 'HOLIDAY', 'REGISTRATION', 'ORIENTATION', 'BREAK', 'OTHER');
CREATE TYPE slot_type AS ENUM ('Lecture', 'Lab', 'Seminar', 'Break', 'Other');
```

---

## Core Tables

### 1. Users Table

Core user information for authentication and basic profile data

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    department VARCHAR(100),
    year VARCHAR(20), -- For students: "B. Tech", "M. Tech", etc.
    enrollment_number VARCHAR(50) UNIQUE, -- For students
    employee_id VARCHAR(50) UNIQUE, -- For faculty/staff
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Profiles Table

Comprehensive profile information for all users (students, faculty, staff) matching frontend requirements

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Academic Info
    section VARCHAR(10),           -- Section A, B, C
    semester VARCHAR(10),          -- Current semester
    cgpa DECIMAL(3,2),            -- Current CGPA
    batch VARCHAR(20),            -- 2022-2026
    roll_number VARCHAR(50),      -- Class roll number
    specialization VARCHAR(200),  -- Specialization area

    -- Personal Info
    date_of_birth DATE,
    blood_group VARCHAR(5),       -- A+, B+, O+, etc.
    alt_email VARCHAR(255),       -- Alternative email
    address TEXT,                 -- Current address
    permanent_address TEXT,       -- Permanent address

    -- Guardian Info
    guardian_name VARCHAR(255),
    guardian_contact VARCHAR(20),
    guardian_email VARCHAR(255),
    guardian_relation VARCHAR(50), -- Father, Mother, Guardian
    guardian_occupation VARCHAR(200),

    -- Academic Details
    previous_education TEXT, -- JSON: {tenth: {school, percentage, yearOfPassing}, intermediateType: '12th'|'diploma', twelfth: {...}, diploma: {...}}
    admission_date DATE,
    expected_graduation DATE,

    -- Mentor Assignment
    mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Social Links (JSON format)
    social_links JSONB DEFAULT '{}', -- {"github": "username", "linkedin": "profile"}

    -- Arrays for multiple values
    skills TEXT[],        -- Technical skills
    achievements TEXT[],  -- Academic achievements
    hobbies TEXT[],      -- Personal hobbies
    bio TEXT,            -- Personal bio/description

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Departments Table

Department information for organizational structure

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    hod_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Notices Table

System-wide notices and announcements with file attachment support

```sql
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type notice_type NOT NULL DEFAULT 'general',
    scope notice_scope NOT NULL DEFAULT 'GLOBAL',

    -- Targeting options for specific notice delivery
    target_years VARCHAR(20)[], -- Array for multiple years (e.g., ["1st", "2nd", "B. Tech"])
    target_departments UUID[], -- Array of department IDs for multi-department notices
    target_roles user_role[], -- Array of user roles for role-specific notices

    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attachment_url TEXT, -- Single file attachment URL (like frontend)
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```

### 5. Notice Reads Table

Track which users have read which notices

```sql
CREATE TABLE notice_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notice_id, user_id)
);
```

### 6. Applications Table

Student applications with smart workflow: Mentor → HOD → optional DEAN escalation

````sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status application_status NOT NULL DEFAULT 'PENDING',

    -- Single file attachment (simplified like notices)
    proof_file_url TEXT,

    -- Smart approval workflow (Mentor → HOD → optional DEAN escalation)
    mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mentor_status application_status DEFAULT 'PENDING',
    mentor_notes TEXT,
    mentor_reviewed_at TIMESTAMP WITH TIME ZONE,

    hod_id UUID REFERENCES users(id) ON DELETE SET NULL,
    hod_status application_status DEFAULT 'PENDING',
    hod_notes TEXT,
    hod_reviewed_at TIMESTAMP WITH TIME ZONE,

    -- DEAN level (only if HOD escalates)
    requires_dean_approval BOOLEAN DEFAULT false, -- HOD sets this to escalate
    dean_id UUID REFERENCES users(id) ON DELETE SET NULL,
    dean_status application_status DEFAULT 'PENDING',
    dean_notes TEXT,
    dean_reviewed_at TIMESTAMP WITH TIME ZONE,
    escalation_reason TEXT, -- Why HOD escalated to DEAN

    -- Overall workflow tracking
    current_level workflow_level DEFAULT 'MENTOR',
    final_decision application_status DEFAULT 'PENDING',    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```### 7. Forms Table

Digital forms with advanced targeting capabilities

```sql
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Targeting options for form availability
    target_years VARCHAR(20)[], -- Array for multiple years (e.g., ["1st", "2nd", "B. Tech"])
    target_departments UUID[], -- Array of department IDs for multi-department forms
    target_roles user_role[], -- Array of user roles for role-specific forms

    -- Optional department association
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

    -- Form configuration
    max_submissions INTEGER, -- Maximum number of submissions allowed (null = unlimited)
    allow_multiple_submissions BOOLEAN DEFAULT false, -- Whether users can submit multiple times
    requires_approval BOOLEAN DEFAULT false, -- Whether submissions require approval

    status form_status NOT NULL DEFAULT 'DRAFT',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    form_data JSONB NOT NULL, -- Store form structure as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
````

### 8. Form Submissions Table

User submissions for forms (one per user per form)

```sql
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL, -- Store form responses as JSON
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(form_id, submitted_by) -- One submission per user per form
);
```

### 9. Subjects Table

Master list of subjects/courses

```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    credits INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. Rooms Table

Classroom and lab information (simplified for timetable)

```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'CLASSROOM',
    capacity INTEGER NOT NULL DEFAULT 50,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    floor_number INTEGER,
    building VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 11. Timetable Slots Table

Individual timetable entries matching frontend timetable structure

```sql
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    room VARCHAR(100) NOT NULL, -- Room name/code (simplified)
    faculty_id UUID REFERENCES users(id) ON DELETE SET NULL,
    day_of_week VARCHAR(10) NOT NULL, -- 'Monday', 'Tuesday', etc.
    time_slot VARCHAR(20) NOT NULL, -- '9:15 AM', '10:15 AM', etc.
    slot_type slot_type NOT NULL DEFAULT 'Lecture',

    -- For class/year specific schedules
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    year VARCHAR(20),
    section VARCHAR(10),

    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-25',
    semester INTEGER CHECK (semester IN (1, 2)) DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12. Events Table

Campus events with advanced targeting capabilities

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Event Category (REGULAR or ACADEMIC)
    event_category VARCHAR(20) NOT NULL DEFAULT 'REGULAR' CHECK (event_category IN ('REGULAR', 'ACADEMIC')),

    -- Event Type (unified for both categories)
    type VARCHAR(50) NOT NULL DEFAULT 'GENERIC',

    -- Date fields (works for both single-day and multi-day events)
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Regular event specific fields (optional for academic events)
    location VARCHAR(255),
    instructor VARCHAR(255),

    -- Academic event specific fields (optional for regular events)
    is_holiday BOOLEAN DEFAULT false,
    academic_year INTEGER,
    semester INTEGER CHECK (semester IN (1, 2)),

    -- Common fields
    link_url TEXT, -- Event link (registration, meeting, calendar, etc.)

    -- Targeting options for event visibility
    target_years VARCHAR(20)[], -- Array for multiple years (e.g., ["1st", "2nd", "B. Tech"])
    target_departments UUID[], -- Array of department IDs for multi-department events
    target_roles user_role[], -- Array of user roles for role-specific events

    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Note**: Event types now support both regular event types (LECTURE, LAB, EXAM, SEMINAR, WORKSHOP, SPORTS, CULTURAL, GENERIC)
and academic event types (SEMESTER_START, SEMESTER_END, EXAM_WEEK, HOLIDAY, REGISTRATION, ORIENTATION, BREAK, OTHER).
The `event_category` field determines which type group the event belongs to.

### 13. Notification Templates Table

Scalable notification system - stores notification templates once, referenced by many users. This architecture prevents database bloat and scales efficiently like Instagram/Facebook.

```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'SYSTEM',

    -- Reference to source entity (notice, form, application, etc.)
    source_type VARCHAR(50), -- 'notice', 'form', 'application', 'system'
    source_id UUID, -- ID of the source record

    -- Targeting options (who should receive this notification)
    target_users UUID[], -- Specific users (for small targeted groups)
    target_roles user_role[], -- Role-based targeting
    target_departments UUID[], -- Department-based targeting
    target_years VARCHAR(20)[], -- Year-based targeting

    -- Notification content and behavior
    data JSONB DEFAULT '{}', -- Additional notification data
    action_url TEXT, -- Deep link URL for navigation
    priority INTEGER DEFAULT 0, -- Notification priority (0=normal, 1=high, 2=urgent)

    -- Lifecycle management
    expires_at TIMESTAMP WITH TIME ZONE, -- Auto-expire old notifications
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 15. User Notifications Table

Lightweight per-user notification tracking. Links users to notification templates with read/interaction state.

```sql
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES notification_templates(id) ON DELETE CASCADE,

    -- User-specific interaction state
    read_at TIMESTAMP WITH TIME ZONE, -- When user read the notification
    dismissed_at TIMESTAMP WITH TIME ZONE, -- When user dismissed/deleted it
    clicked_at TIMESTAMP WITH TIME ZONE, -- When user clicked the action

    -- Delivery tracking
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When notification was created for user

    -- Prevent duplicate notifications for same user+template
    UNIQUE(user_id, template_id)
);
```

**Benefits of this architecture:**

- **50x storage reduction**: One template serves thousands of users instead of duplicating data
- **Fast queries**: Optimized for notification badge counts and user feeds
- **Rich targeting**: Multiple targeting options (users, roles, departments, years)
- **Advanced features**: Priorities, deep links, auto-expiration
- **Industry-standard**: Same pattern used by major social media platforms

### 16. User Sessions Table

Active user sessions for authentication with enhanced tracking

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

---

## Key Features Supported

### 1. Role-Based Access Control

- **STUDENT**: Access to notices, forms, applications, timetable, profile
- **FACULTY**: Can create notices, manage applications, view student data
- **HOD**: Department-level management, application approvals
- **DEAN**: Multi-department oversight, academic event management
- **ADMIN**: System-wide administrative access

### 2. Student Profile Management

- Comprehensive student information storage
- Guardian and mentor assignment
- Academic progress tracking
- Social links and achievements
- Skills and hobby management

### 3. Advanced Notice Targeting

- **Multi-Department Targeting**: Send notices to multiple departments using `target_departments` UUID array (references department IDs)
- **Role-Based Targeting**: Target specific user roles (STUDENT, FACULTY, HOD, etc.) using `target_roles` array
- **Multi-Year Targeting**: Target multiple academic years using `target_years` array (e.g., ["1st", "2nd", "B. Tech"])
- **Combined Targeting**: Use multiple targeting options together for precise audience control
- **Referential Integrity**: Department targeting uses foreign keys for data consistency

### 4. Simplified File Handling

- Single file URL columns (notices: `attachment_url`, applications: `proof_file_url`)
- No separate file tables - direct URL storage like the frontend expects
- Consistent pattern across all entities

### 5. Frontend-Database Alignment

- Exact data types matching frontend requirements
- Proper enum types for dropdowns and selections
- JSON storage for complex data (social_links, form_data)
- Arrays for multiple values (skills, achievements, hobbies)

---

## Sample Queries

### 1. Get Student Dashboard Data

```sql
-- Get today's schedule for a student
SELECT
    s.name as subject,
    ts.room,
    ts.slot_type,
    u.name as faculty_name,
    ts.time_slot
FROM timetable_slots ts
LEFT JOIN subjects s ON ts.subject_id = s.id
LEFT JOIN users u ON ts.faculty_id = u.id
JOIN users student ON student.id = $1
WHERE ts.day_of_week = TO_CHAR(CURRENT_DATE, 'Day')
  AND ts.department_id = (SELECT id FROM departments WHERE name = student.department)
  AND ts.year = student.year
  AND ts.is_active = true
ORDER BY ts.time_slot;
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
    WHERE ts.day_of_week = TO_CHAR(CURRENT_DATE, 'Day')
      AND ts.department_id = (
          SELECT d.id FROM departments d
          JOIN users u ON u.department = d.name
          WHERE u.id = p_user_id
      )
      AND ts.year = (SELECT year FROM users WHERE id = p_user_id)
      AND ts.is_active = true
    ORDER BY ts.start_time;
END;
$$ LANGUAGE plpgsql;
```

### 3. Get Student Profile with All Details

```sql
-- Complete student profile information
SELECT
    u.name,
    u.email,
    u.roll_number,
    u.phone,
    u.avatar_url,
    sp.section,
    sp.semester,
    sp.cgpa,
    sp.batch,
    sp.specialization,
    sp.date_of_birth,
    sp.blood_group,
    sp.address,
    sp.guardian_name,
    sp.guardian_contact,
    sp.skills,
    sp.achievements,
    sp.hobbies,
    sp.bio,
    sp.social_links,
    d.name as department_name,
    mentor.name as mentor_name
FROM users u
LEFT JOIN profiles sp ON u.id = sp.user_id
LEFT JOIN departments d ON u.department = d.name
LEFT JOIN users mentor ON sp.mentor_id = mentor.id
WHERE u.id = $1;
```

### 4. Get Recent Notices for Dashboard

````sql
-- Get recent notices with enhanced targeting support
SELECT
    n.id,
    n.title,
    n.content,
    n.type,
    n.attachment_url,
    n.published_at,
    nr.read_at IS NOT NULL as is_read,
    u.name as created_by_name
FROM notices n
LEFT JOIN notice_reads nr ON n.id = nr.notice_id AND nr.user_id = $1
LEFT JOIN users u ON n.created_by = u.id
LEFT JOIN users current_user ON current_user.id = $1
WHERE n.is_active = true
  AND (n.expires_at IS NULL OR n.expires_at > NOW())
  AND (
    -- Global notices (visible to everyone)
    n.scope = 'GLOBAL'

    -- Multi-year targeting
    OR (n.target_years IS NOT NULL AND current_user.year = ANY(n.target_years))

    -- Multi-department targeting (using department IDs)
    OR (n.target_departments IS NOT NULL AND EXISTS (
        SELECT 1 FROM departments d
        WHERE d.id = ANY(n.target_departments)
        AND d.name = current_user.department
    ))

    -- Role-specific targeting
    OR (n.target_roles IS NOT NULL AND current_user.role = ANY(n.target_roles))
  )
ORDER BY n.is_pinned DESC, n.published_at DESC
LIMIT 10;
```### 5. Get User Applications with Status

```sql
-- Get user's applications
SELECT
    a.id,
    a.title,
    a.type,
    a.description,
    a.status,
    a.proof_file_url,
    a.reviewer_notes,
    a.submitted_at,
    a.reviewed_at,
    reviewer.name as reviewer_name,
    d.name as department_name
FROM applications a
LEFT JOIN users reviewer ON a.reviewer_id = reviewer.id
LEFT JOIN departments d ON a.department_id = d.id
WHERE a.submitted_by = $1
ORDER BY a.submitted_at DESC;
````

### 6. Get Available Forms for Students

````sql
-- Get forms available for submission with enhanced targeting
SELECT
    f.id,
    f.title,
    f.description,
    f.deadline,
    f.max_submissions,
    fs.id IS NOT NULL as already_submitted,
    creator.name as created_by_name
FROM forms f
LEFT JOIN form_submissions fs ON f.id = fs.form_id AND fs.submitted_by = $1
LEFT JOIN users creator ON f.created_by = creator.id
LEFT JOIN users current_user ON current_user.id = $1
WHERE f.status = 'PUBLISHED'
  AND f.deadline > NOW()
  AND (
    -- Forms with no targeting (available to all)
    (f.target_years IS NULL AND f.target_departments IS NULL AND f.target_roles IS NULL)

    -- Multi-year targeting
    OR (f.target_years IS NOT NULL AND current_user.year = ANY(f.target_years))

    -- Multi-department targeting (using department IDs)
    OR (f.target_departments IS NOT NULL AND EXISTS (
        SELECT 1 FROM departments d
        WHERE d.id = ANY(f.target_departments)
        AND d.name = current_user.department
    ))

    -- Role-specific targeting
    OR (f.target_roles IS NOT NULL AND current_user.role = ANY(f.target_roles))
  )
ORDER BY f.deadline ASC;
```### 7. Targeted Notice Creation Examples

```sql
-- Create a notice for specific departments (AI&DS and CSE) using department IDs
INSERT INTO notices (
    title, content, type, scope,
    target_departments, created_by
) VALUES (
    'Machine Learning Workshop',
    'Special workshop on ML algorithms for AI&DS and CSE students.',
    'important',
    'GLOBAL',
    ARRAY[
        (SELECT id FROM departments WHERE code = 'AI&DS'),
        (SELECT id FROM departments WHERE code = 'CSE')
    ],
    $1 -- creator user_id
);

-- Create a notice for specific roles (only students)
INSERT INTO notices (
    title, content, type, scope,
    target_roles, created_by
) VALUES (
    'Student Council Elections',
    'Voting for student council elections starts next week.',
    'important',
    'GLOBAL',
    ARRAY['STUDENT'],
    $1
);

-- Create a notice for multiple years (1st and 2nd year students)
INSERT INTO notices (
    title, content, type, scope,
    target_years, target_roles, created_by
) VALUES (
    'Freshman Orientation Program',
    'Important orientation program for all 1st and 2nd year students.',
    'important',
    'GLOBAL',
    ARRAY['1st', '2nd'],
    ARRAY['STUDENT'],
    $1
);

-- Create a notice for faculty in multiple departments
INSERT INTO notices (
    title, content, type, scope,
    target_departments, target_roles, created_by
) VALUES (
    'Faculty Meeting - Academic Committee',
    'Important meeting for all faculty members in engineering departments.',
    'important',
    'GLOBAL',
    ARRAY[
        (SELECT id FROM departments WHERE code = 'CSE'),
        (SELECT id FROM departments WHERE code = 'EE'),
        (SELECT id FROM departments WHERE code = 'ME')
    ],
    ARRAY['FACULTY', 'HOD'],
    $1
);

-- Create a global notice for all B.Tech students
INSERT INTO notices (
    title, content, type, scope,
    target_years, target_roles, created_by
) VALUES (
    'Placement Drive Registration',
    'Registration open for campus placement drive.',
    'important',
    'GLOBAL',
    ARRAY['B. Tech'],
    ARRAY['STUDENT'],
    $1
);
````

### 8. Targeted Form Creation Examples

```sql
-- Create a form for specific departments (AI&DS and CSE students only)
INSERT INTO forms (
    title, description, created_by,
    target_departments, target_roles,
    status, deadline, form_data
) VALUES (
    'Internship Application Form',
    'Summer internship application for AI&DS and CSE students.',
    $1, -- creator user_id
    ARRAY[
        (SELECT id FROM departments WHERE code = 'AI&DS'),
        (SELECT id FROM departments WHERE code = 'CSE')
    ],
    ARRAY['STUDENT'],
    'ACTIVE',
    '2025-12-31 23:59:59'::timestamp with time zone,
    '{"fields": [{"name": "company_name", "type": "text", "required": true}]}'::jsonb
);

-- Create a form for multiple years (1st and 2nd year students)
INSERT INTO forms (
    title, description, created_by,
    target_years, target_roles,
    status, deadline, form_data
) VALUES (
    'Course Feedback Form',
    'Semester course feedback for junior students.',
    $1,
    ARRAY['1st', '2nd'],
    ARRAY['STUDENT'],
    'ACTIVE',
    '2025-11-30 23:59:59'::timestamp with time zone,
    '{"fields": [{"name": "course_rating", "type": "number", "required": true}]}'::jsonb
);

-- Create a form for faculty in engineering departments
INSERT INTO forms (
    title, description, created_by,
    target_departments, target_roles,
    status, deadline, form_data
) VALUES (
    'Faculty Research Proposal',
    'Annual research proposal submission for engineering faculty.',
    $1,
    ARRAY[
        (SELECT id FROM departments WHERE code = 'CSE'),
        (SELECT id FROM departments WHERE code = 'EE'),
        (SELECT id FROM departments WHERE code = 'ME')
    ],
    ARRAY['FACULTY'],
    'ACTIVE',
    '2026-01-15 23:59:59'::timestamp with time zone,
    '{"fields": [{"name": "research_title", "type": "text", "required": true}]}'::jsonb
);

-- Create a global form for all B.Tech students
INSERT INTO forms (
    title, description, created_by,
    target_years, target_roles,
    status, deadline, form_data
) VALUES (
    'Student Council Election Nomination',
    'Nomination form for student council elections.',
    $1,
    ARRAY['B. Tech'],
    ARRAY['STUDENT'],
    'ACTIVE',
    '2025-12-15 23:59:59'::timestamp with time zone,
    '{"fields": [{"name": "candidate_name", "type": "text", "required": true}]}'::jsonb
);
```

---

## Production Deployment Guidelines

### 1. Environment Setup

```sql
-- Create database and enable extensions
CREATE DATABASE campus_hub_production;
\c campus_hub_production;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 2. Performance Optimization

```sql
-- Add essential indexes for production
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY idx_users_department ON users(department);
CREATE INDEX CONCURRENTLY idx_notices_published_at ON notices(published_at DESC);
CREATE INDEX CONCURRENTLY idx_notices_scope ON notices(scope);
CREATE INDEX CONCURRENTLY idx_applications_status ON applications(status);
CREATE INDEX CONCURRENTLY idx_applications_submitted_by ON applications(submitted_by);
CREATE INDEX CONCURRENTLY idx_timetable_day_time ON timetable_slots(day_of_week, time_slot);

-- Notification system indexes (scalable architecture)
CREATE INDEX CONCURRENTLY idx_notification_templates_type ON notification_templates(type);
CREATE INDEX CONCURRENTLY idx_notification_templates_source ON notification_templates(source_type, source_id);
CREATE INDEX CONCURRENTLY idx_notification_templates_created ON notification_templates(created_at DESC);
CREATE INDEX CONCURRENTLY idx_notification_templates_expires ON notification_templates(expires_at);
CREATE INDEX CONCURRENTLY idx_notification_templates_priority ON notification_templates(priority DESC);
CREATE INDEX CONCURRENTLY idx_notification_templates_target_roles ON notification_templates USING GIN(target_roles);
CREATE INDEX CONCURRENTLY idx_notification_templates_target_departments ON notification_templates USING GIN(target_departments);
CREATE INDEX CONCURRENTLY idx_notification_templates_target_years ON notification_templates USING GIN(target_years);
CREATE INDEX CONCURRENTLY idx_notification_templates_target_users ON notification_templates USING GIN(target_users);
CREATE INDEX CONCURRENTLY idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX CONCURRENTLY idx_user_notifications_template ON user_notifications(template_id);
CREATE INDEX CONCURRENTLY idx_user_notifications_unread ON user_notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX CONCURRENTLY idx_user_notifications_delivered ON user_notifications(delivered_at DESC);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_notice_reads_notice_user ON notice_reads(notice_id, user_id);
CREATE INDEX CONCURRENTLY idx_form_submissions_form_user ON form_submissions(form_id, submitted_by);
```

### 3. Database Security

```sql
-- Create application user with limited permissions
CREATE USER campus_hub_app WITH PASSWORD 'secure_password_here';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE campus_hub_production TO campus_hub_app;
GRANT USAGE ON SCHEMA public TO campus_hub_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO campus_hub_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO campus_hub_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM campus_hub_app;
```

### 4. Backup Strategy

```bash
# Daily backup script
pg_dump -h localhost -U postgres -d campus_hub_production \
  --format=custom --compress=9 \
  --file=/backup/campus_hub_$(date +%Y%m%d).dump

# Point-in-time recovery setup
# Enable WAL archiving in postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /backup/wal_archive/%f'
```

### 5. Monitoring Queries

```sql
-- Check database size and table stats
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Monitor slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### 6. Data Validation Rules

```sql
-- Add check constraints for data integrity
ALTER TABLE users ADD CONSTRAINT chk_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE profiles ADD CONSTRAINT chk_cgpa_range
CHECK (cgpa >= 0.0 AND cgpa <= 10.0);

ALTER TABLE timetable_slots ADD CONSTRAINT chk_valid_day
CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'));
```

---

## Migration Notes

### From Development to Production

1. **Schema Deployment**: Run migration files in order
2. **Data Seeding**: Import initial departments, admin users
3. **Index Creation**: Create indexes after data import for better performance
4. **Function Deployment**: Deploy all stored functions and triggers
5. **Permission Setup**: Configure database users and permissions
6. **Backup Configuration**: Set up automated backup system

### Version Control

- Use numbered migration files: `001_initial_schema.sql`, `002_add_indexes.sql`
- Always include rollback scripts
- Test migrations on staging environment first
- Document all schema changes in this file

---

    JOIN users u ON u.id = p_user_id
    WHERE ts.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
    AND ts.department_id = (SELECT id FROM departments WHERE name = u.department)
    AND ts.year = u.year
    AND ts.is_active = true
    ORDER BY ts.start_time;

END;

$$
LANGUAGE plpgsql;
```

### 3. Auto-update Functions

Trigger functions for maintaining data consistency

```sql
-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$

BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

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

### 4. Notification System Queries

#### Get User's Unread Notifications (for badge count)

```sql
-- Get unread notification count for user
SELECT COUNT(*) as unread_count
FROM user_notifications un
JOIN notification_templates nt ON un.template_id = nt.id
WHERE un.user_id = $1
  AND un.read_at IS NULL
  AND un.dismissed_at IS NULL
  AND (nt.expires_at IS NULL OR nt.expires_at > NOW());
```

#### Get User's Notification Feed

```sql
-- Get user's notification feed with rich data
SELECT
    un.id as notification_id,
    nt.title,
    nt.body,
    nt.type,
    nt.action_url,
    nt.priority,
    nt.source_type,
    nt.source_id,
    un.read_at IS NULL as is_unread,
    un.clicked_at IS NOT NULL as is_clicked,
    nt.created_at
FROM user_notifications un
JOIN notification_templates nt ON un.template_id = nt.id
WHERE un.user_id = $1
  AND un.dismissed_at IS NULL
  AND (nt.expires_at IS NULL OR nt.expires_at > NOW())
ORDER BY nt.priority DESC, nt.created_at DESC
LIMIT 20;
```

#### Create Notification Template (Backend)

```sql
-- Create notification template for new notice
INSERT INTO notification_templates (
    title, body, type, source_type, source_id,
    target_roles, target_departments, target_years,
    action_url, priority, created_by
) VALUES (
    'New Notice: ' || $1, -- notice title
    'A new notice has been published: ' || SUBSTRING($2, 1, 100) || '...', -- notice content preview
    'NOTICE',
    'notice',
    $3, -- notice_id
    ARRAY['STUDENT']::user_role[],
    ARRAY[$4]::UUID[], -- department_ids
    ARRAY['B. Tech', 'M. Tech']::VARCHAR(20)[],
    '/notices/' || $3, -- action URL
    1, -- high priority
    $5 -- created_by user_id
);
```

#### Fan Out Notifications to Users (Background Job)

```sql
-- Fan out notification template to targeted users
WITH targeted_users AS (
    SELECT DISTINCT u.id as user_id
    FROM users u
    JOIN notification_templates nt ON nt.id = $1 -- template_id
    WHERE (
        -- Target specific users
        (nt.target_users IS NOT NULL AND u.id = ANY(nt.target_users)) OR
        -- Target by role
        (nt.target_roles IS NOT NULL AND u.role = ANY(nt.target_roles)) OR
        -- Target by department
        (nt.target_departments IS NOT NULL AND EXISTS (
            SELECT 1 FROM departments d
            WHERE d.name = u.department AND d.id = ANY(nt.target_departments)
        )) OR
        -- Target by year
        (nt.target_years IS NOT NULL AND u.year = ANY(nt.target_years))
    )
    AND u.is_active = true
)
INSERT INTO user_notifications (user_id, template_id)
SELECT user_id, $1
FROM targeted_users
ON CONFLICT (user_id, template_id) DO NOTHING;
```

#### Mark Notification as Read

```sql
-- Mark specific notification as read
UPDATE user_notifications
SET read_at = NOW()
WHERE id = $1 AND user_id = $2;

-- Mark all notifications as read for user
UPDATE user_notifications
SET read_at = NOW()
WHERE user_id = $1 AND read_at IS NULL;
```

#### Get Notice Analytics (Admin)

```sql
-- Get notice read statistics
SELECT
    n.title,
    COUNT(DISTINCT un.user_id) as targeted_users,
    COUNT(DISTINCT CASE WHEN un.read_at IS NOT NULL THEN un.user_id END) as notification_reads,
    COUNT(DISTINCT nr.user_id) as actual_notice_reads,
    ROUND(
        (COUNT(DISTINCT nr.user_id)::DECIMAL / NULLIF(COUNT(DISTINCT un.user_id), 0)) * 100,
        2
    ) as read_percentage
FROM notices n
JOIN notification_templates nt ON nt.source_id = n.id AND nt.source_type = 'notice'
LEFT JOIN user_notifications un ON un.template_id = nt.id
LEFT JOIN notice_reads nr ON nr.notice_id = n.id
WHERE n.id = $1
GROUP BY n.id, n.title;
```

---

## Migration Strategy

### Phase 1: Core Tables

1. Users and Departments
2. User Sessions
3. Basic authentication setup

### Phase 2: Content Management

1. Notices and Notice Reads
2. Notification Templates and User Notifications (Scalable System)
3. Basic content delivery with smart notifications

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
$$
