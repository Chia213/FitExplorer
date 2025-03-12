![established-badge-logo](https://github.com/user-attachments/assets/aa4e07e9-1834-4c1f-adfc-dc860c4e12e5)# FitExplorer 🏋️‍♀️💪

## Overview

FitExplorer is a comprehensive fitness tracking and workout management application designed to help users achieve their fitness goals through interactive tools, personalized workout generation, and progress tracking.


![Upload<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
  <!-- Gradient Background -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#111827;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1F2937;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Main Circle -->
  <circle cx="250" cy="250" r="220" fill="url(#grad2)" />
  <circle cx="250" cy="250" r="210" fill="url(#grad1)" />
  <circle cx="250" cy="250" r="195" fill="url(#grad2)" />
  
  <!-- Inner Border Circle -->
  <circle cx="250" cy="250" r="170" fill="none" stroke="white" stroke-width="2" />
  <circle cx="250" cy="250" r="165" fill="none" stroke="white" stroke-width="1" />
  
  <!-- Established Banner -->
  <path d="M140,170 H360 L350,190 H150 Z" fill="white" />
  <text x="250" y="186" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#111827">ESTABLISHED 2025</text>
  
  <!-- Main Title -->
  <text x="250" y="250" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">FIT</text>
  <text x="250" y="310" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">EXPLORER</text>
  
  <!-- Fitness Icon Elements -->
  <g fill="white">
    <!-- Dumbbell -->
    <rect x="175" y="330" width="150" height="10" rx="2" />
    <rect x="165" y="320" width="30" height="30" rx="5" />
    <rect x="305" y="320" width="30" height="30" rx="5" />
    
    <!-- Stars -->
    <polygon points="220,140 225,130 230,140 220,135 230,135" />
    <polygon points="250,130 255,120 260,130 250,125 260,125" />
    <polygon points="280,140 285,130 290,140 280,135 290,135" />
  </g>
  
  <!-- Bottom Tagline -->
  <text x="250" y="390" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white" letter-spacing="2">STRENGTH • FITNESS • HEALTH</text>
</svg>ding established-badge-logo.svg…]()




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
