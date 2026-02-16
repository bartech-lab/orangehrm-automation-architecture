const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to login page
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.waitForLoadState('networkidle');
  
  // Login
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  
  console.log('=== DASHBOARD ANALYSIS ===');
  console.log('Title:', await page.title());
  console.log('URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: '/Users/mimac/Projects/orangehrm-explore/02-dashboard.png', fullPage: true });
  
  // Analyze main navigation - try different selectors
  console.log('\n=== MAIN NAVIGATION ===');
  
  // Try to find all menu items
  const allMenuItems = await page.locator('ul li, nav li, [class*="menu"] li, [class*="sidebar"] li, [role="menuitem"]').all();
  const seenMenus = new Set();
  for (const item of allMenuItems) {
    const text = await item.textContent();
    if (text?.trim() && !seenMenus.has(text.trim())) {
      seenMenus.add(text.trim());
      console.log(`- ${text.trim()}`);
    }
  }
  
  // Get all links for navigation analysis
  const links = await page.locator('a').all();
  console.log('\n=== ALL LINKS (Top 30) ===');
  let linkCount = 0;
  for (const link of links) {
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    if (text?.trim() && linkCount < 30) {
      console.log(`- ${text.trim().slice(0, 40)} -> ${href}`);
      linkCount++;
    }
  }
  
  // Get page structure
  const h1s = await page.locator('h1').all();
  const h2s = await page.locator('h2').all();
  console.log('\n=== HEADERS ===');
  console.log('H1s:', h1s.length);
  for (const h of h1s) console.log(`  - ${await h.textContent()}`);
  console.log('H2s:', h2s.length);
  for (const h of h2s.slice(0, 5)) console.log(`  - ${await h.textContent()}`);
  
  // Get buttons
  const buttons = await page.locator('button').all();
  console.log('\n=== BUTTONS ===');
  for (const btn of buttons.slice(0, 20)) {
    const text = await btn.textContent();
    if (text?.trim()) console.log(`- ${text.trim()}`);
  }
  
  await browser.close();
})();
