#!/usr/bin/env python3
"""
Script to resize screenshots for iPad App Store submission.
Resizes all PNG files in the screenshots directory to 2732x2048px (13-inch iPad).
"""

import os
from PIL import Image
import glob

def resize_screenshots_for_ipad():
    # iPad 13-inch display dimensions
    TARGET_WIDTH = 2732
    TARGET_HEIGHT = 2048
    
    # Directory containing screenshots
    screenshots_dir = "screenshots"
    output_dir = "screenshots_ipad"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Find all image files in screenshots directory
    image_files = []
    for ext in ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']:
        image_files.extend(glob.glob(os.path.join(screenshots_dir, ext)))
    
    if not image_files:
        print("No image files found in screenshots directory!")
        return
    
    print(f"Found {len(image_files)} image files to resize for iPad...")
    print(f"Target dimensions: {TARGET_WIDTH}x{TARGET_HEIGHT}px")
    print("-" * 50)
    
    resized_count = 0
    
    for image_file in image_files:
        try:
            # Open the image
            with Image.open(image_file) as img:
                original_size = img.size
                print(f"Processing: {os.path.basename(image_file)}")
                print(f"  Original size: {original_size[0]}x{original_size[1]}px")
                
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize the image to iPad dimensions
                # Using LANCZOS resampling for high quality
                resized_img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
                
                # Save the resized image as PNG
                base_name = os.path.splitext(os.path.basename(image_file))[0]
                output_path = os.path.join(output_dir, f"{base_name}.png")
                resized_img.save(output_path, "PNG", optimize=True)
                
                print(f"  Resized to: {TARGET_WIDTH}x{TARGET_HEIGHT}px")
                print(f"  Saved as: {output_path}")
                print()
                
                resized_count += 1
                
        except Exception as e:
            print(f"Error processing {image_file}: {str(e)}")
            print()
    
    print("-" * 50)
    print(f"Successfully resized {resized_count} out of {len(image_files)} files!")
    print(f"iPad screenshots are saved in: {output_dir}/")
    print("\nYou can now upload these iPad screenshots to App Store Connect.")

if __name__ == "__main__":
    resize_screenshots_for_ipad()
