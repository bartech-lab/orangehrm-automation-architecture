import { faker } from '@faker-js/faker';
import { Department } from '../../domain/employee/types.js';

export interface JobTitleData {
  id: string;
  title: string;
  code: string;
  department: Department;
  level: JobLevel;
  description: string;
  responsibilities: string[];
  requirements: string[];
  salaryMin: number;
  salaryMax: number;
  currency: string;
  isActive: boolean;
  reportsTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum JobLevel {
  ENTRY = 'Entry',
  JUNIOR = 'Junior',
  MID = 'Mid',
  SENIOR = 'Senior',
  LEAD = 'Lead',
  MANAGER = 'Manager',
  DIRECTOR = 'Director',
  VP = 'VP',
  EXECUTIVE = 'Executive',
}

type WritableJobTitleData = {
  -readonly [K in keyof JobTitleData]: JobTitleData[K];
};

const jobTitlesByDepartment: Record<Department, Record<JobLevel, string[]>> = {
  [Department.ENGINEERING]: {
    [JobLevel.ENTRY]: ['Junior Developer', 'QA Tester', 'DevOps Intern'],
    [JobLevel.JUNIOR]: ['Software Developer', 'Frontend Developer', 'Backend Developer'],
    [JobLevel.MID]: ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer'],
    [JobLevel.SENIOR]: [
      'Senior Software Engineer',
      'Senior Frontend Engineer',
      'Senior Backend Engineer',
    ],
    [JobLevel.LEAD]: ['Tech Lead', 'Engineering Lead', 'Principal Engineer'],
    [JobLevel.MANAGER]: ['Engineering Manager', 'DevOps Manager'],
    [JobLevel.DIRECTOR]: ['Director of Engineering', 'Director of Infrastructure'],
    [JobLevel.VP]: ['VP of Engineering', 'VP of Technology'],
    [JobLevel.EXECUTIVE]: ['CTO', 'Chief Technology Officer'],
  },
  [Department.SALES]: {
    [JobLevel.ENTRY]: ['Sales Development Rep', 'Business Development Intern'],
    [JobLevel.JUNIOR]: ['Inside Sales Rep', 'Account Coordinator'],
    [JobLevel.MID]: ['Account Executive', 'Sales Representative', 'Territory Manager'],
    [JobLevel.SENIOR]: ['Senior Account Executive', 'Key Account Manager'],
    [JobLevel.LEAD]: ['Sales Team Lead', 'Regional Lead'],
    [JobLevel.MANAGER]: ['Sales Manager', 'Account Management Manager'],
    [JobLevel.DIRECTOR]: ['Director of Sales', 'Director of Business Development'],
    [JobLevel.VP]: ['VP of Sales', 'VP of Revenue'],
    [JobLevel.EXECUTIVE]: ['Chief Revenue Officer', 'CRO'],
  },
  [Department.MARKETING]: {
    [JobLevel.ENTRY]: ['Marketing Coordinator', 'Social Media Intern'],
    [JobLevel.JUNIOR]: ['Marketing Specialist', 'Content Writer', 'SEO Specialist'],
    [JobLevel.MID]: ['Marketing Manager', 'Product Marketing Manager', 'Brand Manager'],
    [JobLevel.SENIOR]: ['Senior Marketing Manager', 'Senior Content Manager'],
    [JobLevel.LEAD]: ['Marketing Lead', 'Campaign Lead'],
    [JobLevel.MANAGER]: ['Marketing Director', 'Growth Manager'],
    [JobLevel.DIRECTOR]: ['Director of Marketing', 'Director of Growth'],
    [JobLevel.VP]: ['VP of Marketing', 'VP of Brand'],
    [JobLevel.EXECUTIVE]: ['CMO', 'Chief Marketing Officer'],
  },
  [Department.HR]: {
    [JobLevel.ENTRY]: ['HR Coordinator', 'Recruiting Coordinator'],
    [JobLevel.JUNIOR]: ['HR Specialist', 'Recruiter', 'Benefits Specialist'],
    [JobLevel.MID]: ['HR Generalist', 'Senior Recruiter', 'HR Business Partner'],
    [JobLevel.SENIOR]: ['Senior HR Business Partner', 'Senior HR Manager'],
    [JobLevel.LEAD]: ['Talent Acquisition Lead', 'HR Lead'],
    [JobLevel.MANAGER]: ['HR Manager', 'Talent Acquisition Manager'],
    [JobLevel.DIRECTOR]: ['Director of HR', 'Director of Talent'],
    [JobLevel.VP]: ['VP of People', 'VP of Human Resources'],
    [JobLevel.EXECUTIVE]: ['Chief People Officer', 'CPO'],
  },
  [Department.FINANCE]: {
    [JobLevel.ENTRY]: ['Accounting Clerk', 'Finance Intern'],
    [JobLevel.JUNIOR]: ['Staff Accountant', 'Financial Analyst', 'AP/AR Specialist'],
    [JobLevel.MID]: ['Senior Accountant', 'Senior Financial Analyst', 'Controller'],
    [JobLevel.SENIOR]: ['Accounting Manager', 'Senior Finance Manager'],
    [JobLevel.LEAD]: ['Finance Lead', 'Accounting Lead'],
    [JobLevel.MANAGER]: ['Finance Manager', 'Accounting Manager'],
    [JobLevel.DIRECTOR]: ['Director of Finance', 'Director of Accounting'],
    [JobLevel.VP]: ['VP of Finance', 'VP of Accounting'],
    [JobLevel.EXECUTIVE]: ['CFO', 'Chief Financial Officer'],
  },
  [Department.OPERATIONS]: {
    [JobLevel.ENTRY]: ['Operations Associate', 'Operations Intern'],
    [JobLevel.JUNIOR]: ['Operations Specialist', 'Process Analyst'],
    [JobLevel.MID]: ['Operations Manager', 'Process Improvement Manager'],
    [JobLevel.SENIOR]: ['Senior Operations Manager', 'Senior Process Manager'],
    [JobLevel.LEAD]: ['Operations Lead', 'Team Lead'],
    [JobLevel.MANAGER]: ['Operations Manager', 'Facilities Manager'],
    [JobLevel.DIRECTOR]: ['Director of Operations', 'Director of Facilities'],
    [JobLevel.VP]: ['VP of Operations', 'VP of Business Operations'],
    [JobLevel.EXECUTIVE]: ['COO', 'Chief Operating Officer'],
  },
  [Department.PRODUCT]: {
    [JobLevel.ENTRY]: ['Product Coordinator', 'Product Intern'],
    [JobLevel.JUNIOR]: ['Associate Product Manager', 'Product Analyst'],
    [JobLevel.MID]: ['Product Manager', 'Technical Product Manager'],
    [JobLevel.SENIOR]: ['Senior Product Manager', 'Group Product Manager'],
    [JobLevel.LEAD]: ['Product Lead', 'Feature Lead'],
    [JobLevel.MANAGER]: ['Product Management Manager', 'Product Team Lead'],
    [JobLevel.DIRECTOR]: ['Director of Product', 'Director of Product Management'],
    [JobLevel.VP]: ['VP of Product', 'VP of Product Strategy'],
    [JobLevel.EXECUTIVE]: ['CPO', 'Chief Product Officer'],
  },
  [Department.DESIGN]: {
    [JobLevel.ENTRY]: ['Design Intern', 'Junior Designer'],
    [JobLevel.JUNIOR]: ['UI Designer', 'UX Designer', 'Graphic Designer'],
    [JobLevel.MID]: ['Product Designer', 'Senior UI Designer', 'Senior UX Designer'],
    [JobLevel.SENIOR]: ['Senior Product Designer', 'Lead Designer'],
    [JobLevel.LEAD]: ['Design Lead', 'UX Lead'],
    [JobLevel.MANAGER]: ['Design Manager', 'Creative Manager'],
    [JobLevel.DIRECTOR]: ['Director of Design', 'Director of UX'],
    [JobLevel.VP]: ['VP of Design', 'VP of Creative'],
    [JobLevel.EXECUTIVE]: ['Chief Design Officer', 'CDO'],
  },
  [Department.LEGAL]: {
    [JobLevel.ENTRY]: ['Legal Intern', 'Paralegal'],
    [JobLevel.JUNIOR]: ['Junior Counsel', 'Contract Specialist'],
    [JobLevel.MID]: ['Corporate Counsel', 'Senior Paralegal'],
    [JobLevel.SENIOR]: ['Senior Counsel', 'Managing Attorney'],
    [JobLevel.LEAD]: ['Legal Lead', 'Compliance Lead'],
    [JobLevel.MANAGER]: ['Legal Manager', 'Compliance Manager'],
    [JobLevel.DIRECTOR]: ['General Counsel', 'Director of Legal'],
    [JobLevel.VP]: ['VP of Legal', 'VP of Compliance'],
    [JobLevel.EXECUTIVE]: ['Chief Legal Officer', 'CLO'],
  },
  [Department.CUSTOMER_SUCCESS]: {
    [JobLevel.ENTRY]: ['Customer Support Rep', 'Customer Success Intern'],
    [JobLevel.JUNIOR]: ['Customer Success Specialist', 'Support Specialist'],
    [JobLevel.MID]: ['Customer Success Manager', 'Account Manager'],
    [JobLevel.SENIOR]: ['Senior Customer Success Manager', 'Senior Account Manager'],
    [JobLevel.LEAD]: ['Customer Success Lead', 'Support Team Lead'],
    [JobLevel.MANAGER]: ['Customer Success Manager', 'Support Manager'],
    [JobLevel.DIRECTOR]: ['Director of Customer Success', 'Director of Support'],
    [JobLevel.VP]: ['VP of Customer Success', 'VP of Support'],
    [JobLevel.EXECUTIVE]: ['Chief Customer Officer', 'CCO'],
  },
};

const commonResponsibilities: Record<JobLevel, string[]> = {
  [JobLevel.ENTRY]: [
    'Learn company processes and procedures',
    'Assist team members with day-to-day tasks',
    'Complete assigned projects under supervision',
    'Participate in training and development programs',
  ],
  [JobLevel.JUNIOR]: [
    'Execute tasks and projects with moderate supervision',
    'Collaborate with cross-functional teams',
    'Contribute to team goals and objectives',
    'Develop professional skills and expertise',
  ],
  [JobLevel.MID]: [
    'Manage projects independently',
    'Mentor junior team members',
    'Drive process improvements',
    'Collaborate with stakeholders across departments',
  ],
  [JobLevel.SENIOR]: [
    'Lead complex projects and initiatives',
    'Provide technical expertise and guidance',
    'Mentor and coach team members',
    'Contribute to strategic planning',
  ],
  [JobLevel.LEAD]: [
    'Lead team projects and initiatives',
    'Coordinate team activities and deliverables',
    'Provide technical leadership',
    'Drive team performance and growth',
  ],
  [JobLevel.MANAGER]: [
    'Manage team performance and development',
    'Set goals and objectives for the team',
    'Hire and onboard new team members',
    'Report on team metrics and achievements',
  ],
  [JobLevel.DIRECTOR]: [
    'Develop departmental strategy and roadmap',
    'Manage budget and resource allocation',
    'Lead cross-functional initiatives',
    'Drive organizational change and improvement',
  ],
  [JobLevel.VP]: [
    'Set strategic direction for the function',
    'Drive executive-level initiatives',
    'Build and maintain key relationships',
    'Contribute to company-wide strategy',
  ],
  [JobLevel.EXECUTIVE]: [
    'Define company vision and strategy',
    'Lead organizational transformation',
    'Drive business growth and innovation',
    'Represent the company externally',
  ],
};

const commonRequirements: Record<JobLevel, string[]> = {
  [JobLevel.ENTRY]: [
    "Bachelor's degree or equivalent",
    '0-1 years of relevant experience',
    'Strong willingness to learn',
    'Good communication skills',
  ],
  [JobLevel.JUNIOR]: [
    "Bachelor's degree in relevant field",
    '1-3 years of relevant experience',
    'Basic knowledge of industry practices',
    'Ability to work in a team environment',
  ],
  [JobLevel.MID]: [
    "Bachelor's degree in relevant field",
    '3-5 years of relevant experience',
    'Proven track record of successful projects',
    'Strong problem-solving skills',
  ],
  [JobLevel.SENIOR]: [
    "Bachelor's degree in relevant field",
    '5-8 years of relevant experience',
    'Deep expertise in domain area',
    'Experience mentoring others',
  ],
  [JobLevel.LEAD]: [
    "Bachelor's degree in relevant field",
    '6-9 years of relevant experience',
    'Demonstrated leadership abilities',
    'Strong technical or functional expertise',
  ],
  [JobLevel.MANAGER]: [
    "Bachelor's degree in relevant field",
    '7-10 years of relevant experience',
    '2+ years of people management experience',
    'Strong organizational and communication skills',
  ],
  [JobLevel.DIRECTOR]: [
    "Bachelor's degree in relevant field; Master's preferred",
    '10+ years of relevant experience',
    '5+ years of leadership experience',
    'Strategic thinking and planning abilities',
  ],
  [JobLevel.VP]: [
    "Bachelor's degree required; MBA or advanced degree preferred",
    '12+ years of relevant experience',
    '7+ years of executive leadership experience',
    'Proven track record of driving business results',
  ],
  [JobLevel.EXECUTIVE]: [
    "Bachelor's degree required; MBA or advanced degree preferred",
    '15+ years of relevant experience',
    '10+ years of C-suite or executive experience',
    'Exceptional leadership and vision',
  ],
};

const salaryRanges: Record<JobLevel, { min: number; max: number }> = {
  [JobLevel.ENTRY]: { min: 35000, max: 55000 },
  [JobLevel.JUNIOR]: { min: 50000, max: 75000 },
  [JobLevel.MID]: { min: 70000, max: 110000 },
  [JobLevel.SENIOR]: { min: 100000, max: 150000 },
  [JobLevel.LEAD]: { min: 120000, max: 170000 },
  [JobLevel.MANAGER]: { min: 130000, max: 190000 },
  [JobLevel.DIRECTOR]: { min: 160000, max: 250000 },
  [JobLevel.VP]: { min: 200000, max: 350000 },
  [JobLevel.EXECUTIVE]: { min: 300000, max: 600000 },
};

export class JobTitleBuilder {
  private jobTitle: Partial<WritableJobTitleData> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.jobTitle = {};
  }

