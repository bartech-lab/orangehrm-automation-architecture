import { test, expect } from '../../infra/test-runner/index.js';
import { HRMSystem } from '../../domain/hrm-system.js';

test.describe('User Journey - Recruitment Pipeline', () => {
  test('view vacancies list', async ({ auth }) => {
    const hrmSystem = new HRMSystem(auth);
    const vacancies = await hrmSystem.viewRecruitmentVacancies();

    expect(vacancies.hasResultsTable).toBe(true);
  });

  test('view candidates list', async ({ auth }) => {
    const hrmSystem = new HRMSystem(auth);
    const candidates = await hrmSystem.viewRecruitmentCandidates();

    expect(candidates.hasResultsTable).toBe(true);
  });

  test('complete recruitment workflow', async ({ auth, testData }) => {
    const hrmSystem = new HRMSystem(auth);
    const suffix = testData
      .getUniqueString('candidate')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-12);
    const vacancyName = `Test Position ${suffix}`;
    const candidateFirstName = `Candidate${suffix}`;

    const result = await hrmSystem.completeRecruitmentPipeline({
      vacancyName,
      jobTitle: 'Software Engineer',
      positions: 1,
      candidateFirstName,
      candidateLastName: 'Test',
      candidateEmail: `${candidateFirstName.toLowerCase()}@example.com`,
    });

    expect(result.vacancyCreated).toBe(true);
    expect(result.candidateAdded).toBe(true);
    expect(result.workflowAdvanced).toBe(true);
  });
});
