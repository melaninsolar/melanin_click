# Melanin Click v2.0 - Tauri Edition

A modern, cross-platform Bitcoin and Whive desktop client built with Tauri, React, and TypeScript.

## 🚀 Features

- **Cross-Platform**: Native performance on Windows, macOS, and Linux
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Bitcoin Core Integration**: Download, install, and manage Bitcoin nodes
- **Whive Mining**: CPU mining support for Whive cryptocurrency
- **System Monitoring**: Real-time system information and resource usage
- **Secure Architecture**: Sandboxed Rust backend with TypeScript frontend
- **Professional Design**: Modern UI that builds user confidence

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design

### Backend (Rust)
- Tauri framework for native performance
- Cross-platform system operations
- Secure file and process management
- HTTP downloads with progress tracking
- SHA256 file verification

## 🛠️ Development

### Prerequisites
- Node.js 18+ and npm
- Rust 1.70+
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libwebkit2gtk-4.0-dev`, `libssl-dev`
  - **Windows**: Microsoft C++ Build Tools

### Setup
```bash
# Clone and navigate to the project
cd melanin_click_tauri

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## 🎯 Usage

### Running the Application

1. **Development Mode**:
   ```bash
   npm run tauri dev
   ```

2. **Production Build**:
   ```bash
   npm run tauri build
   ```

### Features Overview

#### Dashboard
- System information (OS, architecture, memory, disk space)
- Node status monitoring
- Quick action buttons for Bitcoin and Whive

#### Bitcoin Core
- Download Bitcoin Core for your platform/architecture
- Start/stop Bitcoin node
- Monitor node status

#### Whive Protocol
- Download Whive client
- Start/stop CPU mining
- Monitor mining status

#### Settings
- View data directories
- Configure application settings

## 🔧 Technical Details

### Supported Platforms & Architectures
- **Windows**: x86_64
- **macOS**: x86_64 (Intel) and aarch64 (Apple Silicon)
- **Linux**: x86_64 and aarch64

### Download URLs
The application automatically detects your platform and architecture to download the correct binaries:

- **Bitcoin Core**: From bitcoincore.org official releases
- **Whive**: From GitHub releases

### Data Directories
- **Bitcoin**: Platform-specific Bitcoin data directory
- **Whive**: Platform-specific Whive data directory

## 🚀 Advantages Over Previous Version

### Performance
- **Faster Startup**: Native Rust backend vs Python interpreter
- **Better Memory Usage**: Rust's memory safety and efficiency
- **Responsive UI**: Non-blocking operations during downloads/mining

### Security
- **Sandboxed Architecture**: Tauri's security model
- **Memory Safety**: Rust prevents common vulnerabilities
- **File System Permissions**: Controlled access to user directories

### User Experience
- **Modern UI**: Professional appearance builds trust
- **Cross-Platform Consistency**: Same experience everywhere
- **Real-time Updates**: Live system monitoring and progress tracking

### Maintenance
- **Single Codebase**: No more platform-specific files
- **Type Safety**: TypeScript prevents runtime errors
- **Better Error Handling**: Rust's Result type for robust error management

## 📦 Distribution

### Desktop Installers
Tauri automatically generates platform-specific installers:
- **Windows**: `.msi` installer
- **macOS**: `.dmg` disk image and `.app` bundle
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

### Code Signing
For production releases, configure code signing in `tauri.conf.json`:
- **Windows**: Authenticode signing
- **macOS**: Apple Developer ID
- **Linux**: GPG signing

## 🔒 Security Considerations

### Permissions
The application requests minimal permissions:
- File system access to home directory for Bitcoin/Whive data
- Network access for downloads
- Process spawning for running nodes/mining

### Verification
- SHA256 hash verification for downloaded files
- Official download sources only
- Secure HTTPS connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and support:
1. Check the GitHub Issues page
2. Review the troubleshooting section
3. Create a new issue with detailed information

---

**Melanin Click v2.0** - Professional Bitcoin & Whive Desktop Client
