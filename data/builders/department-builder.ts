import { faker } from '@faker-js/faker';
import { Department } from '../../domain/employee/types.js';

export interface DepartmentData {
  id: string;
  code: string;
  name: Department;
  description: string;
  managerId?: string;
  managerName?: string;
  location: string;
  budget: number;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

type WritableDepartmentData = {
  -readonly [K in keyof DepartmentData]: DepartmentData[K];
};

const departmentDescriptions: Record<Department, string> = {
  [Department.ENGINEERING]:
    'Responsible for product development, technical infrastructure, and engineering excellence.',
  [Department.SALES]:
    'Drives revenue growth through customer acquisition and relationship management.',
  [Department.MARKETING]:
    'Builds brand awareness and generates demand through strategic campaigns.',
  [Department.HR]:
    'Manages talent acquisition, employee relations, and organizational development.',
  [Department.FINANCE]: 'Oversees financial planning, accounting, and fiscal management.',
  [Department.OPERATIONS]:
    'Ensures smooth day-to-day business operations and process optimization.',
  [Department.PRODUCT]: 'Defines product strategy, roadmap, and user experience.',
  [Department.DESIGN]: 'Creates visual designs, user interfaces, and brand assets.',
  [Department.LEGAL]: 'Manages legal compliance, contracts, and risk mitigation.',
  [Department.CUSTOMER_SUCCESS]: 'Ensures customer satisfaction, retention, and success.',
};

const departmentLocations: Record<Department, string[]> = {
  [Department.ENGINEERING]: ['San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Remote'],
  [Department.SALES]: ['New York, NY', 'Chicago, IL', 'London, UK', 'Remote'],
  [Department.MARKETING]: ['San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Remote'],
  [Department.HR]: ['San Francisco, CA', 'Austin, TX', 'Denver, CO', 'Onsite'],
  [Department.FINANCE]: ['New York, NY', 'Chicago, IL', 'Onsite'],
  [Department.OPERATIONS]: ['Austin, TX', 'Phoenix, AZ', 'Dallas, TX', 'Hybrid'],
  [Department.PRODUCT]: ['San Francisco, CA', 'Seattle, WA', 'Remote'],
  [Department.DESIGN]: ['San Francisco, CA', 'Los Angeles, CA', 'Portland, OR', 'Remote'],
  [Department.LEGAL]: ['New York, NY', 'Washington, DC', 'Onsite'],
  [Department.CUSTOMER_SUCCESS]: ['Denver, CO', 'Austin, TX', 'Remote'],
};

export class DepartmentBuilder {
  private department: Partial<WritableDepartmentData> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.department = {};
  }

  withId(id: string): DepartmentBuilder {
    this.department.id = id;
    return this;
  }

  withCode(code: string): DepartmentBuilder {
    this.department.code = code;
    return this;
  }

  withName(name: Department): DepartmentBuilder {
    this.department.name = name;
    return this;
  }

  withDescription(description: string): DepartmentBuilder {
    this.department.description = description;
    return this;
  }

  withManager(managerId: string, managerName: string): DepartmentBuilder {
    this.department.managerId = managerId;
    this.department.managerName = managerName;
    return this;
  }

  withLocation(location: string): DepartmentBuilder {
    this.department.location = location;
    return this;
  }

  withBudget(budget: number): DepartmentBuilder {
    this.department.budget = budget;
    return this;
  }

  withEmployeeCount(count: number): DepartmentBuilder {
    this.department.employeeCount = count;
    return this;
  }

  withRandomData(): DepartmentBuilder {
    const departments = Object.values(Department);
    const name = faker.helpers.arrayElement(departments);
    const locations = departmentLocations[name];

    this.department = {
      id: faker.string.uuid(),
      code: this.generateDepartmentCode(name),
      name,
      description: departmentDescriptions[name],
      location: faker.helpers.arrayElement(locations),
      budget: faker.number.int({ min: 500000, max: 5000000 }),
      employeeCount: faker.number.int({ min: 5, max: 100 }),
      createdAt: faker.date.past({ years: 10 }),
      updatedAt: new Date(),
    };

    return this;
  }

  withManagerInfo(): DepartmentBuilder {
    this.department.managerId = faker.string.uuid();
    this.department.managerName = faker.person.fullName();
    return this;
  }

  forDepartment(name: Department): DepartmentBuilder {
    this.department.name = name;
    this.department.code = this.generateDepartmentCode(name);
    this.department.description = departmentDescriptions[name];
    this.department.location = faker.helpers.arrayElement(departmentLocations[name]);
    return this;
  }

  private generateDepartmentCode(name: Department): string {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 4);
  }

  validate(): void {
    const requiredFields: Array<keyof DepartmentData> = [
      'id',
      'code',
      'name',
      'description',
      'location',
      'createdAt',
      'updatedAt',
    ];

    for (const field of requiredFields) {
      if (this.department[field] === undefined || this.department[field] === null) {
        throw new Error(`Validation failed: ${field} is required`);
      }
    }

    if (this.department.code!.length < 2) {
      throw new Error('Validation failed: code must be at least 2 characters');
    }

    if (this.department.description!.length < 10) {
      throw new Error('Validation failed: description must be at least 10 characters');
    }
  }

  build(): DepartmentData {
    this.validate();
    const result = this.department as DepartmentData;
    this.reset();
    return result;
  }

  buildAllDepartments(): DepartmentData[] {
    const departments: DepartmentData[] = [];
    const allDepartments = Object.values(Department);

    for (const dept of allDepartments) {
      this.reset();
      this.forDepartment(dept);
      this.withId(faker.string.uuid());
      this.withCode(this.generateDepartmentCode(dept));
      this.withBudget(faker.number.int({ min: 500000, max: 5000000 }));
      this.withEmployeeCount(faker.number.int({ min: 5, max: 100 }));
      this.department.createdAt = faker.date.past({ years: 10 });
      this.department.updatedAt = new Date();
      departments.push(this.build());
    }

    return departments;
  }
}

export function createAllDepartments(): DepartmentData[] {
  return new DepartmentBuilder().buildAllDepartments();
}

export function createDepartment(
  name: Department,
  overrides?: Partial<DepartmentData>
): DepartmentData {
  const builder = new DepartmentBuilder().forDepartment(name);

  if (overrides) {
    if (overrides.id) builder.withId(overrides.id);
    if (overrides.code) builder.withCode(overrides.code);
    if (overrides.description) builder.withDescription(overrides.description);
    if (overrides.managerId && overrides.managerName) {
      builder.withManager(overrides.managerId, overrides.managerName);
    }
    if (overrides.location) builder.withLocation(overrides.location);
    if (overrides.budget !== undefined) builder.withBudget(overrides.budget);
    if (overrides.employeeCount !== undefined) builder.withEmployeeCount(overrides.employeeCount);
  }

  return builder.build();
}
