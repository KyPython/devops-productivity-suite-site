# Tool Deep Dives - Technical Mastery

**Purpose:** Deep technical understanding of each tool so you can answer any question confidently.

---

## 🔧 Tool 1: Shell Games Toolkit

### Technical Architecture

**What it is:**
- Collection of POSIX-compliant shell scripts
- Designed for maximum portability (macOS, Linux, Windows WSL)
- No external dependencies beyond standard Unix tools

**Why POSIX matters:**
- POSIX = Portable Operating System Interface
- Ensures scripts work across different Unix-like systems
- Avoids bash-specific features that break on other shells
- Critical for teams using different operating systems

**The 3 Core Scripts:**

#### 1. `new-node-project.sh`
**Purpose:** Scaffold new Node.js/TypeScript projects

**What it does:**
1. Creates project directory structure
2. Initializes npm/package.json with sensible defaults
3. Sets up TypeScript configuration
4. Creates basic folder structure (src/, tests/, etc.)
5. Adds .gitignore
6. Installs common dependencies
7. Creates README template

**Customization points:**
- Project structure (folders, files)
- Default dependencies
- TypeScript config settings
- Testing framework (Jest, Mocha, etc.)

**Technical details:**
- Uses `mkdir -p` for safe directory creation
- Uses `cat` with heredoc for file creation
- Uses `npm init -y` for package.json
- Uses `npm install` for dependencies
- Error handling with `set -e` (exit on error)

**Common customizations:**
- Python projects: Replace npm with pip, add requirements.txt
- Java projects: Add Maven/Gradle structure
- Go projects: Add go.mod, standard Go layout

---

#### 2. `dev-env-check.sh`
**Purpose:** Verify required development tools are installed

**What it checks:**
- Node.js version
- npm version
- Git installation
- Required CLI tools
- Environment variables
- File permissions

**Why it matters:**
- Catches environment issues before they cause problems
- Ensures all developers have same tools
- Prevents "works on my machine" issues

**Technical details:**
- Uses `command -v` to check tool availability
- Uses `--version` flags to check versions
- Compares versions with `test` and `[ ]`
- Exits with error codes for CI/CD integration

**Common customizations:**
- Add checks for Docker, Kubernetes, cloud CLI tools
- Check for specific versions (not just "installed")
- Verify database connections
- Check disk space, memory

---

**Productivity Features (New):**

#### Port Configuration System
- **`port-config.sh`** - Centralized port management
- **`port-validation.sh`** - Port conflict detection
- **`.devops/ports.conf`** - Port configuration file
- Eliminates hardcoded ports in scripts

#### Migration Tool
- **`migrate-ports.sh`** - Automatically migrate existing projects
- Scans for hardcoded ports
- Extracts to configuration
- Updates scripts to use variables

#### Template System
- **`generate-scripts.sh`** - Generate dev scripts from templates
- Templates: `start-dev.sh`, `stop-dev.sh`, `health-check.sh`
- All use port configuration system
- Consistent script generation

#### Dependency Detection
- **`dependency-detection.sh`** - Auto-detect package managers
- Supports: npm, yarn, pnpm, pip, poetry, cargo, go
- Auto-install missing dependencies
- Monorepo support

---

#### 3. `simple-deploy.sh`
**Purpose:** Simulate deployment workflows

**What it does:**
1. Runs tests
2. Builds project
3. Creates deployment package
4. Validates deployment artifacts
5. Simulates deployment (dry-run)

**Why it matters:**
- Tests deployment process before production
- Catches deployment issues early
- Standardizes deployment steps

**Technical details:**
- Uses `npm test` or custom test command
- Uses `npm run build` or custom build command
- Creates tarball or zip file
- Validates file existence and permissions
- Can integrate with actual deployment tools

**Common customizations:**
- Add Docker build steps
- Add cloud deployment (AWS, GCP, Azure)
- Add database migrations
- Add environment variable validation

