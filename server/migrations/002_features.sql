-- Advanced PostgreSQL features for CampusHub
-- GIN indexes for notices table
CREATE INDEX IF NOT EXISTS idx_notices_target_years_gin ON notices USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_notices_target_departments_gin ON notices USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_notices_target_roles_gin ON notices USING GIN(target_roles);
-- GIN indexes for forms table
CREATE INDEX IF NOT EXISTS idx_forms_target_years_gin ON forms USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_forms_target_departments_gin ON forms USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_forms_target_roles_gin ON forms USING GIN(target_roles);
-- GIN indexes for events table (unified - handles both regular and academic events)
CREATE INDEX IF NOT EXISTS idx_events_target_years_gin ON events USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_events_target_departments_gin ON events USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_events_target_roles_gin ON events USING GIN(target_roles);
-- Additional indexes for unified events table
CREATE INDEX IF NOT EXISTS idx_events_category ON events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
-- GIN indexes for notification_templates table
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_roles_gin ON notification_templates USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_departments_gin ON notification_templates USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_years_gin ON notification_templates USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_notification_templates_target_users_gin ON notification_templates USING GIN(target_users);
-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
DROP TRIGGER IF EXISTS update_academic_years_updated_at ON academic_years;
DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON form_submissions;
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
DROP TRIGGER IF EXISTS update_timetable_slots_updated_at ON timetable_slots;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
DROP TRIGGER IF EXISTS update_user_notifications_updated_at ON user_notifications;
-- Create triggers
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
CREATE TRIGGER update_notification_templates_updated_at BEFORE
UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notifications_updated_at BEFORE
UPDATE ON user_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();