import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Create Auto
export const createAuto = async (autoData, wardNo) => {
  try {
    const {
      autoNumber,
      registrationNumber,
      capacity,
      purchaseDate,
      condition,
      fuelType,
    } = autoData;

    // Check if auto already exists
    const existingAuto = await pool.query(
      'SELECT id FROM autos WHERE auto_number = $1 OR registration_number = $2',
      [autoNumber, registrationNumber]
    );

    if (existingAuto.rows.length > 0) {
      throw new Error('Auto with this number or registration already exists');
    }

    const autoId = uuidv4();
    const result = await pool.query(
      `INSERT INTO autos (id, auto_number, registration_number, capacity, purchase_date, condition, fuel_type, ward_no, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, auto_number, registration_number, capacity, purchase_date, condition, fuel_type, ward_no, status, created_at, type`,
      [autoId, autoNumber, registrationNumber, capacity || 12, purchaseDate || null, condition, fuelType, wardNo, 'active']
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get Autos by Ward
export const getAutosByWard = async (wardNo) => {
  try {
    const result = await pool.query(
      `SELECT id, auto_number as "autoNumber", registration_number as "registrationNumber", capacity, 
              purchase_date as "purchaseDate", condition, fuel_type as "fuelType", 
              ward_no as "wardNo", status, type, created_at as "createdAt"
       FROM autos 
       WHERE ward_no = $1 
       ORDER BY created_at DESC`,
      [wardNo]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get Autos by Ward with Pagination
export const getAutosByWardPaginated = async (wardNo, limit, offset) => {
  try {
    const result = await pool.query(
      `SELECT id, auto_number as "autoNumber", registration_number as "registrationNumber", capacity, 
              purchase_date as "purchaseDate", condition, fuel_type as "fuelType", 
              ward_no as "wardNo", status, type, created_at as "createdAt"
       FROM autos 
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

// Get Single Auto
export const getAutoById = async (autoId) => {
  try {
    const result = await pool.query(
      `SELECT id, auto_number as "autoNumber", registration_number as "registrationNumber", capacity, 
              purchase_date as "purchaseDate", condition, fuel_type as "fuelType", 
              ward_no as "wardNo", status, type, created_at as "createdAt"
       FROM autos 
       WHERE id = $1`,
      [autoId]
    );

    if (result.rows.length === 0) {
      throw new Error('Auto not found');
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update Auto
export const updateAuto = async (autoId, autoData) => {
  try {
    const {
      autoNumber,
      registrationNumber,
      capacity,
      purchaseDate,
      condition,
      fuelType,
    } = autoData;

    const result = await pool.query(
      `UPDATE autos 
       SET auto_number = COALESCE($1, auto_number),
           registration_number = COALESCE($2, registration_number),
           capacity = COALESCE($3, capacity),
           purchase_date = COALESCE($4, purchase_date),
           condition = COALESCE($5, condition),
           fuel_type = COALESCE($6, fuel_type),
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, auto_number as "autoNumber", registration_number as "registrationNumber", capacity, 
                 purchase_date as "purchaseDate", condition, fuel_type as "fuelType", 
                 ward_no as "wardNo", status, type, created_at as "createdAt"`,
      [
        autoNumber || null,
        registrationNumber || null,
        capacity || null,
        purchaseDate || null,
        condition || null,
        fuelType || null,
        autoId,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Auto not found');
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete Auto
export const deleteAuto = async (autoId) => {
  try {
    const result = await pool.query(
      'DELETE FROM autos WHERE id = $1 RETURNING id',
      [autoId]
    );

    if (result.rows.length === 0) {
      throw new Error('Auto not found');
    }

    return { success: true, message: 'Auto deleted successfully' };
  } catch (error) {
    throw error;
  }
};
