const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Ensure output directory exists
  fs.mkdirSync('./explore-output', { recursive: true });

  // Navigate to login page
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.waitForLoadState('networkidle');
  
  // Get page title and initial state
  const title = await page.title();
  const url = page.url();
  
  // Check for login form elements
  const loginForm = await page.locator('form').count();
  const usernameField = await page.locator('input[name*="username"], input[placeholder*="username" i]').count();
  const passwordField = await page.locator('input[type="password"]').count();
  const rememberMe = await page.locator('input[type="checkbox"], .remember-me, text=Remember me').count();
  const loginButton = await page.locator('button[type="submit"]').count();
  
  // Take screenshot
  await page.screenshot({ path: './explore-output/01-login-page.png' });
  
  console.log('=== LOGIN PAGE ANALYSIS ===');
  console.log('Title:', title);
  console.log('URL:', url);
  console.log('Login form found:', loginForm > 0);
  console.log('Username field found:', usernameField > 0);
  console.log('Password field found:', passwordField > 0);
  console.log('Remember me option:', rememberMe > 0 ? 'YES' : 'NO');
  console.log('Login button found:', loginButton > 0);
  
  // Get all form labels and inputs
  const formElements = await page.locator('form input, form button, form label').all();
  console.log('\nForm elements:');
  for (const el of formElements) {
    const tagName = await el.evaluate(e => e.tagName);
    const type = await el.getAttribute('type');
    const name = await el.getAttribute('name');
    const placeholder = await el.getAttribute('placeholder');
    const text = await el.textContent();
    console.log(`  ${tagName}${type ? `[${type}]` : ''} - name: ${name}, placeholder: ${placeholder}, text: ${text?.slice(0, 30)}`);
  }
  
  // Get all links on login page
  const links = await page.locator('a').all();
  console.log('\nLinks on login page:');
  for (const link of links) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    console.log(`  ${text?.trim()} -> ${href}`);
  }
  
  await browser.close();
})();
