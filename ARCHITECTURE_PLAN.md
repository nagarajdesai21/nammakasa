# Implementation Plan: Smart Waste Collection Tracking App

## Core Problem & Vision

**The Real-World Problem** (Bangalore/Indian Cities):
- Citizens don't know when garbage autos will arrive
- Drivers falsely claim they completed collections → zero accountability
- No real-time tracking, no ETA, no data verification
- Manual admin scheduling is inefficient and un-scalable

**Our Solution**:
A **Route-Based GPS Tracking System** where:
1. **City divided into Wards** → Each ward has multiple collection **Routes**
2. **Admin assigns autos to routes daily** (RouteAssignment: route_id + auto_id + date)
3. **Drivers send live GPS continuously** while on route
4. **Citizens see live auto location + ETA** for their specific route
5. **System tracks completion with accountability** (photos, timestamps)

**Real Example**:
- Ward 1 (Bangalore) has 3 routes: Indiranagar North, Indiranagar South, Koramangala
- Monday: Auto #101 assigned to Indiranagar North, Auto #102 assigned to Koramangala
- Citizens in Indiranagar North see Auto #101's location on their map + ETA
- Driver confirms completion by snapping photos at dump yard

---

## STEP 1: System Architecture (High-Level)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              CITIZEN APP (React Native)                         │
│   • View assigned route                                         │
│   • See live auto location & ETA                               │
│   • Get push notifications (status: pending/completed)          │
│                                                                 │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────┴────────────────┐
│                                         │
│    DRIVER APP (React Native)           │    ADMIN PANEL (React Web)
│  • See assigned route details          │  • Assign autos to routes
│  • Send GPS every 5-10 seconds         │  • View all routes
│  • Mark tasks complete + photo         │  • Monitor driver GPS
│  • View completed collections          │  • Generate reports
│                                         │
└────────┬────────────────────────────────┴─────────────────┐
         │                                                   │
         │  BACKEND API (Node.js + Express)                │
         │  ┌──────────────────────────────────────────┐   │
         │  │ • Authentication (OTP + JWT)             │   │
         │  │ • Route Management                        │   │
         │  │ • RouteAssignment Logic                  │   │
         │  │ • Real-time GPS Streaming (Socket.io)   │   │
         │  │ • ETA Calculation (Google Maps API)     │   │
         │  │ • Task Completion Tracking              │   │
         │  │ • Notifications (FCM)                   │   │
         │  └──────────────────────────────────────────┘   │
         │                                                   │
    ┌────┴────────────────────────────────────────────────┐ │
    │                                                     │ │
    │  DataBase: PostgreSQL + PostGIS                    │ │
    │  ┌────────────────────────────────────────────┐   │ │
    │  │ • Users (Citizens, Drivers, Admins)        │   │ │
    │  │ • Wards (geographical divisions)           │   │ │
    │  │ • Routes (route details per ward)          │   │ │
    │  │ • RouteAssignments (auto to route daily)   │   │ │
    │  │ • GPSLogs (driver location history)        │   │ │
    │  │ • Tasks (collection points)                │   │ │
    │  │ • TaskCompletion (proof with photos)       │   │ │
    │  └────────────────────────────────────────────┘   │ │
    │                                                     │ │
    │  Cache: Redis                                       │ │
    │  • Current route assignments (fast lookup)         │ │
    │  • Live driver locations (for WebSocket)           │ │
    │                                                     │ │
    │  External Services:                                 │ │
    │  • Google Maps API (ETA calculation)               │ │
    │  • Firebase Cloud Messaging (push notifications)   │ │
    │  • Twilio/Firebase Auth (OTP)                      │ │
    │  • AWS S3 (store task completion photos)           │ │
    └─────────────────────────────────────────────────────┘
