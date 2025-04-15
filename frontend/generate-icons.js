import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons of different sizes
const sizes = [16, 32, 48, 72, 96, 144, 192, 384, 512];

// Create a basic icon with "FE" text
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4f46e5'; // Indigo color
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Add a lighter inner circle
  ctx.fillStyle = '#6366f1'; // Lighter indigo
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 * 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  // Add text
  const fontSize = Math.floor(size * 0.4);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FE', size/2, size/2);
  
  // Save as PNG
  const fileName = size === 192 ? 'icon-192x192.png' : 
                  size === 512 ? 'icon-512x512.png' : 
                  `icon-${size}x${size}.png`;
  const out = fs.createWriteStream(path.join(iconsDir, fileName));
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  
  // Also create a maskable icon version for size 192 and 512
  if (size === 192 || size === 512) {
    const maskableCanvas = createCanvas(size, size);
    const maskCtx = maskableCanvas.getContext('2d');
    
    // Safe zone is 40% of icon size
    const safeInset = size * 0.1; // Safe zone is inset by 10%
    const safeSize = size * 0.8; // Safe content is 80% of total size
    
    // Background for the full icon
    maskCtx.fillStyle = '#4f46e5';
    maskCtx.fillRect(0, 0, size, size);
    
    // Add a lighter inner circle in the safe zone
    maskCtx.fillStyle = '#6366f1';
    maskCtx.beginPath();
    maskCtx.arc(size/2, size/2, safeSize/2, 0, Math.PI * 2);
    maskCtx.fill();
    
    // Add text in the safe zone
    const maskFontSize = Math.floor(safeSize * 0.4);
    maskCtx.font = `bold ${maskFontSize}px sans-serif`;
    maskCtx.fillStyle = 'white';
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.fillText('FE', size/2, size/2);
    
    // Save maskable icon
    const maskableName = size === 512 ? 'maskable_icon.png' : `maskable_icon_${size}.png`;
    const maskableOut = fs.createWriteStream(path.join(iconsDir, maskableName));
    const maskableStream = maskableCanvas.createPNGStream();
    maskableStream.pipe(maskableOut);
  }
});

// Generate splash screens for iOS
const splashSizes = [
  { width: 640, height: 1136, name: 'splash-640x1136.png' }, // iPhone 5/SE
  { width: 750, height: 1334, name: 'splash-750x1334.png' }, // iPhone 6/7/8
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' }, // iPhone 6+/7+/8+
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS
];

splashSizes.forEach(({ width, height, name }) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1f2937'); // Dark gray
  gradient.addColorStop(1, '#111827'); // Darker gray
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw circular logo in the center
  const logoSize = Math.min(width, height) * 0.4;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Outer circle
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.arc(centerX, centerY, logoSize/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner circle
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(centerX, centerY, logoSize/2 * 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  // Logo text
  const fontSize = Math.floor(logoSize * 0.4);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FE', centerX, centerY);
  
  // App name below the logo
  const appNameFontSize = Math.floor(logoSize * 0.2);
  ctx.font = `bold ${appNameFontSize}px sans-serif`;
  ctx.fillStyle = 'white';
  ctx.fillText('FitExplorer', centerX, centerY + logoSize/2 + appNameFontSize * 2);
  
  // Save splash screen
  const out = fs.createWriteStream(path.join(iconsDir, name));
  const stream = canvas.createPNGStream();
  stream.pipe(out);
});

console.log(`
📱 PWA Icons generated successfully! 📱

Location: ${iconsDir}

Generated:
- Standard icons (16px to 512px)
- Maskable icons for Android
- Splash screens for iOS

These icons will be used by the PWA for homescreen icons and splash screens.
`); 