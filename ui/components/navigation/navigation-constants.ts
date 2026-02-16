/**
 * Navigation module constants for OrangeHRM
 * Centralized location for all module names and routes
 */

/**
 * Module names for navigation
 * Used in sidebar, breadcrumbs, and page objects
 */
export const MODULE_NAMES = {
  // Main modules
  ADMIN: 'Admin',
  PIM: 'PIM',
  LEAVE: 'Leave',
  TIME: 'Time',
  RECRUITMENT: 'Recruitment',
  PERFORMANCE: 'Performance',
  DASHBOARD: 'Dashboard',

  // Employee-related
  MY_INFO: 'My Info',
  DIRECTORY: 'Directory',
  BUZZ: 'Buzz',

  // Additional modules
  CLAIM: 'Claim',
  MAINTENANCE: 'Maintenance',
} as const;

/**
 * Module route paths for URL navigation
 */
export const MODULE_ROUTES = {
  [MODULE_NAMES.ADMIN]: '/web/index.php/admin/viewSystemUsers',
  [MODULE_NAMES.PIM]: '/web/index.php/pim/viewEmployeeList',
  [MODULE_NAMES.LEAVE]: '/web/index.php/leave/viewLeaveList',
  [MODULE_NAMES.TIME]: '/web/index.php/time/viewEmployeeTimesheet',
  [MODULE_NAMES.RECRUITMENT]: '/web/index.php/recruitment/viewCandidates',
  [MODULE_NAMES.PERFORMANCE]: '/web/index.php/performance/searchEvaluatePerformanceReview',
  [MODULE_NAMES.DASHBOARD]: '/web/index.php/dashboard/index',
  [MODULE_NAMES.MY_INFO]: '/web/index.php/pim/viewPersonalDetails/empNumber/',
  [MODULE_NAMES.DIRECTORY]: '/web/index.php/directory/viewDirectory',
  [MODULE_NAMES.BUZZ]: '/web/index.php/buzz/viewBuzz',
  [MODULE_NAMES.CLAIM]: '/web/index.php/claim/viewAssignClaim',
  [MODULE_NAMES.MAINTENANCE]: '/web/index.php/maintenance/purgeEmployee',
} as const;

/**
 * Type for module routes
 */
export type ModuleRoute = (typeof MODULE_ROUTES)[keyof typeof MODULE_ROUTES];

/**
 * Sidebar menu item selectors
 * Maps module names to their sidebar menu item data-testid or class patterns
 * Uses specific selectors to avoid matching multiple elements
 */
export const SIDEBAR_SELECTORS = {
  [MODULE_NAMES.ADMIN]: '.oxd-main-menu-item:has-text("Admin")',
  [MODULE_NAMES.PIM]: '.oxd-main-menu-item:has-text("PIM")',
  [MODULE_NAMES.LEAVE]: '.oxd-main-menu-item:has-text("Leave")',
  [MODULE_NAMES.TIME]: '.oxd-main-menu-item:has-text("Time")',
  [MODULE_NAMES.RECRUITMENT]: '.oxd-main-menu-item:has-text("Recruitment")',
  [MODULE_NAMES.PERFORMANCE]: '.oxd-main-menu-item:has-text("Performance")',
  [MODULE_NAMES.DASHBOARD]: '.oxd-main-menu-item:has-text("Dashboard")',
  [MODULE_NAMES.MY_INFO]: '.oxd-main-menu-item:has-text("My Info")',
  [MODULE_NAMES.DIRECTORY]: '.oxd-main-menu-item:has-text("Directory")',
  [MODULE_NAMES.BUZZ]: '.oxd-main-menu-item:has-text("Buzz")',
  [MODULE_NAMES.CLAIM]: '.oxd-main-menu-item:has-text("Claim")',
  [MODULE_NAMES.MAINTENANCE]: '.oxd-main-menu-item:has-text("Maintenance")',
} as const;

/**
 * OrangeHRM-specific CSS selectors
 * Based on the oxd-* class pattern used in the application
 */
export const OXD_SELECTORS = {
  // Sidebar
  SIDEBAR: '.oxd-sidepanel',
  SIDEBAR_MENU: '.oxd-main-menu',
  SIDEBAR_MENU_ITEM: '.oxd-main-menu-item',
  SIDEBAR_TOGGLE: '.oxd-sidepanel-header .oxd-icon-button',

  // Topbar
  TOPBAR: '.oxd-topbar',
  TOPBAR_HEADER: '.oxd-topbar-header',
  SEARCH_INPUT: 'input[placeholder*="Search"]',
  USER_DROPDOWN: '.oxd-userdropdown',
  USER_DROPDOWN_MENU: '.oxd-dropdown-menu',
  USER_DROPDOWN_NAME: '.oxd-userdropdown-name',

  // Breadcrumbs
  BREADCRUMB: '.oxd-topbar-header-breadcrumb',
  BREADCRUMB_ITEM: '.oxd-topbar-header-breadcrumb-item',
  BREADCRUMB_LEVEL: '.oxd-topbar-header-breadcrumb-level',

  // Common
  TOAST: '.oxd-toast',
  MODAL: '.oxd-dialog',
  BUTTON: '.oxd-button',
  FORM: '.oxd-form',
} as const;