```

### User Flows

**Citizen Flow**:
```
1. Install app → Login with OTP (phone number)
2. System shows: "Your collection route: Indiranagar North"
3. See live map with Auto #101's current location
4. See ETA: "Auto arrives in 12 mins"
5. Get notification: "Auto is 2 mins away"
6. Driver completes, notification: "Collection completed"
```

**Driver Flow**:
```
1. Install app → Login with OTP (phone)
2. See dashboard: "Today assigned to route: Indiranagar North"
3. Start route → GPS auto-sends every 10 secs
4. Navigate to collection points
5. At dump yard: Snap photo of waste + mark "Completed"
6. Backend verifies photos + marks route complete
```

**Admin Flow**:
```
1. Login to admin panel (web)
2. View all routes, drivers, assignments for today
3. Assign Auto #101 → Route "Indiranagar North"
4. Assign Auto #102 → Route "Koramangala"
5. Monitor: See live GPS of all drivers
6. Generate report: Routes completed, time taken, photos
```

---

## STEP 2: Database Schema (Core Tables)

### Key Entities & Relationships

```
Users (Citizens, Drivers, Admins)
    ↓
Wards (City divisions)
    ↓
Routes (Collection routes in each ward)
    ↓
RouteAssignments (which auto does which route today)
    ↓
GPSLogs (driver's real-time location)
↓
Tasks (collection points on a route)
    ↓
TaskCompletion (proof of completion with photos)
```

### SQL Schema

```sql
-- USERS TABLE (Citizens, Drivers, Admins)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  user_type ENUM('CITIZEN', 'DRIVER', 'ADMIN') NOT NULL,
  password_hash VARCHAR(255),
  firebase_uid VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WARDS TABLE (City divisions like "Indiranagar", "Koramangala")
CREATE TABLE wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  geom GEOMETRY(POLYGON, 4326), -- PostGIS polygon for ward boundary
  created_at TIMESTAMP DEFAULT NOW()
);

-- ROUTES TABLE (Collection routes within each ward)
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID REFERENCES wards(id) NOT NULL,
  name VARCHAR(255) NOT NULL, -- "Indiranagar North", "Koramangala East"
  description TEXT,
  start_point GEOMETRY(POINT, 4326), -- Starting collection point
  end_point GEOMETRY(POINT, 4326),   -- Ending/dump yard location
  estimated_duration_minutes INT, -- Expected time to complete
  collection_frequency VARCHAR(50) DEFAULT 'DAILY', -- DAILY, WEEKLY, etc
  created_at TIMESTAMP DEFAULT NOW()
);

-- ROUTE_ASSIGNMENTS TABLE (admin assigns autos to routes daily)
CREATE TABLE route_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) NOT NULL,
  driver_id UUID REFERENCES users(id) NOT NULL,
  assigned_date DATE NOT NULL,
  status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(route_id, assigned_date) -- Only one driver per route per day
);

-- CITIZENS_ON_ROUTE TABLE (citizens subscribed to a route for notifications)
CREATE TABLE citizens_on_route (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  route_id UUID REFERENCES routes(id) NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW()
);

-- GPS_LOGS TABLE (driver's real-time location)
CREATE TABLE gps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) NOT NULL,
  route_assignment_id UUID REFERENCES route_assignments(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  geom GEOMETRY(POINT, 4326), -- PostGIS point for geospatial queries
  accuracy INT, -- GPS accuracy in meters
  timestamp TIMESTAMP DEFAULT NOW()
);

-- TASKS TABLE (collection points on a route)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) NOT NULL,
  location_name VARCHAR(255), -- "Apartment Block A", "Main Junction"
  location_point GEOMETRY(POINT, 4326), -- GPS coordinates
  task_order INT, -- Order of collection (1st, 2nd, 3rd, etc)
  created_at TIMESTAMP DEFAULT NOW()
);

-- TASK_COMPLETION TABLE (proof of collection)
CREATE TABLE task_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  route_assignment_id UUID REFERENCES route_assignments(id) NOT NULL,
  photo_url VARCHAR(255), -- Stored in S3, path to image
  completed_at TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS TABLE (for tracking sent notifications)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  route_assignment_id UUID REFERENCES route_assignments(id),
  notification_type ENUM('COLLECTION_UPCOMING', 'COLLECTION_IN_PROGRESS', 'COLLECTION_COMPLETED') NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Indexes for Performance

