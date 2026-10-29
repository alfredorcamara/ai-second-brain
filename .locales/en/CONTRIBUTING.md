# Contributing Guide (CONTRIBUTING.md)

Thank you for your interest in contributing to **AI Second Brain**! 🧠✨

## How to Contribute

1. **Fork** the repository on GitHub.
2. **Create a branch** for your feature or fix (`git checkout -b feat/my-feature`).
3. **Respect the Core Rules**:
   - Read [00-core.md](.agents/rules/00-core.md) and [01-ai-decision.md](.agents/rules/01-ai-decision.md).
   - Never hardcode AI model catalogs or break existing governance contracts.
4. **Validate Integrity**:
   - Run `npm run doctor` (`node scripts/doctor.js`) and ensure **100% health** (zero broken links or JS syntax errors).
5. **Commit** following Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).
6. **Open a Pull Request** describing the context, problem solved, and validation steps.

## Contributor License Agreement (CLA)

By submitting a Pull Request, you agree to the terms of our [CLA.md](CLA.md).
