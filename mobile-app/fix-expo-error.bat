@echo off
echo Fixing Expo configuration error...
echo.

echo Step 1: Navigating to app directory...
cd /d C:\Users\chiar\Documents\Project\FitExplorer\mobile-app\FitExplorerApp

echo Step 2: Publishing fixed configuration...
eas update --channel production

echo.
echo Step 3: Testing the fix...
echo After publishing, try scanning the QR code again!
echo.
pause
