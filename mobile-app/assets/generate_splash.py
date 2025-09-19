#!/usr/bin/env python3
"""
Generate splash screen image from HTML file
"""
import os
import subprocess
import sys

def generate_splash():
    print("🎨 Generating splash screen image...")
    
    # Check if we have the required files
    html_file = "splash-screen-minimal.html"
    if not os.path.exists(html_file):
        print(f"❌ Error: {html_file} not found!")
        return False
    
    print("✅ HTML file found")
    print("📝 Instructions:")
    print("1. Open http://localhost:8000/splash-screen-minimal.html in your browser")
    print("2. Right-click on the splash screen area")
    print("3. Select 'Inspect Element' or press F12")
    print("4. In the Elements tab, find the .splash-container div")
    print("5. Right-click on that div and select 'Capture node screenshot'")
    print("6. Save the image as 'splash.png' in this folder")
    print("7. Press Enter when done...")
    
    input()
    
    # Check if splash.png was created
    if os.path.exists("splash.png"):
        print("✅ splash.png created successfully!")
        
        # Copy to frontend assets
        try:
            import shutil
            shutil.copy("splash.png", "../frontend/src/assets/splash.png")
            print("✅ Copied to frontend/src/assets/splash.png")
            return True
        except Exception as e:
            print(f"❌ Error copying file: {e}")
            return False
    else:
        print("❌ splash.png not found. Please follow the instructions above.")
        return False

if __name__ == "__main__":
    generate_splash()