---

### Advanced Topics

**Error Handling:**
- `set -e`: Exit on error
- `set -u`: Exit on undefined variables
- `set -o pipefail`: Exit on pipe failures
- `trap`: Cleanup on exit

**Portability:**
- Avoid bash-specific features (`[[ ]]`, arrays)
- Use POSIX-compliant syntax (`[ ]`, `test`)
- Test on multiple systems
- Use `#!/bin/sh` instead of `#!/bin/bash`

**Security:**
- Validate user input
- Avoid `eval`
- Use quoted variables
- Check file permissions

---

## ⚙️ Tool 2: Ubiquitous Automation

### Technical Architecture

**What it is:**
- CI/CD automation system
- Multi-layer testing strategy
- GitHub Actions workflows
- Local automation scripts

**The Testing Pyramid:**
```
        /\
       /  \     10% System Tests (slow, few)
      /____\
     /      \   20% Integration Tests (medium speed)
    /________\
   /          \  70% Unit Tests (fast, many)
  /____________\
```

**Why this matters:**
- Fast feedback (unit tests run in milliseconds)
- Catch bugs at cheapest level
- System tests only for critical paths

---

### Local Automation Scripts

#### `test-all.sh`
**Purpose:** Run all tests locally

**What it does:**
1. Runs unit tests
2. Runs integration tests
3. Runs linting
4. Runs type checking
5. Reports results

**Technical details:**
- Uses `npm test` or custom test command
- Uses `npm run lint` for linting
- Uses `tsc --noEmit` for type checking
- Exits with error code if any step fails
- Can run in parallel with `&` and `wait`

---

#### `lint-and-test.sh`
**Purpose:** Quick quality check before commit

**What it does:**
1. Runs linting
2. Runs fast tests (unit tests only)
3. Exits quickly if issues found

**Why it matters:**
- Fast feedback before committing
- Catches issues before they enter repo
- Can be used as pre-commit hook

---

#### `pre-commit.sh`
**Purpose:** Git pre-commit hook

**What it does:**
1. Runs on every `git commit`
2. Runs linting and tests
3. Prevents commit if issues found
4. Can be bypassed with `--no-verify`

**Technical details:**
- Installed in `.git/hooks/pre-commit`
- Uses `git diff --cached` to check staged files
- Runs only on changed files (performance)
- Can be configured to skip certain checks

---

### GitHub Actions Workflows

#### Workflow Structure
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run lint
```

**Key Concepts:**
- **Triggers:** When workflow runs (push, PR, schedule)
- **Jobs:** Parallel execution units
- **Steps:** Sequential commands within jobs
- **Artifacts:** Files saved between jobs
- **Secrets:** Encrypted environment variables

**Common Workflows:**
1. **CI Workflow:** Runs on every push/PR
2. **CD Workflow:** Runs on merge to main
3. **Scheduled Workflow:** Runs on schedule (nightly tests)
4. **Manual Workflow:** Runs on manual trigger

---

### Integration Points

**Pre-commit Hooks:**
- Uses Husky (Node.js) or native Git hooks
- Runs before commit is created
- Can be bypassed but discouraged

**CI/CD Pipeline:**
- Runs on every push
- Runs on pull requests
- Can block merges if tests fail

**Local Scripts:**
- Can run same commands as CI
- Ensures "works locally" = "works in CI"
- Reduces CI failures

---

## 📝 Tool 3: Git Workflows Sample

### Branching Strategy

**GitFlow Model:**
```
main (production)
  └── develop (integration)
       ├── feature/user-auth
       ├── feature/payment
       └── hotfix/critical-bug
```

**GitHub Flow (Simpler):**
```
main (production)
  ├── feature/user-auth
  ├── feature/payment
  └── hotfix/critical-bug
