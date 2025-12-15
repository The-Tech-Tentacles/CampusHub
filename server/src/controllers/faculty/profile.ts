import { Request, Response } from 'express';
import { getDatabase } from '../../config/database.js';
import { users, profiles, departments } from '../../schema/index.js';
import { eq } from 'drizzle-orm';

/**
 * Get faculty profile
 */
export async function getFacultyProfile(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        if (!user?.userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get user data
        const [userData] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!userData) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Get profile data
        const [profileData] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.userId, user.userId))
            .limit(1);

        // Fetch department name
        let departmentName = null;
        if (userData.departmentId) {
            const [dept] = await db
                .select({ name: departments.name })
                .from(departments)
                .where(eq(departments.id, userData.departmentId))
                .limit(1);
            departmentName = dept?.name || null;
        }

        res.json({
            success: true,
            data: {
                // User table fields
                id: userData.id,
                name: userData.name,
                email: userData.email,
                employeeId: userData.employeeId,
                phone: userData.phone,
                avatarUrl: userData.avatarUrl,
                department: departmentName,
                departmentId: userData.departmentId,
                role: userData.role,
                isActive: userData.isActive,

                // Profile table fields
                dateOfBirth: profileData?.dateOfBirth || null,
                bloodGroup: profileData?.bloodGroup || null,
                altEmail: profileData?.altEmail || null,
                address: profileData?.address || null,
                permanentAddress: profileData?.permanentAddress || null,
                socialLinks: profileData?.socialLinks || {},
                skills: profileData?.skills || [],
                achievements: profileData?.achievements || [],
                hobbies: profileData?.hobbies || [],
                bio: profileData?.bio || null,

                // Faculty-specific fields (stored in profiles table)
                prefix: profileData?.prefix || null,
                gender: profileData?.gender || null,
                cabinLocationId: profileData?.cabinLocationId || null,
                officeHours: profileData?.officeHours || null,
                researchInterest: profileData?.researchInterests ? profileData.researchInterests.join(', ') : null,
                qualification: profileData?.qualifications ? profileData.qualifications.join(', ') : null,
                experience: profileData?.experienceYears ? profileData.experienceYears.toString() : null
            }
        });

    } catch (error) {
        console.error('Get faculty profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Update faculty profile
 */
export async function updateFacultyProfile(req: Request, res: Response): Promise<void> {
    try {
        const { db } = getDatabase();
        const user = (req as any).user;

        if (!user?.userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        const {
            name,
            phone,
            employeeId,
            // Profile fields
            dateOfBirth,
            bloodGroup,
            altEmail,
            address,
            permanentAddress,
            socialLinks,
            skills,
            achievements,
            hobbies,
            bio,
            // Faculty-specific fields
            prefix,
            gender,
            cabinLocationId,
            officeHours,
            researchInterest,
            qualification,
            experience
        } = req.body;

        // Get current user data to check for changes
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.userId))
            .limit(1);

        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Update users table only if values have changed
        const userUpdates: any = {};
        if (name && name !== currentUser.name) userUpdates.name = name;
        if (phone && phone !== currentUser.phone) userUpdates.phone = phone;
        if (employeeId && employeeId !== currentUser.employeeId) userUpdates.employeeId = employeeId;

        if (Object.keys(userUpdates).length > 0) {
            console.log('Updating users table:', userUpdates);
            try {
                await db
                    .update(users)
                    .set(userUpdates)
                    .where(eq(users.id, user.userId));
                console.log('Users table updated successfully');
            } catch (error) {
                console.error('Error updating users table:', error);
                throw new Error('Failed to update user information');
            }
        } else {
            console.log('No changes to users table');
        }

        // Check if profile exists
        let existingProfile;
        try {
            [existingProfile] = await db
                .select()
                .from(profiles)
                .where(eq(profiles.userId, user.userId))
                .limit(1);
        } catch (error) {
            console.error('Error checking existing profile:', error);
            throw new Error('Failed to check profile existence');
        }

        // Convert frontend fields to backend schema
        const researchInterestsArray = researchInterest ?
            (typeof researchInterest === 'string' ? researchInterest.split(',').map((s: string) => s.trim()).filter(Boolean) : researchInterest)
            : undefined;
        const qualificationsArray = qualification ?
            (typeof qualification === 'string' ? qualification.split(',').map((s: string) => s.trim()).filter(Boolean) : qualification)
            : undefined;
        const experienceYears = experience ?
            (typeof experience === 'string' ? parseInt(experience) || null : experience)
            : undefined;

        const profileData: any = {};
        if (dateOfBirth !== undefined) profileData.dateOfBirth = dateOfBirth || null;
        if (bloodGroup !== undefined) profileData.bloodGroup = bloodGroup || null;
        if (altEmail !== undefined) profileData.altEmail = altEmail || null;
        if (address !== undefined) profileData.address = address || null;
        if (permanentAddress !== undefined) profileData.permanentAddress = permanentAddress || null;
        if (socialLinks !== undefined) profileData.socialLinks = socialLinks || {};
        if (skills !== undefined) profileData.skills = Array.isArray(skills) ? skills : [];
        if (achievements !== undefined) profileData.achievements = Array.isArray(achievements) ? achievements : [];
        if (hobbies !== undefined) profileData.hobbies = Array.isArray(hobbies) ? hobbies : [];
        if (bio !== undefined) profileData.bio = bio || null;
        if (prefix !== undefined) profileData.prefix = prefix || null;
        if (gender !== undefined) profileData.gender = gender || null;
        // Handle cabin location - ensure empty strings become null
        if (cabinLocationId !== undefined) {
            profileData.cabinLocationId = (cabinLocationId && cabinLocationId.trim().length > 0) ? cabinLocationId : null;
        }
        if (officeHours !== undefined) profileData.officeHours = officeHours || null;
        if (researchInterestsArray !== undefined) profileData.researchInterests = researchInterestsArray;
        if (qualificationsArray !== undefined) profileData.qualifications = qualificationsArray;
        if (experienceYears !== undefined) profileData.experienceYears = experienceYears;

        // Only update if there's actual data to update
        if (Object.keys(profileData).length > 0) {
            console.log('Updating profile with data:', JSON.stringify(profileData, null, 2));
            try {
                if (existingProfile) {
                    // Update existing profile
                    console.log('Updating existing profile for user:', user.userId);
                    await db
                        .update(profiles)
                        .set(profileData)
                        .where(eq(profiles.userId, user.userId));
                } else {
                    // Create new profile
                    console.log('Creating new profile for user:', user.userId);
                    await db
                        .insert(profiles)
                        .values({
                            userId: user.userId,
                            ...profileData
                        });
                }
            } catch (error) {
                console.error('Error updating/inserting profile:', error);
                throw new Error('Failed to update profile data');
            }
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error: any) {
        console.error('Update faculty profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}
