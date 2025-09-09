#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FitExplorer Mobile App Builder\n');

// Check if we're in the right directory
const appDir = path.join(__dirname, 'FitExplorerApp');
if (!fs.existsSync(path.join(appDir, 'package.json'))) {
    console.error('❌ Error: Please run this script from the mobile-app directory');
    process.exit(1);
}

// Change to app directory
process.chdir(appDir);

// Function to run commands
function runCommand(command, description) {
    console.log(`\n📦 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed successfully!`);
    } catch (error) {
        console.error(`❌ Error during ${description}:`, error.message);
        process.exit(1);
    }
}

// Main build process
async function buildApp() {
    console.log('🔍 Checking EAS CLI installation...');
    try {
        execSync('npx eas --version', { stdio: 'pipe' });
    } catch (error) {
        console.log('📥 Installing EAS CLI...');
        runCommand('npm install -g @expo/eas-cli', 'Installing EAS CLI');
    }

    console.log('\n🔐 Checking authentication...');
    try {
        execSync('eas whoami', { stdio: 'pipe' });
    } catch (error) {
        console.log('🔑 Please log in to your Expo account:');
        runCommand('eas login', 'Expo authentication');
    }

    console.log('\n📋 Available build options:');
    console.log('1. Android APK (Preview)');
    console.log('2. iOS IPA (Preview)');
    console.log('3. Both platforms (Preview)');
    console.log('4. Android (Production)');
    console.log('5. iOS (Production)');
    console.log('6. Both platforms (Production)');
    console.log('7. Publish update only');

    // For now, let's build a preview version
    console.log('\n🏗️  Building Android APK (Preview)...');
    runCommand('eas build --platform android --profile preview', 'Android APK build');

    console.log('\n🎉 Build completed!');
    console.log('\n📱 Your app is now available at:');
    console.log('   https://expo.dev/@chia94/FitExplorerApp');
    console.log('\n📋 Next steps:');
    console.log('   1. Check the build status at: https://expo.dev/accounts/chia94/projects/FitExplorerApp');
    console.log('   2. Download the APK when ready');
    console.log('   3. Share the direct link with users');
}

// Run the build
buildApp().catch(console.error);
