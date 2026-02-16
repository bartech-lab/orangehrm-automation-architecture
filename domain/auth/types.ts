export enum UserRole {
  ADMIN = 'Admin',
  HR_MANAGER = 'HR Manager',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
  RECRUITER = 'Recruiter',
  PAYROLL_ADMIN = 'Payroll Admin',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  LOCKED = 'Locked',
  EXPIRED = 'Expired',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export enum Role {
  ADMIN = 'Admin',
  HR_MANAGER = 'HR Manager',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
  RECRUITER = 'Recruiter',
  PAYROLL_ADMIN = 'Payroll Admin',
}

export interface Credentials {
  username: string;
  password: string;
}

export type UserCredentials = Credentials;

export interface User {
  readonly id: string;
  username: string;
  email: string;
  roles: UserRole[];
  employeeId?: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedUser {
  readonly id: string;
  username: string;
  email: string;
  roles: UserRole[];
  employeeId?: string;
  firstName: string;
  lastName: string;
  permissions: Permission[];
  sessionToken?: string;
  expiresAt?: Date;
  lastLoginAt?: Date;
}

export interface AuthSession {
  readonly id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface Permission {
  resource: string;
  action: PermissionAction;
  scope: 'own' | 'department' | 'organization';
}

export interface LoginAttempt {
  username: string;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAgeDays?: number;
  preventReuseCount?: number;
}

export class AuthValidator {
  static validateUsername(username: string): boolean {
    const minLength = 3;
    const maxLength = 50;
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    return (
      username.length >= minLength &&
      username.length <= maxLength &&
      validPattern.test(username)
    );
  }

  static validatePassword(password: string, policy: PasswordPolicy): boolean {
    if (password.length < policy.minLength) return false;
    if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
    if (policy.requireNumbers && !/[0-9]/.test(password)) return false;
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false;
    }
    return true;
  }

  static hasPermission(
    user: AuthenticatedUser,
    resource: string,
    action: PermissionAction
  ): boolean {
    return user.permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  }

  static isSessionValid(user: AuthenticatedUser): boolean {
    if (!user.expiresAt) return true;
    return new Date() < user.expiresAt;
  }
}
