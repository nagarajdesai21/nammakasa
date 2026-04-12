import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Create Route
export const createRoute = async (routeData, wardNo) => {
  try {
    const {
      routeName,
      routeCode,
      pinCodes,
      estimatedDuration,
      frequency,
      coordinates,
      description,
    } = routeData;

    // Validation
    if (!routeName || !routeCode) {
      throw new Error('Route name and code are required');
    }

    const routeId = uuidv4();
    const result = await pool.query(
      `INSERT INTO routes (id, route_name, route_code, ward_no, pin_codes, estimated_duration, frequency, coordinates, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, route_name as "routeName", route_code as "routeCode", ward_no as "wardNo", 
                 pin_codes as "pinCodes", estimated_duration as "estimatedDuration", 
                 frequency, coordinates, description, status, created_at as "createdAt"`,
      [
        routeId,
        routeName,
        routeCode,
        wardNo,
        JSON.stringify(pinCodes || []),
        estimatedDuration || 60,
        frequency || 'daily',
        JSON.stringify(coordinates || []),
        description || null,
        'active'
      ]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get Routes by Ward
export const getRoutesByWard = async (wardNo, limit, offset) => {
  try {
    const result = await pool.query(
      `SELECT id, route_name as "routeName", route_code as "routeCode", ward_no as "wardNo",
              pin_codes as "pinCodes", estimated_duration as "estimatedDuration",
              frequency, coordinates, description, status, created_at as "createdAt"
       FROM routes
       WHERE ward_no = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [wardNo, limit, offset]
    );

    return result.rows.map((row) => ({
      ...row,
      pinCodes: typeof row.pinCodes === 'string' ? JSON.parse(row.pinCodes) : row.pinCodes,
      coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
    }));
  } catch (error) {
    throw error;
  }
};

// Get Single Route
export const getRouteById = async (routeId) => {
  try {
    const result = await pool.query(
      `SELECT id, route_name as "routeName", route_code as "routeCode", ward_no as "wardNo",
              pin_codes as "pinCodes", estimated_duration as "estimatedDuration",
              frequency, coordinates, description, status, created_at as "createdAt"
       FROM routes
       WHERE id = $1`,
      [routeId]
    );

    if (result.rows.length === 0) {
      throw new Error('Route not found');
    }

    const row = result.rows[0];
    return {
      ...row,
      pinCodes: typeof row.pinCodes === 'string' ? JSON.parse(row.pinCodes) : row.pinCodes,
      coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
    };
  } catch (error) {
    throw error;
  }
};

// Update Route
export const updateRoute = async (routeId, routeData) => {
  try {
    const {
      routeName,
      routeCode,
      pinCodes,
      estimatedDuration,
      frequency,
      coordinates,
      description,
    } = routeData;

    const result = await pool.query(
      `UPDATE routes
       SET route_name = COALESCE($1, route_name),
           route_code = COALESCE($2, route_code),
           pin_codes = COALESCE($3, pin_codes),
           estimated_duration = COALESCE($4, estimated_duration),
           frequency = COALESCE($5, frequency),
           coordinates = COALESCE($6, coordinates),
           description = COALESCE($7, description),
           updated_at = NOW()
       WHERE id = $8
       RETURNING id, route_name as "routeName", route_code as "routeCode", ward_no as "wardNo",
                 pin_codes as "pinCodes", estimated_duration as "estimatedDuration",
                 frequency, coordinates, description, status, created_at as "createdAt"`,
      [
        routeName || null,
        routeCode || null,
        pinCodes ? JSON.stringify(pinCodes) : null,
        estimatedDuration || null,
        frequency || null,
        coordinates ? JSON.stringify(coordinates) : null,
        description || null,
        routeId,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Route not found');
    }

    const row = result.rows[0];
    return {
      ...row,
      pinCodes: typeof row.pinCodes === 'string' ? JSON.parse(row.pinCodes) : row.pinCodes,
      coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
    };
  } catch (error) {
    throw error;
  }
};

// Delete Route
export const deleteRoute = async (routeId) => {
  try {
    const result = await pool.query(
      'DELETE FROM routes WHERE id = $1 RETURNING id',
      [routeId]
    );

    if (result.rows.length === 0) {
      throw new Error('Route not found');
    }

    return { success: true, message: 'Route deleted successfully' };
  } catch (error) {
    throw error;
  }
};
