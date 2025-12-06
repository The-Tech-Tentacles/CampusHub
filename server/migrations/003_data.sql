-- ACADEMIC YEARS SAMPLE DATA
-- =============================================
INSERT INTO academic_years (name, code, level, sequence_order)
VALUES -- Undergraduate Years
    ('1st Year', '1ST', 'UNDERGRADUATE', 1),
    ('2nd Year', '2ND', 'UNDERGRADUATE', 2),
    ('3rd Year', '3RD', 'UNDERGRADUATE', 3),
    ('B. Tech', '4TH', 'UNDERGRADUATE', 4),
    -- Postgraduate Years
    ('1st Year M.Tech', 'M1ST', 'POSTGRADUATE', 5),
    ('2nd Year M.Tech', 'M2ND', 'POSTGRADUATE', 6),
    -- Diploma Years
    ('1st Year Diploma', 'D1ST', 'DIPLOMA', 7),
    ('2nd Year Diploma', 'D2ND', 'DIPLOMA', 8),
    ('3rd Year Diploma', 'D3RD', 'DIPLOMA', 9),
    -- Certificate Programs
    ('Certificate Program', 'CERT', 'CERTIFICATE', 10) ON CONFLICT (code) DO NOTHING;
-- Insert sample departments
INSERT INTO departments (name, code, description)
VALUES (
        'Computer Science & Engineering',
        'CSE',
        'Department of Computer Science & Engineering'
    ),
    (
        'Artificial Intelligence and Data Science',
        'AI&DS',
        'Department of Artificial Intelligence and Data Science'
    ),
    (
        'IOT and Cyber Security(CSE)',
        'IOT-CS',
        'Department of IOT and Cyber Security(CSE)'
    ),
    (
        'Electrical Engineering',
        'EE',
        'Department of Electrical Engineering'
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
    ) ON CONFLICT (code) DO NOTHING;
-- Insert default users (password: password123 for all) with foreign key relationships
INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        department_id,
        academic_year_id,
        enrollment_number,
        employee_id,
        is_active
    )
VALUES (
        'Student',
        'student@adcet.ac.in',
        '$2a$12$rQv8W6gxfJ.TzeLG8QY8v.tq6h1QZH3K8QZ5J8QY8v.tq6h1QZH3K8',
        'STUDENT',
        (
            SELECT id
            FROM departments
            WHERE code = 'AI&DS'
        ),
        (
            SELECT id
            FROM academic_years
            WHERE code = '4TH'
        ),
        '10220910xx',
        NULL,
        true
    ),
    (
        'Faculty',
        'faculty@adcet.ac.in',
        '$2a$12$rQv8W6gxfJ.TzeLG8QY8v.tq6h1QZH3K8QZ5J8QY8v.tq6h1QZH3K8',
        'FACULTY',
        (
            SELECT id
            FROM departments
            WHERE code = 'AI&DS'
        ),
        NULL,
        NULL,
        'FAC001',
        true
    ),
    (
        'Hod',
        'hod@adcet.ac.in',
        '$2a$12$rQv8W6gxfJ.TzeLG8QY8v.tq6h1QZH3K8QZ5J8QY8v.tq6h1QZH3K8',
        'HOD',
        (
            SELECT id
            FROM departments
            WHERE code = 'AI&DS'
        ),
        NULL,
        NULL,
        'HOD001',
        true
    ),
    (
        'Dean',
        'dean@adcet.ac.in',
        '$2a$12$rQv8W6gxfJ.TzeLG8QY8v.tq6h1QZH3K8QZ5J8QY8v.tq6h1QZH3K8',
        'DEAN',
        (
            SELECT id
            FROM departments
            WHERE code = 'CSE'
        ),
        NULL,
        NULL,
        'DEAN001',
        true
    ),
    (
        'Admin',
        'admin@adcet.ac.in',
        '$2a$12$rQv8W6gxfJ.TzeLG8QY8v.tq6h1QZH3K8QZ5J8QY8v.tq6h1QZH3K8',
        'ADMIN',
        NULL,
        NULL,
        NULL,
        'ADM001',
        true
    ) ON CONFLICT (email) DO NOTHING;
-- Insert sample student profile (for John Doe)
INSERT INTO student_profiles (
        user_id,
        section,
        semester,
        cgpa,
        batch,
        roll_number,
        specialization,
        date_of_birth,
        blood_group,
        alt_email,
        address,
        permanent_address,
        guardian_name,
        guardian_contact,
        guardian_email,
        guardian_relation,
        guardian_occupation,
        previous_education,
        admission_date,
        expected_graduation,
        social_links,
        skills,
        achievements,
        hobbies,
        bio
    )
