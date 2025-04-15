import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get your domain from the command line or use a default
const domain = process.argv[2] || 'https://yourapp-domain.com';
const qrUrl = `${domain}/qr-install`;

// Output filepath
const outputDir = path.join(__dirname, 'public', 'assets');
const outputFile = path.join(outputDir, 'install-qr.png');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// QR code options
const options = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 0.92,
  margin: 1,
  color: {
    dark: '#4f46e5',  // Indigo color (matches theme)
    light: '#ffffff'  // White background
  }
};

// Generate QR code
QRCode.toFile(outputFile, qrUrl, options, function(err) {
  if (err) {
    console.error('Error generating QR code:', err);
    return;
  }
  
  console.log(`
📱 QR Code generated successfully! 📱

Location: ${outputFile}
URL: ${qrUrl}

This QR code will take users directly to the app installation page.
When scanned, users will see clear instructions for installing the app
to their home screen based on their device type.

Usage:
1. Print this QR code
2. Display it on your website
3. Include it in marketing materials

To generate a QR code for a different domain, run:
node generate-qr.js https://your-custom-domain.com
  `);
}); 