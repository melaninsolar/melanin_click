# Contributing to Melanin Click

Thank you for your interest in contributing to Melanin Click! This document provides guidelines for contributing to our cryptocurrency mining platform.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally: `git clone https://github.com/YOUR_USERNAME/melanin_click.git`
3. **Install dependencies** and **run tests**: `./tests/run_tests.sh`
4. **Create a feature branch**: `git checkout -b feature/your-feature-name`
5. **Make your changes** and **commit**: `git commit -m "Description of changes"`
6. **Push and create a pull request**

## 📋 Development Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Rust** 1.70+ and Cargo
- **Platform-specific dependencies**:
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libwebkit2gtk-4.1-dev`, `libssl-dev`
  - **Windows**: Microsoft C++ Build Tools

### Environment Setup
```bash
cd melanin_click_tauri
npm install
cp ../.env.example ../.env  # Configure your environment variables
cargo check                # Verify Rust setup
npm run tauri:dev          # Start development server
```

## 🧪 Testing

**Run the complete test suite before submitting:**
```bash
./tests/run_tests.sh
```

This includes:
- Rust unit tests and clippy linting
- TypeScript compilation checks
- Frontend build verification
- Security vulnerability scanning
- Project structure validation

## 📝 Code Standards

### Rust Backend
- **Follow Rust conventions**: Use `cargo fmt` and `cargo clippy`
- **Write tests**: Add unit tests for new functionality
- **Handle errors**: Use `AppError` for error handling
- **Document functions**: Use doc comments for public APIs
- **Security first**: Validate all inputs, use environment variables for secrets

### TypeScript Frontend
- **Use TypeScript strictly**: Enable strict mode checks
- **Follow React patterns**: Use hooks and functional components
- **Style with Tailwind**: Use utility classes consistently
- **Handle states**: Manage loading, error, and success states

### Git Conventions
- **Conventional commits**: Use format `type(scope): description`
- **Feature branches**: Create branches from `main` for new features
- **Small commits**: Make focused, atomic commits
- **Clear messages**: Write descriptive commit messages

## 🐛 Bug Reports

When reporting bugs, include:

1. **Environment details** (OS, version, hardware)
2. **Steps to reproduce** the issue
3. **Expected vs actual behavior**
4. **Screenshots or logs** if applicable
5. **Mining configuration** if mining-related

## 💡 Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're solving
3. **Propose a solution** if you have ideas
4. **Consider implementation complexity** and maintenance burden
5. **Align with project roadmap** - see [TODO.md](../TODO.md)

## 🔒 Security

- **Never commit secrets**: Use `.env` files and environment variables
- **Validate all inputs**: Especially mining addresses and pool URLs
- **Report security issues privately**: Email the maintainers directly
- **Follow security best practices**: See our security guidelines in testing

## 📚 Documentation

- **Update documentation** for any user-facing changes
- **Add code comments** for complex logic
- **Update README.md** if changing system structure
- **Keep TODO.md current** with sprint progress

## 🎯 Project Structure

Understanding our architecture helps with contributions:

```
melanin_click/
├── melanin_click_tauri/     # Main Tauri application
│   ├── src/                 # React frontend
│   └── src-tauri/           # Rust backend
├── tests/                   # Testing framework
├── docs/                    # Technical documentation
└── assets/                  # Application assets
```

## 🤝 Code Review Process

1. **Automated checks**: CI/CD must pass (tests, linting, building)
2. **Code review**: At least one maintainer review required
3. **Testing**: Verify changes work in development environment
4. **Documentation**: Ensure docs are updated if needed
5. **Merge**: Squash and merge to maintain clean history

## 🚀 Sprint Development

We follow a sprint-based development approach:

- **Sprint 1**: Desktop Foundation ✅ (95% complete)
- **Sprint 2**: Mobile & Solo Mining (August 2025)
- **Sprint 3**: AI Network & Hardware (September 2025)

See [TODO.md](../TODO.md) for current sprint status and planning.

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community support
- **Code Review**: Tag maintainers in pull requests
- **Documentation**: Check README.md and docs/ folder

## 📄 License

By contributing to Melanin Click, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

---

**Thank you for contributing to Melanin Click!** 🚀⛏️