### Summary

This pull request introduces a comprehensive testing suite for the `@fraud-detector/core` package using `vitest`. It adds unit tests for the `analyzeDocument` function, covering various scenarios, including heuristic checks and LLM-based analysis.

### Changes

- **Added `vitest`**: Integrated `vitest` as the testing framework and configured it for the workspace.
- **Test Scripts**: Added `test` and `test:cov` scripts to the root `package.json`.
- **Unit Tests**: Created `analyzeDocument.test.ts` with the following test cases:
  - A valid document should not be flagged as fraudulent.
  - An invoice with a mismatched total is correctly flagged.
  - A document with suspicious PDF metadata is flagged.
  - The system correctly handles fraud detection based on LLM responses.
- **Mocking**: Implemented mocking for the document parser and LLM to ensure isolated and predictable test runs.
- **Refactoring**: Minor refactoring was done to fix module resolution issues that were preventing tests from running. This included creating local placeholder modules for `prompts` and `models`.

### How to Test

1. Navigate to the `ai-invoice-receipt-fraud-detector` directory.
2. Run `pnpm install` to ensure all dependencies are installed.
3. Run `pnpm test` to execute the test suite.
4. Run `pnpm test:cov` to see the test coverage report.

All tests should pass, and the coverage report will show the extent to which the `core` package is tested.
