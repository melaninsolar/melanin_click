# 🚀 Melanin Click - Bitcoin & Whive Desktop Client

> **One-click Bitcoin and Whive operations** - True to its name, just click and go!

A modern, secure desktop application for Bitcoin and Whive cryptocurrency operations, built with Tauri, React, and Rust.

## ✨ Features

- **🔽 One-Click Downloads**: Bitcoin Core and Whive Core installation
- **⛏️ Integrated Mining**: CPU mining with pool connectivity  
- **📊 Real-Time Monitoring**: System stats, mining performance, node status
- **🔒 Secure Operations**: Local-only processing, no external data sharing
- **🖥️ Cross-Platform**: Windows, macOS, and Linux support
- **⚡ Performance Optimized**: Native Rust backend with React frontend

## 🎯 Quick Start

### For End Users (Ready-to-Use App)

1. **Download the app** from the `Melanin Click - Ready to Use` folder
2. **Launch using Terminal** (required for security):
   ```bash
   cd "path/to/Melanin Click - Ready to Use"
   export BITCOIN_RPC_PASSWORD="melanin_secure_2025_prod_password"
   open "Melanin Click.app"
   ```
3. **Or use the launch script**: Double-click `Launch Melanin Click.command`

### For Developers

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd melanin_click_tauri
   ```

2. **Set required environment variable**:
   ```bash
   export BITCOIN_RPC_PASSWORD="your_secure_password_16_chars_min"
   ```

3. **Install dependencies**:
   ```bash
   npm install
   cd src-tauri && cargo check && cd ..
   ```

4. **Launch development server**:
   ```bash
   ./launch_dev.sh
   # or manually:
   npm run tauri:dev
   ```

## 📋 System Requirements

### Minimum Requirements
- **OS**: macOS 11.0+, Windows 10+, or Ubuntu 20.04+
- **RAM**: 4GB (8GB recommended for Bitcoin full node)
- **Storage**: 550MB (Bitcoin pruned) or 500GB+ (Bitcoin full node)
- **Internet**: Broadband connection for blockchain sync

### Development Requirements
- **Node.js**: 18.0+
- **Rust**: 1.75+
- **Tauri CLI**: 2.0+

## 🚨 Known Issues

We've identified several issues that need resolution:

### Issue #1: macOS Security Restrictions
- **Problem**: App cannot launch directly due to code signing requirements
- **Workaround**: Use Terminal launch or security override
- **Fix Needed**: Proper Apple Developer certificate signing

### Issue #2: Environment Variable Dependency
- **Problem**: App requires `BITCOIN_RPC_PASSWORD` (16+ characters) to start
- **Workaround**: Set environment variable before launch
- **Fix Needed**: Embedded configuration or user-friendly setup

### Issue #3: Mining Executable Availability
- **Problem**: CPU mining only works on Windows (binary availability)
- **Platforms Affected**: macOS and Linux require manual compilation
- **Fix Needed**: Cross-platform miner binaries or build automation

### Issue #4: Production Build Resource Bundling
- **Problem**: App bundle has resource validation issues
- **Impact**: Potential launch failures on some systems
- **Fix Needed**: Proper Tauri bundling configuration

## 💻 Platform Support

| Feature | Windows | macOS | Linux |
|---------|---------|--------|-------|
| Bitcoin Downloads | ✅ | ✅ | ✅ |
| Whive Downloads | ✅ | ✅ | ✅ |
| Node Operations | ✅ | ✅ | ✅ |
| CPU Mining | ✅ | ⚠️* | ⚠️* |
| App Launch | ✅ | ⚠️** | ⚠️** |

*Requires manual miner compilation  
**Requires security override or Terminal launch

## 🛠 Architecture

```
Melanin Click
├── Frontend (React + TypeScript)
│   ├── Bitcoin/Whive management pages
│   ├── System monitoring dashboard
│   ├── Mining configuration interface
│   └── Real-time notifications
│
├── Backend (Rust + Tauri)
│   ├── Cryptocurrency node management
│   ├── Mining process coordination
│   ├── System information gathering
│   └── Secure RPC communications
│
└── Native Integrations
    ├── File system operations
    ├── Process management
    └── Network communications
```

## 🔧 Development

### Build Commands

```bash
# Development server
npm run tauri:dev

# Production build
npm run tauri:build

# Type checking
npm run type-check

# Testing
npm test
```

### Environment Variables

```bash
# Required for Bitcoin RPC security (minimum 16 characters)
export BITCOIN_RPC_PASSWORD="your_secure_password_here"

# Optional: Logging level
export RUST_LOG="info"
```

## 📁 Project Structure

```
melanin_click_tauri/
├── src/                          # React frontend
│   ├── components/              # UI components
│   ├── pages/                   # Main application pages
│   ├── hooks/                   # Custom React hooks
│   └── services/                # API services
│
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── core.rs              # Core system operations
│   │   ├── mining.rs            # Mining management
│   │   ├── node.rs              # Cryptocurrency node operations
│   │   └── validation.rs        # Input validation
│   └── target/                  # Compiled binaries
│
├── Melanin Click - Ready to Use/ # Production build
│   ├── Melanin Click.app        # macOS application bundle
│   └── Launch Melanin Click.command # Launch script
│
└── README.md                    # This file
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Priority Areas for Contribution

1. **Cross-platform mining support** (macOS/Linux binaries)
2. **Improved app signing and distribution**
3. **Enhanced error handling and user feedback**
4. **Performance optimizations**
5. **Additional cryptocurrency support**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Check this README for setup and usage instructions
- **Community**: Join discussions in GitHub Discussions

## 🙏 Acknowledgments

- **Bitcoin Core** team for the reference implementation
- **Whive Protocol** developers for the innovative Yespower algorithm
- **Tauri** framework for enabling secure desktop applications
- **React** and **Rust** communities for excellent tooling

---

**Ready to start your cryptocurrency journey? Just click and go with Melanin Click!** 🚀