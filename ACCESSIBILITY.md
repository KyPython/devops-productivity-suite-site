# Accessibility Testing

This project includes automated accessibility testing in the CI/CD pipeline to ensure our website meets WCAG 2.1 AA standards.

## Running Accessibility Tests Locally

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Start a local server:
```bash
npm run serve
```

This will start a server on `http://localhost:3000`

### Running Tests

#### Option 1: Using pa11y-ci (Recommended for CI/CD)
```bash
npm run test:a11y
```

This uses the `.pa11yci.json` configuration file and tests all pages defined in the config.

#### Option 2: Using the custom TypeScript script
```bash
npm run test:a11y:local
```

This script tests the main pages and provides a detailed summary.

#### Option 3: Using axe-core CLI
```bash
npm run test:a11y:axe
```

This uses the `@axe-core/cli` tool with the `.axerc.json` configuration.

## CI/CD Integration

Accessibility tests run automatically in GitHub Actions on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop` branches

The workflow:
1. Builds the project
2. Starts a local server
3. Runs accessibility tests using `pa11y-ci`
4. Uploads test results as artifacts

## Tested Pages

The following pages are tested for accessibility:
- Landing page (`/`)
- Checklist page (`/checklist.html`)
- Presentation page (`/presentation.html`)

## Accessibility Standards

Tests are configured to check against **WCAG 2.1 AA** standards, which include:
- Color contrast requirements
- Keyboard navigation
- Screen reader compatibility
- Semantic HTML structure
- Form labels and inputs
- Image alt text
- Heading hierarchy
- And more...

## Fixing Accessibility Issues

When accessibility tests fail:

1. Review the error messages in the CI/CD output
2. Each error will indicate:
   - The page/URL where the issue was found
   - The specific accessibility rule that failed
   - The element or code that needs to be fixed
3. Fix the issues in your code
4. Re-run the tests locally to verify fixes
5. Push your changes - the CI/CD pipeline will automatically test again

## Configuration Files

- `.pa11yci.json` - Configuration for pa11y-ci (used in CI/CD)
- `.axerc.json` - Configuration for axe-core CLI (alternative tool)
- `scripts/test-accessibility.ts` - Custom TypeScript test script

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [pa11y Documentation](https://pa11y.org/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)