```sql
-- Faster GPS lookups by driver
CREATE INDEX idx_gps_logs_driver_timestamp
ON gps_logs(driver_id, timestamp DESC);

-- Faster route assignment queries
CREATE INDEX idx_route_assignments_driver_date
ON route_assignments(driver_id, assigned_date);

-- Faster geospatial queries (nearest driver)
CREATE INDEX idx_gps_logs_geom
ON gps_logs USING GIST(geom);

-- Faster task completion lookups
CREATE INDEX idx_task_completion_route_assignment
ON task_completion(route_assignment_id);
```

---

## STEP 3: Driver App - GPS Tracking

### What Happens:
```
Driver starts collection route
    ↓
App collects GPS every 5-10 seconds
    ↓
POST /api/driver/gps-update { latitude, longitude, accuracy }
    ↓
Backend stores in GPS_LOGS table
    ↓
Backend broadcasts to all subscribed citizens via WebSocket
    ↓
Citizens see real-time driver location on map
```

### Key Endpoints:

```
POST /api/driver/gps-update
Body: { latitude, longitude, accuracy }
Response: { success: true }

GET /api/driver/today-assignment
Response: {
  route_id, route_name, start_point, end_point, tasks: [...]
}

POST /api/driver/task-complete
Body: { task_id, photo_base64 }
Response: { photo_url, task_id, completed_at }
```

---

## STEP 4: Backend - Store & Stream GPS

### Architecture:

1. **Store GPS**:
   - POST /api/driver/gps-update → PostgreSQL gps_logs table
   - Every 10 seconds from driver app

2. **Stream GPS (Real-time)**:
   - Socket.io WebSocket connection
   - When GPS update received → broadcast to all citizens on that route
   - Citizens' map updates in real-time

3. **Calculate ETA**:
   - Get current driver location + route destination
   - Call Google Maps Distance Matrix API
   - Broadcast updated ETA to citizens (every 30 seconds)

### Key Files to Create:

```
backend/src/
├── models/
│   ├── User.js
│   ├── Route.js
│   ├── RouteAssignment.js
│   ├── GpsLog.js
│   ├── Task.js
│   └── TaskCompletion.js
├── services/
│   ├── gpsService.js      # Handle GPS updates, store in DB
│   ├── etaService.js      # Calculate ETA using Google Maps
│   └── notificationService.js
├── routes/
│   ├── driver.routes.js   # Driver endpoints
│   ├── citizen.routes.js  # Citizen endpoints
│   ├── admin.routes.js    # Admin endpoints
│   └── gps.routes.js      # GPS endpoints
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── socket/
│   └── socketHandler.js   # Socket.io real-time broadcast
└── server.js
```

---

## STEP 5: Citizen App - Live Tracking

### User Experience:

```
Citizen opens app
    ↓
Shows assigned route: "Indiranagar North"
    ↓
Map displays:
  • Route path (start → collection points → dump yard)
  • Live blue dot: Auto's current location (updates every 5 secs)
  • Grey dots: Collection points already completed
  • Red dot: Next collection point
  • White dot: Dump yard (destination)
    ↓
Shows ETA: "Auto arrives in 12 mins"
    ↓
Get push notifications:
  • "Auto is 5 mins away"
  • "Auto is 2 mins away"
  • "Collection completed!"
```

### Key Components:
```
CitizenApp
├── LoginScreen
├── DashboardScreen (shows assigned route)
├── TrackingMapScreen (live map with driver + ETA)
├── NotificationCenter
└── HistoryScreen
```

---

## STEP 6: ETA Calculation

### How It Works:

```
1. Driver sends GPS: { latitude, longitude }
2. Backend queries: "Where is dump yard for this route?"
3. Call Google Maps Distance Matrix API:
   - origin: driver's current location
   - destination: route's dump yard (end_point)
   - mode: 'driving'
4. Get response: { distance: 5.2km, duration: 18 mins }
5. Broadcast to all citizens on that route:
   { eta_seconds: 1080, distance_km: 5.2 }
6. Update every 30 seconds as driver moves
```

