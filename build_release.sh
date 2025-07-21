#!/bin/bash

# Melanin Click - Cross-Platform Release Builder
# Sprint 1 Release Script

set -e

echo "🚀 Melanin Click - Building Sprint 1 Release"
echo "============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking build prerequisites..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v cargo &> /dev/null; then
        log_error "Rust/Cargo is not installed"
        exit 1
    fi
    
    log_success "All prerequisites found"
}

# Setup environment
setup_environment() {
    log_info "Setting up build environment..."
    
    cd melanin_click_tauri
    
    # Install dependencies
    log_info "Installing Node.js dependencies..."
    npm install
    
    # Update Rust dependencies
    log_info "Updating Rust dependencies..."
    cd src-tauri
    cargo fetch
    cd ..
    
    log_success "Environment setup complete"
}

# Build frontend
build_frontend() {
    log_info "Building React frontend..."
    npm run build
    log_success "Frontend build complete"
}

# Build Tauri application
build_tauri() {
    log_info "Building Tauri application for production..."
    
    # Get the current platform
    PLATFORM=$(uname -s)
    ARCH=$(uname -m)
    
    case $PLATFORM in
        "Darwin")
            log_info "Building for macOS ($ARCH)..."
            npm run tauri build -- --target universal-apple-darwin
            ;;
        "Linux")
            log_info "Building for Linux ($ARCH)..."
            npm run tauri build
            ;;
        "MINGW"*|"CYGWIN"*|"MSYS"*)
            log_info "Building for Windows ($ARCH)..."
            npm run tauri build
            ;;
        *)
            log_warning "Unknown platform: $PLATFORM. Attempting default build..."
            npm run tauri build
            ;;
    esac
    
    log_success "Tauri build complete"
}

# Package for distribution
package_release() {
    log_info "Packaging release files..."
    
    # Create release directory
    RELEASE_DIR="../release-sprint1"
    mkdir -p "$RELEASE_DIR"
    
    # Copy built artifacts
    if [ -d "src-tauri/target/release/bundle" ]; then
        cp -r src-tauri/target/release/bundle/* "$RELEASE_DIR/"
        log_success "Release packages copied to $RELEASE_DIR"
    else
        log_warning "No bundle directory found. Build may have failed."
    fi
    
    # Copy documentation
    cp ../README.md "$RELEASE_DIR/"
    cp ../Install.md "$RELEASE_DIR/"
    cp ../USER_INSTALL_GUIDE.md "$RELEASE_DIR/"
    
    # Create checksums
    log_info "Generating checksums..."
    cd "$RELEASE_DIR"
    find . -type f \( -name "*.dmg" -o -name "*.exe" -o -name "*.deb" -o -name "*.AppImage" \) -exec sha256sum {} \; > checksums.txt
    cd - > /dev/null
    
    log_success "Release packaging complete"
}

# Generate release notes
generate_release_notes() {
    log_info "Generating release notes..."
    
    cat > "$RELEASE_DIR/RELEASE_NOTES.md" << EOF
# Melanin Click v2.0.0 - Sprint 1 Release

## 🎯 Release Overview
This is the first major release of Melanin Click, featuring a complete Tauri-based architecture with cross-platform desktop support for Bitcoin and Whive mining.

## ✨ New Features

### 🖥️ Cross-Platform Desktop Support
- **Windows**: Native .exe installer with MSI support
- **macOS**: Universal binary .dmg with Apple Silicon support  
- **Linux**: .deb packages and AppImage support

### ⛏️ Mining Operations
- **Bitcoin Mining**: SHA-256 algorithm with CKPool connectivity
- **Whive Mining**: YescryptR32 CPU mining optimized for performance
- **Pool Support**: Multiple mining pools with failover capabilities
- **Address Validation**: Real-time Bitcoin and Whive address validation

### 🔧 Node Management
- **One-Click Installation**: Automated Bitcoin Core and Whive node setup
- **Configuration Management**: Optimized configurations for mainnet and pruned modes
- **Status Monitoring**: Real-time node synchronization and health monitoring

### 🎨 Modern UI
- **React-Based Interface**: Modern, responsive design with dark theme
- **Real-Time Updates**: Live mining statistics and system monitoring
- **Notification System**: Comprehensive user feedback and alerts
- **Onboarding Wizard**: Guided setup for new users

### 🔐 Security & Validation
- **Address Validation**: Prevents mining to invalid addresses
- **File Verification**: SHA-256 checksums for all downloads
- **Secure Configuration**: Best practices for node and mining setup

## 🛠️ Technical Details
- **Framework**: Tauri 2.0 with Rust backend
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Mining**: Native CPU mining with optimized algorithms
- **Cross-Platform**: Single codebase supporting Windows, macOS, and Linux

## 📋 System Requirements
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space (plus blockchain storage if running full nodes)
- **CPU**: Multi-core processor recommended for mining
- **Network**: Stable internet connection for pool mining

## 🚀 Installation
See the included \`USER_INSTALL_GUIDE.md\` for platform-specific installation instructions.

## 🐛 Known Issues
- Mining statistics are simulated in this release (Sprint 2 will add real-time parsing)
- Solo mining is not yet implemented (planned for Sprint 2)
- Mobile support not included (planned for Sprint 2)

## 🔄 What's Next - Sprint 2 Preview
- Android mobile application
- Solo mining capabilities  
- Enhanced mining statistics
- Expanded pool support
- Address book functionality

## 📞 Support
- GitHub Issues: [Report bugs and feature requests](https://github.com/your-org/melanin_click/issues)
- Documentation: See included markdown files
- Community: Join our Telegram group for support

---
**Build Date**: $(date)
**Git Commit**: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
**Platform**: $(uname -s) $(uname -m)
EOF

    log_success "Release notes generated"
}

# Main build process
main() {
    echo
    log_info "Starting Melanin Click Sprint 1 build process..."
    echo
    
    check_prerequisites
    setup_environment
    build_frontend
    build_tauri
    package_release
    generate_release_notes
    
    echo
    log_success "🎉 Sprint 1 build complete!"
    log_info "Release files are available in: $(realpath $RELEASE_DIR)"
    echo
    
    # Display release summary
    echo "📦 Release Summary:"
    echo "=================="
    if [ -d "$RELEASE_DIR" ]; then
        ls -la "$RELEASE_DIR"
    fi
    echo
    
    log_info "To test the release:"
    case $(uname -s) in
        "Darwin")
            echo "  - Open the .dmg file and drag Melanin Click to Applications"
            ;;
        "Linux")
            echo "  - Install .deb: sudo dpkg -i melanin-click_*.deb"
            echo "  - Or run AppImage: ./melanin-click*.AppImage"
            ;;
        "MINGW"*|"CYGWIN"*|"MSYS"*)
            echo "  - Run the .exe installer as Administrator"
            ;;
    esac
    echo
}

# Run main function
main "$@" 