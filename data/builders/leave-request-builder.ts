import { faker } from '@faker-js/faker';
import {
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  LeaveBalance,
  LeaveEntitlement,
  LeaveRequestCalculator,
} from '../../domain/leave/types';

type WritableLeaveRequest = {
  -readonly [K in keyof LeaveRequest]: LeaveRequest[K];
};

type WritableLeaveBalance = {
  -readonly [K in keyof LeaveBalance]: LeaveBalance[K];
};

type WritableLeaveEntitlement = {
  -readonly [K in keyof LeaveEntitlement]: LeaveEntitlement[K];
};

export class LeaveRequestBuilder {
  private leaveRequest: Partial<WritableLeaveRequest> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.leaveRequest = {};
  }

  withId(id: string): LeaveRequestBuilder {
    this.leaveRequest.id = id;
    return this;
  }

  withEmployeeId(employeeId: string): LeaveRequestBuilder {
    this.leaveRequest.employeeId = employeeId;
    return this;
  }

  withLeaveType(leaveType: LeaveType): LeaveRequestBuilder {
    this.leaveRequest.leaveType = leaveType;
    return this;
  }

  withStatus(status: LeaveStatus): LeaveRequestBuilder {
    this.leaveRequest.status = status;
    return this;
  }

  withStartDate(startDate: Date): LeaveRequestBuilder {
    this.leaveRequest.startDate = startDate;
    return this;
  }

  withEndDate(endDate: Date): LeaveRequestBuilder {
    this.leaveRequest.endDate = endDate;
    return this;
  }

  withDaysRequested(days: number): LeaveRequestBuilder {
    this.leaveRequest.daysRequested = days;
    return this;
  }

  withReason(reason: string): LeaveRequestBuilder {
    this.leaveRequest.reason = reason;
    return this;
  }

  withComments(comments: string): LeaveRequestBuilder {
    this.leaveRequest.comments = comments;
    return this;
  }

  withAttachments(attachments: string[]): LeaveRequestBuilder {
    this.leaveRequest.attachments = attachments;
    return this;
  }

  withApprover(approverId: string, approverName: string): LeaveRequestBuilder {
    this.leaveRequest.approverId = approverId;
    this.leaveRequest.approverName = approverName;
    return this;
  }

  withApprovalDate(approvalDate: Date): LeaveRequestBuilder {
    this.leaveRequest.approvalDate = approvalDate;
    return this;
  }

  withRejectionReason(reason: string): LeaveRequestBuilder {
    this.leaveRequest.rejectionReason = reason;
    return this;
  }

  asHalfDay(halfDayType: 'Morning' | 'Afternoon'): LeaveRequestBuilder {
    this.leaveRequest.isHalfDay = true;
    this.leaveRequest.halfDayType = halfDayType;
    return this;
  }

  withRandomData(): LeaveRequestBuilder {
    const leaveTypes = Object.values(LeaveType);
    const statuses = Object.values(LeaveStatus);
    const startDate = faker.date.soon({ days: 30 });
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 10 }));
    const status = faker.helpers.arrayElement(statuses);

    this.leaveRequest = {
      id: faker.string.uuid(),
      employeeId: faker.string.uuid(),
      leaveType: faker.helpers.arrayElement(leaveTypes),
      status,
      startDate,
      endDate,
      daysRequested: LeaveRequestCalculator.calculateDuration(startDate, endDate),
      reason: faker.lorem.sentence(),
      comments: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined,
      attachments: faker.datatype.boolean() ? [faker.system.fileName()] : undefined,
      requestedAt: new Date(),
      updatedAt: new Date(),
    };

    if (status === LeaveStatus.REJECTED) {
      this.leaveRequest.rejectionReason = faker.lorem.sentence();
    }

    if (status === LeaveStatus.APPROVED) {
      this.leaveRequest.approverId = faker.string.uuid();
      this.leaveRequest.approverName = faker.person.fullName();
      this.leaveRequest.approvalDate = new Date();
    }

    return this;
  }

  withPendingStatus(): LeaveRequestBuilder {
    this.leaveRequest.status = LeaveStatus.PENDING;
    return this;
  }

  withApprovedStatus(approverId?: string, approverName?: string): LeaveRequestBuilder {
    this.leaveRequest.status = LeaveStatus.APPROVED;
    this.leaveRequest.approverId = approverId || faker.string.uuid();
    this.leaveRequest.approverName = approverName || faker.person.fullName();
    this.leaveRequest.approvalDate = new Date();
    return this;
  }

  withRejectedStatus(reason: string): LeaveRequestBuilder {
    this.leaveRequest.status = LeaveStatus.REJECTED;
    this.leaveRequest.rejectionReason = reason;
    return this;
  }

  validate(): void {
    const requiredFields: Array<keyof LeaveRequest> = [
      'id',
      'employeeId',
      'leaveType',
      'status',
      'startDate',
      'endDate',
      'daysRequested',
      'reason',
      'requestedAt',
      'updatedAt',
    ];

    for (const field of requiredFields) {
      if (this.leaveRequest[field] === undefined || this.leaveRequest[field] === null) {
        throw new Error(`Validation failed: ${field} is required`);
      }
    }

    if (
      this.leaveRequest.startDate! > this.leaveRequest.endDate!
    ) {
      throw new Error('Validation failed: startDate must be before or equal to endDate');
    }

    if (this.leaveRequest.reason!.length < 1) {
      throw new Error('Validation failed: reason cannot be empty');
    }

    if (this.leaveRequest.daysRequested! <= 0) {
      throw new Error('Validation failed: daysRequested must be positive');
    }

    if (this.leaveRequest.status === LeaveStatus.REJECTED && !this.leaveRequest.rejectionReason) {
      throw new Error('Validation failed: rejectionReason is required when status is REJECTED');
    }
  }

  build(): LeaveRequest {
    this.validate();
    const result = this.leaveRequest as LeaveRequest;
    this.reset();
    return result;
  }

  buildMany(count: number): LeaveRequest[] {
    const requests: LeaveRequest[] = [];
    for (let i = 0; i < count; i++) {
      this.withRandomData();
      requests.push(this.build());
    }
    return requests;
  }
}

