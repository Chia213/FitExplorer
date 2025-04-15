import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source logo path
const logoPath = path.join(__dirname, 'src', 'assets', 'Ronjasdrawing.png');

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons of different sizes
const sizes = [16, 32, 48, 72, 96, 144, 192, 384, 512];

// Create icons from the logo
async function generateIcons() {
  try {
    // Load the source logo
    const logoImage = await loadImage(logoPath);
    
    // Generate icons for each size
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw the logo image (maintain aspect ratio)
      const scale = Math.min(size / logoImage.width, size / logoImage.height);
      const x = (size - logoImage.width * scale) / 2;
      const y = (size - logoImage.height * scale) / 2;
      
      ctx.drawImage(logoImage, x, y, logoImage.width * scale, logoImage.height * scale);
      
      // Save as PNG
      const fileName = size === 192 ? 'icon-192x192.png' : 
                      size === 512 ? 'icon-512x512.png' : 
                      `icon-${size}x${size}.png`;
      
      const out = fs.createWriteStream(path.join(iconsDir, fileName));
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      
      // Create maskable icons for size 192 and 512
      if (size === 192 || size === 512) {
        const maskableCanvas = createCanvas(size, size);
        const maskCtx = maskableCanvas.getContext('2d');
        
        // Fill background
        maskCtx.fillStyle = '#1f2937'; // Dark background
        maskCtx.fillRect(0, 0, size, size);
        
        // Draw logo slightly smaller to ensure safe zone
        const safeZone = size * 0.1; // 10% padding
        const safeSize = size - (safeZone * 2);
        const safeScale = Math.min(safeSize / logoImage.width, safeSize / logoImage.height);
        const safeX = (size - logoImage.width * safeScale) / 2;
        const safeY = (size - logoImage.height * safeScale) / 2;
        
        maskCtx.drawImage(logoImage, safeX, safeY, logoImage.width * safeScale, logoImage.height * safeScale);
        
        // Save maskable icon
        const maskableName = size === 512 ? 'maskable_icon.png' : `maskable_icon_${size}.png`;
        const maskableOut = fs.createWriteStream(path.join(iconsDir, maskableName));
        const maskableStream = maskableCanvas.createPNGStream();
        maskableStream.pipe(maskableOut);
      }
    }
    
    // Generate splash screens for iOS
    const splashSizes = [
      { width: 640, height: 1136, name: 'splash-640x1136.png' }, // iPhone 5/SE
      { width: 750, height: 1334, name: 'splash-750x1334.png' }, // iPhone 6/7/8
      { width: 1242, height: 2208, name: 'splash-1242x2208.png' }, // iPhone 6+/7+/8+
      { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS
    ];
    
    for (const { width, height, name } of splashSizes) {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1f2937'); // Dark gray
      gradient.addColorStop(1, '#111827'); // Darker gray
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw logo in center
      const logoSize = Math.min(width, height) * 0.4;
      const logoScale = Math.min(logoSize / logoImage.width, logoSize / logoImage.height);
      const centerX = width / 2 - (logoImage.width * logoScale) / 2;
      const centerY = height / 2 - (logoImage.height * logoScale) / 2;
      
      ctx.drawImage(logoImage, centerX, centerY, logoImage.width * logoScale, logoImage.height * logoScale);
      
      // Add app name below the logo
      const appNameFontSize = Math.floor(logoSize * 0.1);
      ctx.font = `bold ${appNameFontSize}px sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('FitExplorer', width / 2, centerY + logoImage.height * logoScale + appNameFontSize * 2);
      
      // Save splash screen
      const out = fs.createWriteStream(path.join(iconsDir, name));
      const stream = canvas.createPNGStream();
      stream.pipe(out);
    }
    
    console.log(`
📱 PWA Icons generated successfully! 📱

Location: ${iconsDir}

Generated:
- Standard icons (16px to 512px)
- Maskable icons for Android
- Splash screens for iOS

These icons will be used by the PWA for homescreen icons and splash screens.
`);
    
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the icon generation
generateIcons(); 