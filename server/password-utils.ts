import bcrypt from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt hashing
 * Higher is more secure but slower
 */
const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password
 * @param password The plain text password to hash
 * @returns Promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hash
 * @param plainTextPassword The plain text password to check
 * @param hashedPassword The hash to compare against
 * @returns Promise that resolves to true if the password matches, false otherwise
 */
export async function comparePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}