SELECT u.id,
    'A',
    '7',
    8.5,
    '2022-2026',
    '40xx',
    'Full Stack Development',
    '2003-05-15'::DATE,
    'O+',
    'student@gmail.com',
    'College Hostel',
    'Home',
    'Father',
    '+91 1111111111',
    'father@email.com',
    'Father',
    'Software Engineer',
    '12th',
    '2022-11-02'::DATE,
    '2026-06-30'::DATE,
    '{"github": "git", "linkedin": "linkedin", "portfolio": "https://my.dev"}'::JSONB,
    ARRAY ['React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX Design'],
    ARRAY ['Best Project Award 2023', 'Hackathon Winner - TechFest 2024'],
    ARRAY ['Coding', 'Photography', 'Music', 'Gaming'],
    'Passionate computer science student with a love for full-stack development and AI. Always eager to learn new technologies and contribute to open-source projects.'
FROM users u
WHERE u.email = 'student@adcet.ac.in' ON CONFLICT (user_id) DO NOTHING;
-- Set mentor for the student profile
UPDATE student_profiles
SET mentor_id = (
        SELECT u.id
        FROM users u
            JOIN departments d ON u.department_id = d.id
        WHERE u.role = 'FACULTY'
            AND d.code = 'AI&DS'
        LIMIT 1
    )
WHERE user_id = (
        SELECT id
        FROM users
        WHERE email = 'student@adcet.ac.in'
    );
UPDATE users
SET department_id = departments.id
FROM departments
WHERE users.department IS NOT NULL
    AND users.department_id IS NULL
    AND (
        departments.code = UPPER(REPLACE(users.department, ' & ', '&'))
        OR departments.name ILIKE '%' || users.department || '%'
        OR UPPER(users.department) LIKE '%' || UPPER(departments.code) || '%'
        OR (
            users.department ILIKE '%AI%'
            AND departments.code = 'AI&DS'
        )
        OR (
            users.department ILIKE '%CSE%'
            AND departments.code = 'CSE'
        )
        OR (
            users.department ILIKE '%EE%'
            AND departments.code = 'EE'
        )
        OR (
            users.department ILIKE '%ME%'
            AND departments.code = 'ME'
        )
        OR (
            users.department ILIKE '%CE%'
            AND departments.code = 'CE'
        )
    );
-- Migrate existing year data to academic_year_id
UPDATE users
SET academic_year_id = academic_years.id
FROM academic_years
WHERE users.year IS NOT NULL
    AND users.academic_year_id IS NULL
    AND (
        academic_years.name ILIKE '%' || users.year || '%'
        OR academic_years.code ILIKE '%' || users.year || '%'
        OR (
            users.year ~ '^[1-4]'
            AND academic_years.code = users.year || 'ST'
        )
        OR (
            users.year ILIKE '%1st%'
            AND academic_years.code = '1ST'
        )
        OR (
            users.year ILIKE '%2nd%'
            AND academic_years.code = '2ND'
        )
        OR (
            users.year ILIKE '%3rd%'
            AND academic_years.code = '3RD'
        )
        OR (
            users.year ILIKE '%4th%'
            AND academic_years.code = '4TH'
        )
        OR (
            users.year ILIKE '%b.tech%'
            AND academic_years.level = 'UNDERGRADUATE'
        )
        OR (
            users.year ILIKE '%btech%'
            AND academic_years.level = 'UNDERGRADUATE'
        )
        OR (
            users.year ILIKE '%bachelor%'
            AND academic_years.level = 'UNDERGRADUATE'
        )
        OR (
            users.year ILIKE '%m.tech%'
            AND academic_years.level = 'POSTGRADUATE'
        )
        OR (
            users.year ILIKE '%mtech%'
            AND academic_years.level = 'POSTGRADUATE'
        )
        OR (
            users.year ILIKE '%master%'
            AND academic_years.level = 'POSTGRADUATE'
        )
        OR (
            users.year ILIKE '%diploma%'
            AND academic_years.level = 'DIPLOMA'
        )
        OR (
            users.year ILIKE '%certificate%'
            AND academic_years.level = 'CERTIFICATE'
        )
    );
DO $$
DECLARE creator_id UUID;
BEGIN
SELECT id INTO creator_id
FROM users
WHERE role IN ('ADMIN', 'FACULTY')
LIMIT 1;
INSERT INTO notices (
        title,
        content,
        type,
        scope,
        created_by,
        published_at,
        is_active,
        expires_at
    )
