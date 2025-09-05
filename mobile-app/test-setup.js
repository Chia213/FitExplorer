const fs = require('fs');
const path = require('path');

console.log('🧪 Testing FitExplorer Mobile App Setup...\n');

// Check if frontend directory exists
const frontendPath = path.join(__dirname, '../frontend');
if (!fs.existsSync(frontendPath)) {
  console.error('❌ Frontend directory not found');
  process.exit(1);
}

// Check if package.json has Capacitor dependencies
const packageJsonPath = path.join(frontendPath, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasCapacitor = packageJson.devDependencies && 
    (packageJson.devDependencies['@capacitor/cli'] || packageJson.devDependencies['@capacitor/core']);
  
  if (hasCapacitor) {
    console.log('✅ Capacitor dependencies found in package.json');
  } else {
    console.log('❌ Capacitor dependencies not found in package.json');
  }
} else {
  console.log('❌ package.json not found');
}

// Check if capacitor.config.ts exists
const capacitorConfigPath = path.join(frontendPath, 'capacitor.config.ts');
if (fs.existsSync(capacitorConfigPath)) {
  console.log('✅ Capacitor configuration found');
} else {
  console.log('❌ Capacitor configuration not found');
}

// Check if dist directory exists (built app)
const distPath = path.join(frontendPath, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ Built app found in dist directory');
} else {
  console.log('⚠️ App not built yet. Run "npm run build" in frontend directory');
}

// Check if mobile platforms exist
const androidPath = path.join(frontendPath, 'android');
const iosPath = path.join(frontendPath, 'ios');

if (fs.existsSync(androidPath)) {
  console.log('✅ Android platform found');
} else {
  console.log('⚠️ Android platform not found. Run "npx cap add android"');
}

if (fs.existsSync(iosPath)) {
  console.log('✅ iOS platform found');
} else {
  console.log('⚠️ iOS platform not found. Run "npx cap add ios" (macOS only)');
}

console.log('\n🎉 Setup test complete!');
console.log('If you see any ❌ or ⚠️, follow the suggested actions above.');