export class LeaveBalanceBuilder {
  private balance: Partial<WritableLeaveBalance> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.balance = {};
  }

  withEmployeeId(employeeId: string): LeaveBalanceBuilder {
    this.balance.employeeId = employeeId;
    return this;
  }

  withLeaveType(leaveType: LeaveType): LeaveBalanceBuilder {
    this.balance.leaveType = leaveType;
    return this;
  }

  withEntitlementDays(days: number): LeaveBalanceBuilder {
    this.balance.entitlementDays = days;
    return this;
  }

  withUsedDays(days: number): LeaveBalanceBuilder {
    this.balance.usedDays = days;
    return this;
  }

  withPendingDays(days: number): LeaveBalanceBuilder {
    this.balance.pendingDays = days;
    return this;
  }

  forYear(year: number): LeaveBalanceBuilder {
    this.balance.year = year;
    return this;
  }

  withRandomData(): LeaveBalanceBuilder {
    const leaveTypes = Object.values(LeaveType);
    const entitlement = faker.number.int({ min: 10, max: 30 });
    const used = faker.number.int({ min: 0, max: entitlement });
    const pending = faker.number.int({ min: 0, max: entitlement - used });

    this.balance = {
      employeeId: faker.string.uuid(),
      leaveType: faker.helpers.arrayElement(leaveTypes),
      entitlementDays: entitlement,
      usedDays: used,
      pendingDays: pending,
      remainingDays: entitlement - used - pending,
      year: new Date().getFullYear(),
    };

    return this;
  }

  validate(): void {
    const requiredFields: Array<keyof LeaveBalance> = [
      'employeeId',
      'leaveType',
      'entitlementDays',
      'usedDays',
      'pendingDays',
      'remainingDays',
      'year',
    ];

    for (const field of requiredFields) {
      if (this.balance[field] === undefined || this.balance[field] === null) {
        throw new Error(`Validation failed: ${field} is required`);
      }
    }

    const total = this.balance.usedDays! + this.balance.pendingDays!;
    if (total > this.balance.entitlementDays!) {
      throw new Error('Validation failed: usedDays + pendingDays cannot exceed entitlementDays');
    }

    if (this.balance.remainingDays !== this.balance.entitlementDays! - total) {
      throw new Error('Validation failed: remainingDays calculation is incorrect');
    }
  }

  build(): LeaveBalance {
    this.validate();
    const result = this.balance as LeaveBalance;
    this.reset();
    return result;
  }
}

export class LeaveEntitlementBuilder {
  private entitlement: Partial<WritableLeaveEntitlement> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.entitlement = {};
  }

  withId(id: string): LeaveEntitlementBuilder {
    this.entitlement.id = id;
    return this;
  }

  withEmployeeId(employeeId: string): LeaveEntitlementBuilder {
    this.entitlement.employeeId = employeeId;
    return this;
  }

  withLeaveType(leaveType: LeaveType): LeaveEntitlementBuilder {
    this.entitlement.leaveType = leaveType;
    return this;
  }

  withEntitledDays(days: number): LeaveEntitlementBuilder {
    this.entitlement.entitledDays = days;
    return this;
  }

  forYear(year: number): LeaveEntitlementBuilder {
    this.entitlement.year = year;
    return this;
  }

  validFrom(date: Date): LeaveEntitlementBuilder {
    this.entitlement.validFrom = date;
    return this;
  }

  validTo(date: Date): LeaveEntitlementBuilder {
    this.entitlement.validTo = date;
    return this;
  }

  withCarriedOverDays(days: number): LeaveEntitlementBuilder {
    this.entitlement.carriedOverDays = days;
    return this;
  }

  withRandomData(): LeaveEntitlementBuilder {
    const leaveTypes = Object.values(LeaveType);
    const year = new Date().getFullYear();
    const validFrom = new Date(year, 0, 1);
    const validTo = new Date(year, 11, 31);

    this.entitlement = {
      id: faker.string.uuid(),
      employeeId: faker.string.uuid(),
      leaveType: faker.helpers.arrayElement(leaveTypes),
      entitledDays: faker.number.int({ min: 10, max: 30 }),
      year,
      validFrom,
      validTo,
      carriedOverDays: faker.datatype.boolean() ? faker.number.int({ min: 0, max: 5 }) : undefined,
    };

    return this;
  }

  validate(): void {
    const requiredFields: Array<keyof LeaveEntitlement> = [
      'id',
      'employeeId',
      'leaveType',
      'entitledDays',
      'year',
      'validFrom',
      'validTo',
    ];

    for (const field of requiredFields) {
      if (this.entitlement[field] === undefined || this.entitlement[field] === null) {
        throw new Error(`Validation failed: ${field} is required`);
      }
    }

    if (this.entitlement.entitledDays! <= 0) {
      throw new Error('Validation failed: entitledDays must be positive');
    }

    if (this.entitlement.validFrom! >= this.entitlement.validTo!) {
      throw new Error('Validation failed: validFrom must be before validTo');
    }
  }

  build(): LeaveEntitlement {
    this.validate();
    const result = this.entitlement as LeaveEntitlement;
    this.reset();
    return result;
  }
}
