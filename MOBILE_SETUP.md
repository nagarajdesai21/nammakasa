# NammaKasa Mobile App - Quick Setup Guide

## 🎯 Project Structure

```
nammakasa/
├── admin-panel/          → React/Web admin dashboard
├── services/
│   └── admin-backend/    → Express backend API
└── app/                  → React Native mobile app (NEW)
    ├── src/
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.tsx          ← Customer + Driver tabs
    │   │   │   ├── CustomerSignupPage.tsx ← Signup with OTP
    │   │   │   ├── OtpVerificationPage.tsx← Both user types
    │   │   │   └── DriverLoginPage.tsx   
    │   │   └── app/
    │   │       ├── customer/
    │   │       │   └── CustomerDashboard.tsx
    │   │       └── driver/
    │   │           └── DriverDashboard.tsx
    │   ├── components/
    │   │   ├── Button.tsx
    │   │   └── TextInput.tsx
    │   ├── services/
    │   │   └── apiService.ts  ← API calls
    │   └── store/
    │       └── authStore.ts   ← Zustand state
    ├── App.tsx              ← Navigation setup
    ├── package.json
    ├── app.json
    ├── tsconfig.json
    └── babel.config.js
```

## 🔧 Backend API Endpoints Created

### Customer Routes (New)
```
POST /api/auth/customer/signup/send-otp
  → Send OTP to email + phone

POST /api/auth/customer/signup/verify-otp
  → Verify OTP (returns token)

POST /api/auth/customer/signup
  → Register new customer
```

### Driver Routes (New)
```
POST /api/auth/driver/login/send-otp
  → Check if driver exists in DB
  → Send OTP if exists
  → Return driverExists: false if not

POST /api/auth/driver/login/verify-otp
  → Verify OTP (returns token)
```

### Database Tables Added
- `jwt_sessions` - Track JWT tokens
- `notification_logs` - Email/SMS audit trail

## 🚀 How to Run

### 1. Start Backend
```bash
cd services/admin-backend
npm install
npm start
# Should print: 🚀 Admin Backend running on port 5000
```

### 2. Start Mobile App
```bash
cd app
npm install
npm start
```

### 3. View on Phone/Emulator
- **Android Emulator**: Press `a`
- **iOS Simulator**: Press `i`
- **Physical Phone**: Scan QR with Expo Go app

## 🧪 Testing Flows

### Test Customer Signup
1. Click "Sign up" on login page
2. Fill: Name, Email, Phone, Password
3. Click "Continue (Send OTP)"
4. Enter OTP: `123456`
5. Redirects to login automatically
6. Logged in!

### Test Customer Login
1. On login page (Customer tab)
2. Enter any email + phone from previous signup
3. Click "Continue"
4. Enter OTP: `123456`
5. Logged in!

### Test Driver Login
1. Add a driver via admin panel first (http://localhost:5173)
2. On login page, click "Driver" tab
3. Enter driver's phone number
4. Click "Send OTP"
5. **If driver not found**: Shows error "Please contact admin"
6. **If driver exists**: Sends OTP
7. Enter OTP: `123456`
8. Logged in!

## 📱 Key Features Implemented

✅ **Customer Signup**
- Multi-step form validation
- Email + Phone OTP requirement
- Secure password hashing
- Auto-login after signup

✅ **Customer Login**
- OTP-based (no password needed)
- Email + Phone verification
- JWT token generation

✅ **Driver Login**
- Pre-registration check (must be added by admin)
- OTP-based login
- User-friendly error: "Driver not found - contact admin"

✅ **Authentication State**
- Zustand store for state management
- AsyncStorage for token persistence
- Auto-login on app restart if token exists

✅ **Error Handling**
- Form validation feedback
- Server error messages
- OTP expiry handling (10 minutes)
- Too many attempts protection (3 tries)

✅ **UI/UX**
- Consistent brand colors (#FF6B00, #003D82)
- Loading spinners
- Smooth navigation
- Back buttons
- Test OTP helper text

## ⚙️ Configuration

**API Base URL:**
- Android Emulator: `http://10.0.2.2:5000` (special IP for localhost)
- iPhone Simulator: `http://localhost:5000`
- Physical phone: Use actual laptop IP (e.g., `http://192.168.x.x:5000`)

**Edit in:** `app/app.json` → `extra.apiUrl`

## 📲 Network Troubleshooting

### "Failed to fetch" Error
1. **Check backend running**: `curl http://localhost:5000/health`
2. **Wrong URL**: Edit `apiService.ts` → `API_BASE_URL`
3. **Firewall**: Allow port 5000
4. **Different machine**: 
   - Find laptop IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update URL in app: `http://YOUR_IP:5000`

### Device Can't Connect
- Same WiFi network required
- Or use ngrok: `ngrok http 5000`
- Update app URL to ngrok tunnel

## 🔐 Security Notes

- Passwords hashed with bcrypt
- JWT tokens stored securely in AsyncStorage
- OTP expires after 10 minutes
- 3-attempt limit before rate limiting
- Phone/Email uniqueness enforced

## 📝 TODO / Next Steps

1. **SMS Integration (MSG91)**
   - Export SMS service function
   - Use MSG91 API key
   - Replace mock OTP with real tests

2. **Dashboard Screens**
   - Add actual customer dashboard
   - Add driver routes/assignments view
   - Bottom tab navigation

3. **Real-time Features**
   - Socket.io for live updates
   - Push notifications (FCM)

4. **Additional Pages**
   - User profile
   - Settings
   - Support/Help
   - Terms & Privacy

## 🎓 Architecture Decisions

| Decision | Reason |
|----------|--------|
| React Native + Expo | Fast dev, cross-platform, live reload |
| TypeScript | Type safety, better IDE support |
| Zustand | Lightweight state management |
| AsyncStorage | Built-in, no extra dependencies |
| JWT | Stateless auth, mobile-friendly |
| OTP Login | Security, no password to steal |

## 📞 Support

- Backend logs: Watch `services/admin-backend` console
- App logs: Expo console shows all logs
- Database issues: Check PostgreSQL connection in `.env`

---

**Status**: ✅ MVP Complete - Ready for SMS integration and dashboard development
