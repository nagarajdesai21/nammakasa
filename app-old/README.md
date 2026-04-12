# NammaKasa Mobile App

React Native mobile application for NammaKasa waste management system. Supports both Customer and Driver login flows with OTP verification.

## 📋 Features

- **Customer Authentication**
  - Sign up with email and phone
  - OTP verification for both email and phone
  - Secure login with JWT tokens

- **Driver Authentication**
  - OTP-based login
  - Driver verification against admin database
  - Automatic redirect if not registered

- **Two-User Types**
  - Customer: For citizens requesting waste collection
  - Driver: For waste collection drivers

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- React Native compatible device or emulator

### Installation

1. **Navigate to app folder**
```bash
cd app
npm install
```

2. **Start the app**
```bash
npm start
```

This will open Expo CLI. You can then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan QR code with Expo Go app on physical device

## 🔐 Authentication Flow

### Customer Signup
1. Fill details (name, email, phone, password)
2. Click "Continue" → OTP sent to email and phone
3. Enter 6-digit OTP
4. Account created, auto-login

### Customer Login
1. Enter email and phone
2. Click "Continue" → OTP sent
3. Enter 6-digit OTP
4. Logged in

### Driver Login
1. Enter phone number
2. System checks if driver exists in admin database
3. If exists: OTP sent to phone
4. Enter OTP → Logged in
5. If not exists: Show message "Please contact admin to register"

## 🧪 Testing

For testing authentication without real SMS service:
- Use OTP: `123456` in the OTP field

Backend will accept both:
- Real OTP (generated)
- Mock OTP `123456`

## 📱 Screen Structure

```
App/
├── Auth Stack (Login screens)
│   ├── LoginPage (with Customer/Driver tabs)
│   ├── CustomerSignupPage (multi-step form + OTP)
│   ├── DriverLoginPage (placeholder)
│   └── OtpVerificationPage (handles both types)
└── App Stack (authenticated screens)
    ├── CustomerDashboard
    └── DriverDashboard
```

## 🔗 API Endpoints

### Customer
- `POST /api/auth/customer/signup/send-otp` - Send OTP
- `POST /api/auth/customer/signup/verify-otp` - Verify OTP
- `POST /api/auth/customer/signup` - Register

### Driver
- `POST /api/auth/driver/login/send-otp` - Send OTP (checks driver exists)
- `POST /api/auth/driver/login/verify-otp` - Verify OTP & login

## 💾 Local Storage

The app uses `AsyncStorage` to persist:
- JWT tokens (`jwt_token`)
- User type (`user_type`: customer | driver)

## 🎨 Color Scheme

- Primary Orange: `#FF6B00`
- Primary Blue: `#003D82`
- Green Accent: `#00A86B`

## 📝 Environment Variables

Create `.env` in the `services/admin-backend` folder:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nammakasa_admin
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
EXPO_API_URL=http://10.0.2.2:5000
MSG91_API_KEY=your_msg91_api_key
```

## 🛠️ Next Steps

1. **SMS Integration**: Replace mock OTP with MSG91 API
   - Sign up at msg91.com
   - Add API key to `.env`
   - Implement SMS sending in auth routes

2. **Dashboard Screens**: Build actual customer/driver dashboards

3. **Real-time Updates**: Add realtime database updates with Socket.io

4. **Notifications**: Push notifications for new assignments (drivers), collections (customers)

## 📲 To Phone Setup

1. Install Expo Go on your phone
2. Run `npm start` on laptop
3. Scan QR code with Expo Go
4. App opens on phone with hot reload

## 🐛 Common Issues

### "Failed to fetch" error on different laptop
- Ensure backend is running: `cd services/admin-backend && npm start`
- Check IP address - use correct IP instead of localhost
- Firewall: Allow port 5000

### OTP not sending
- Mock OTP works by default: use `123456`
- SMS service not configured yet (MSG91)

### Connection refused
- Backend not running
- Wrong API URL in `app.json`
- Network connectivity issue

## 📞 Support

For issues or questions, refer to mobile auth routes documentation or create issue in repo.
