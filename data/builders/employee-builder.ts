import { faker } from '@faker-js/faker';
import {
  Employee,
  Department,
  EmploymentStatus,
} from '../../domain/employee/types';

type WritableEmployee = {
  -readonly [K in keyof Employee]: Employee[K];
};

export class EmployeeBuilder {
  private employee: Partial<WritableEmployee> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.employee = {};
  }

  withId(id: string): EmployeeBuilder {
    this.employee.id = id;
    return this;
  }

  withEmployeeId(employeeId: string): EmployeeBuilder {
    this.employee.employeeId = employeeId;
    return this;
  }

  withFirstName(firstName: string): EmployeeBuilder {
    this.employee.firstName = firstName;
    return this;
  }

  withMiddleName(middleName: string): EmployeeBuilder {
    this.employee.middleName = middleName;
    return this;
  }

  withLastName(lastName: string): EmployeeBuilder {
    this.employee.lastName = lastName;
    return this;
  }

  withEmail(email: string): EmployeeBuilder {
    this.employee.email = email;
    return this;
  }

  withPhone(phone: string): EmployeeBuilder {
    this.employee.phone = phone;
    return this;
  }

  withDepartment(department: Department): EmployeeBuilder {
    this.employee.department = department;
    return this;
  }

  withJobTitle(jobTitle: string): EmployeeBuilder {
    this.employee.jobTitle = jobTitle;
    return this;
  }

  withEmploymentStatus(status: EmploymentStatus): EmployeeBuilder {
    this.employee.employmentStatus = status;
    return this;
  }

  withHireDate(hireDate: Date): EmployeeBuilder {
    this.employee.hireDate = hireDate;
    return this;
  }

  withDateOfBirth(dateOfBirth: Date): EmployeeBuilder {
    this.employee.dateOfBirth = dateOfBirth;
    return this;
  }

  withGender(gender: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say'): EmployeeBuilder {
    this.employee.gender = gender;
    return this;
  }

  withNationality(nationality: string): EmployeeBuilder {
    this.employee.nationality = nationality;
    return this;
  }

  withMaritalStatus(status: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other'): EmployeeBuilder {
    this.employee.maritalStatus = status;
    return this;
  }

  withAddress(address: NonNullable<Employee['address']>): EmployeeBuilder {
    this.employee.address = address;
    return this;
  }

  withEmergencyContact(contact: NonNullable<Employee['emergencyContact']>): EmployeeBuilder {
    this.employee.emergencyContact = contact;
    return this;
  }

  withSupervisor(supervisorId: string, supervisorName: string): EmployeeBuilder {
    this.employee.supervisorId = supervisorId;
    this.employee.supervisorName = supervisorName;
    return this;
  }

  withSalary(salary: NonNullable<Employee['salary']>): EmployeeBuilder {
    this.employee.salary = salary;
    return this;
  }

  withWorkLocation(location: 'Onsite' | 'Remote' | 'Hybrid'): EmployeeBuilder {
    this.employee.workLocation = location;
    return this;
  }

  withProfilePicture(url: string): EmployeeBuilder {
    this.employee.profilePictureUrl = url;
    return this;
  }

  withRandomData(): EmployeeBuilder {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const departments = Object.values(Department);
    const employmentStatuses = Object.values(EmploymentStatus);
    const genders: Array<'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say'> = [
      'Male',
      'Female',
      'Non-Binary',
      'Prefer not to say',
    ];
    const maritalStatuses: Array<'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other'> = [
      'Single',
      'Married',
      'Divorced',
      'Widowed',
      'Other',
    ];
    const workLocations: Array<'Onsite' | 'Remote' | 'Hybrid'> = [
      'Onsite',
      'Remote',
      'Hybrid',
    ];

    this.employee = {
      id: faker.string.uuid(),
      employeeId: faker.string.alphanumeric(6).toUpperCase(),
      firstName,
      middleName: faker.datatype.boolean() ? faker.person.middleName() : undefined,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      department: faker.helpers.arrayElement(departments),
      jobTitle: faker.person.jobTitle(),
      employmentStatus: faker.helpers.arrayElement(employmentStatuses),
      hireDate: faker.date.past({ years: 5 }),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      gender: faker.helpers.arrayElement(genders),
      nationality: faker.location.country(),
      maritalStatus: faker.helpers.arrayElement(maritalStatuses),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      emergencyContact: {
        name: faker.person.fullName(),
        relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend', 'Other']),
        phone: faker.phone.number(),
      },
      workLocation: faker.helpers.arrayElement(workLocations),
      salary: {
        amount: faker.number.int({ min: 30000, max: 150000 }),
        currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP']),
        frequency: faker.helpers.arrayElement(['Hourly', 'Monthly', 'Yearly']),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this;
  }

  withActiveStatus(): EmployeeBuilder {
    this.employee.employmentStatus = EmploymentStatus.ACTIVE;
    return this;
  }

  withInactiveStatus(): EmployeeBuilder {
    this.employee.employmentStatus = EmploymentStatus.INACTIVE;
    return this;
  }

  validate(): void {
    const requiredFields: Array<keyof Employee> = [
      'id',
      'employeeId',
      'firstName',
      'lastName',
      'email',
      'department',
      'jobTitle',
      'employmentStatus',
      'hireDate',
      'createdAt',
      'updatedAt',
    ];

    for (const field of requiredFields) {
      if (this.employee[field] === undefined || this.employee[field] === null) {
        throw new Error(`Validation failed: ${field} is required`);
      }
    }

    if (!this.employee.email!.includes('@')) {
      throw new Error('Validation failed: email must be valid');
    }

    if (this.employee.firstName!.length < 1) {
      throw new Error('Validation failed: firstName cannot be empty');
    }

    if (this.employee.lastName!.length < 1) {
      throw new Error('Validation failed: lastName cannot be empty');
    }
  }

  build(): Employee {
    this.validate();
    const result = this.employee as Employee;
    this.reset();
    return result;
  }

  buildMany(count: number): Employee[] {
    const employees: Employee[] = [];
    for (let i = 0; i < count; i++) {
      this.withRandomData();
      employees.push(this.build());
    }
    return employees;
  }
}
