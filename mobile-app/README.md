# FitExplorer Mobile App Assets

## 📁 Folder Structure

```
mobile-app/
├── screenshots/           # App Store screenshots (10 images)
│   ├── splash.png
│   ├── landingpage.png
│   ├── aiworkoutgenerator.png
│   ├── fitnesscalculator.png
│   ├── muscleguide.png
│   ├── workouthistory.png
│   ├── routines.png
│   ├── progresstracker.png
│   ├── profile.png
│   └── workoutlogpartone.png
│
├── app-previews/          # App Store preview videos (3 videos)
│   ├── preview-1-ai-workout-generator.mp4
│   ├── preview-2-workout-log.mp4
│   └── preview-3-workout-history.mp4
│
├── assets/                # Development assets
│   ├── splash-screen-minimal.html
│   ├── generate_splash.py
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
│
└── resize_screenshots.py  # Script to resize screenshots for App Store
```

## 🎬 App Preview Strategy

### Preview 1: AI Workout Generator (30s)
- **File**: `preview-1-ai-workout-generator.mp4`
- **Content**: Splash → Dashboard → AI Generator → Form → Results → Save
- **Focus**: Innovation and personalization

### Preview 2: Workout Log (30s)
- **File**: `preview-2-workout-log.mp4`
- **Content**: Splash → Dashboard → Workout Log → Add Exercises → Finish
- **Focus**: Core functionality and ease of use

### Preview 3: Workout History (30s)
- **File**: `preview-3-workout-history.mp4`
- **Content**: Splash → Dashboard → History → Browse → Progress Charts
- **Focus**: Progress tracking and data visualization

## 📱 Screenshot Order

1. **Splash Screen** - First impression
2. **Landing Page** - App overview
3. **AI Workout Generator** - Key differentiator
4. **Fitness Calculator** - Popular feature
5. **Muscle Guide** - Educational value
6. **Workout History** - Progress tracking
7. **Routines** - Workout management
8. **Progress Tracker** - Data visualization
9. **Profile/Dashboard** - User experience
10. **Workout Log** - Core functionality

## 🚀 App Store Requirements

- **Screenshots**: 1242x2688px (iPhone 12 Pro Max)
- **App Previews**: 15-30 seconds each, MP4/MOV format
- **File Size**: Max 500MB per preview
- **Resolution**: 1242x2688px for previews

## 📝 Usage

1. **Generate screenshots**: Use `resize_screenshots.py`
2. **Create splash screen**: Use `assets/splash-screen-minimal.html`
3. **Record previews**: Use iPhone screen recording
4. **Upload to App Store**: Use App Store Connect
