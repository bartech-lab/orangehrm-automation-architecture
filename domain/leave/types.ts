export enum LeaveType {
  ANNUAL = 'Annual Leave',
  SICK = 'Sick Leave',
  PERSONAL = 'Personal Leave',
  MATERNITY = 'Maternity Leave',
  PATERNITY = 'Paternity Leave',
  BEREAVEMENT = 'Bereavement Leave',
  UNPAID = 'Unpaid Leave',
  COMPASSIONATE = 'Compassionate Leave',
  STUDY = 'Study Leave',
  COMPENSATORY = 'Compensatory Leave',
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
  TAKEN = 'Taken',
  EXPIRED = 'Expired',
}

export interface LeaveRequest {
  readonly id: string;
  employeeId: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason: string;
  comments?: string;
  attachments?: string[];
  approverId?: string;
  approverName?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  requestedAt: Date;
  updatedAt: Date;
  isHalfDay?: boolean;
  halfDayType?: 'Morning' | 'Afternoon';
}

export interface LeaveBalance {
  readonly employeeId: string;
  leaveType: LeaveType;
  entitlementDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveRequestFilters {
  employeeId?: string;
  leaveType?: LeaveType;
  status?: LeaveStatus;
  startDateFrom?: Date;
  startDateTo?: Date;
  approverId?: string;
}

export interface LeaveEntitlement {
  readonly id: string;
  employeeId: string;
  leaveType: LeaveType;
  entitledDays: number;
  year: number;
  validFrom: Date;
  validTo: Date;
  carriedOverDays?: number;

}

export interface LeavePeriod {
  startDate: Date;
  endDate: Date;
  duration: number;
  isHalfDay: boolean;
  halfDayType?: 'Morning' | 'Afternoon';
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  recurring: boolean;
  description?: string;
}

export interface WorkWeek {
  monday: WorkDayType;
  tuesday: WorkDayType;
  wednesday: WorkDayType;
  thursday: WorkDayType;
  friday: WorkDayType;
  saturday: WorkDayType;
  sunday: WorkDayType;
}

export interface LeaveAssignment {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  effectiveDate: Date;
  entitledDays: number;
}

export enum PartialDayType {
  NONE = 'None',
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  SPECIFY_TIME = 'Specify Time',
}

export enum LeaveDuration {
  FULL_DAY = 'Full Day',
  HALF_DAY = 'Half Day',
  SPECIFY_TIME = 'Specify Time',
}

export enum WorkDayType {
  WORKING_DAY = 'Working Day',
  NON_WORKING_DAY = 'Non-Working Day',
  HALF_DAY = 'Half Day',
}

export class LeaveRequestCalculator {
  static calculateBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }

  static calculateDuration(
    startDate: Date,
    endDate: Date,
    isHalfDay?: boolean
  ): number {
    const businessDays = this.calculateBusinessDays(startDate, endDate);
    return isHalfDay ? 0.5 : businessDays;
  }

  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  static isFutureDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  static canBeCancelled(request: LeaveRequest): boolean {
    const nonCancellableStatuses: LeaveStatus[] = [
      LeaveStatus.TAKEN,
      LeaveStatus.EXPIRED,
      LeaveStatus.CANCELLED,
    ];
    return !nonCancellableStatuses.includes(request.status);
  }

  static canBeApproved(request: LeaveRequest): boolean {
    return request.status === LeaveStatus.PENDING;
  }

  static calculateRemainingBalance(
    entitlement: LeaveEntitlement,
    usedDays: number,
    pendingDays: number
  ): number {
    const totalAvailable =
      entitlement.entitledDays + (entitlement.carriedOverDays || 0);
    return totalAvailable - usedDays - pendingDays;
  }
}
