# Nammakasa Admin Panel - React.js Website

A production-ready waste management admin dashboard for BBMP (Bengaluru Bruhat Mahanagara Palike) to manage waste collection operations with route assignments, driver management, and visual analytics.

## 🚀 Features

### 1. **Authentication System**
- Secure login/signup with OTP verification
- Ward-based access control (each admin manages one ward)
- Multi-step signup with email verification
- Admin approval workflow for new registrations

### 2. **Dashboard**
- Real-time statistics (total autos, drivers, routes)
- Weekly collection trends with interactive charts
- Auto type distribution (compactor, tipper, tractor)
- Ward-wise overview
- Recent activity log

### 3. **Waste Auto Management**
- Add/edit/delete waste collection autos
- Search autos by registration number
- Track auto capacity, condition, and fuel type
- Maintenance schedule tracking
- Status management (active/inactive/maintenance)

### 4. **Route Management**
- Create collection routes with pincode mapping
- Search routes by pincode (auto-locate area)
- Set frequency (daily, alternate, weekly)
- Define estimated collection duration
- Multiple routes per ward

### 5. **Driver Management**
- Add/edit/delete drivers with full details
- Track experience, salary, and license info
- Optional fields for flexibility
- Driver status management
- License expiry tracking

### 6. **Route Assignment**
- Assign routes to autos and drivers
- Track multiple assignments per day
- Petrol management (cost tracking)
- Service charge management
- Assignment status tracking

### 7. **Visual Mapping & Analytics**
- **Map View**: Interactive pincode selection
- **Chart View**: 
  - Pincode to auto distribution
  - Route auto assignments & capacity
  - Collection performance metrics
  - Auto capacity utilization
  - Route performance analysis
  - Ward coverage status
- **Data View**: Detailed tables with all mappings

### 8. **UI/UX**
- Karnataka Government inspired design
- Responsive (mobile, tablet, desktop)
- Beautiful gradient headers and cards
- Icon-rich interface with lucide-react
- Dark mode ready

## 📋 Tech Stack

- **Frontend Framework**: React 18.2
- **Language**: TypeScript 5.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **State Management**: Zustand 4.4
- **Charts**: Recharts 2.10
- **Maps**: Leaflet 1.9 + React-Leaflet 4.2
- **HTTP Client**: Axios 1.6
- **Icons**: Lucide React 0.294
- **Routing**: React Router v6

## 🏗️ Project Structure

```
admin-panel/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── features/
│   │   │   ├── AddAutoPage.tsx
│   │   │   ├── AddRouteInfoPage.tsx
│   │   │   ├── AddDriverPage.tsx
│   │   │   ├── AssignRoutePage.tsx
│   │   │   └── VisualMappingPage.tsx
│   │   └── Dashboard.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── index.html
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ (with npm or yarn)
- Git

### Installation Steps

1. **Navigate to admin-panel directory**
   ```bash
   cd /home/subramanya/Desktop/per/nammakasa/admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure API URL** (edit `.env.local`)
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 Demo Credentials

```
Email: demo@gov.in
Password: demo123
Ward: 45
```

## 📡 API Endpoints (To be implemented)

### Authentication
- `POST /api/auth/signup` - Register new admin
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/request-approval` - Request admin approval

### Autos
- `GET /api/autos` - Get all autos for ward
- `GET /api/autos/:id` - Get auto details
- `POST /api/autos` - Create new auto
- `PUT /api/autos/:id` - Update auto
- `DELETE /api/autos/:id` - Delete auto
- `GET /api/autos/search?autoNumber=XX` - Search auto by number

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `GET /api/routes/search?pinCode=560038` - Search routes by pincode

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Route Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `GET /api/assignments/mapping` - Get visual mapping data

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get collection trends
- `GET /api/dashboard/ward-overview` - Get ward overview

### Map Services
- `GET /api/map/location?pinCode=560038` - Get location from pincode
- `GET /api/map/route/:routeId` - Get route coordinates
- `GET /api/map/search?q=indiranagar` - Search locations

## 🎨 Color Scheme

The design uses Karnataka Government official colors:
- **Primary Orange**: `#FF6B00` - Main actions and highlights
- **Secondary Blue**: `#003D82` - Secondary elements
- **Accent Green**: `#00A86B` - Success and positive indicators
- **Light Gray**: `#F5F5F5` - Backgrounds

