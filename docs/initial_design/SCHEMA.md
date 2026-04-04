# Database Schema - Nammakasa Platform

## Database Overview
- **Database**: PostgreSQL 12+
- **ORM**: Sequelize (Node.js) or Knex.js
- **Connection Pool**: 10-20 connections
- **Indexes**: Create on frequently queried columns (phone, auto_number, route_id, driver_id)

## Complete Schema Definition

### 1. CITIZENS TABLE
```sql
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(255),
  password_hash VARCHAR(255),
  otp_attempts INT DEFAULT 0,
  otp_verified_at TIMESTAMP,
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
  license_number VARCHAR(50),
  password_hash VARCHAR(255),
  otp_attempts INT DEFAULT 0,
  otp_verified_at TIMESTAMP,
  verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'inactive')),
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
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'operator')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);
```

### 4. AUTOS TABLE
```sql
CREATE TABLE autos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_number VARCHAR(20) UNIQUE NOT NULL,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  current_assigned_route_id UUID REFERENCES routes(id) ON DELETE SET NULL,

  -- Last known location
  last_location_lat DECIMAL(10, 8),
  last_location_lng DECIMAL(11, 8),
  last_location_updated_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT auto_number_format CHECK (LENGTH(auto_number) >= 4)
);

CREATE INDEX idx_autos_driver_id ON autos(driver_id);
CREATE INDEX idx_autos_route_id ON autos(current_assigned_route_id);
CREATE INDEX idx_autos_status ON autos(status);
```

### 5. ROUTES TABLE
```sql
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,

  total_stops INT DEFAULT 0,
  created_by_admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP
);

CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_created_by ON routes(created_by_admin_id);
```

### 6. ROUTE_STOPS TABLE
```sql
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,

  sequence INT NOT NULL,
  address VARCHAR(500) NOT NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(15),
  task_type VARCHAR(50) CHECK (task_type IN ('collection', 'delivery', 'dropoff', 'pickup')),

  stop_lat DECIMAL(10, 8) NOT NULL,
  stop_lng DECIMAL(11, 8) NOT NULL,

  instructions TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(route_id, sequence),
  CONSTRAINT sequence_positive CHECK (sequence > 0)
);

CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_sequence ON route_stops(route_id, sequence);
```

### 7. TASKS TABLE
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_id UUID NOT NULL REFERENCES autos(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_id UUID NOT NULL REFERENCES route_stops(id) ON DELETE CASCADE,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),

  completed_at TIMESTAMP,
  completion_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_auto_id ON tasks(auto_id);
CREATE INDEX idx_tasks_route_id ON tasks(route_id);
CREATE INDEX idx_tasks_stop_id ON tasks(stop_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
```

### 8. LOCATIONS TABLE
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,

  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  accuracy_meters INT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_locations_driver_id ON locations(driver_id);
CREATE INDEX idx_locations_created_at ON locations(created_at);
CREATE INDEX idx_locations_driver_created ON locations(driver_id, created_at DESC);
```

### 9. OTP_TOKENS TABLE
```sql
CREATE TABLE otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  entity_type VARCHAR(20) CHECK (entity_type IN ('citizen', 'driver')),

  expires_at TIMESTAMP NOT NULL,
  attempted_at TIMESTAMP,
  attempts INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT otp_length CHECK (LENGTH(otp_code) = 6)
);

CREATE INDEX idx_otp_phone_type ON otp_tokens(phone, entity_type);
CREATE INDEX idx_otp_expires_at ON otp_tokens(expires_at);
```

### 10. JWT_TOKENS TABLE
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
CREATE INDEX idx_jwt_refresh ON jwt_tokens(refresh_token);
```

## Relationships Diagram
```
CITIZENS (1) ─────────────────── (*)  TASKS (indirect, via Driver → Auto)
DRIVERS (1) ─────────────────── (1) AUTOS
AUTOS (1) ────────────────────── (*) TASKS
ROUTES (1) ───────────────────── (*) ROUTE_STOPS
ROUTES (1) ───────────────────── (*) TASKS
ROUTE_STOPS (1) ────────────────── (*) TASKS
DRIVERS (1) ────────────────────── (*) LOCATIONS
ADMINS (1) ─────────────────────── (*) ROUTES (created_by_admin_id)
```

## Key Constraints & Rules
1. **One Auto = One Driver**: Each auto assigned to one driver (can change)
2. **One Auto = One Route/Day**: Auto has current_assigned_route_id (editable)
3. **Route = Set of Stops**: Immutable once assigned, but admin can reassign auto
4. **Tasks Auto-Generated**: Generated daily from route → auto mapping
5. **Location History**: Keep 24 hours, auto-purge older records
6. **OTP**: Valid 10 minutes, max 3 attempts
7. **JWT**: Access token 1 hour, refresh token 7 days
