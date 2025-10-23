import bcrypt from 'bcryptjs';

// Password Configuration
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error('Failed to hash password');
    }
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        throw new Error('Failed to compare password');
    }
}

/**
 * Generate a random password (for temporary passwords)
 */
export function generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Minimum length check
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    // Maximum length check
    if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
    }

    // Contains uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Contains lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Contains number
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Contains special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Check if password needs rehashing (if salt rounds changed)
 */
export function needsRehash(hash: string): boolean {
    try {
        const rounds = bcrypt.getRounds(hash);
        return rounds < SALT_ROUNDS;
    } catch (error) {
        return true; // If we can't determine rounds, assume it needs rehashing
    }
}