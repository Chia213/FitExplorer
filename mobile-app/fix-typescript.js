const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TypeScript issue...\n');

const frontendPath = path.join(__dirname, '../frontend');

try {
  // Install TypeScript
  console.log('📦 Installing TypeScript...');
  execSync('npm install -D typescript', { cwd: frontendPath, stdio: 'inherit' });

  // Try to sync again
  console.log('🔄 Syncing with native platforms...');
  execSync('npx cap sync', { cwd: frontendPath, stdio: 'inherit' });

  console.log('✅ Fixed! Now you can run the mobile commands.');
  console.log('\nNext steps:');
  console.log('1. Run "npm run mobile:android" to open in Android Studio');
  console.log('2. Run "npm run mobile:ios" to open in Xcode (macOS only)');

} catch (error) {
  console.error('❌ Fix failed:', error.message);
  console.log('\nTry running these commands manually:');
  console.log('cd frontend');
  console.log('npm install -D typescript');
  console.log('npx cap sync');
}
