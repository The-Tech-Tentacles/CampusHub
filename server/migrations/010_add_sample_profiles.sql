-- Migration: Add sample profile data for testing
-- Purpose: Insert comprehensive profile information for existing users
-- Date: 2024-12-04
-- Sample profile for student user (assuming user ID exists from seed data)
-- Replace the user_id UUID with actual user ID from your database
-- Sample Profile 1: Student Profile
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
        skills
    )
SELECT u.id as 'd2c77299-9d21-4d12-9789-8d2dd659b2c5',
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
    'KCT\'s School, Karad' as previous_education,
    'Santosh Yadav' as guardian_name,
    '+91 7410140780' as guardian_contact,
    'santoshyadav@email.com' as guardian_email,
    'Father' as guardian_relation,
    'Farming' as guardian_occupation,
    '{"github": "johndoe", "linkedin": "john-doe-dev", "portfolio": "https://johndoe.dev"}'::jsonb as social_links,
    ARRAY ['React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX Design'] as skills
FROM users u
WHERE u.role = 'STUDENT'
    AND NOT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.user_id = u.id
    )
LIMIT 1;
-- Sample Profile 2: Faculty Profile
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
        skills
    )
SELECT 46cbf487-a2f8-4fb3-b877-fdf9fdb46c24 as user_id,
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
    ARRAY ['Python', 'TensorFlow', 'PyTorch', 'Research', 'Teaching'] as skills
FROM users u
WHERE u.role = 'FACULTY'
    AND NOT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.user_id = u.id
    )
LIMIT 1;
-- Sample Profile 3: HOD Profile
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
        skills
    )
SELECT u.id as user_id,
    'Prof.' as prefix,
    '1975-08-15' as date_of_birth,
    'MALE' as gender,
    'B+' as blood_group,
    'michael.chen.personal@gmail.com' as alt_email,
    'Faculty Quarter 1, Campus' as address,
    '789 Academic Drive, University Town - 110003' as permanent_address,
    'Professor and Head of Department with extensive experience in computer science education and research. Leading the department towards excellence in teaching and innovation.' as bio,
    'Monday-Friday: 10:00 AM - 12:00 PM (By Appointment)' as office_hours,
    ARRAY ['Computer Networks', 'Distributed Systems', 'Cloud Computing', 'Software Engineering'] as research_interests,
    ARRAY ['Ph.D. in Computer Science, UC Berkeley', 'M.S. in Computer Engineering, Stanford', 'B.Tech in CSE, IIT Bombay'] as qualifications,
    20 as experience_years,
    '{"linkedin": "prof-michael-chen", "scholar": "michael-chen-cs"}'::jsonb as social_links,
    ARRAY ['Leadership', 'Research', 'Cloud Architecture', 'Software Engineering'] as skills
FROM users u
WHERE u.role = 'HOD'
    AND NOT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.user_id = u.id
    )
LIMIT 1;
-- Update mentor_id for student profile (assign a faculty member as mentor)
UPDATE profiles
SET mentor_id = (
        SELECT u.id
        FROM users u
        WHERE u.role = 'FACULTY'
        LIMIT 1
    )
WHERE user_id IN (
        SELECT u.id
        FROM users u
        WHERE u.role = 'STUDENT'
    )
    AND mentor_id IS NULL;
-- Add comment
COMMENT ON TABLE profiles IS 'Comprehensive profile information for all users including students, faculty, and staff';
COMMENT ON COLUMN profiles.mentor_id IS 'Reference to faculty member assigned as mentor for students';
COMMENT ON COLUMN profiles.social_links IS 'JSON object containing social media links (github, linkedin, portfolio, etc.)';
COMMENT ON COLUMN profiles.skills IS 'Array of skills and competencies';