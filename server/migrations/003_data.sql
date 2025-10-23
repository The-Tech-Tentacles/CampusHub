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
-- =============================================
-- DATA MIGRATION HELPERS
-- =============================================
-- These queries help migrate existing string-based data to foreign key relationships
-- Run these ONLY if you have existing users with department/year string values
-- Migrate existing department data to department_id
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