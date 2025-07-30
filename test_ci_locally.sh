#!/bin/bash
set -e

echo "🚀 Running CI/CD Pipeline Locally..."

# Set environment variables (like CI/CD)
export BITCOIN_RPC_PASSWORD="ci_test_password_2024_secure_x9K3m7N2p8Q5"
export WHIVE_RPC_PASSWORD="ci_test_whive_password_2024_secure_y4T8n6M1q9R7"
export APP_SECRET_KEY="ci_test_app_secret_2024_32_chars_long_key"

echo "✅ Environment variables set"

# Create .env file for testing
echo "📝 Creating .env file..."
cp .env.example .env
echo "BITCOIN_RPC_PASSWORD=$BITCOIN_RPC_PASSWORD" >> .env
echo "WHIVE_RPC_PASSWORD=$WHIVE_RPC_PASSWORD" >> .env
echo "APP_SECRET_KEY=$APP_SECRET_KEY" >> .env

# Test Documentation Check
echo "📚 Testing documentation check..."
required_files=("README.md" "INSTALL.md" "TODO.md" "STARTUP_GUIDE.md" "LICENSE")
for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "❌ Missing: $file"
    exit 1
  elif [[ ! -s "$file" ]]; then
    echo "❌ Empty: $file"
    exit 1
  else
    echo "✅ Found: $file"
  fi
done

# Test hardcoded secrets check
echo "🔒 Testing security check..."
if grep -r "password.*=" --include="*.rs" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=target . | grep -v test | grep -v ci.yml | grep -v "rpcpassword={}"; then
  echo "❌ Found potential hardcoded passwords"
  exit 1
else
  echo "✅ No hardcoded passwords found"
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
cd melanin_click_tauri
npm ci

# Test TypeScript type checking
echo "🔍 Testing TypeScript..."
npm run type-check

# Test linting
echo "🧹 Testing linting..."
npm run lint

# Test Rust compilation and tests
echo "🦀 Testing Rust..."
cd src-tauri
cargo test --verbose
cargo clippy -- -D warnings
cargo fmt -- --check

# Test build (debug mode)
echo "🏗️ Testing build..."
cd ..
npm run tauri:build:debug

# Test integration tests
echo "🧪 Testing integration tests..."
cd ..
chmod +x tests/run_tests.sh
./tests/run_tests.sh

echo "🎉 All CI/CD tests passed locally!"