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
    
    # Find all PNG files in screenshots directory
    png_files = glob.glob(os.path.join(screenshots_dir, "*.png"))
    
    if not png_files:
        print("No PNG files found in screenshots directory!")
        return
    
    print(f"Found {len(png_files)} PNG files to resize for iPad...")
    print(f"Target dimensions: {TARGET_WIDTH}x{TARGET_HEIGHT}px")
    print("-" * 50)
    
    resized_count = 0
    
    for png_file in png_files:
        try:
            # Open the image
            with Image.open(png_file) as img:
                original_size = img.size
                print(f"Processing: {os.path.basename(png_file)}")
                print(f"  Original size: {original_size[0]}x{original_size[1]}px")
                
                # Resize the image to iPad dimensions
                # Using LANCZOS resampling for high quality
                resized_img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
                
                # Save the resized image
                output_path = os.path.join(output_dir, os.path.basename(png_file))
                resized_img.save(output_path, "PNG", optimize=True)
                
                print(f"  Resized to: {TARGET_WIDTH}x{TARGET_HEIGHT}px")
                print(f"  Saved as: {output_path}")
                print()
                
                resized_count += 1
                
        except Exception as e:
            print(f"Error processing {png_file}: {str(e)}")
            print()
    
    print("-" * 50)
    print(f"Successfully resized {resized_count} out of {len(png_files)} files!")
    print(f"iPad screenshots are saved in: {output_dir}/")
    print("\nYou can now upload these iPad screenshots to App Store Connect.")

if __name__ == "__main__":
    resize_screenshots_for_ipad()
