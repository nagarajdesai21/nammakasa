# Nammakasa Mobile App

A React Native app for citizens and drivers to track waste collection in real-time.

## Features

- **Unified App**: Single app for both citizens and drivers
- **OTP Login**: Phone number based authentication
- **Real-time Tracking**: Live GPS tracking of waste collection vehicles
- **Route Management**: Citizens see their assigned routes, drivers manage assignments

## Tech Stack

- **React Native** with Expo
- **TypeScript**
- **React Navigation** for routing
- **AsyncStorage** for local data persistence

## Project Structure

```
src/
├── navigation/          # App navigation setup
├── screens/            # Screen components
│   ├── LoginScreen.tsx
│   ├── CitizenDashboard.tsx
│   └── DriverDashboard.tsx
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
├── components/         # Reusable UI components
└── utils/              # Utility functions
```

## Current Implementation

### ✅ Completed
- Project setup with Expo
- Navigation structure
- Login screen with phone OTP UI
- Basic dashboard screens for citizens and drivers
- API service layer

### 🔄 Backend Integration Notes

The current backend uses email-based OTP for signup. For mobile login, we need:

1. **Phone OTP Endpoints**:
   - `POST /api/auth/send-phone-otp` - Send OTP to phone
   - `POST /api/auth/login` - Login with phone + OTP

2. **Update existing routes** or add new ones for mobile authentication

### 🚀 Next Steps

1. Update backend for phone OTP authentication
2. Implement GPS tracking for drivers
3. Add map integration for live tracking
4. Implement push notifications
5. Add route assignment views

## Running the App

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run web      # Web browser
```

## API Configuration

Update the API base URL in `src/services/api.ts`:
- Development: `http://localhost:5001`
- Production: Your server URL

For mobile devices/emulators, use your computer's IP address instead of localhost.