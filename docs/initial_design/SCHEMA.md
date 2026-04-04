# Database Schema - Nammakasa Zone-Based Platform

## Database Overview
- **Database**: PostgreSQL 12+
- **ORM**: Sequelize (Node.js) or Knex.js
- **Connection Pool**: 10-20 connections
- **Indexes**: Create on frequently queried columns (phone, ward_id, zone_id, auto_id)

## Complete Schema Definition

### 1. CITIZENS TABLE
```sql
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(255),
  password_hash VARCHAR(255),
  verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT phone_format CHECK (LENGTH(phone) >= 10 AND LENGTH(phone) <= 15)
);

CREATE INDEX idx_citizens_phone ON citizens(phone);
CREATE INDEX idx_citizens_verified ON citizens(verified_at);
```

### 2. DRIVERS TABLE
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  auto_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT phone_format CHECK (LENGTH(phone) >= 10 AND LENGTH(phone) <= 15),
  CONSTRAINT auto_number_format CHECK (LENGTH(auto_number) >= 4)
);

CREATE INDEX idx_drivers_phone ON drivers(phone);
CREATE INDEX idx_drivers_auto_number ON drivers(auto_number);
CREATE INDEX idx_drivers_status ON drivers(status);
```

### 3. ADMINS TABLE
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);
```

### 4. WARDS TABLE
```sql
CREATE TABLE wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wards_city ON wards(city);
```

### 5. WARD_ADMINS TABLE (Many-to-Many)
```sql
CREATE TABLE ward_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(admin_id, ward_id)
);

CREATE INDEX idx_ward_admins_admin ON ward_admins(admin_id);
CREATE INDEX idx_ward_admins_ward ON ward_admins(ward_id);
```

### 6. AUTOS TABLE
```sql
CREATE TABLE autos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_number VARCHAR(20) UNIQUE NOT NULL,
  ward_id UUID NOT NULL REFERENCES wards(id),
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  
  -- Last known location
  last_location_lat DECIMAL(10, 8),
  last_location_lng DECIMAL(11, 8),
  last_location_updated_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_autos_ward_id ON autos(ward_id);
CREATE INDEX idx_autos_driver_id ON autos(driver_id);
CREATE INDEX idx_autos_status ON autos(status);
```

### 7. ZONES TABLE (Geographic Polygons)
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  
  -- Polygon boundary (GeoJSON format)
  polygon JSONB NOT NULL,
  
  -- Center point for quick lookup
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  
  created_by_admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(ward_id, name)
);

CREATE INDEX idx_zones_ward_id ON zones(ward_id);
CREATE INDEX idx_zones_created_by ON zones(created_by_admin_id);
```

### 8. DAILY_ASSIGNMENTS TABLE
```sql
CREATE TABLE daily_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_id UUID NOT NULL REFERENCES autos(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  assigned_by_admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(auto_id, assigned_date)
);

CREATE INDEX idx_assignments_auto ON daily_assignments(auto_id);
CREATE INDEX idx_assignments_zone ON daily_assignments(zone_id);
CREATE INDEX idx_assignments_date ON daily_assignments(assigned_date);
CREATE INDEX idx_assignments_status ON daily_assignments(status);
```

### 9. LOCATIONS TABLE (Location History)
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy_meters INT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_locations_driver ON locations(driver_id);
CREATE INDEX idx_locations_created ON locations(created_at);
CREATE INDEX idx_locations_driver_created ON locations(driver_id, created_at DESC);
```

### 10. OTP_TOKENS TABLE
```sql
CREATE TABLE otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  entity_type VARCHAR(20) CHECK (entity_type IN ('citizen', 'driver')),
  
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT otp_length CHECK (LENGTH(otp_code) = 6)
);

CREATE INDEX idx_otp_phone_type ON otp_tokens(phone, entity_type);
CREATE INDEX idx_otp_expires ON otp_tokens(expires_at);
```

### 11. JWT_TOKENS TABLE (Refresh Tokens)
```sql
CREATE TABLE jwt_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('citizen', 'driver', 'admin')),
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jwt_user ON jwt_tokens(user_id, user_type);
CREATE INDEX idx_jwt_token ON jwt_tokens(refresh_token);
```

## Relationships Diagram
```
WARDS (1) ──────────── (*) ZONES
      │
      ├─────────────── (*) AUTOS
      │
      └─────────────── (*) WARD_ADMINS → ADMINS

ZONES (1) ──────────── (*) DAILY_ASSIGNMENTS
AUTOS (1) ──────────── (*) DAILY_ASSIGNMENTS

DRIVERS (1) ────────── (*) LOCATIONS
DRIVERS (1) ────────── (1) AUTOS

ADMINS (1) ─────────── (*) ZONES (created_by)
ADMINS (1) ─────────── (*) DAILY_ASSIGNMENTS (assigned_by)
ADMINS (1) ─────────── (*) WARD_ADMINS
```

## Key Constraints & Rules
1. **One Auto = One Driver**: Each auto assigned to max one driver
2. **One Auto = One Zone/Day**: Auto assigned to one zone daily (via daily_assignments)
3. **Zone = Polygon**: Geographic area (stored as GeoJSON), reusable across days
4. **One-Click Assignment**: Admin assigns zone to auto for a specific date
5. **Location History**: Keep 24-48 hours, auto-purge older records
6. **OTP**: Valid 10 minutes, max 3 attempts
7. **JWT**: Access token 1 hour, refresh token 7 days
8. **Ward Structure**: Multiple zones per ward, multiple admins per ward
