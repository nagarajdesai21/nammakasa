import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nammakasa_admin',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});


// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create users table if it doesn't exist
    const checkUsersQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;
    
    let result = await pool.query(checkUsersQuery);
    
    if (!result.rows[0].exists) {
      console.log('Creating users table...');
      
      await pool.query(`
        CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    user_type VARCHAR(20) NOT NULL, -- ADMIN / DRIVER / CITIZEN

    ward_no INT,

    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING / APPROVED

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
      `);
      
      console.log('✅ Users table created successfully');
    } else {
      console.log('✅ Users table already exists');
    }
    
    // Create OTP verifications table if it doesn't exist
    const checkOtpQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'otp_verifications'
      );
    `;
    
    result = await pool.query(checkOtpQuery);
    
    if (!result.rows[0].exists) {
      console.log('Creating otp_verifications table...');
      
      await pool.query(`
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  otp VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
      `);
      
      console.log('✅ OTP Verifications table created successfully');
    } else {
      console.log('✅ OTP Verifications table already exists');
    }
    
    // Create autos table if it doesn't exist
    const checkAutosQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'autos'
      );
    `;
    
    result = await pool.query(checkAutosQuery);
    
    if (!result.rows[0].exists) {
      console.log('Creating autos table...');
      
      await pool.query(`
        CREATE TABLE autos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          auto_number VARCHAR(50) NOT NULL UNIQUE,
          registration_number VARCHAR(50) NOT NULL UNIQUE,
          capacity INTEGER DEFAULT 12,
          purchase_date DATE,
          condition VARCHAR(50),
          fuel_type VARCHAR(50) DEFAULT 'petrol',
          ward_no INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          type VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('✅ Autos table created successfully');
    } else {
      console.log('✅ Autos table already exists');
    }
    
    // Create drivers table if it doesn't exist
    const checkDriversQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'drivers'
      );
    `;
    
    result = await pool.query(checkDriversQuery);
    
    if (!result.rows[0].exists) {
      console.log('Creating drivers table...');
      
      await pool.query(`
        CREATE TABLE drivers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL UNIQUE,
          age INTEGER NOT NULL,
          years_of_service INTEGER,
          salary INTEGER,
          license_number VARCHAR(50),
          license_expiry DATE,
          ward_no INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('✅ Drivers table created successfully');
    } else {
      console.log('✅ Drivers table already exists');
    }
    
    // Create routes table if it doesn't exist
    const checkRoutesQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'routes'
      );
    `;
    
    result = await pool.query(checkRoutesQuery);
    
    if (!result.rows[0].exists) {
      console.log('Creating routes table...');
      
      await pool.query(`
        CREATE TABLE routes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          route_name VARCHAR(100) NOT NULL,
          route_code VARCHAR(50) NOT NULL,
          ward_no INTEGER NOT NULL,
          pin_codes JSONB DEFAULT '[]'::jsonb,
          estimated_duration INTEGER DEFAULT 60,
          frequency VARCHAR(50) DEFAULT 'daily',
          coordinates JSONB DEFAULT '[]'::jsonb,
          description TEXT,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('✅ Routes table created successfully');
    } else {
      console.log('✅ Routes table already exists');
    }

    // Create assignments table if it doesn't exist
    const checkAssignmentsQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'assignments'
      );
    `;
    
    result = await pool.query(checkAssignmentsQuery);
    
    if (!result.rows[0].exists) {
      console.log('Creating assignments table...');
      
      await pool.query(`
        CREATE TABLE assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
          auto_id UUID NOT NULL REFERENCES autos(id) ON DELETE CASCADE,
          driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
          assignment_date DATE NOT NULL,
          estimated_completion_time TIME,
          status VARCHAR(50) DEFAULT 'assigned',
          petrol_details JSONB DEFAULT '[]'::jsonb,
          service_charges JSONB DEFAULT '[]'::jsonb,
          ward_no INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('✅ Assignments table created successfully');
    } else {
      console.log('✅ Assignments table already exists');
    }
    
    console.log('✅ All database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

export default pool;