### Implementation:

```javascript
// backend/src/services/etaService.js

async function calculateETA(driverLocation, routeDestination) {
  const response = await googleMapsClient.distanceMatrix({
    origins: [{ lat: driverLocation.latitude, lng: driverLocation.longitude }],
    destinations: [{ lat: routeDestination.latitude, lng: routeDestination.longitude }],
    mode: 'driving'
  });

  return response.rows[0].elements[0].duration.value; // in seconds
}

// Broadcast to citizens
async function broadcastETA(routeAssignmentId, etaSeconds) {
  const citizensOnRoute = await CitizensOnRoute.query()
    .where('route_id', routeId);

  citizensOnRoute.forEach(citizen => {
    io.to(`citizen_${citizen.user_id}`).emit('eta_update', {
      eta_seconds: etaSeconds,
      updated_at: new Date()
    });
  });
}
```

---

## STEP 7: Admin Panel - Route Assignment

### Admin Dashboard Features:

```
1. View all routes for the city
2. View all available drivers
3. Assign drivers to routes for today:
   - Select route + drag driver to it
   - Save assignment
4. Monitor real-time:
   - See all driver GPSs on map
   - See ETA to dump yard
   - See completed tasks
5. Generate report:
   - Routes completed today
   - Time per route
   - Photos of collections
```

### Key Endpoints for Admin:

```
GET /api/admin/routes
Response: [ { id, name, ward_name, estimated_duration }, ... ]

GET /api/admin/drivers
Response: [ { id, name, phone, status }, ... ]

POST /api/admin/route-assignments
Body: [ { route_id, driver_id, assigned_date }, ... ]
Response: { success: true }

GET /api/admin/live-tracking
Response: {
  assignments: [
    {
      route_id, driver_id, driver_name,
      current_location: { latitude, longitude },
      eta_to_destination: 1080,
      completed_tasks: 5,
      total_tasks: 8
    }
  ]
}

POST /api/admin/report
Body: { start_date, end_date }
Response: PDF/CSV with all collections data
```

---

## Implementation Phases (8-10 Weeks)

### Phase 1: Auth + Database (Week 1-2)
- Setup Express backend + PostgreSQL
- Implement OTP authentication (Firebase)
- JWT token management
- User registration (Citizen/Driver/Admin)

### Phase 2: Route Management (Week 2-3)
- Create routes + wards CRUD
- Build admin endpoints for assignment
- Store route data in DB

### Phase 3: GPS Tracking (Week 3-4)
- Driver app sends GPS every 10 secs
- Backend stores GPS in gps_logs table
- Socket.io setup for real-time broadcasting

### Phase 4: ETA Calculation (Week 4-5)
- Google Maps API integration
- Calculate ETA from driver → dump yard
- Broadcast ETA updates to citizens

### Phase 5: Citizen App Basic (Week 5-6)
- React Native login
- Dashboard showing assigned route
- Real-time map with driver location + ETA

### Phase 6: Driver App Basic (Week 6-7)
- React Native login
- Show today's assigned route
- Send GPS every 10 secs
- Mark tasks complete + photo upload

### Phase 7: Notifications & Polish (Week 7-8)
- Push notifications (FCM) when driver approaching
- Notification when collection completed
- Error handling + edge cases

### Phase 8: Admin Panel (Week 8-9)
- Web dashboard for route assignment
- Live tracking view
- Report generation

### Phase 9: Testing & Deploy (Week 9-10)
- E2E testing
- Load testing
- Deploy to production

---

## File Structure (Final)

