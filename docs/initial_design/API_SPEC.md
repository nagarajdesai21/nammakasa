# API Specification - Nammakasa Zone-Based Platform

## Overview
RESTful API for zone-based waste collection platform supporting:
- Citizen authentication and tracking
- Driver authentication and zone collection
- Admin zone creation and daily assignments
- Location tracking via HTTP polling
- ETA calculation

---

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.nammakasa.com/api
```

## Response Format
All responses are JSON:
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
Send OTP to phone

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

## Assignment Endpoints (Driver)

### GET /assignment/driver/:driverId
Get driver's zone assignment for today

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "assignment": {
    "id": "uuid",
    "auto_id": "uuid",
    "zone_id": "uuid",
    "zone_name": "Zone-A",
    "assigned_date": "2024-05-15",
    "status": "assigned",
    
    "zone_details": {
      "id": "uuid",
      "name": "Zone-A",
      "polygon": {
        "type": "Polygon",
        "coordinates": [[[77.6, 12.9], [77.7, 12.9], [77.7, 13.0], [77.6, 13.0], [77.6, 12.9]]]
      },
      "center_lat": 12.95,
      "center_lng": 77.65
    }
  }
}
```

---

### POST /assignment/driver/:driverId/complete-zone
Mark zone service as complete

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "completion_notes": "All households collected",
  "photo_url": "https://s3.../image.jpg"  // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "assignment": {
    "id": "uuid",
    "status": "completed",
    "completed_at": "2024-05-15T10:45:00Z"
  }
}
```

---

## ETA Endpoint

### GET /eta/:driverId/:citizenLatLng
Calculate ETA from driver to citizen location

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
```
?latitude=12.9352&longitude=77.6245
```

**Response (200):**
```json
{
  "distance_km": 2.3,
  "duration_minutes": 12,
  "arrival_time": "2024-05-15T15:00:00Z"
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
    "role": "admin",
    "wards": ["uuid1", "uuid2"]  // wards they manage
  }
}
```

---

## Admin - Zone Management

### POST /admin/zones
Create a new zone (draw polygon)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request:**
```json
{
  "ward_id": "uuid",
  "name": "Zone-A",
  "polygon": {
    "type": "Polygon",
    "coordinates": [[[77.6, 12.9], [77.7, 12.9], [77.7, 13.0], [77.6, 13.0], [77.6, 12.9]]]
  },
  "center_lat": 12.95,
  "center_lng": 77.65
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Zone-A",
  "ward_id": "uuid",
  "created_at": "2024-05-15T10:00:00Z"
}
```

---

### GET /admin/zones
List all zones for admin's ward(s)

**Query Parameters:**
```
?ward_id=uuid  // optional filter by ward
```

**Response (200):**
```json
{
  "zones": [
    {
      "id": "uuid",
      "name": "Zone-A",
      "ward_id": "uuid",
      "polygon": {...},
      "assigned_autos_today": 2,
      "created_by": "admin@company.com"
    }
  ]
}
```

---

### PATCH /admin/zones/:zoneId
Edit zone (redraw polygon)

**Request:**
```json
{
  "name": "Zone-A-Updated",
  "polygon": {...}
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Zone-A-Updated"
}
```

---

## Admin - Daily Assignment

### POST /admin/daily-assignments
Batch assign zones to autos for today

**Request:**
```json
{
  "assignments": [
    { "auto_id": "uuid", "zone_id": "uuid" },
    { "auto_id": "uuid", "zone_id": "uuid" }
  ],
  "assigned_date": "2024-05-15"
}
```

**Response (200):**
```json
{
  "success": true,
  "assignments_created": 2,
  "assignments": [
    { "auto_id": "uuid", "zone_id": "uuid", "status": "assigned" }
  ]
}
```

---

### GET /admin/daily-assignments
View today's assignments

**Query Parameters:**
```
?date=2024-05-15
```

**Response (200):**
```json
{
  "assignments": [
    {
      "id": "uuid",
      "auto_id": "uuid",
      "auto_number": "MH01",
      "driver_name": "Ram Kumar",
      "zone_id": "uuid",
      "zone_name": "Zone-A",
      "status": "in_progress",
      "assigned_at": "2024-05-15T08:00:00Z"
    }
  ]
}
```

---

### PATCH /admin/daily-assignments/:assignmentId
Reassign zone to different auto

**Request:**
```json
{
  "auto_id": "uuid"  // new auto
}
```

**Response (200):**
```json
{
  "success": true,
  "assignment": {
    "id": "uuid",
    "auto_id": "uuid",
    "status": "reassigned"
  }
}
```

---

## Admin - Dashboard

### GET /admin/dashboard
Get dashboard summary

**Query Parameters:**
```
?date=2024-05-15&ward_id=uuid
```

**Response (200):**
```json
{
  "summary": {
    "date": "2024-05-15",
    "ward": "Koramangala",
    "total_autos": 4,
    "autos_assigned": 3,
    "autos_idle": 1,
    "total_zones": 5,
    "zones_assigned_today": 3,
    "average_completion_percentage": 75.5,
    "assignments": [
      {
        "zone_name": "Zone-A",
        "auto_number": "MH01",
        "driver_name": "Ram Kumar",
        "status": "in_progress",
        "completion_percentage": 75
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
- **Auth endpoints**: 5 requests/minute per phone
- **Location updates**: 1 request per 15 seconds per driver
