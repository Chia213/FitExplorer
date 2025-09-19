# FitExplorer 🏋️‍♀️💪

<img src="frontend/src/assets/Ronjasdrawing.png" width="300" alt="FitExplorer Logo">

## Overview

FitExplorer is a comprehensive fitness tracking and workout management application designed to help users achieve their fitness goals through AI-powered tools, personalized recommendations, and interactive progress tracking. Built with passion for training and now available as a Progressive Web App (PWA) with mobile-optimized design.

**🚀 Now Available on App Store!** - Submit your fitness journey with our mobile-optimized experience.

## 🌟 Key Features

### 1. AI-Powered Workout Generation
- Generate personalized workout routines based on:
  - Fitness goals (strength, hypertrophy, endurance, weight loss)
  - Experience level
  - Available equipment
  - Time constraints
  - Target muscle groups

### 2. Comprehensive Workout Tracking
- Log exercises with detailed sets, reps, and weights
- Save routines for quick access
- Track workout history with visual progress charts
- Rest timer with customizable intervals
- Support for specialized set types (drop sets, supersets, pyramids)

### 3. Nutrition Management
- Food tracking with detailed macronutrient analysis
- AI-generated meal plans based on goals and preferences
- Nutrition history visualization with charts
- Meal plan adjustments based on workout activity
- AI nutrition guide with chat support

### 4. Progress Monitoring
- Visual performance tracking across exercises
- Personal records tracking
- Workout frequency monitoring
- Body measurement tracking

### 5. Fitness Calculators
- BMI Calculator with health category assessment
- Body Fat Percentage calculator (Navy method)
- TDEE (Total Daily Energy Expenditure) calculator
- One Rep Max (1RM) calculator for strength tracking
- Mobile-optimized interface with dark/light mode support

### 6. Muscle Guide & Exercise Library
- Comprehensive anatomical muscle guide
- 500+ exercises with detailed instructions
- Visual muscle group targeting
- Exercise form guidance and tips
- Interactive muscle selection interface

### 7. User Experience
- Dark/Light mode support with theme persistence
- Mobile-first responsive design
- Progressive Web App (PWA) capabilities
- Interactive UI with smooth animations (Framer Motion)
- Secure authentication with email/password and Google OAuth
- Mobile-optimized splash screen and navigation

## 🛠 Tech Stack

### Frontend
- React 18 with modern hooks and context
- React Router v6 for navigation
- Tailwind CSS with custom design system
- Vite for fast development and building
- Framer Motion for smooth animations
- Recharts for data visualization
- React Icons for consistent iconography
- Google OAuth integration
- PWA capabilities with service workers
- Mobile-optimized responsive design
- Custom CSS for mobile-specific styling

### Backend
- FastAPI
- PostgreSQL
- JWT Authentication
- SQLAlchemy

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.12+)
- PostgreSQL
- Modern web browser with PWA support

### Mobile Access
- **Progressive Web App**: Access via mobile browser
- **App Store**: Available for iOS devices
- **Responsive Design**: Optimized for all screen sizes

### Frontend Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/fitexplorer.git
cd fitexplorer/frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
# Create a .env file with:
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Run the development server
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory
```bash
cd ../backend
```

2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Configure environment variables
```bash
# Create a .env file with:
DATABASE_URL=postgresql://username:password@localhost:5432/fitexplorer
SECRET_KEY=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

5. Run database migrations
```bash
alembic upgrade head
```

6. Start the backend server
```bash
uvicorn app.main:app --reload
```

## 📱 Mobile Features

### App Store Ready
- **Screenshots**: Professional mobile screenshots for App Store
- **App Previews**: Video demonstrations of key features
- **Mobile Optimization**: Touch-friendly interface and navigation
- **Splash Screen**: Custom branded loading experience

### PWA Capabilities
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Core features work without internet
- **Push Notifications**: Workout reminders and motivation
- **Responsive Design**: Seamless experience across all devices

## 🎯 Recent Updates

- ✅ **Mobile-First Design**: Complete mobile optimization
- ✅ **Fitness Calculators**: BMI, Body Fat, TDEE, 1RM calculators
- ✅ **Muscle Guide**: Interactive anatomical exercise library
- ✅ **Dark/Light Mode**: Enhanced theme system with persistence
- ✅ **App Store Submission**: Ready for iOS App Store
- ✅ **PWA Implementation**: Progressive Web App capabilities
- ✅ **Mobile Navigation**: Touch-optimized bottom navigation
- ✅ **Splash Screen**: Professional branded loading experience

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

- Chia Ranchber: fitexplorer.fitnessapp@gmail.com
- Ivan Lee: ivan98lee@gmail.com

---

**Your Fitness Adventure Awaits! 💪🏼**

Last updated: 2025-01-19
