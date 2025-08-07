# 🚀 Melanin Click - Quick Startup Guide

**Get up and running with Melanin Click in 5 minutes!**

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ and npm installed
- **Rust** 1.70+ installed (for development)
- **Git** for version control
- **Operating System**: Windows 10+, macOS 10.13+, or Linux

### Quick Installation Check
```bash
node --version   # Should be v18+
npm --version    # Should be 8+
rust --version   # Should be 1.70+
```

---

## ⚡ Quick Start (Users)

### Option 1: Download Pre-built Release (Recommended)
1. Go to [Releases](https://github.com/xyephy/melanin_click/releases)
2. Download for your platform:
   - **Windows**: `melanin-click-windows.exe`
   - **macOS**: `melanin-click-macos.dmg`
   - **Linux**: `melanin-click-linux.deb` or `.AppImage`
3. Install and run!

### Option 2: Build from Source
```bash
# Clone repository
git clone https://github.com/xyephy/melanin_click.git
cd melanin_click

# Navigate to Tauri app
cd melanin_click_tauri

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

---

## 🛠️ Development Setup

### 1. Clone and Setup
```bash
git clone https://github.com/xyephy/melanin_click.git
cd melanin_click
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for development)
# Required for production builds with code signing
```

### 3. Install Dependencies
```bash
cd melanin_click_tauri
npm install
```

### 4. Development Commands
```bash
# Run in development mode (recommended)
npm run tauri:dev

# Build for production
npm run tauri:build

# Run tests
npm run test

# Run linting
npm run lint
```

---

## 🎯 First-Time User Flow

### 1. Launch Application
- Open Melanin Click from your applications
- Complete the welcome wizard

### 2. Configure Mining
1. **Enter Addresses**:
   - Bitcoin: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` (example)
   - Whive: `WiZx6iFbnQ8p2fFy7SzeB3TXHg4Wqk2Aes` (example)

2. **Select Mining Pool**:
   - Bitcoin: CKPool Solo, F2Pool, Ocean
   - Whive: Official Whive pools

3. **Start Mining**:
   - Choose thread count (recommended: 50% of CPU cores)
   - Set mining intensity (recommended: 80-90%)
   - Click "Start Mining"

### 3. Monitor Progress
- View real-time hashrate and statistics
- Check accepted/rejected shares
- Monitor system resources

---

## 📁 Project Structure

```
melanin_click/
├── 📄 README.md              # Project overview
├── 📄 INSTALL.md             # Installation instructions
├── 📄 TODO.md                # Development roadmap
├── 📄 STARTUP_GUIDE.md       # This guide
├── 📄 .env                   # Environment variables (not committed)
├── 📂 docs/                  # Technical documentation
│   ├── tauri_architecture_proposal.md
│   ├── CODE_SIGNING_GUIDE.md
│   ├── ROADMAP.md
│   └── CONTRIBUTING.md
├── 📂 tests/                 # All test files
│   ├── unit/
│   └── frontend_integration_tests.js
├── 📂 melanin_click_tauri/   # Main Tauri application
│   ├── src/                  # React frontend
│   ├── src-tauri/           # Rust backend
│   └── package.json
└── 📂 assets/               # Application assets
```

---

## 🔧 Common Issues & Solutions

### Build Issues

**Problem**: `tauri command not found`
```bash
# Solution: Install Tauri CLI
npm install -g @tauri-apps/cli
# or use npx
npx tauri dev
```

**Problem**: Rust compilation errors
```bash
# Solution: Update Rust toolchain
rustup update
```

### Runtime Issues

**Problem**: "App is damaged" on macOS
- **Solution**: Right-click app → Open, or see `docs/CODE_SIGNING_GUIDE.md`

**Problem**: Mining won't start
- **Solution**: Check addresses are valid and pools are reachable

**Problem**: High CPU usage
- **Solution**: Reduce thread count in mining settings

---

## 🧪 Testing

### Run All Tests
```bash
# Frontend unit tests
npm run test

# Rust backend tests
cd melanin_click_tauri/src-tauri
cargo test

# Integration tests (in browser console)
# Navigate to app and run: await runAllTests()
```

### Manual Testing Checklist
- [ ] App launches without errors
- [ ] Address validation works for Bitcoin/Whive
- [ ] System info displays correctly
- [ ] Mining starts and shows statistics
- [ ] Node installation works
- [ ] Settings save and persist

---

## 📦 Building for Distribution

### Development Build
```bash
npm run tauri:dev
```

### Production Build
```bash
# Set environment variables first (for code signing)
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name"

# Build
npm run tauri:build

# Output in: src-tauri/target/release/bundle/
```

### Platform-Specific Builds
```bash
# macOS
./build_release.sh

# Windows (from Windows machine)
npm run tauri:build

# Linux
npm run tauri:build
```

---

## 🌐 Network Configuration

### Firewall Settings
Ensure these ports are accessible:
- **Bitcoin**: 8333 (node), 8332 (RPC)
- **Whive**: 10998 (node), 10997 (RPC)
- **Mining Pools**: Various (4334, 3333, etc.)

### Pool Connections
Default mining pools are configured, but you can add custom pools:
1. Go to Settings → Pool Configuration
2. Add custom stratum URL: `stratum+tcp://pool.example.com:4334`
3. Test connection before saving

---

## 🚨 Troubleshooting

### Check System Requirements
```bash
# Verify Node.js version
node --version

# Check available memory
free -h  # Linux
vm_stat  # macOS

# Verify Rust installation
rustc --version
```

### Debug Mode
```bash
# Run with debug logging
RUST_LOG=debug npm run tauri:dev

# Check browser console for frontend errors
# Check terminal for backend errors
```

### Get Help
1. **Documentation**: Check `docs/` folder
2. **Issues**: GitHub Issues for bug reports
3. **Community**: Project discussions
4. **Logs**: Check `~/.melanin_click/logs/` for detailed logs

---

## 🎉 Success!

If you see the mining dashboard with active statistics, you're ready to go!

**Next Steps:**
1. Optimize your mining settings
2. Monitor profitability
3. Join the community
4. Consider running a full node

---

## 📚 Additional Resources

- **Full Documentation**: `docs/` folder
- **Installation Guide**: `INSTALL.md`
- **Development Roadmap**: `TODO.md`
- **API Reference**: `docs/api/` (coming soon)
- **Video Tutorials**: (coming soon)

---

*Last Updated: December 2024*
*For technical support, please check the troubleshooting section or open a GitHub issue.* 