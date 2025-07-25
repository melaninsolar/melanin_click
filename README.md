# 🚀 Melanin Click - Advanced Cryptocurrency Mining Platform

[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange)](https://rust-lang.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> **Professional all-in-one cryptocurrency mining platform** supporting Bitcoin (SHA-256) and Whive (Yespower) mining across desktop platforms with modern Tauri architecture.

## 🎯 Features

### ⛏️ **Professional Mining Operations**
- **Bitcoin Mining**: SHA-256 algorithm with multiple pool support (CKPool, F2Pool, Ocean, etc.)
- **Whive Mining**: Optimized Yespower CPU mining with thread control
- **Address Validation**: Real-time Bitcoin and Whive address validation
- **Pool Management**: Intelligent pool selection with failover capabilities
- **Performance Monitoring**: Real-time statistics and system monitoring

### 🖥️ **Cross-Platform Desktop Support**
- **Windows**: Native `.exe` installer with MSI support
- **macOS**: Universal binary `.dmg` (Intel & Apple Silicon)
- **Linux**: `.deb` packages and AppImage support

### 🔧 **Node Management**
- **One-Click Installation**: Automated Bitcoin Core and Whive node setup
- **Smart Configuration**: Optimized configs for mainnet and pruned modes
- **Status Monitoring**: Real-time synchronization and health monitoring

### 🎨 **Modern Interface**
- **React-Based UI**: Professional dark theme with responsive design
- **Real-Time Updates**: Live mining statistics and notifications
- **Guided Setup**: Comprehensive onboarding wizard
- **System Integration**: Native desktop notifications and controls

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Rust** 1.70+ (for development)
- **Operating System**: Windows 10+, macOS 10.13+, or Linux

### Installation

#### Option 1: Download Release (Recommended)
1. Visit the [Releases](https://github.com/xyephy/melanin_click/releases) page
2. Download the installer for your platform:
   - **Windows**: `melanin-click-windows.exe`
   - **macOS**: `melanin-click-macos.dmg`
   - **Linux**: `melanin-click-linux.deb` or `melanin-click-linux.AppImage`
3. Run the installer and follow the setup wizard

#### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/xyephy/melanin_click.git
cd melanin_click

# Navigate to Tauri application
cd melanin_click_tauri

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

### First-Time Setup
1. **Launch** Melanin Click
2. **Complete** the onboarding wizard
3. **Configure** your mining addresses
4. **Select** your preferred pools
5. **Start mining** with one click!

## 📖 Documentation

- 📋 **[Project Roadmap](ROADMAP.md)** - Development timeline and milestones
- 🛠️ **[User Installation Guide](USER_INSTALL_GUIDE.md)** - Platform-specific setup instructions
- 🏗️ **[Architecture Proposal](tauri_architecture_proposal.md)** - Technical system design
- 🔑 **[Code Signing Guide](CODE_SIGNING_GUIDE.md)** - Development and distribution setup

## 🏗️ Architecture

**Melanin Click** is built with modern technologies for performance and reliability:

- **🦀 Rust Backend**: High-performance, memory-safe core operations
- **⚛️ React Frontend**: Modern, responsive user interface
- **🖥️ Tauri Framework**: Native desktop integration with web technologies
- **🔗 Native Mining**: Direct algorithm implementations for optimal performance

## 🎮 Mining Guide

### Bitcoin Mining
1. **Enter** your Bitcoin address (validated in real-time)
2. **Select** mining pool (CKPool Solo, F2Pool, Ocean, etc.)
3. **Configure** worker name and thread count
4. **Start** mining with enhanced Stratum connectivity

### Whive Mining  
1. **Enter** your Whive address (automatic validation)
2. **Adjust** CPU threads for optimal performance
3. **Set** mining intensity (recommended: 80-90%)
4. **Begin** CPU-optimized Yespower mining

## 🚦 Project Status

### ✅ Sprint 1 (COMPLETE) - Desktop Foundation
- [x] Cross-platform desktop application
- [x] Bitcoin and Whive pool mining
- [x] Professional UI with real-time statistics  
- [x] Address validation and error handling
- [x] Native installers for all platforms

### 🔄 Sprint 2 (August 2025) - Mobile & Solo Mining
- [ ] Android mobile application
- [ ] Solo mining capabilities
- [ ] Enhanced mining statistics
- [ ] External alpha testing program

### 🔮 Sprint 3 (September 2025) - AI Network & Hardware
- [ ] Melanin Network AI-powered mining pool
- [ ] MSBX hardware integration
- [ ] Complete ecosystem deployment

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for:
- Development environment setup
- Code style guidelines  
- Pull request process
- Issue reporting

### Development Commands
```bash
# Development mode
npm run tauri:dev

# Production build
npm run tauri:build

# Release build script
npm run release

# Lint and format
npm run lint
npm run format
```

## 🔒 Security

- **Address Validation**: Prevents mining to invalid addresses
- **File Verification**: SHA-256 checksums for all downloads
- **Secure Configuration**: Industry best practices for node setup
- **Privacy**: No telemetry or data collection

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/xyephy/melanin_click/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/xyephy/melanin_click/discussions)
- **📚 Documentation**: See included guides and documentation
- **🏃‍♂️ Community**: Join our mining community channels

---

### 🏷️ Legacy Python Implementation

The original Python implementation is preserved in the [`alpha`](https://github.com/xyephy/melanin_click/tree/alpha) branch for reference and compatibility during the transition period.

---

**Built with ❤️ by the Melanin Click Team** | **Transform Your Mining Experience** 🚀
