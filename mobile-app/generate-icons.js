const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes for different platforms
const iconSizes = {
  ios: [
    { size: 20, name: 'icon-20.png' },
    { size: 29, name: 'icon-29.png' },
    { size: 40, name: 'icon-40.png' },
    { size: 58, name: 'icon-58.png' },
    { size: 60, name: 'icon-60.png' },
    { size: 80, name: 'icon-80.png' },
    { size: 87, name: 'icon-87.png' },
    { size: 120, name: 'icon-120.png' },
    { size: 180, name: 'icon-180.png' },
    { size: 1024, name: 'icon-1024.png' }
  ],
  android: [
    { size: 48, name: 'icon-48.png' },
    { size: 72, name: 'icon-72.png' },
    { size: 96, name: 'icon-96.png' },
    { size: 144, name: 'icon-144.png' },
    { size: 192, name: 'icon-192.png' }
  ]
};

// Splash screen sizes
const splashSizes = {
  ios: [
    { width: 640, height: 1136, name: 'splash-640x1136.png' },
    { width: 750, height: 1334, name: 'splash-750x1334.png' },
    { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
    { width: 1242, height: 2208, name: 'splash-1242x2208.png' }
  ],
  android: [
    { width: 1080, height: 1920, name: 'splash-1080x1920.png' }
  ]
};

async function generateIcons() {
  const sourceIcon = path.join(__dirname, '../frontend/public/icons/icon-512x512.png');
  const sourceSplash = path.join(__dirname, '../frontend/public/icons/splash-750x1334.png');
  
  // Create directories
  const iosDir = path.join(__dirname, 'ios-icons');
  const androidDir = path.join(__dirname, 'android-icons');
  const iosSplashDir = path.join(__dirname, 'ios-splash');
  const androidSplashDir = path.join(__dirname, 'android-splash');
  
  [iosDir, androidDir, iosSplashDir, androidSplashDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('🎨 Generating iOS icons...');
  for (const icon of iconSizes.ios) {
    await sharp(sourceIcon)
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(iosDir, icon.name));
    console.log(`✅ Generated ${icon.name}`);
  }

  console.log('🎨 Generating Android icons...');
  for (const icon of iconSizes.android) {
    await sharp(sourceIcon)
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(androidDir, icon.name));
    console.log(`✅ Generated ${icon.name}`);
  }

  console.log('🎨 Generating iOS splash screens...');
  for (const splash of splashSizes.ios) {
    await sharp(sourceSplash)
      .resize(splash.width, splash.height)
      .png()
      .toFile(path.join(iosSplashDir, splash.name));
    console.log(`✅ Generated ${splash.name}`);
  }

  console.log('🎨 Generating Android splash screens...');
  for (const splash of splashSizes.android) {
    await sharp(sourceSplash)
      .resize(splash.width, splash.height)
      .png()
      .toFile(path.join(androidSplashDir, splash.name));
    console.log(`✅ Generated ${splash.name}`);
  }

  console.log('🎉 All icons and splash screens generated successfully!');
}

generateIcons().catch(console.error);
