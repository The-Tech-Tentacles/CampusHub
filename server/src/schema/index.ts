// Basic schema export - will be expanded as we add tables
// This file exports all database schema definitions for Drizzle ORM

export * from './users';

// Export all schemas as a combined object
import { users, userRoleEnum } from './users';

export const schemas = {
    users,
    userRoleEnum,
};