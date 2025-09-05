const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📱 Deploying FitExplorer for iPhone testing...\n');

const frontendPath = path.join(__dirname, '../frontend');

try {
  // Build the app
  console.log('🔨 Building app...');
  execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });

  // Check if Vercel CLI is available
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI found');
    
    console.log('🚀 Deploying to Vercel...');
    execSync('vercel --prod', { cwd: frontendPath, stdio: 'inherit' });
    
    console.log('\n🎉 Deployed successfully!');
    console.log('📱 Now open Safari on your iPhone and:');
    console.log('1. Go to your Vercel URL');
    console.log('2. Tap Share button');
    console.log('3. Tap "Add to Home Screen"');
    console.log('4. Your app will work like a native app!');
    
  } catch (error) {
    console.log('⚠️ Vercel CLI not found. Installing...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
    
    console.log('🚀 Deploying to Vercel...');
    execSync('vercel --prod', { cwd: frontendPath, stdio: 'inherit' });
  }

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\nManual steps:');
  console.log('1. cd frontend');
  console.log('2. npm run build');
  console.log('3. npx vercel --prod');
  console.log('4. Open the URL on your iPhone');
  console.log('5. Add to Home Screen');
}
