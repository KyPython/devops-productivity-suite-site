# Week 2, Day 1: Infrastructure as Code (IaC) Fundamentals

**Part of DevOps Productivity Suite - Tool #6: Infrastructure as Code (Terraform)**

**Goal for Today:** Stop clicking buttons in the cloud console. Learn to define, provision, and manage infrastructure using code (Terraform), enabling reproducible and version-controlled environments.

This study material aligns with **Tool #6: Infrastructure as Code (Terraform)** in the DevOps Productivity Suite package.

---

## 🎯 Mastery Checklist

- [ ] Can explain the difference between **Declarative** (what I want) and **Imperative** (how to do it) infrastructure.
- [ ] Understand the core workflow of Terraform: `init` -> `plan` -> `apply`.
- [ ] Can explain the purpose of the **Terraform State file** (`terraform.tfstate`) and why it must be protected.
- [ ] Can write a basic `main.tf` file to define a simple cloud resource (like an S3 bucket or EC2 instance).
- [ ] Understand the concept of **Drift** (when reality differs from your code).

---

## 🗣️ Key Talking Points

- **"We treat infrastructure exactly like software. By defining servers, databases, and networks in code, we can version control them, review changes via Pull Requests, and roll back if something breaks."**
- **"This eliminates 'ClickOps'. No one is manually configuring servers in the AWS console, which removes human error and ensures that Staging matches Production exactly."**
- **"Disaster Recovery becomes automated. If a region goes down, we can redeploy the entire infrastructure to a new region in minutes using the same code."**

---

## ❓ Common Questions & Answers

**Q: "Why can't I just use the AWS Console? It's faster."**
> **A:** "It's faster for the *first* time, but it's unmaintainable. You can't 'undo' a click in the console easily, and you can't see a history of who changed what. IaC provides an audit trail and reproducibility that manual clicking never can."

**Q: "What is this 'State' file?"**
> **A:** "Terraform needs a map to know what it created. The state file maps your code (e.g., `resource "aws_s3_bucket" "b"`) to the real-world ID (e.g., `bucket-12345`). It's the source of truth. If you lose it, Terraform loses track of your infrastructure."

**Q: "Is this safe? Will it delete my database?"**
> **A:** "That is why we use `terraform plan`. It is a 'dry run' that shows you exactly what will happen (create, update, or destroy) before you confirm. We never run `apply` without reviewing the `plan` first."

---

## 🧠 Practice & Study Exercises

1.  **Terraform Setup:** Install Terraform on your local machine. Run `terraform --version` to verify.
2.  **Write Your First Config:** Create a file named `main.tf`. Use the `local` provider to create a text file on your computer. This allows you to test IaC concepts without needing AWS credentials yet.
    ```hcl
    resource "local_file" "foo" {
      content  = "Hello, IaC!"
      filename = "${path.module}/hello.txt"
    }
    ```
    Run `terraform init`, `terraform plan`, and `terraform apply`. Check if the file was created.
3.  **Analyze State:** Look at the `terraform.tfstate` file that was generated. Try to change the `content` in your `main.tf` and run `terraform plan` again. Observe how Terraform detects the change.

---

## 📚 Related Documentation

- **DevOps Productivity Suite:** See `BUSINESS_MATERIALS/DEVOPS_PRODUCTIVITY_SUITE.md` for complete tool documentation
- **Infrastructure Standards:** See `BUSINESS_MATERIALS/infrastructure/INFRASTRUCTURE.md` for engineering standards and best practices

---

Welcome to the world of modern operations.