VALUES (
        'Emergency: Campus Closure',
        'Due to severe weather conditions...',
        'urgent',
        'GLOBAL',
        creator_id,
        NOW(),
        true,
        NULL
    ),
    (
        'Mid-Semester Exam Schedule',
        'Exam schedule finalized...',
        'important',
        'GLOBAL',
        creator_id,
        NOW() - INTERVAL '1 day',
        true,
        NOW() + INTERVAL '30 days'
    ),
    (
        'Library Hours Extended',
        'Library open 7AM-11PM...',
        'important',
        'GLOBAL',
        creator_id,
        NOW(),
        true,
        NULL
    ),
    (
        'Scholarship Applications Open',
        'Merit scholarships available...',
        'important',
        'GLOBAL',
        creator_id,
        NOW() - INTERVAL '5 days',
        true,
        NOW() + INTERVAL '25 days'
    ),
    (
        'Internship Fair 2025',
        'Google, Microsoft, Apple recruiting...',
        'important',
        'GLOBAL',
        creator_id,
        NOW() - INTERVAL '2 hours',
        true,
        NOW() + INTERVAL '60 days'
    ),
    (
        'Sports Day Registration',
        'Register for sports events...',
        'general',
        'GLOBAL',
        creator_id,
        NOW() - INTERVAL '4 days',
        true,
        NULL
    ),
    (
        'New WiFi Network',
        'CampusNet-5G deployed...',
        'general',
        'GLOBAL',
        creator_id,
        NOW(),
        true,
        NULL
    ),
    (
        'Research Symposium',
        'Submit papers by Feb 10...',
        'general',
        'GLOBAL',
        creator_id,
        NOW() - INTERVAL '6 days',
        true,
        NOW() + INTERVAL '40 days'
    ),
    (
        'Security Alert',
        'New checkpoints active...',
        'urgent',
        'GLOBAL',
        creator_id,
        NOW() - INTERVAL '1 day',
        true,
        NULL
    ),
    (
        'Mental Health Week',
        'Free counseling available...',
        'important',
        'GLOBAL',
        creator_id,
        NOW() - INTERVAL '2 days',
        true,
        NOW() + INTERVAL '20 days'
    );
END $$;
INSERT INTO academic_events (
        id,
        title,
        description,
        type,
        start_date,
        end_date,
        is_holiday,
        link_url,
        target_years,
        target_departments,
        target_roles,
        academic_year,
        semester,
        can_edit,
        created_by,
        created_at,
        updated_at
    )
