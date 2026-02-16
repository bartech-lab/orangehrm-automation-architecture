export enum Department {
  ENGINEERING = 'Engineering',
  SALES = 'Sales',
  MARKETING = 'Marketing',
  HR = 'Human Resources',
  FINANCE = 'Finance',
  OPERATIONS = 'Operations',
  PRODUCT = 'Product',
  DESIGN = 'Design',
  LEGAL = 'Legal',
  CUSTOMER_SUCCESS = 'Customer Success',
}

export enum EmploymentStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TERMINATED = 'Terminated',
  PROBATION = 'On Probation',
  SUSPENDED = 'Suspended',
}

export interface Employee {
  readonly id: string;
  readonly employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  department: Department;
  jobTitle: string;
  employmentStatus: EmploymentStatus;
  hireDate: Date;
  terminationDate?: Date;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  nationality?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  supervisorId?: string;
  supervisorName?: string;
  subordinates?: string[];
  salary?: {
    amount: number;
    currency: string;
    frequency: 'Hourly' | 'Monthly' | 'Yearly';
  };
  workLocation?: 'Onsite' | 'Remote' | 'Hybrid';
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSearchFilters {
  department?: Department;
  employmentStatus?: EmploymentStatus;
  jobTitle?: string;
  supervisorId?: string;
  nameQuery?: string;
  includeInactive?: boolean;
}

export interface EmployeeSummary {
  readonly id: string;
  fullName: string;
  jobTitle: string;
  department: Department;
  employmentStatus: EmploymentStatus;
}

export type Gender = 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';

export interface EmployeeContact {
  type: 'email' | 'phone' | 'address';
  value: string;
  isPrimary: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Dependent {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: Date;
}

export interface JobDetails {
  jobTitle: string;
  jobDescription?: string;
  employmentStatus: EmploymentStatus;
  department: Department;
  location?: string;
  startDate: Date;
  endDate?: Date;
}

export interface SalaryComponent {
  name: string;
  amount: number;
  currency: string;
  frequency: 'Hourly' | 'Monthly' | 'Yearly';
  isTaxable: boolean;
}