```

**When to use which:**
- **GitFlow:** Complex projects, multiple environments, release cycles
- **GitHub Flow:** Simpler projects, continuous deployment, small teams

---

### Branch Protection Rules

**Main Branch Protection:**
- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require branches to be up to date
- Restrict who can push
- Require linear history

**Why it matters:**
- Prevents broken code in production
- Ensures code review
- Maintains code quality
- Prevents force pushes

---

### Pull Request Templates

**Standard Template:**
```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
```

**Why it matters:**
- Ensures consistent PR information
- Helps reviewers understand changes
- Documents testing approach
- Tracks change types

---

### Code Review Process

**Review Checklist:**
1. Code follows style guidelines
2. Tests are included
3. Documentation is updated
4. No breaking changes (or documented)
5. Performance considered
6. Security considered

**Review Best Practices:**
- Be constructive, not critical
- Explain why, not just what
- Suggest improvements, don't just reject
- Approve when ready, don't delay

---

## 🏗️ Tool 4: Code Generator Tool

### Template System

**Template Structure:**
```
templates/
  ├── react-component.template
  ├── api-route.template
  └── database-model.template
```

**Template Syntax:**
```
{{COMPONENT_NAME}} - Component name
{{PROPS}} - Props interface
{{STYLES}} - CSS/styling
```

**How it works:**
1. Load template file
2. Replace placeholders with values
3. Write to output directory
4. Check for overwrites

---

### Overwrite Protection

**Why it matters:**
- Prevents accidental code loss
- Protects existing implementations
- Forces intentional changes

**How it works:**
- Check if file exists
- If exists, prompt user
- `--force` flag to overwrite
- `--dry-run` to preview

---

### Extensibility

**Adding New Templates:**
1. Create template file
2. Define placeholders
3. Add to template registry
4. Test generation

**Custom Placeholders:**
- Can define custom placeholders
- Can add validation
- Can add conditional logic
- Can chain templates

---

## 🔍 Tool 5: Software Entropy

### Code Smell Detection

**What are code smells?**
- Indicators of potential problems
- Not bugs, but warning signs
- Suggest refactoring needed

**Common Code Smells:**
1. **Long Functions:** > 50 lines (configurable)
2. **Large Files:** > 500 lines (configurable)
3. **High Complexity:** Cyclomatic complexity > 10
4. **TODO Density:** > 5 TODOs per 100 lines
5. **Duplicate Code:** Similar code blocks

---

### Rule System

**Pluggable Rules:**
- Each rule is independent
- Can enable/disable rules
- Can configure thresholds
- Can add custom rules

**Rule Structure:**
```typescript
interface Rule {
  name: string;
  description: string;
  check: (file: File) => Issue[];
  threshold: number;
}
```

**Built-in Rules:**
1. Function length
2. File length
3. TODO density
4. Complexity
5. Duplication (basic)

---

### Output Formats

**JSON Output:**
```json
{
  "issues": [
    {
      "file": "src/utils.ts",
      "line": 45,
      "rule": "function-length",
      "severity": "warning",
      "message": "Function is 75 lines, threshold is 50"
    }
  ],
  "summary": {
    "totalIssues": 12,
    "bySeverity": {
      "error": 2,
      "warning": 10
    }
  }
}
```

**Pretty Console Output:**
```
src/utils.ts:45 - Function is 75 lines (threshold: 50)
src/models/user.ts:120 - File is 650 lines (threshold: 500)
```

**Why multiple formats:**
- JSON for CI/CD integration
- Pretty for human reading
- Can add HTML, CSV, etc.

---

### CI/CD Integration

**Unified CI/CD Pattern:**
All tools now include `.github/workflows/example.yml` files showing complete CI/CD integration. They all support:
- Automatic CI detection (GitHub Actions, GitLab CI, CircleCI, etc.)
- `CI=true` environment variable for explicit CI mode
- Graceful failure for optional checks
- GitHub Actions annotations for better visibility

**GitHub Actions Example:**
```yaml
- name: Run Software Entropy
  run: npx software-entropy scan --format json --threshold high