VALUES -- Semester start
    (
        gen_random_uuid(),
        'Semester 1 Begins - Academic Year 2024-25',
        'First day of classes for Fall semester 2024. All students must report to their respective departments.',
        'SEMESTER_START',
        '2024-08-15',
        '2024-08-15',
        false,
        'https://campushub.edu/academic-calendar',
        NULL,
        NULL,
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        2024,
        1,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- National Holiday
    (
        gen_random_uuid(),
        'Independence Day',
        'National Holiday - Independence Day of India. University will be closed.',
        'HOLIDAY',
        '2024-08-15',
        '2024-08-15',
        true,
        NULL,
        NULL,
        NULL,
        NULL,
        2024,
        1,
        false,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Orientation week
    (
        gen_random_uuid(),
        'Orientation Week for New Students',
        'Welcome and orientation program for first-year students. Includes campus tour, departmental introductions, and student handbook distribution.',
        'ORIENTATION',
        '2024-08-16',
        '2024-08-22',
        false,
        'https://campushub.edu/orientation',
        (
            SELECT ARRAY_AGG(id)
            FROM academic_years
            WHERE code = 'Y1'
        ),
        NULL,
        ARRAY ['STUDENT']::user_role [],
        2024,
        1,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Festival break
    (
        gen_random_uuid(),
        'Diwali Break',
        'Festival holidays for Diwali celebration. Classes will resume on the specified end date.',
        'HOLIDAY',
        CURRENT_DATE + INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '40 days',
        true,
        NULL,
        NULL,
        NULL,
        NULL,
        2024,
        1,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Mid-semester exams
    (
        gen_random_uuid(),
        'Mid-Semester Examination Week',
        'Mid-semester examinations for all courses. Exam schedules will be published department-wise on the portal.',
        'EXAM_WEEK',
        CURRENT_DATE + INTERVAL '50 days',
        CURRENT_DATE + INTERVAL '60 days',
        false,
        'https://campushub.edu/exam-schedule',
        NULL,
        NULL,
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        2024,
        1,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Winter break
    (
        gen_random_uuid(),
        'Winter Break',
        'Winter vacation break. Campus will be closed for instructional activities.',
        'BREAK',
        '2024-12-20',
        '2025-01-05',
        true,
        NULL,
        NULL,
        NULL,
        NULL,
        2024,
        1,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Semester end
    (
        gen_random_uuid(),
        'Semester 1 Ends - Academic Year 2024-25',
        'Last day of classes for Fall semester 2024. Final examinations will begin shortly after.',
        'SEMESTER_END',
        '2025-01-15',
        '2025-01-15',
        false,
        'https://campushub.edu/academic-calendar',
        NULL,
        NULL,
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        2024,
        1,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Semester 2 registration
    (
        gen_random_uuid(),
        'Course Registration for Semester 2',
        'Online course registration window for Spring semester 2025. Students must register through the student portal.',
        'REGISTRATION',
        '2025-01-16',
        '2025-01-25',
        false,
        'https://campushub.edu/registration',
        NULL,
        NULL,
        ARRAY ['STUDENT']::user_role [],
        2024,
        2,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Semester 2 start
    (
        gen_random_uuid(),
        'Semester 2 Begins - Academic Year 2024-25',
        'First day of classes for Spring semester 2025. All students must attend classes as per their registered timetable.',
        'SEMESTER_START',
        '2025-02-01',
        '2025-02-01',
        false,
        'https://campushub.edu/academic-calendar',
        NULL,
        NULL,
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        2024,
        2,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Republic Day
    (
        gen_random_uuid(),
        'Republic Day',
        'National Holiday - Republic Day of India. University will be closed.',
        'HOLIDAY',
        '2025-01-26',
        '2025-01-26',
        true,
        NULL,
        NULL,
        NULL,
        NULL,
        2024,
        2,
        false,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Holi break
    (
        gen_random_uuid(),
        'Holi Festival Break',
        'Festival holidays for Holi celebration.',
        'HOLIDAY',
        '2025-03-14',
        '2025-03-15',
        true,
        NULL,
        NULL,
        NULL,
        NULL,
        2024,
        2,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Mid-sem semester 2
    (
        gen_random_uuid(),
        'Mid-Semester Examination Week - Semester 2',
        'Mid-semester examinations for Spring semester courses.',
        'EXAM_WEEK',
        '2025-04-01',
        '2025-04-10',
        false,
        'https://campushub.edu/exam-schedule',
        NULL,
        NULL,
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        2024,
        2,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Summer internship registration
    (
        gen_random_uuid(),
        'Summer Internship Registration',
        'Registration window for summer internships and industrial training programs.',
        'REGISTRATION',
        '2025-04-15',
        '2025-04-30',
        false,
        'https://campushub.edu/internships',
        (
            SELECT ARRAY_AGG(id)
            FROM academic_years
            WHERE code IN ('Y2', 'Y3')
        ),
        NULL,
        ARRAY ['STUDENT']::user_role [],
        2024,
        2,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Semester 2 end
    (
        gen_random_uuid(),
        'Semester 2 Ends - Academic Year 2024-25',
        'Last day of classes for Spring semester 2025. Final examinations will follow.',
        'SEMESTER_END',
        '2025-05-30',
        '2025-05-30',
        false,
        'https://campushub.edu/academic-calendar',
        NULL,
        NULL,
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        2024,
        2,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Summer break
    (
        gen_random_uuid(),
        'Summer Break',
        'Summer vacation. Campus will reopen for next academic year on the specified date.',
        'BREAK',
        '2025-06-01',
        '2025-07-31',
        true,
        NULL,
        NULL,
        NULL,
        NULL,
        2024,
        2,
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
INSERT INTO events (
        id,
        title,
        description,
        type,
        date,
        start_time,
        end_time,
        location,
        instructor,
        link_url,
        target_years,
        target_departments,
        target_roles,
        is_active,
        created_by,
        created_at,
        updated_at
    )
VALUES -- Global lecture event - All students
    (
        gen_random_uuid(),
        'Introduction to Machine Learning',
        'Comprehensive introduction to ML algorithms, supervised and unsupervised learning, with hands-on examples.',
        'LECTURE',
        CURRENT_DATE + INTERVAL '5 days',
        '10:00:00',
        '11:30:00',
        'Auditorium - Main Block',
        'Dr. Priya Sharma',
        'https://meet.google.com/abc-defg-hij',
        NULL,
        -- All years
        NULL,
        -- All departments
        ARRAY ['STUDENT']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role IN ('FACULTY', 'ADMIN')
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Department-specific workshop
    (
        gen_random_uuid(),
        'Web Development Bootcamp',
        'Intensive 3-hour workshop covering React, Node.js, and full-stack development best practices.',
        'WORKSHOP',
        CURRENT_DATE + INTERVAL '7 days',
        '14:00:00',
        '17:00:00',
        'Computer Lab - Building A',
        'Prof. Rajesh Kumar',
        'https://github.com/campushub/workshop-materials',
        NULL,
        (
            SELECT ARRAY_AGG(id)
            FROM departments
            WHERE code IN ('CSE', 'AI&DS')
        ),
        ARRAY ['STUDENT']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Exam for specific years
    (
        gen_random_uuid(),
        'Mid-Semester Examination',
        'Mid-semester examinations for Data Structures and Algorithms. Students must bring university ID cards.',
        'EXAM',
        CURRENT_DATE + INTERVAL '15 days',
        '09:00:00',
        '12:00:00',
        'Examination Halls A, B, C',
        NULL,
        NULL,
        (
            SELECT ARRAY_AGG(id)
            FROM academic_years
            WHERE code IN ('Y2', 'Y3')
        ),
        NULL,
        ARRAY ['STUDENT']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Guest seminar - open to all
    (
        gen_random_uuid(),
        'Industry Insights: AI in Healthcare',
        'Guest lecture by industry experts on the applications of artificial intelligence in modern healthcare systems.',
        'SEMINAR',
        CURRENT_DATE + INTERVAL '10 days',
        '15:00:00',
        '16:30:00',
        'Seminar Hall - Block B',
        'Dr. Ananya Verma (Apollo Hospitals)',
        'https://campushub.edu/seminars/ai-healthcare',
        NULL,
        NULL,
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Sports event
    (
        gen_random_uuid(),
        'Annual Inter-Department Cricket Tournament',
        'Three-day cricket tournament between all departments. Team registrations close 2 days before the event.',
        'SPORTS',
        CURRENT_DATE + INTERVAL '20 days',
        '08:00:00',
        '18:00:00',
        'University Sports Ground',
        NULL,
        'https://campushub.edu/sports/cricket-tournament',
        NULL,
        NULL,
        ARRAY ['STUDENT']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Cultural event
    (
        gen_random_uuid(),
        'Diwali Celebration & Cultural Night',
        'Traditional Diwali celebration with cultural performances, food stalls, and fireworks display. Open to all staff and students.',
        'CULTURAL',
        CURRENT_DATE + INTERVAL '25 days',
        '18:00:00',
        '22:00:00',
        'Main Campus Grounds',
        NULL,
        'https://campushub.edu/events/diwali-2024',
        NULL,
        NULL,
        NULL,
        -- Open to everyone
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Lab session for specific department
    (
        gen_random_uuid(),
        'Advanced Network Security Lab',
        'Hands-on lab session covering penetration testing, vulnerability assessment, and security hardening techniques.',
        'LAB',
        CURRENT_DATE + INTERVAL '3 days',
        '11:00:00',
        '14:00:00',
        'Security Lab - CS Department',
        'Prof. Amit Singh',
        NULL,
        (
            SELECT ARRAY_AGG(id)
            FROM academic_years
            WHERE code IN ('Y3', 'Y4')
        ),
        (
            SELECT ARRAY_AGG(id)
            FROM departments
            WHERE code = 'CSE'
        ),
        ARRAY ['STUDENT']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Generic upcoming event
    (
        gen_random_uuid(),
        'Career Counseling Session',
        'One-on-one career guidance and placement preparation session. Students can book slots through the portal.',
        'GENERIC',
        CURRENT_DATE + INTERVAL '12 days',
        '10:00:00',
        '16:00:00',
        'Career Development Cell - Block C',
        'Ms. Kavya Reddy',
        'https://campushub.edu/career-counseling',
        NULL,
        NULL,
        ARRAY ['STUDENT']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- Past event (completed)
    (
        gen_random_uuid(),
        'Orientation Day 2024',
        'Welcome and orientation program for newly admitted students.',
        'GENERIC',
        CURRENT_DATE - INTERVAL '30 days',
        '09:00:00',
        '17:00:00',
        'University Auditorium',
        NULL,
        NULL,
        (
            SELECT ARRAY_AGG(id)
            FROM academic_years
            WHERE code = 'Y1'
        ),
        NULL,
        ARRAY ['STUDENT']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP - INTERVAL '35 days',
        CURRENT_TIMESTAMP - INTERVAL '35 days'
    ),
    -- Upcoming workshop for faculty
    (
        gen_random_uuid(),
        'Teaching Methodologies Workshop',
        'Workshop on modern teaching techniques, online assessment tools, and student engagement strategies.',
        'WORKSHOP',
        CURRENT_DATE + INTERVAL '18 days',
        '10:00:00',
        '13:00:00',
        'Faculty Development Center',
        'Dr. Meera Nair',
        NULL,
        NULL,
        NULL,
        ARRAY ['FACULTY', 'HOD', 'DEAN']::user_role [],
        true,
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
INSERT INTO applications (
        id,
        title,
        type,
        description,
        submitted_by,
        department_id,
        status,
        mentor_id,
        mentor_status,
        mentor_notes,
        mentor_reviewed_at,
        hod_status,
        hod_notes,
        dean_status,
        current_level,
        final_decision,
        submitted_at,
        proof_file_url
    )
VALUES -- Pending application (just submitted)
    (
        gen_random_uuid(),
        'Medical Leave Application',
        'Leave Request',
        'Requesting 3 days leave for medical treatment. I have been diagnosed with viral fever and need rest as per doctor recommendation.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'AI&DS'
            LIMIT 1
        ), 'PENDING', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), -- Using ADMIN as mentor
        'PENDING', NULL,
        NULL,
        'PENDING',
        NULL,
        'PENDING',
        'MENTOR',
        'PENDING',
        NOW() - INTERVAL '2 hours',
        '/uploads/medical_certificate.pdf'
    ),
    -- Under Review (Mentor approved, HOD reviewing)
    (
        gen_random_uuid(),
        'Hostel Room Change Request',
        'Accommodation',
        'Request to change hostel room from Block A to Block B due to health reasons. Current room is too far from medical center.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'AI&DS'
            LIMIT 1
        ), 'UNDER_REVIEW', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), 'APPROVED', 'Valid health concern. Recommend approval.', NOW() - INTERVAL '1 day',
        'UNDER_REVIEW',
        NULL,
        'PENDING',
        'HOD',
        'UNDER_REVIEW',
        NOW() - INTERVAL '2 days',
        '/uploads/hostel_request.pdf'
    ),
    -- Approved application (Full workflow completed)
    (
        gen_random_uuid(),
        'Extra Credit Project Submission',
        'Academic',
        'Submission of extra credit project for Database Management course. Project includes full CRUD application with React frontend and Node.js backend.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'CSE'
            LIMIT 1
        ), 'APPROVED', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), 'APPROVED', 'Excellent work on the project. Well-structured code.', NOW() - INTERVAL '3 days',
        'APPROVED',
        'Approved for extra credits. Great implementation.',
        'PENDING',
        'COMPLETED',
        'APPROVED',
        NOW() - INTERVAL '5 days',
        '/uploads/project_report.pdf'
    ),
    -- Rejected by mentor
    (
        gen_random_uuid(),
        'Research Project Extension',
        'Academic',
        'Request for extension of research project deadline due to equipment failure in lab.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'IOT&CS'
            LIMIT 1
        ), 'REJECTED', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), 'REJECTED', 'Alternative equipment was available. Deadline cannot be extended as per university policy.', NOW() - INTERVAL '1 day',
        'PENDING',
        NULL,
        'PENDING',
        'MENTOR',
        'REJECTED',
        NOW() - INTERVAL '2 days',
        '/uploads/equipment_report.pdf'
    ),
    -- Escalated to DEAN
    (
        gen_random_uuid(),
        'Special Permission for Industrial Visit',
        'Event',
        'Request for special permission to organize industrial visit to Tech Park for AI&DS students. Requires Dean approval due to budget constraints.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'AI&DS'
            LIMIT 1
        ), 'ESCALATED', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), 'APPROVED', 'Good initiative. Recommending to HOD.', NOW() - INTERVAL '5 days',
        'APPROVED',
        'Excellent proposal. Escalating to Dean for budget approval.',
        'UNDER_REVIEW',
        'DEAN',
        'ESCALATED',
        NOW() - INTERVAL '7 days',
        '/uploads/visit_proposal.pdf'
    ),
    -- Approved - International Conference
    (
        gen_random_uuid(),
        'Permission for International Conference',
        'Academic',
        'Request for permission and funding to attend IEEE International Conference on AI in Singapore.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'AI&DS'
            LIMIT 1
        ), 'APPROVED', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), 'APPROVED', 'Research paper is accepted. Strong recommendation.', NOW() - INTERVAL '10 days',
        'APPROVED',
        'Approved. Excellent opportunity for student.',
        'PENDING',
        'COMPLETED',
        'APPROVED',
        NOW() - INTERVAL '15 days',
        '/uploads/conference_acceptance.pdf'
    ),
    -- Pending - Sports Event
    (
        gen_random_uuid(),
        'Permission for National Sports Event',
        'Sports',
        'Request to participate in National Level Cricket Tournament. Event dates clash with class schedule.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'CSE'
            LIMIT 1
        ), 'PENDING', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), 'PENDING', NULL,
        NULL,
        'PENDING',
        NULL,
        'PENDING',
        'MENTOR',
        'PENDING',
        NOW() - INTERVAL '5 hours',
        '/uploads/sports_invitation.pdf'
    ),
    -- Under Review - Internship Extension
    (
        gen_random_uuid(),
        'Internship Extension Approval',
        'Academic',
        'Request to extend internship period by 2 weeks. Company is offering full-time conversion opportunity.',
        (
            SELECT id
            FROM users
            WHERE role = 'STUDENT'
            LIMIT 1
        ), (
            SELECT id
            FROM departments
            WHERE code = 'CSE'
            LIMIT 1
        ), 'UNDER_REVIEW', (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), 'APPROVED', 'Good opportunity. Extension recommended.', NOW() - INTERVAL '2 days',
        'UNDER_REVIEW',
        NULL,
        'PENDING',
        'HOD',
        'UNDER_REVIEW',
        NOW() - INTERVAL '3 days',
        '/uploads/internship_letter.pdf'
    );
-- Insert Dummy Forms for Testing
-- Run this after the main schema is set up
-- First, let's get some user IDs to use as form creators
-- These should be faculty, HOD, or admin users
-- Form 1: Course Feedback Form (Active, not expired)
INSERT INTO forms (
        title,
        description,
        created_by,
        deadline,
        form_data,
        status,
        target_roles,
        allow_multiple_submissions,
        requires_approval,
        max_submissions
    )
VALUES (
        'Course Feedback Form - Semester 1',
        'Please provide your feedback on the courses you are enrolled in for this semester. Your feedback helps us improve the quality of education.',
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), NOW() + INTERVAL '30 days',
        '{"fields": [
        {"name": "fullName", "type": "text", "label": "Full Name", "required": true},
        {"name": "email", "type": "email", "label": "Email", "required": true},
        {"name": "course", "type": "text", "label": "Course Name", "required": true},
        {"name": "rating", "type": "number", "label": "Overall Rating (1-5)", "required": true, "min": 1, "max": 5},
        {"name": "feedback", "type": "textarea", "label": "Additional Feedback", "required": false}
    ]}'::jsonb,
        'ACTIVE',
        ARRAY ['STUDENT']::user_role [],
        false,
        false,
        500
    );
-- Form 2: Research Project Proposal (Active, not expired)
INSERT INTO forms (
        title,
        description,
        created_by,
        deadline,
        form_data,
        status,
        target_roles,
        allow_multiple_submissions,
        requires_approval,
        max_submissions
    )
VALUES (
        'Final Year Research Project Proposal',
        'Submit your final year research project proposal for approval. Include detailed information about your project objectives and methodology.',
        (
            SELECT id
            FROM users
            WHERE role = 'FACULTY'
            LIMIT 1
        ), NOW() + INTERVAL '60 days',
        '{"fields": [
        {"name": "fullName", "type": "text", "label": "Student Name", "required": true},
        {"name": "email", "type": "email", "label": "Email", "required": true},
        {"name": "projectTitle", "type": "text", "label": "Project Title", "required": true},
        {"name": "abstract", "type": "textarea", "label": "Project Abstract", "required": true},
        {"name": "supervisor", "type": "text", "label": "Preferred Supervisor", "required": false},
        {"name": "additionalInfo", "type": "textarea", "label": "Additional Information", "required": false}
    ]}'::jsonb,
        'ACTIVE',
        ARRAY ['STUDENT']::user_role [],
        false,
        true,
        50
    );
-- Form 3: Library Book Request (Active, not expired)
INSERT INTO forms (
        title,
        description,
        created_by,
        deadline,
        form_data,
        status,
        target_roles,
        allow_multiple_submissions,
        requires_approval,
        max_submissions
    )
VALUES (
        'Library Book Request Form',
        'Request new books to be added to the library collection. Provide complete details including ISBN if possible.',
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), NOW() + INTERVAL '20 days',
        '{"fields": [
        {"name": "fullName", "type": "text", "label": "Your Name", "required": true},
        {"name": "email", "type": "email", "label": "Email", "required": true},
        {"name": "bookTitle", "type": "text", "label": "Book Title", "required": true},
        {"name": "author", "type": "text", "label": "Author Name", "required": true},
        {"name": "isbn", "type": "text", "label": "ISBN (if known)", "required": false},
        {"name": "additionalInfo", "type": "textarea", "label": "Why this book?", "required": false}
    ]}'::jsonb,
        'ACTIVE',
        ARRAY ['STUDENT', 'FACULTY']::user_role [],
        true,
        false,
        100
    );
-- Form 4: Campus Event Registration (Active, deadline soon)
INSERT INTO forms (
        title,
        description,
        created_by,
        deadline,
        form_data,
        status,
        target_roles,
        allow_multiple_submissions,
        requires_approval,
        max_submissions
    )
VALUES (
        'Annual Tech Fest Registration',
        'Register for the annual tech fest. Limited slots available. Multiple events can be selected.',
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), NOW() + INTERVAL '5 days',
        '{"fields": [
        {"name": "fullName", "type": "text", "label": "Full Name", "required": true},
        {"name": "email", "type": "email", "label": "Email", "required": true},
        {"name": "phone", "type": "text", "label": "Phone Number", "required": true},
        {"name": "events", "type": "text", "label": "Events (comma-separated)", "required": true},
        {"name": "additionalInfo", "type": "textarea", "label": "Team Details", "required": false}
    ]}'::jsonb,
        'ACTIVE',
        ARRAY ['STUDENT']::user_role [],
        false,
        false,
        200
    );
