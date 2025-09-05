# iPhone Testing Guide (Windows + iPhone)

Since you're on Windows but have an iPhone, here are the best ways to test your FitExplorer app:

## 🚀 Option 1: PWA (Progressive Web App) - Easiest

### Step 1: Deploy to a Web Server
```bash
# Build your app
cd frontend
npm run build

# Deploy to Vercel (free)
npx vercel --prod

# Or deploy to Netlify
npx netlify deploy --prod --dir=dist
```

### Step 2: Install on iPhone
1. Open Safari on your iPhone
2. Go to your deployed URL (e.g., `https://fitexplorer.vercel.app`)
3. Tap the Share button (square with arrow)
4. Tap "Add to Home Screen"
5. Your app will appear on your home screen like a native app!

## 📱 Option 2: Local Testing with ngrok

### Step 1: Install ngrok
```bash
npm install -g ngrok
```

### Step 2: Run your app locally
```bash
cd frontend
npm run dev
```

### Step 3: Expose to internet
```bash
ngrok http 5173
```

### Step 4: Test on iPhone
1. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Open Safari on your iPhone
3. Go to the ngrok URL
4. Add to Home Screen

## 🍎 Option 3: Use a Mac (Best for App Store)

### Rent a Mac
- **MacStadium**: $79/month for Mac Mini
- **AWS Mac instances**: Pay per hour
- **MacInCloud**: $20/month for remote Mac

### Steps with Mac:
1. Get access to a Mac
2. Install Xcode
3. Run `npm run mobile:ios` (I'll add this back)
4. Build and test on your iPhone
5. Submit to App Store

## 🔧 PWA Features You Get

- **App-like experience** on iPhone
- **Offline functionality** (with service worker)
- **Push notifications** (limited on iOS)
- **Home screen icon**
- **Full-screen mode**
- **No App Store needed**

## 📋 Quick PWA Setup

I've already configured your app as a PWA. Just:

1. **Deploy to web** (Vercel/Netlify)
2. **Open on iPhone Safari**
3. **Add to Home Screen**
4. **Use like a native app!**

## 🎯 Recommendation

For now, use **Option 1 (PWA)** - it's the fastest way to get your app on your iPhone and test it like a native app. Later, if you want to submit to the App Store, you'll need access to a Mac.