  withId(id: string): JobTitleBuilder {
    this.jobTitle.id = id;
    return this;
  }

  withTitle(title: string): JobTitleBuilder {
    this.jobTitle.title = title;
    return this;
  }

  withCode(code: string): JobTitleBuilder {
    this.jobTitle.code = code;
    return this;
  }

  withDepartment(department: Department): JobTitleBuilder {
    this.jobTitle.department = department;
    return this;
  }

  withLevel(level: JobLevel): JobTitleBuilder {
    this.jobTitle.level = level;
    return this;
  }

  withDescription(description: string): JobTitleBuilder {
    this.jobTitle.description = description;
    return this;
  }

  withResponsibilities(responsibilities: string[]): JobTitleBuilder {
    this.jobTitle.responsibilities = responsibilities;
    return this;
  }

  withRequirements(requirements: string[]): JobTitleBuilder {
    this.jobTitle.requirements = requirements;
    return this;
  }

  withSalaryRange(min: number, max: number, currency = 'USD'): JobTitleBuilder {
    this.jobTitle.salaryMin = min;
    this.jobTitle.salaryMax = max;
    this.jobTitle.currency = currency;
    return this;
  }

  withActiveStatus(isActive = true): JobTitleBuilder {
    this.jobTitle.isActive = isActive;
    return this;
  }

