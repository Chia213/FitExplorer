const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up FitExplorer Mobile App...\n');

// Check if we're in the right directory
const frontendPath = path.join(__dirname, '../frontend');
if (!fs.existsSync(frontendPath)) {
  console.error('❌ Frontend directory not found. Please run this script from the mobile-app directory.');
  process.exit(1);
}

try {
  // Navigate to frontend and install dependencies
  console.log('📦 Installing Capacitor dependencies...');
  execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });

  // Initialize Capacitor if not already initialized
  const capacitorConfigPath = path.join(frontendPath, 'capacitor.config.ts');
  const capacitorConfigJsPath = path.join(frontendPath, 'capacitor.config.js');
  if (!fs.existsSync(capacitorConfigPath) && !fs.existsSync(capacitorConfigJsPath)) {
    console.log('⚙️ Initializing Capacitor...');
    execSync('npx cap init "FitExplorer" "com.fitexplorer.app"', { cwd: frontendPath, stdio: 'inherit' });
  }

  // Add Android platform
  console.log('🤖 Adding Android platform...');
  try {
    execSync('npx cap add android', { cwd: frontendPath, stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Android platform might already exist, continuing...');
  }

  // Add iOS platform (only on macOS)
  if (process.platform === 'darwin') {
    console.log('🍎 Adding iOS platform...');
    try {
      execSync('npx cap add ios', { cwd: frontendPath, stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ iOS platform might already exist, continuing...');
    }
  } else {
    console.log('⚠️ Skipping iOS platform (macOS required)');
  }

  // Build the web app
  console.log('🔨 Building web app...');
  execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });

  // Sync with native platforms
  console.log('🔄 Syncing with native platforms...');
  execSync('npx cap sync', { cwd: frontendPath, stdio: 'inherit' });

  // Generate icons
  console.log('🎨 Generating app icons...');
  try {
    execSync('node generate-icons.js', { cwd: __dirname, stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Icon generation failed, you can run it manually later');
  }

  console.log('\n✅ Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run mobile:android" to open in Android Studio');
  if (process.platform === 'darwin') {
    console.log('2. Run "npm run mobile:ios" to open in Xcode');
  }
  console.log('3. Build and deploy to app stores');
  console.log('\nFor detailed instructions, see MOBILE_SETUP.md');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
