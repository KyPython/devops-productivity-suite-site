# Infrastructure Standards: IaC Fundamentals

**Objective:** Establish the foundation for the product's infrastructure. We are moving away from manual configuration to defining, provisioning, and managing our environment using code (Terraform). This ensures our production environment is stable, reproducible, and secure.

---

## 🛠️ Engineering Standards

- **Declarative over Imperative:** We define *what* the infrastructure should look like, not the script to build it.
- **Workflow Compliance:** All changes follow the `init` -> `plan` (review) -> `apply` cycle.
- **State Management:** The **Terraform State file** (`terraform.tfstate`) is the source of truth. For the product, this will eventually move to remote storage (e.g., S3) to allow team collaboration.
- **Drift Detection:** We monitor for "Drift" (when the actual cloud state differs from our code) to ensure no unauthorized manual changes occur.
- **No Hardcoding:** We use **Variables** for configuration (names, sizes, environments) to ensure the same code can be reused across Staging and Production.
- **Modularity:** We use **Modules** to encapsulate logic. We do not copy-paste resource blocks; we instantiate modules.

---

## 🏗️ Product Infrastructure Principles

- **Infrastructure as Software:** We treat our servers, databases, and networks exactly like our application code. They are version-controlled, peer-reviewed via Pull Requests, and tested.
- **Zero "ClickOps":** No one manually configures resources in the AWS/Cloud console. This eliminates human error and ensures Staging matches Production exactly.
- **Automated Disaster Recovery:** If a region fails, we can redeploy the entire product infrastructure to a new region in minutes using our existing codebase.

---

## 📋 Architecture Decisions & FAQ

**Decision: Why not use the Console for quick fixes?**
> **Rationale:** While faster initially, console changes are unmaintainable, lack an audit trail, and will be overwritten by Terraform (Drift) on the next deployment. We prioritize reproducibility and stability over speed of ad-hoc changes.

**Concept: The State File**
> **Context:** Terraform maps our code (e.g., `resource "aws_s3_bucket" "b"`) to real-world IDs (e.g., `bucket-12345`) via the State file. Losing this file means losing control of our infrastructure.

**Safety: Preventing Accidental Deletion**
> **Protocol:** We always run `terraform plan` before `apply`. This "dry run" shows exactly what will be created, updated, or destroyed. We never apply blindly.

---

## 🚀 Implementation Steps

1.  **Environment Setup:** Ensure Terraform is installed (`terraform --version`).
2.  **Initial Configuration:** Create a `main.tf` in the infrastructure directory. For testing the workflow without cloud costs, we will start with the `local` provider:
    ```hcl
    resource "local_file" "foo" {
      content  = "Hello, IaC!"
      filename = "${path.module}/hello.txt"
    }
    ```
    Run `terraform init`, `terraform plan`, and `terraform apply`.
3.  **State Analysis:** Observe the generated `terraform.tfstate`. Change the `content` in `main.tf` and run `terraform plan` to see how Terraform detects drift.
4.  **Security Check:** Ensure `.gitignore` is configured to exclude `*.tfstate` and `.terraform/` folders to prevent leaking sensitive infrastructure data.
5.  **Auto-Formatting Setup:** Install pre-commit hooks for automatic Terraform formatting (see below).

---

## 🔧 Terraform Formatting & Pre-Commit Hooks

**Objective:** Automatically format Terraform files before commits, ensuring consistent code style across the team without manual intervention.

### Features

- **Auto-format on commit:** Terraform files (`.tf`, `.tfvars`) are automatically formatted using `terraform fmt`
- **Auto-stage formatted files:** Formatted files are automatically staged, so you don't need to re-add them
- **Validation:** Terraform syntax is validated before allowing commits
- **Smart failure:** Only fails if formatting can't be applied or validation fails (not for minor style issues)

### Setup

1. **Install the pre-commit hook:**
   ```bash
   chmod +x scripts/setup-terraform-pre-commit.sh
   ./scripts/setup-terraform-pre-commit.sh
   ```

2. **Verify it works:**
   ```bash
   # Make a change to a .tf file with bad formatting
   echo 'resource "local_file" "test" {content="test"filename="test.txt"}' >> infrastructure/main.tf
   
   # Stage and try to commit
   git add infrastructure/main.tf
   git commit -m "Test formatting"
   
   # The hook will format the file, stage it, and allow the commit
   ```

### How It Works

1. When you commit, the pre-commit hook runs automatically
2. It checks all staged `.tf` and `.tfvars` files
3. Files that need formatting are automatically formatted with `terraform fmt`
4. Formatted files are automatically staged with `git add`
5. Terraform validation runs to ensure syntax is correct
6. Commit proceeds if formatting succeeds and validation passes

### Manual Formatting

You can also format files manually:
```bash
# Format all Terraform files in current directory
terraform fmt

# Format specific file
terraform fmt infrastructure/main.tf

# Check formatting without modifying files
terraform fmt -check
```

### Benefits

- ✅ **Consistent style:** All Terraform code follows the same formatting rules
- ✅ **No manual work:** Formatting happens automatically on commit
- ✅ **Catches errors early:** Validation prevents invalid Terraform from being committed
- ✅ **Team alignment:** Everyone's code looks the same without discussion
- ✅ **CI/CD ready:** Works seamlessly in automated environments

---

Building a robust foundation for the product.