  withReportsTo(reportsTo: string): JobTitleBuilder {
    this.jobTitle.reportsTo = reportsTo;
    return this;
  }

  withRandomData(): JobTitleBuilder {
    const departments = Object.values(Department);
    const levels = Object.values(JobLevel);
    const department = faker.helpers.arrayElement(departments);
    const level = faker.helpers.arrayElement(levels);
    const titles = jobTitlesByDepartment[department][level];
    const title = faker.helpers.arrayElement(titles);
    const salaryRange = salaryRanges[level];

    this.jobTitle = {
      id: faker.string.uuid(),
      title,
      code: this.generateJobCode(title, department),
      department,
      level,
      description: faker.lorem.paragraph(),
      responsibilities: faker.helpers.arrayElements(commonResponsibilities[level], {
        min: 2,
        max: 4,
      }),
      requirements: faker.helpers.arrayElements(commonRequirements[level], { min: 2, max: 4 }),
      salaryMin: salaryRange.min,
      salaryMax: salaryRange.max,
      currency: 'USD',
      isActive: faker.datatype.boolean(0.9),
      createdAt: faker.date.past({ years: 5 }),
      updatedAt: new Date(),
    };

    return this;
  }

  forDepartmentAndLevel(department: Department, level: JobLevel): JobTitleBuilder {
    const titles = jobTitlesByDepartment[department][level];
    const title = faker.helpers.arrayElement(titles);
    const salaryRange = salaryRanges[level];

    this.jobTitle.department = department;
    this.jobTitle.level = level;
    this.jobTitle.title = title;
    this.jobTitle.code = this.generateJobCode(title, department);
    this.jobTitle.description = faker.lorem.paragraph();
    this.jobTitle.responsibilities = commonResponsibilities[level];
    this.jobTitle.requirements = commonRequirements[level];
    this.jobTitle.salaryMin = salaryRange.min;
    this.jobTitle.salaryMax = salaryRange.max;
    this.jobTitle.currency = 'USD';
    this.jobTitle.isActive = true;

    return this;
  }

