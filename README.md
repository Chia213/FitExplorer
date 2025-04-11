# FitExplorer 🏋️‍♀️💪

<img src="https://github.com/user-attachments/assets/aa4e07e9-1834-4c1f-adfc-dc860c4e12e5" width="300" alt="FitExplorer Logo">

## Overview

FitExplorer is a comprehensive fitness tracking and workout management application designed to help users achieve their fitness goals through AI-powered tools, personalized recommendations, and interactive progress tracking.

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

### 5. User Experience
- Dark/Light mode support
- Mobile-responsive design
- Interactive UI with animations (Framer Motion)
- Secure authentication with email/password and Google OAuth

## 🛠 Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Vite
- Framer Motion
- Recharts for data visualization
- React Icons
- Google OAuth integration

### Backend
- FastAPI
- PostgreSQL
- JWT Authentication
- SQLAlchemy

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL

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

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

- Chia Ranchber: fitexplorer.fitnessapp@gmail.com
- Ivan Lee: ivan98lee@gmail.com

---

**Happy Fitness Tracking! 💪🏼**