-- Form 5: Expired Form (for testing missed forms)
INSERT INTO forms (
        title,
        description,
        created_by,
        deadline,
        form_data,
        status,
        target_roles,
        allow_multiple_submissions,
        requires_approval,
        max_submissions
    )
VALUES (
        'Alumni Mentorship Program Registration',
        'Register for the alumni mentorship program. This deadline has passed.',
        (
            SELECT id
            FROM users
            WHERE role = 'ADMIN'
            LIMIT 1
        ), NOW() - INTERVAL '10 days',
        '{"fields": [
        {"name": "fullName", "type": "text", "label": "Full Name", "required": true},
        {"name": "email", "type": "email", "label": "Email", "required": true},
        {"name": "careerGoals", "type": "textarea", "label": "Career Goals", "required": true},
        {"name": "additionalInfo", "type": "textarea", "label": "Additional Information", "required": false}
    ]}'::jsonb,
        'ACTIVE',
        ARRAY ['STUDENT']::user_role [],
        false,
        true,
        200
    );
-- Form 6: Another Expired Form
INSERT INTO forms (
        title,
        description,
        created_by,
        deadline,
        form_data,
        status,
        target_roles,
        allow_multiple_submissions,
        requires_approval,
        max_submissions
    )
VALUES (
        'Sports Day Event Registration',
        'Register for various sports events in the annual sports day. Deadline has passed.',
        (
            SELECT id
            FROM users
            WHERE role = 'FACULTY'
            LIMIT 1
        ), NOW() - INTERVAL '5 days',
        '{"fields": [
        {"name": "fullName", "type": "text", "label": "Full Name", "required": true},
        {"name": "email", "type": "email", "label": "Email", "required": true},
        {"name": "sport", "type": "text", "label": "Sport Name", "required": true},
        {"name": "additionalInfo", "type": "textarea", "label": "Additional Details", "required": false}
    ]}'::jsonb,
        'ACTIVE',
        ARRAY ['STUDENT']::user_role [],
        false,
        false,
        400
    );
