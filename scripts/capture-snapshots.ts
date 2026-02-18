import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface FormField {
  tag: string;
  type?: string;
  name?: string;
  placeholder?: string;
  label?: string;
  id?: string;
  className: string;
  required: boolean;
  locator: string;
}

interface Button {
  text: string;
  type: string;
  className: string;
  locator: string;
}

interface Link {
  text: string;
  href: string;
  className: string;
  locator: string;
}

interface Select {
  label?: string;
  name?: string;
  className: string;
  options: string[];
  locator: string;
}

interface Table {
  headers: string[];
  rowCount: number;
  className: string;
  locator: string;
}

interface PageSnapshot {
  url: string;
  title: string;
  timestamp: string;
  forms: FormField[];
  buttons: Button[];
  links: Link[];
  selects: Select[];
  tables: Table[];
  customDropdowns: { label: string; className: string; locator: string }[];
  datePickers: { placeholder: string; className: string; locator: string }[];
  validation: {
    errorClass: string;
    errorInputClass: string;
    errorTextExample: string;
  };
  rawHtml: string;
}

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';
const CREDENTIALS = { username: 'Admin', password: 'admin123' };

async function capturePageSnapshot(page: Page): Promise<PageSnapshot> {
  const url = page.url();
  const title = await page.title();

  const forms: FormField[] = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    return inputs.map((el) => {
      const input = el as HTMLInputElement | HTMLTextAreaElement;
      const label =
        document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim() ||
        input.closest('.oxd-input-group')?.querySelector('.oxd-label')?.textContent?.trim() ||
        input.getAttribute('aria-label');
      return {
        tag: input.tagName.toLowerCase(),
        type: input.type || undefined,
        name: input.name || undefined,
        placeholder: input.placeholder || undefined,
        label: label || undefined,
        id: input.id || undefined,
        className: input.className,
        required: input.required || input.hasAttribute('required'),
        locator: input.placeholder
          ? `getByPlaceholder('${input.placeholder}')`
          : input.name
            ? `locator('input[name="${input.name}"]')`
            : label
              ? `getByLabel('${label}')`
              : `locator('.${input.className.split(' ')[0]}')`,
      };
    });
  });

  const buttons: Button[] = await page.evaluate(() => {
    const btns = Array.from(
      document.querySelectorAll('button, input[type="submit"], input[type="button"]')
    );
    return btns.map((el) => {
      const btn = el as HTMLButtonElement | HTMLInputElement;
      const text = btn.textContent?.trim() || btn.value || btn.getAttribute('aria-label') || '';
      return {
        text,
        type: btn.type || 'button',
        className: btn.className,
        locator: text
          ? `getByRole('button', { name: '${text}' })`
          : `locator('button[type="${btn.type || 'button'}"]')`,
      };
    });
  });

  const links: Link[] = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    return anchors
      .filter((el) => {
        const a = el as HTMLAnchorElement;
        const text = a.textContent?.trim() || '';
        return text.length > 0 && text.length < 100;
      })
      .map((el) => {
        const a = el as HTMLAnchorElement;
        const text = a.textContent?.trim() || a.getAttribute('aria-label') || '';
        return {
          text,
          href: a.href,
          className: a.className,
          locator: text
            ? `getByRole('link', { name: '${text}' })`
            : `locator('a[href*="${a.getAttribute('href')}"]')`,
        };
      });
  });

  const selects: Select[] = await page.evaluate(() => {
    const selectEls = Array.from(document.querySelectorAll('select'));
    return selectEls.map((el) => {
      const select = el as HTMLSelectElement;
      const label =
        document.querySelector(`label[for="${select.id}"]`)?.textContent?.trim() ||
        select.getAttribute('aria-label');
      return {
        label: label || undefined,
        name: select.name || undefined,
        className: select.className,
        options: Array.from(select.options).map((o) => o.text),
        locator: select.name
          ? `getByRole('combobox', { name: '${select.name}' })`
          : `locator('select')`,
      };
    });
  });

  const tables: Table[] = await page.evaluate(() => {
    const tableEls = Array.from(document.querySelectorAll('table, .oxd-table'));
    return tableEls.map((el) => {
      const headers = Array.from(el.querySelectorAll('th, .oxd-table-header-cell')).map(
        (h) => h.textContent?.trim() || ''
      );
      const rows = el.querySelectorAll('tbody tr, .oxd-table-card');
      return {
        headers,
        rowCount: rows.length,
        className: el.className,
        locator: el.className.includes('oxd-table')
          ? `locator('.oxd-table')`
          : `getByRole('table')`,
      };
    });
  });

  const customDropdowns = await page.evaluate(() => {
    const dropdowns = Array.from(document.querySelectorAll('.oxd-select-text'));
    return dropdowns.map((el) => ({
      label: el.closest('.oxd-input-group')?.querySelector('.oxd-label')?.textContent?.trim() || '',
      className: el.className,
      locator: `.oxd-select-text`,
    }));
  });

  const datePickers = await page.evaluate(() => {
    const pickers = Array.from(
      document.querySelectorAll('input[placeholder*="yyyy"], .oxd-date-input input')
    );
    return pickers.map((el) => {
      const input = el as HTMLInputElement;
      return {
        placeholder: input.placeholder || '',
        className: input.className,
        locator: input.placeholder
          ? `getByPlaceholder('${input.placeholder}')`
          : `locator('.oxd-date-input input')`,
      };
    });
  });

  const validation = await page.evaluate(() => {
    const errorEl = document.querySelector('.oxd-input-field-error-message');
    return {
      errorClass: 'oxd-input-field-error-message',
      errorInputClass: 'oxd-input--error',
      errorTextExample: errorEl?.textContent?.trim() || 'Required',
    };
  });

  const rawHtml = await page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, style, link').forEach((el) => el.remove());
    return clone.innerHTML.substring(0, 50000);
  });

  return {
    url,
    title,
    timestamp: new Date().toISOString(),
    forms,
    buttons,
    links,
    selects,
    tables,
    customDropdowns,
    datePickers,
    validation,
    rawHtml,
  };
}