```
nammakasa/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── firebase.js
│   │   │   └── googleMaps.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Ward.js
│   │   │   ├── Route.js
│   │   │   ├── RouteAssignment.js
│   │   │   ├── GpsLog.js
│   │   │   ├── Task.js
│   │   │   ├── TaskCompletion.js
│   │   │   └── Notification.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── gpsService.js
│   │   │   ├── etaService.js
│   │   │   ├── routeService.js
│   │   │   └── notificationService.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── driver.routes.js
│   │   │   ├── citizen.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── gps.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── package.json
│   └── README.md
│
├── mobile/
│   ├── citizen/
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.js
│   │   │   │   ├── DashboardScreen.js
│   │   │   │   ├── TrackingMapScreen.js
│   │   │   │   ├── NotificationCenter.js
│   │   │   │   └── HistoryScreen.js
│   │   │   ├── components/
│   │   │   │   ├── LiveMap.js
│   │   │   │   ├── ETADisplay.js
│   │   │   │   └── RouteInfo.js
│   │   │   ├── services/
│   │   │   │   ├── api.js
│   │   │   │   ├── socketService.js
│   │   │   │   └── authService.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.js
│   │   │   └── App.js
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── driver/
│       ├── src/
│       │   ├── screens/
│       │   │   ├── LoginScreen.js
│       │   │   ├── DashboardScreen.js
│       │   │   ├── RouteDetailScreen.js
│       │   │   ├── TaskCompleteScreen.js
│       │   │   └── HistoryScreen.js
│       │   ├── components/
│       │   │   └── LocationPermission.js
│       │   ├── services/
│       │   │   ├── gpsService.js
│       │   │   ├── api.js
│       │   │   └── authService.js
│       │   ├── context/
│       │   │   └── AuthContext.js
│       │   └── App.js
│       ├── app.json
│       └── package.json
│
├── admin/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── RouteAssignmentPage.js
│   │   │   ├── LiveTrackingPage.js
│   │   │   └── ReportPage.js
│   │   ├── components/
│   │   │   └── MapView.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│   ├── package.json
│   └── README.md
│
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    ├── SETUP.md
    └── DEPLOYMENT.md
```

---

## Trade-offs & MVP vs Future

### MVP (Weeks 1-9):
✅ Route-based assignment
✅ Real-time GPS tracking (5-10 sec updates)
✅ ETA calculation
✅ Push notifications (basic)
✅ Photo proof of collection
✅ Admin assignment panel
❌ No payment system
❌ No AI waste detection yet
❌ Single city only
❌ No offline support

### Future (Phase 2):
- Payment integration for drivers
- AI waste detection (image analysis)
- Multi-city support
- Offline mode + sync
- Advanced analytics & reports
- Mobile app auto-updates

---

## Critical Success Factors

1. **Real-time Reliability**: GPS updates must consistently reach backend within 2 seconds
2. **ETA Accuracy**: Use traffic-aware routing (Google Maps API handles this)
3. **Battery Usage**: GPS every 10 secs on driver app is aggressive but acceptable for 8-hour shift
4. **Data Privacy**: Citizens only see the specific route's driver, not all drivers
5. **Offline Resilience**: If network drops, queue GPS updates and sync when online

---

## Implementation Decisions (FINALIZED)

1. ✅ **Route-based system**: Confirmed
2. ✅ **Tech stack**: Node.js + Express + PostgreSQL + React Native
3. ✅ **Photo Storage**: Local server storage (MVP approach)
4. ✅ **OTP Provider**: Firebase SMS OTP (simplest integration)
5. ✅ **Push Notification**: Firebase Cloud Messaging (FCM)
6. ✅ **Start approach**: UI/Frontend First (React Native screens)
7. **Deployment**: AWS EC2 or Heroku (to be decided)

---

## Implementation Strategy: UI FIRST

### Weekly Breakdown:
- **Weeks 1-2**: React Native UI for Citizen + Driver apps (login, dashboard, map screens)
- **Weeks 3-4**: Backend API setup + database + authentication
- **Weeks 5-6**: Integrate UI with backend APIs
- **Weeks 7-8**: GPS tracking, ETA, notifications
- **Weeks 9-10**: Admin panel, testing, deployment

### Your Next Steps:
1. ✅ Accept this architecture plan
2. ⏭️ Create React Native project structure
3. ⏭️ Build LoginScreen (OTP verification)
4. ⏭️ Build DashboardScreen (citizen) + RouteDetailScreen (driver)
5. ⏭️ Build TrackingMapScreen with live map (mockups using static data)
6. Create backend later (when UI is ready to integrate)
