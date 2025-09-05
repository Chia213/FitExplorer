const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📱 Setting up Expo for iPhone app...\n');

const frontendPath = path.join(__dirname, '../frontend');

try {
  // Install Expo CLI
  console.log('📦 Installing Expo CLI...');
  execSync('npm install -g @expo/cli', { stdio: 'inherit' });

  // Create Expo project
  console.log('🚀 Creating Expo project...');
  const expoPath = path.join(__dirname, 'expo-app');
  
  if (!fs.existsSync(expoPath)) {
    execSync('npx create-expo-app@latest expo-app --template blank', { cwd: __dirname, stdio: 'inherit' });
  }

  // Install EAS CLI for building
  console.log('🔧 Installing EAS CLI...');
  execSync('npm install -g eas-cli', { stdio: 'inherit' });

  console.log('\n✅ Expo setup complete!');
  console.log('\nNext steps:');
  console.log('1. cd expo-app');
  console.log('2. npx expo start');
  console.log('3. Install Expo Go app on your iPhone');
  console.log('4. Scan QR code to test');
  console.log('5. eas build --platform ios (for App Store)');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\nManual steps:');
  console.log('1. npm install -g @expo/cli');
  console.log('2. npx create-expo-app@latest expo-app');
  console.log('3. cd expo-app && npx expo start');
}
