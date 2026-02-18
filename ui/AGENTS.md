# UI Layer

Page Objects + Components for OrangeHRM.

## STRUCTURE

```
ui/
├── components/           # Reusable UI components
│   ├── base-component.ts # Abstract base with semantic helpers
│   ├── *-component.ts    # Concrete components
│   └── navigation/       # Sidebar, Topbar, Breadcrumb
├── pages/                # Page Objects by module
│   ├── base-page.ts      # Abstract page base
│   ├── login-page.ts     # Authentication
│   ├── dashboard-page.ts # Main dashboard
│   ├── pim/              # PIM module pages
│   ├── admin/            # Admin module pages
│   ├── leave/            # Leave module pages
│   └── ...
└── index.ts              # Barrel export
```

## WHERE TO LOOK

| Task              | Location                                                     |
| ----------------- | ------------------------------------------------------------ |
| Add page object   | `ui/pages/{module}/{name}-page.ts`                           |
| Add component     | `ui/components/{name}-component.ts`                          |
| Modify navigation | `ui/components/navigation/`                                  |
| Update base class | `ui/components/base-component.ts` or `ui/pages/base-page.ts` |

## COMPONENT PATTERN

All components extend `BaseComponent`:

```typescript
class MyComponent extends BaseComponent {
  constructor(page: Page) {
    super(page, '.my-selector'); // or pass Locator
  }

  // Use semantic helpers from base
  async getValue(): Promise<string> {
    const input = this.getByLabel(/value/i);
    return input.inputValue();
  }
}
```

## PAGE OBJECT PATTERN

All pages extend `BasePage`:

```typescript
class MyPage extends BasePage {
  readonly submitButton: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.submitButton = page.getByRole('button', { name: /submit/i });
  }
}
```

## CONVENTIONS

- **Semantic locators first**: `getByRole`, `getByLabel`, `getByPlaceholder`
- **CSS fallback**: `.oxd-*` classes only when semantic unavailable
- **Locator properties**: Define as `readonly` in constructor
- **Error handling**: Use `.catch(() => false)` for visibility checks
