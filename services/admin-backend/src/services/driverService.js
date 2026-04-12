import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Create Driver
export const createDriver = async (driverData, wardNo) => {
  try {
    const {
      name,
      phone,
      age,
      yearsOfService,
      salary,
      licenseNumber,
      licenseExpiry,
    } = driverData;

    // Validation
    if (!name || !phone || !age) {
      throw new Error('Name, phone, and age are required');
    }

    const driverId = uuidv4();
    const result = await pool.query(
      `INSERT INTO drivers (id, name, phone, age, years_of_service, salary, license_number, license_expiry, ward_no, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, name, phone, age, years_of_service as "yearsOfService", salary, 
                 license_number as "licenseNumber", license_expiry as "licenseExpiry", 
                 ward_no as "wardNo", status, created_at as "createdAt"`,
      [
        driverId,
        name,
        phone,
        age,
        yearsOfService || null,
        salary || null,
        licenseNumber || null,
        licenseExpiry || null,
        wardNo,
        'active'
      ]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get Drivers by Ward
export const getDriversByWard = async (wardNo) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, age, years_of_service as "yearsOfService", salary,
              license_number as "licenseNumber", license_expiry as "licenseExpiry",
              ward_no as "wardNo", status, created_at as "createdAt"
       FROM drivers
       WHERE ward_no = $1
       ORDER BY created_at DESC`,
      [wardNo]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get Drivers by Ward with Pagination
export const getDriversByWardPaginated = async (wardNo, limit, offset) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, age, years_of_service as "yearsOfService", salary,
              license_number as "licenseNumber", license_expiry as "licenseExpiry",
              ward_no as "wardNo", status, created_at as "createdAt"
       FROM drivers
       WHERE ward_no = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [wardNo, limit, offset]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get Single Driver
export const getDriverById = async (driverId) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, age, years_of_service as "yearsOfService", salary,
              license_number as "licenseNumber", license_expiry as "licenseExpiry",
              ward_no as "wardNo", status, created_at as "createdAt"
       FROM drivers
       WHERE id = $1`,
      [driverId]
    );

    if (result.rows.length === 0) {
      throw new Error('Driver not found');
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update Driver
export const updateDriver = async (driverId, driverData) => {
  try {
    const {
      name,
      phone,
      age,
      yearsOfService,
      salary,
      licenseNumber,
      licenseExpiry,
    } = driverData;

    const result = await pool.query(
      `UPDATE drivers
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           age = COALESCE($3, age),
           years_of_service = COALESCE($4, years_of_service),
           salary = COALESCE($5, salary),
           license_number = COALESCE($6, license_number),
           license_expiry = COALESCE($7, license_expiry),
           updated_at = NOW()
       WHERE id = $8
       RETURNING id, name, phone, age, years_of_service as "yearsOfService", salary,
                 license_number as "licenseNumber", license_expiry as "licenseExpiry",
                 ward_no as "wardNo", status, created_at as "createdAt"`,
      [
        name || null,
        phone || null,
        age || null,
        yearsOfService || null,
        salary || null,
        licenseNumber || null,
        licenseExpiry || null,
        driverId,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Driver not found');
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete Driver
export const deleteDriver = async (driverId) => {
  try {
    const result = await pool.query(
      'DELETE FROM drivers WHERE id = $1 RETURNING id',
      [driverId]
    );

    if (result.rows.length === 0) {
      throw new Error('Driver not found');
    }

    return { success: true, message: 'Driver deleted successfully' };
  } catch (error) {
    throw error;
  }
};