async function login(page: Page) {
  await page.goto(`${BASE_URL}/web/index.php/auth/login`);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Username').fill(CREDENTIALS.username);
  await page.getByPlaceholder('Password').fill(CREDENTIALS.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');
}

const PAGES_TO_CAPTURE = [
  { name: 'login', url: '/web/index.php/auth/login', needsAuth: false },
  { name: 'dashboard', url: '/web/index.php/dashboard/index', needsAuth: true },
  { name: 'admin-user-management', url: '/web/index.php/admin/viewSystemUsers', needsAuth: true },
  { name: 'admin-add-user', url: '/web/index.php/admin/saveSystemUser', needsAuth: true },
  { name: 'pim-employee-list', url: '/web/index.php/pim/viewEmployeeList', needsAuth: true },
  { name: 'pim-add-employee', url: '/web/index.php/pim/addEmployee', needsAuth: true },
  { name: 'leave-list', url: '/web/index.php/leave/viewLeaveList', needsAuth: true },
  { name: 'leave-apply', url: '/web/index.php/leave/applyLeave', needsAuth: true },
  { name: 'leave-assign', url: '/web/index.php/leave/assignLeave', needsAuth: true },
  { name: 'time-timesheet', url: '/web/index.php/time/viewEmployeeTimesheet', needsAuth: true },
  {
    name: 'recruitment-candidates',
    url: '/web/index.php/recruitment/viewCandidates',
    needsAuth: true,
  },
  {
    name: 'recruitment-add-candidate',
    url: '/web/index.php/recruitment/addCandidate',
    needsAuth: true,
  },
  {
    name: 'recruitment-vacancies',
    url: '/web/index.php/recruitment/viewJobVacancy',
    needsAuth: true,
  },
  { name: 'my-info', url: '/web/index.php/pim/viewMyDetails', needsAuth: true },
  {
    name: 'performance',
    url: '/web/index.php/performance/searchEvaluatePerformance',
    needsAuth: true,
  },
  { name: 'directory', url: '/web/index.php/directory/viewDirectory', needsAuth: true },
  { name: 'maintenance', url: '/web/index.php/maintenance/purgeCandidates', needsAuth: true },
  { name: 'claim', url: '/web/index.php/claim/assignClaim', needsAuth: true },
  { name: 'buzz', url: '/web/index.php/buzz/viewBuzz', needsAuth: true },
  { name: 'admin-job-titles', url: '/web/index.php/admin/viewJobTitleList', needsAuth: true },
  { name: 'admin-add-job-title', url: '/web/index.php/admin/saveJobTitle', needsAuth: true },
  { name: 'admin-nationalities', url: '/web/index.php/admin/nationality', needsAuth: true },
];

async function main() {
  const outputDir = path.join(process.cwd(), 'snapshots', 'structured');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let isLoggedIn = false;

  for (const pageConfig of PAGES_TO_CAPTURE) {
    console.log(`Capturing: ${pageConfig.name}...`);

    try {
      if (pageConfig.needsAuth && !isLoggedIn) {
        await login(page);
        isLoggedIn = true;
      }

      await page.goto(`${BASE_URL}${pageConfig.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const snapshot = await capturePageSnapshot(page);

      const outputPath = path.join(outputDir, `${pageConfig.name}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

      console.log(`  ✓ Saved: ${outputPath}`);
    } catch (error) {
      console.error(`  ✗ Failed: ${pageConfig.name}`, error);
    }
  }

  const index = {
    generated: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages: PAGES_TO_CAPTURE.map((p) => ({
      name: p.name,
      file: `${p.name}.json`,
      url: p.url,
      needsAuth: p.needsAuth,
    })),
  };
  fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2));

  await browser.close();
  console.log('\nDone! Snapshots saved to snapshots/structured/');
}

main().catch(console.error);