INSERT INTO profiles (
        user_id,
        prefix,
        date_of_birth,
        gender,
        blood_group,
        alt_email,
        address,
        permanent_address,
        bio,
        section,
        semester,
        cgpa,
        batch,
        roll_number,
        specialization,
        admission_date,
        expected_graduation,
        previous_education,
        guardian_name,
        guardian_contact,
        guardian_email,
        guardian_relation,
        guardian_occupation,
        social_links,
        skills,
        hobbies,
        achievements
    )
SELECT 'd2c77299-9d21-4d12-9789-8d2dd659b2c5' as user_id,
    'Mr.' as prefix,
    '2004-11-19' as date_of_birth,
    'MALE' as gender,
    'B+' as blood_group,
    'rakesh@gmail.com' as alt_email,
    'Room 313, University Hostel' as address,
    'Saidapur, City - karad' as permanent_address,
    'Passionate AI & DS student with a love for full-stack development and AI. Always eager to learn new technologies and contribute to open-source projects.' as bio,
    'A' as section,
    '7' as semester,
    8.50 as cgpa,
    'B1' as batch,
    '4012' as roll_number,
    'Full Stack Development' as specialization,
    '2021-08-15' as admission_date,
    '2025-06-30' as expected_graduation,
    'KCTs School, Karad' as previous_education,
    'Santosh Yadav' as guardian_name,
    '+91 7410140780' as guardian_contact,
    'santoshyadav@email.com' as guardian_email,
    'Father' as guardian_relation,
    'Farming' as guardian_occupation,
    '{"github": "johndoe", "linkedin": "john-doe-dev", "portfolio": "https://johndoe.dev"}'::jsonb as social_links,
    ARRAY ['React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX Design'] as skills,
    ARRAY ['Coding', 'Photography', 'Music', 'Gaming'] as hobbies,
    ARRAY ['Best Project Award 2023', 'Hackathon Winner - TechFest 2024', 'Dean''s List 2023'] as achievements
