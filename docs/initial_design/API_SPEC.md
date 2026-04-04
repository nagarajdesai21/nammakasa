# API Specification - Nammakasa Platform

## Overview
RESTful API for the auto service platform supporting:
- Citizen authentication and tracking
- Driver authentication and task management
- Admin route creation and auto assignment
- Location tracking via HTTP polling
- ETA calculation

---

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.nammakasa.com/api
```

## Response Format
All responses are JSON with the following structure:
```json
{
  "success": true/false,
  "data": {},
  "message": "string",
  "error": "string (if error)"
}
```

---

## Authentication Endpoints

### POST /auth/send-otp
Send OTP to phone number

**Request:**
```json
{
  "phone": "+919876543210",
  "user_type": "citizen" | "driver"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expires_in_seconds": 600
}
```

**Response (429):**
```json
{
  "error": "Too many requests. Try after 1 minute."
}
```

---

### POST /auth/verify-otp
Verify OTP and get temporary token

**Request:**
```json
{
  "phone": "+919876543210",
  "otp_code": "123456",
  "user_type": "citizen" | "driver"
}
```

**Response (200):**
```json
{
  "success": true,
  "temp_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "name": "John Doe",
    "user_type": "citizen",
    "is_first_login": true
  },
  "expires_in_seconds": 300
}
```

---

### POST /auth/set-password
Set password on first login

**Headers:**
```
Authorization: Bearer {temp_token}
```

**Request:**
```json
{
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "user_type": "citizen"
  }
}
```

---

### POST /auth/login-password
Login with phone + password

**Request:**
```json
{
  "phone": "+919876543210",
  "password": "SecurePass123!",
  "user_type": "citizen" | "driver"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "user_type": "citizen"
  }
}
```

---

### POST /auth/refresh-token
Refresh access token

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

---

## Location Endpoints

### POST /location/update
Driver updates their location

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "latitude": 12.9352,
  "longitude": 77.6245,
  "accuracy_meters": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated"
}
```

---

### GET /location/driver/:driverId
Get driver's last known location

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "driver_id": "uuid",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "accuracy_meters": 10,
  "last_updated": "2024-05-15T14:30:00Z"
}
```

---

## Task Endpoints

### GET /tasks/driver/:driverId
Get driver's daily tasks

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "stop_number": 1,
      "address": "122 Koramangala Main Rd",
      "customer_name": "Rajesh Kumar",
      "customer_phone": "+919876543210",
      "task_type": "collection",
      "status": "completed",
      "completed_at": "2024-05-15T09:30:00Z"
    }
  ],
  "total_stops": 8,
  "completed_count": 1
}
```

---

### POST /tasks/:taskId/complete
Mark task as completed

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "completion_notes": "Completed successfully",
  "photo_url": "https://s3.../image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "task": {
    "id": "uuid",
    "status": "completed",
    "completed_at": "2024-05-15T10:45:00Z"
  }
}
```

---

## ETA Endpoint

### GET /eta/:driverId/:citizenId
Calculate ETA from driver to citizen

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "distance_km": 2.3,
  "duration_minutes": 12,
  "arrival_time": "2024-05-15T15:00:00Z",
  "route_polyline": "encoded_polyline_string"
}
```

---

## Admin Authentication

### POST /admin/auth/login
Admin login

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "AdminPass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "eyJhbGc...",
  "admin": {
    "id": "uuid",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

---

## Admin Routes Endpoints

### POST /admin/routes
Create a new route

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request:**
```json
{
  "name": "West Zone Day Shift",
  "description": "Daily collection route for west zone",
  "stops": [
    {
      "sequence": 1,
      "address": "122 Koramangala Main Rd",
      "customer_name": "Rajesh Kumar",
      "customer_phone": "+919876543210",
      "task_type": "collection",
      "lat": 12.9352,
      "lng": 77.6245,
      "instructions": "Gate code: 1234"
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "West Zone Day Shift",
  "total_stops": 8,
  "created_at": "2024-05-15T10:00:00Z"
}
```

---

### GET /admin/routes
List all routes

**Response (200):**
```json
{
  "routes": [
    {
      "id": "uuid",
      "name": "West Zone Day Shift",
      "total_stops": 8,
      "assigned_autos": 2,
      "status": "active"
    }
  ]
}
```

---

### PATCH /admin/routes/:routeId
Edit route

**Request:**
```json
{
  "name": "West Zone Day Shift - Updated",
  "stops": [...]
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "West Zone Day Shift - Updated"
}
```

---

## Admin Auto Assignment Endpoints

### POST /admin/autos/:autoId/assign-route
Assign route to auto

**Request:**
```json
{
  "route_id": "uuid",
  "driver_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "auto": {
    "id": "uuid",
    "auto_number": "MH01AB1234",
    "assigned_route_id": "uuid",
    "driver_id": "uuid"
  },
  "tasks_created": 8
}
```

---

### GET /admin/autos
List all autos with assignments

**Response (200):**
```json
{
  "autos": [
    {
      "id": "uuid",
      "auto_number": "MH01AB1234",
      "driver_name": "Ram Kumar",
      "assigned_route": "West Zone Day Shift",
      "task_progress": "3/8",
      "completion_percentage": 37.5
    }
  ]
}
```

---

## Admin Dashboard Endpoint

### GET /admin/dashboard
Get dashboard summary

**Response (200):**
```json
{
  "summary": {
    "total_autos_active": 12,
    "total_drivers_on_duty": 10,
    "active_routes": 5,
    "average_completion_percentage": 68.5,
    "routes": [
      {
        "name": "West Zone",
        "stops_completed": 8,
        "total_stops": 8,
        "percentage": 100
      }
    ]
  }
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |

---

## Rate Limiting
- **Default**: 100 requests/minute per user
- **Auth endpoints**: 5 requests/minute per phone number
- **Location updates**: 1 request per 5 seconds per driver
