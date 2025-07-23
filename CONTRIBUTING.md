# Contributing to Well

Thank you for your interest in contributing to Well! We welcome contributions from developers, designers, product thinkers, and anyone who wants to improve how invoices are collected and automated.

Whether you're fixing bugs, suggesting features, creating new provider blueprints, or helping with documentation — every bit counts.

---

## Ways to Contribute

### Fix a Bug

* Check the [Issues](https://github.com/your-org/well/issues) tab for open bug reports.
* Look for issues labeled `good first issue` or `help wanted`.
* Submit a pull request with a clear title and description of the fix.

### Suggest or Build a Feature

* Propose a new feature via an issue.
* Include context, user need, and possible implementation ideas.
* You're also welcome to open a PR directly if the change is small and self-contained.

### Contribute a Provider Blueprint

* Use **Contributor Mode** in the Chrome extension to guide the AI through a new invoice workflow.
* Once the blueprint is generated, export it and submit it via pull request.
* Include a description of the provider and any edge cases you covered.

### 📚 Improve Documentation

* Spot a typo? Want to add a helpful example? Found missing install steps?
* We love copy updates just as much as code. Submit away!

### 💬 Join the Discussion

* Share feedback, questions, or improvement ideas in our [Discussions](https://github.com/your-org/well/discussions).
* Upvote features you’d like to see or add comments on active issues.

---

## 💡 Continuous Improvement Process

We have a dedicated process for collecting and implementing improvement ideas. See our [IDEAS.md](IDEAS.md) for details on:
- How to submit improvement ideas
- Our prioritization process
- Monthly triage sessions
- Recognition for contributors

### Quick Links for Ideas
- **Report extraction failures**: [Create Bug Report](../../issues/new?template=bug_report.md)
- **Suggest features**: [Create Feature Request](../../issues/new?template=feature_request.md)
- **General discussions**: [Start a Discussion](../../discussions)

## 🚀 Getting Started with Code Contributions

### Prerequisites
- Node.js (version 16 or higher)
- Python (version 3.8 or higher)
- Git

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/Well.git
   cd Well
   ```

2. **Install dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run tests to ensure everything works**
   ```bash
   npm test
   python -m pytest
   ```

## 📝 Code Contribution Guidelines

### Branch Naming Convention
- `feature/description` - for new features
- `bugfix/description` - for bug fixes
- `improvement/description` - for enhancements
- `docs/description` - for documentation updates

### Commit Message Format
```
type(scope): brief description

Detailed description of changes (if needed)

Fixes #issue-number (if applicable)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   python -m pytest
   npm run lint
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat(extraction): improve receipt field detection"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

## 🧪 Testing Guidelines

### Unit Tests
- Write tests for all new functions
- Maintain test coverage above 80%
- Use descriptive test names

### Integration Tests
- Test extraction workflows end-to-end
- Include various document formats
- Test error handling scenarios

### Test Data
- Use anonymized/synthetic test documents
- Never commit real personal/financial data
- Document test case characteristics

## 📚 Documentation Standards

### Code Documentation
- Use clear, descriptive variable names
- Add comments for complex logic
- Document all public APIs
- Include usage examples

### README Updates
- Update installation instructions if needed
- Add new features to feature list
- Update API documentation
- Include migration guides for breaking changes

## 🐛 Bug Reports & Extraction Failures

When reporting bugs or extraction failures, please include:

### For Code Bugs
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, versions)
- Error messages or logs

### For Extraction Failures
- Document format and characteristics
- Expected extraction results
- Actual extraction results
- Anonymized sample document (if possible)

Use our [bug report template](../../issues/new?template=bug_report.md) for consistency.

## 🎯 Feature Requests

Before submitting a feature request:
1. Check existing issues and discussions
2. Consider the broader impact on users
3. Think about implementation complexity
4. Provide clear use cases

Use our [feature request template](../../issues/new?template=feature_request.md).

## 🔍 Code Review Process

### For Contributors
- Be open to feedback
- Respond to review comments promptly
- Make requested changes in separate commits
- Squash commits before final merge

### For Reviewers
- Be constructive and specific
- Focus on code quality and maintainability
- Check for security implications
- Verify tests and documentation

## 🏷️ Issue Labels

We use labels to organize and prioritize work:

- **Type**: `bug`, `feature`, `enhancement`, `documentation`
- **Priority**: `critical`, `high`, `medium`, `low`
- **Area**: `accuracy`, `performance`, `compatibility`, `ux`, `security`
- **Status**: `triage`, `ready`, `in-progress`, `blocked`, `waiting-for-review`

## 🤝 Community Guidelines

### Be Respectful
- Use inclusive language
- Be patient with newcomers
- Provide constructive feedback
- Respect different perspectives

### Stay Focused
- Keep discussions relevant
- Use appropriate channels (issues vs discussions)
- Search before creating new issues
- Follow templates when provided

## 🚀 Release Process

1. **Development** → Feature branches
2. **Testing** → Integration testing on develop branch
3. **Review** → Code review and approval
4. **Staging** → Deploy to staging environment
5. **Release** → Merge to main and tag version
6. **Documentation** → Update changelog and docs

## 📞 Getting Help

- **Questions about contributing**: Use [Discussions](../../discussions)
- **Technical issues**: Create an [Issue](../../issues)
- **Real-time chat**: Join our Discord (link in README)
- **Email**: contact@yourproject.com (for sensitive matters)

## 🎉 Recognition

We appreciate all contributions! Contributors may receive:
- GitHub contributor badge
- Mention in release notes
- Feature naming rights for major contributions
- Early access to new features

## 📋 Checklist for New Contributors

- [ ] Read this CONTRIBUTING.md
- [ ] Review our [IDEAS.md](IDEAS.md) process
- [ ] Set up development environment
- [ ] Run tests successfully
- [ ] Read existing code to understand patterns
- [ ] Check open issues for "good first issue" labels
- [ ] Join community discussions

---

Thank you for contributing to making invoice and receipt extraction better for everyone! 🙏

*Last updated: [Current Date]*