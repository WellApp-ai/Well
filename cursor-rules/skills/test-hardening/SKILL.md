---
name: test-hardening
description: Convert passed QA Contract criteria to automated tests
---

# Test Hardening Skill

Convert verified QA Contract criteria (G#N, AC#N) into permanent automated tests. Ensures passing scenarios become regression tests.

## When to Use

- After qa-commit returns GREEN for a commit
- After debug skill fixes an issue (Phase 7: Harden)
- Before pushing PR (ensure all criteria have tests)
- Manually with "use test-hardening skill"

## Input: Verification Report

From qa-commit's Verification Report:
- List of passed G#N (Gherkin scenarios)
- List of passed AC#N (acceptance criteria)

## Phase 1: Analyze Criteria

### 1.1 Categorize by Test Type

| Criteria Type | Test Framework | Location |
|---------------|----------------|----------|
| G#N (Backend) | Jest | `apps/api/**/*.test.ts` |
| AC#N (UI State) | Storybook | `**/*.stories.tsx` |
| AC#N (Interaction) | Playwright | `tests/e2e/**/*.spec.ts` |

### 1.2 Check Existing Tests

```
Grep: "G#[N]" or "[scenario name]" in test files
```

Skip if test already exists.

## Phase 2: Generate Backend Tests (G#N)

For each passed G#N without existing test:

### 2.1 Template

```typescript
// apps/api/src/[feature]/__tests__/[feature].test.ts

describe('[Feature Name]', () => {
  // G#1: [Scenario name]
  it('should [expected behavior]', async () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const response = await request(app)
      .[method]('[endpoint]')
      .send(input);
    
    // Assert
    expect(response.status).toBe([status]);
    expect(response.body).toMatchObject({ /* expected */ });
  });

  // G#2: [Scenario name]
  it('should return [error] when [condition]', async () => {
    // Test implementation
  });
});
```

### 2.2 Generate Test

1. Extract endpoint, method, expected response from G#N
2. Create test file if not exists
3. Add test case with G#N reference in comment
4. Run test to verify it passes

```bash
npm run test -- --grep "[scenario name]"
```

## Phase 3: Generate Storybook Stories (AC#N - States)

For state-based AC#N:

### 3.1 Template

```typescript
// apps/web/src/[component]/[Component].stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Features/[Feature]/[Component]',
  component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

// AC#1: Renders without error
export const Default: Story = {
  args: { /* default props */ },
};

// AC#2: Shows loading state
export const Loading: Story = {
  args: { isLoading: true },
};

// AC#3: Shows error state
export const Error: Story = {
  args: { error: 'Something went wrong' },
};

// AC#4: Shows empty state
export const Empty: Story = {
  args: { data: [] },
};
```

### 3.2 Generate Story

1. Check if stories file exists
2. Add missing story variants for each AC#N
3. Run Storybook to verify renders

```bash
npm run storybook -- --smoke-test
```

## Phase 4: Generate E2E Tests (AC#N - Interactions)

For interaction-based AC#N:

### 4.1 Template

```typescript
// tests/e2e/[feature].spec.ts

import { test, expect } from '@playwright/test';

test.describe('[Feature Name]', () => {
  // AC#5: User can submit form
  test('should allow form submission', async ({ page }) => {
    await page.goto('/[route]');
    
    await page.fill('[name="field"]', 'value');
    await page.click('[type="submit"]');
    
    await expect(page.locator('.success')).toBeVisible();
  });

  // AC#6: Keyboard navigation works
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/[route]');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('name', 'first-field');
  });
});
```

### 4.2 Generate Test

1. Check if E2E test file exists
2. Add test case for each interaction AC#N
3. Run Playwright to verify

```bash
npx playwright test [feature].spec.ts
```

## Phase 5: Verify Tests Pass

Run all generated tests:

```bash
# Backend
npm run test

# Storybook
npm run storybook -- --smoke-test

# E2E (if applicable)
npx playwright test
```

## Phase 6: Update Test Summary

```markdown
## Test Hardening Report

### Generated Tests

| Criteria | Type | File | Status |
|----------|------|------|--------|
| G#1 | Jest | `[path]` | CREATED/EXISTS |
| G#2 | Jest | `[path]` | CREATED/EXISTS |
| AC#1 | Storybook | `[path]` | CREATED/EXISTS |
| AC#3 | Playwright | `[path]` | CREATED/EXISTS |

### Test Results

| Suite | Total | Passed | Failed |
|-------|-------|--------|--------|
| Jest | [N] | [N] | 0 |
| Storybook | [N] | [N] | 0 |
| Playwright | [N] | [N] | 0 |

### Coverage Update

- Backend: [N]% → [N]%
- Frontend: [N]% → [N]%
```

## Integration with Debug

When invoked from debug skill Phase 7 (Harden):

1. Receive the reproduction steps from debug
2. Create regression test to prevent recurrence
3. Add test with reference to original issue

```typescript
// Regression test for [issue description]
// Debug session: [date]
it('should not [bug behavior] when [condition]', async () => {
  // Reproduction steps from debug
});
```

## Invocation

Invoked by:
- `qa-commit` - After GREEN verdict
- `debug` - Phase 7 Harden
- Push-pr mode - Pre-push verification

Or manually with "use test-hardening skill".