- name: Fail if issues found
  run: |
    if [ $(jq '.summary.totalIssues' entropy-report.json) -gt 0 ]; then
      exit 1
    fi
```

**See `.github/workflows/example.yml` in each repository for complete examples.**

**Why it matters:**
- Prevents quality degradation
- Catches issues before merge
- Enforces quality standards
- Provides visibility

---

## 🔗 Integration Patterns

### Unified Integration Pattern

**All tools now work together via unified patterns:**

**1. NPM Script Integration:**
All tools provide npm script templates in `examples/package.json.scripts.example.json`:
```json
{
  "scripts": {
    "check-env": "./scripts/dev-env-check.sh",
    "test:all": "./scripts/test-all.sh",
    "git:pr": "git-workflow pr",
    "gen:component": "gen generate component",
    "quality:check": "software-entropy ."
  }
}
```

**2. CI/CD Compatibility:**
All scripts automatically detect CI environments and adjust behavior:
- No interactive prompts in CI
- Optional checks fail gracefully
- Standardized exit codes (0=success, 1=failure, 2=partial)

**3. GitHub Actions Examples:**
Each tool includes `.github/workflows/example.yml` with:
- Complete workflow examples
- Multi-job configurations
- Best practices for automation

### Complete Workflow Example

**Scenario:** New feature development

1. **Shell Games:** `npm run check-env` verifies environment
2. **Shell Games:** `new-node-project.sh` creates project structure
3. **Code Generator:** `npm run gen:component Button` generates component
4. **Git Workflows:** `npm run git:pr` creates branch and prepares PR
5. **Ubiquitous Automation:** Pre-commit hooks run automatically
6. **Git Workflows:** `npm run git:pr` runs all checks before PR
7. **Ubiquitous Automation:** CI runs full test suite (from `.github/workflows/example.yml`)
8. **Software Entropy:** `npm run quality:check:ci` checks code quality in CI
9. **Git Workflows:** Merge to main after approval
10. **Ubiquitous Automation:** CD deploys to production

**Value:** Complete automation from project creation to deployment, all accessible via simple npm commands.

---

### Customization Points

**Each tool can be customized:**
- Shell Games: Scripts for your stack
- Code Generator: Templates for your patterns
- Git Workflows: Branching strategy for your team
- Ubiquitous Automation: Workflows for your CI/CD
- Software Entropy: Rules for your standards

**The Setup Process:**
1. Discovery call: Understand your needs
2. Customization: Adapt tools to your stack
3. Integration: Set up in your repos
4. Training: Teach your team
5. Support: Ongoing help

---

## 🎯 Technical Troubleshooting

### Common Issues & Solutions

#### Issue: Shell scripts don't work on Windows
**Solution:** Use WSL (Windows Subsystem for Linux) or Git Bash

#### Issue: GitHub Actions workflow fails
**Solution:** Check logs, ensure dependencies are installed, verify secrets

#### Issue: Pre-commit hooks are too slow
**Solution:** Run only on changed files, skip slow checks, use parallel execution

#### Issue: Code Generator overwrites existing code
**Solution:** Use `--dry-run` first, check `--force` flag, backup before generating

#### Issue: Software Entropy flags too many issues
**Solution:** Adjust thresholds, start lenient and tighten gradually, add exceptions

---

## 📚 Further Reading

### Shell Scripting
- POSIX Shell Specification
- "Advanced Bash-Scripting Guide"
- Shell script best practices

### CI/CD
- GitHub Actions documentation
- "Continuous Delivery" by Jez Humble
- CI/CD best practices

### Git
- "Pro Git" by Scott Chacon
- Git branching strategies
- Code review best practices

### Code Quality
- "Refactoring" by Martin Fowler
- Code smell catalog
- Technical debt management

---

**Master these technical details, and you can answer any question confidently.**