FROM users u
WHERE u.role = 'STUDENT'
    AND NOT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.user_id = u.id
    )
LIMIT 1;
INSERT INTO profiles (
        user_id,
        prefix,
        date_of_birth,
        gender,
        blood_group,
        alt_email,
        address,
        permanent_address,
        bio,
        office_hours,
        research_interests,
        qualifications,
        experience_years,
        social_links,
        skills,
        hobbies,
        achievements
    )
SELECT '46cbf487-a2f8-4fb3-b877-fdf9fdb46c24' as user_id,
    'Prof.' as prefix,
    '1985-03-20' as date_of_birth,
    'MALE' as gender,
    'A+' as blood_group,
    'am@gmail.com' as alt_email,
    'OS LAB,AI & DS Department, COE Building' as address,
    'Home Town - Ashta' as permanent_address,
    'Associate Professor specializing in Computer Science and AI. Passionate about teaching and research in machine learning and data science.' as bio,
    'Monday-Friday: 9:00 AM - 5:30 PM' as office_hours,
    ARRAY ['Machine Learning', 'Artificial Intelligence', 'Data Science', 'Neural Networks'] as research_interests,
    ARRAY ['Ph.D. in Computer Science, MIT', 'M.S. in AI, Stanford University', 'B.Tech in CSE, IIT Delhi'] as qualifications,
    12 as experience_years,
    '{"linkedin": "am-phd", "researchgate": "am-phd", "scholar": "am-phd"}'::jsonb as social_links,
    ARRAY ['Python', 'TensorFlow', 'PyTorch', 'Research', 'Teaching'] as skills,
    ARRAY ['Reading', 'Chess', 'Mentoring'] as hobbies,
    ARRAY ['Best Teacher Award 2022', 'Published 50+ Research Papers', 'IEEE Fellow'] as achievements
FROM users u
WHERE u.role = 'FACULTY'
    AND NOT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.user_id = u.id
    )
LIMIT 1;