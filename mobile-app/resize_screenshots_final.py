#!/usr/bin/env python3
"""
Resize screenshots to App Store requirements
Required dimensions: 1242 × 2688px (iPhone 12 Pro Max)
"""
import os
from pathlib import Path
from PIL import Image

def resize_screenshot(input_path, output_path, width=1242, height=2688):
    """Resize screenshot to App Store dimensions"""
    try:
        print(f"Resizing {input_path.name}...")
        
        # Open image
        with Image.open(input_path) as img:
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize with aspect ratio preservation
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Create new image with target dimensions
            new_img = Image.new('RGB', (width, height), (0, 0, 0))  # Black background
            
            # Calculate position to center the image
            x = (width - img.width) // 2
            y = (height - img.height) // 2
            
            # Paste the resized image onto the black background
            new_img.paste(img, (x, y))
            
            # Save as PNG
            new_img.save(output_path, 'PNG', quality=95)
            
        print(f"✅ Successfully resized: {output_path.name}")
        return True
        
    except Exception as e:
        print(f"❌ Error resizing {input_path.name}: {e}")
        return False

def main():
    print("📱 Screenshot Resizer for App Store")
    print("=" * 40)
    
    # Define paths
    screenshots_dir = Path("screenshots")
    resized_dir = Path("screenshots-resized")
    
    # Create resized directory
    resized_dir.mkdir(exist_ok=True)
    
    # Find all image files
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPEG', '*.JPG', '*.PNG']:
        image_files.extend(screenshots_dir.glob(ext))
    
    if not image_files:
        print("❌ No image files found in screenshots directory")
        return False
    
    print(f"Found {len(image_files)} image files:")
    for img in image_files:
        print(f"  - {img.name}")
    
    print(f"\n🎯 Resizing to App Store dimensions (1242 × 2688px)...")
    print("=" * 50)
    
    success_count = 0
    for img_file in image_files:
        # Create output filename (convert to lowercase and .png)
        output_name = img_file.stem.lower() + '.png'
        output_file = resized_dir / output_name
        
        if resize_screenshot(img_file, output_file):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"✅ Successfully resized {success_count}/{len(image_files)} screenshots")
    print(f"📁 Resized screenshots saved to: {resized_dir}")
    print("\n📱 App Store Requirements:")
    print("  - Dimensions: 1242 × 2688px (iPhone 12 Pro Max)")
    print("  - Format: PNG or JPEG")
    print("  - Max file size: 5MB per screenshot")
    
    # List the resized files
    print("\n📋 Resized files:")
    for file in sorted(resized_dir.glob("*.png")):
        print(f"  - {file.name}")
    
    return success_count > 0

if __name__ == "__main__":
    main()