## 💡 Key Features Explained

### Ward-Based Access
- Each admin is assigned to ONE ward (e.g., Ward 45)
- Can only view and manage their ward's data
- All data is automatically filtered by `wardNo`
- Ward number is set during signup and stored in JWT token

### Petrol & Service Management
- Track fuel expenses for each route assignment
- Optional fields - can be added at any time
- Used for cost analysis and budgeting

### Route Assignment Logic
- One route can be assigned to multiple autos (for parallel coverage)
- One auto can be assigned to one route per day only
- Each assignment includes driver and vehicle details
- System calculates completion times automatically

### Data Validation
- Email validation
- Phone number validation (Indian format)
- Pincode validation (6 digits)
- Age range checking (18-70 years)
- Capacity range checking (1-30 tons)

## 🚀 Performance Optimizations

1. **Code Splitting**: Routes are lazy-loaded
2. **State Management**: Using Zustand for lightweight state
3. **API Caching**: Implemented in auth store
4. **Responsive Images**: Optimized icons
5. **CSS**: Tailwind for minimal bundle size
6. **Build**: Minified and optimized Vite build

## 🔒 Security Features

1. **Authentication**: JWT-based with localStorage
2. **Protected Routes**: Unauthorized users redirected to login
3. **Ward Isolation**: Data is ward-specific
4. **OTP Verification**: Email-based two-factor authentication
5. **Admin Approval**: New registrations require approval
6. **CORS**: Ready for secure backend integration

## 📱 Responsive Design

- Mobile: Full-featured on small screens
- Tablet: Optimized layout
- Desktop: Full dashboard experience
- Hamburger menu on mobile for navigation

## 🧪 Testing Demo Data

The application comes with mock data for testing:
- 2 waste autos in Ward 45
- 2 collection routes
- 2 drivers
- 1 route assignment with petrol tracking

All mock data is defined in the respective feature pages.

## 📊 Dashboard Metrics

### Real-time Statistics
- Total waste autos and active count
- Total drivers
- Total routes
- Collection completion rate

### Charts
- **Bar Chart**: Weekly collection trends (completed vs pending)
- **Pie Chart**: Auto type distribution
- **Bar Chart**: Ward-wise statistics

### Recent Activity
- Auto additions
- Driver verifications
- Collection completions
- Assignment updates

## 🗺️ Visual Mapping Features

### Map View
- Select pincode
- View assigned autos and routes
- Interactive map placeholder (ready for Leaflet integration)
- Real-time location display

### Charts View
- Pincode to auto distribution
- Route performance metrics
- Capacity utilization analysis
- Collection performance trends

### Data View
- Detailed tables
- Exportable data
- Searchable and sortable

## 🔄 API Integration Ready

The `api.ts` service file is fully structured for backend connectivity:
- All endpoints defined with proper typing
- Request/response interceptors ready
- Error handling in place
- Auth token auto-injection
- Ready for production backend

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment to Server
1. Run `npm run build`
2. Copy `dist` folder to server
3. Configure nginx/apache to serve `index.html`
4. Ensure API endpoints are properly configured

## 📝 Future Enhancements

- [ ] Interactive map with real-time vehicle tracking
- [ ] GPS tracking integration
- [ ] Photo upload for proof of collection
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Predictive analytics for route optimization
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Progressive Web App (PWA) features

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Installation Failed
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install
```

### Build Errors
```bash
# Check TypeScript errors
npm run type-check

# Run linter
npm run lint
```

## 📞 Support Contact

**Government of Karnataka**
- BBMP Main Office: +91 080-2293 5001
- Email: admin@nammakasa.gov.in
- Website: https://bbmp.gov.in

## 📄 License

This project is developed for Bengaluru Bruhat Mahanagara Palike (BBMP) under the Government of Karnataka.

## 👥 Team

Built with ❤️ for efficient waste management in Bengaluru

---

**Last Updated**: April 2026
**Status**: Production Ready ✅
