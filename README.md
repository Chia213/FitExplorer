# FitExplorer 🏋️‍♀️💪

## Overview

FitExplorer is a comprehensive fitness tracking and workout management application designed to help users achieve their fitness goals through interactive tools, personalized workout generation, and progress tracking.

![FitExplorer Logo](./src/assets/established-badge-logo.svg)

## 🌟 Key Features

### 1. Workout Generation
- Generate custom workout routines based on:
  - Fitness level
  - Available equipment
  - Time constraints
  - Personal goals

### 2. Workout Tracking
- Log and record workouts with detailed exercise information
- Track sets, reps, weights, and personal notes
- Maintain a comprehensive workout history

### 3. Muscle Guide
- Interactive anatomy exploration
- Detailed exercise instructions
- Targeted muscle group information

### 4. Progress Monitoring
- Visualize fitness progress
- Track strength gains
- Monitor workout frequency and performance

### 5. User Authentication
- Email/Password Registration
- Google OAuth Login
- Secure token-based authentication

### 6. Responsive Design
- Dark and Light mode
- Mobile and desktop friendly
- Tailwind CSS styling

## 🛠 Tech Stack

### Frontend
- React 19
- React Router
- Tailwind CSS
- Vite
- React Icons
- Google OAuth

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL

### Frontend Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/fitexplorer.git
cd fitexplorer
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the frontend directory
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Run the development server
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory
```bash
cd backend
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

4. Create a `.env` file
```bash
DB_URL=postgresql://username:password@localhost:5432/fitdemo
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
uvicorn main:app --reload
```

## 🔐 Environment Variables

### Frontend
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID

### Backend
- `DB_URL`: PostgreSQL database connection string
- `SECRET_KEY`: JWT secret key
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

- Chiranjeev Bharadwaj: chiranchber@gmail.com
- Ivan Lee: ivan98lee@gmail.com

---

**Happy Fitness Tracking! 💪🏼**