  private generateJobCode(title: string, department: Department): string {
    const deptCode = department.substring(0, 3).toUpperCase();
    const titleCode = title
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 4)
      .toUpperCase();
    return `${deptCode}-${titleCode}-${faker.number.int({ min: 100, max: 999 })}`;
  }

  validate(): void {
    const requiredFields: Array<keyof JobTitleData> = [
      'id',
      'title',
      'code',
      'department',
      'level',
      'description',
      'responsibilities',
      'requirements',
      'salaryMin',
      'salaryMax',
      'currency',
      'isActive',
      'createdAt',
      'updatedAt',
    ];

    for (const field of requiredFields) {
      if (this.jobTitle[field] === undefined || this.jobTitle[field] === null) {
        throw new Error(`Validation failed: ${field} is required`);
      }
    }

    if (this.jobTitle.salaryMax! <= this.jobTitle.salaryMin!) {
      throw new Error('Validation failed: salaryMax must be greater than salaryMin');
    }

    if (this.jobTitle.responsibilities!.length === 0) {
      throw new Error('Validation failed: at least one responsibility is required');
    }

    if (this.jobTitle.requirements!.length === 0) {
      throw new Error('Validation failed: at least one requirement is required');
    }
  }

  build(): JobTitleData {
    this.validate();
    const result = this.jobTitle as JobTitleData;
    this.reset();
    return result;
  }

  buildMany(count: number): JobTitleData[] {
    const jobTitles: JobTitleData[] = [];
    for (let i = 0; i < count; i++) {
      this.withRandomData();
      jobTitles.push(this.build());
    }
    return jobTitles;
  }

  buildAllForDepartment(department: Department): JobTitleData[] {
    const jobTitles: JobTitleData[] = [];
    const levels = Object.values(JobLevel);

    for (const level of levels) {
      const titles = jobTitlesByDepartment[department][level];
      for (const title of titles) {
        this.reset();
        const salaryRange = salaryRanges[level];
        this.jobTitle = {
          id: faker.string.uuid(),
          title,
          code: this.generateJobCode(title, department),
          department,
          level,
          description: faker.lorem.paragraph(),
          responsibilities: commonResponsibilities[level],
          requirements: commonRequirements[level],
          salaryMin: salaryRange.min,
          salaryMax: salaryRange.max,
          currency: 'USD',
          isActive: true,
          createdAt: faker.date.past({ years: 5 }),
          updatedAt: new Date(),
        };
        jobTitles.push(this.build());
      }
    }

    return jobTitles;
  }
}

export function createJobTitle(
  department: Department,
  level: JobLevel,
  overrides?: Partial<JobTitleData>
): JobTitleData {
  const builder = new JobTitleBuilder().forDepartmentAndLevel(department, level);

  if (overrides) {
    if (overrides.id) builder.withId(overrides.id);
    if (overrides.title) builder.withTitle(overrides.title);
    if (overrides.code) builder.withCode(overrides.code);
    if (overrides.description) builder.withDescription(overrides.description);
    if (overrides.responsibilities) builder.withResponsibilities(overrides.responsibilities);
    if (overrides.requirements) builder.withRequirements(overrides.requirements);
    if (overrides.salaryMin !== undefined && overrides.salaryMax !== undefined) {
      builder.withSalaryRange(overrides.salaryMin, overrides.salaryMax, overrides.currency);
    }
    if (overrides.isActive !== undefined) builder.withActiveStatus(overrides.isActive);
    if (overrides.reportsTo) builder.withReportsTo(overrides.reportsTo);
  }

  return builder.build();
}

export function createJobTitlesForDepartment(department: Department): JobTitleData[] {
  return new JobTitleBuilder().buildAllForDepartment(department);
}
