import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Create Assignment
export const createAssignment = async (assignmentData, wardNo) => {
  try {
    const {
      routeId,
      autoId,
      driverId,
      assignmentDate,
      estimatedCompletionTime,
      status = 'assigned',
      petrolDetails = [],
      serviceCharges = [],
    } = assignmentData;

    // Validation
    if (!routeId || !autoId || !driverId || !assignmentDate) {
      throw new Error('Route, auto, driver, and assignment date are required');
    }

    const assignmentId = uuidv4();
    const result = await pool.query(
      `INSERT INTO assignments (
        id, route_id, auto_id, driver_id, assignment_date, 
        estimated_completion_time, status, petrol_details, 
        service_charges, ward_no, created_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, route_id as "routeId", auto_id as "autoId", 
                 driver_id as "driverId", assignment_date as "assignmentDate",
                 estimated_completion_time as "estimatedCompletionTime",
                 status, petrol_details as "petrolDetails",
                 service_charges as "serviceCharges", ward_no as "wardNo",
                 created_at as "createdAt"`,
      [
        assignmentId,
        routeId,
        autoId,
        driverId,
        assignmentDate,
        estimatedCompletionTime || null,
        status,
        JSON.stringify(petrolDetails),
        JSON.stringify(serviceCharges),
        wardNo,
      ]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get Assignments by Ward
export const getAssignmentsByWard = async (wardNo) => {
  try {
    const result = await pool.query(
      `SELECT id, route_id as "routeId", auto_id as "autoId", 
              driver_id as "driverId", assignment_date as "assignmentDate",
              estimated_completion_time as "estimatedCompletionTime",
              status, petrol_details as "petrolDetails",
              service_charges as "serviceCharges", ward_no as "wardNo",
              created_at as "createdAt"
       FROM assignments
       WHERE ward_no = $1
       ORDER BY assignment_date DESC, created_at DESC`,
      [wardNo]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get Assignments by Ward with Pagination
export const getAssignmentsByWardPaginated = async (wardNo, limit, offset) => {
  try {
    const result = await pool.query(
      `SELECT id, route_id as "routeId", auto_id as "autoId", 
              driver_id as "driverId", assignment_date as "assignmentDate",
              estimated_completion_time as "estimatedCompletionTime",
              status, petrol_details as "petrolDetails",
              service_charges as "serviceCharges", ward_no as "wardNo",
              created_at as "createdAt"
       FROM assignments
       WHERE ward_no = $1
       ORDER BY assignment_date DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [wardNo, limit, offset]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get Single Assignment
export const getAssignmentById = async (assignmentId) => {
  try {
    const result = await pool.query(
      `SELECT id, route_id as "routeId", auto_id as "autoId", 
              driver_id as "driverId", assignment_date as "assignmentDate",
              estimated_completion_time as "estimatedCompletionTime",
              status, petrol_details as "petrolDetails",
              service_charges as "serviceCharges", ward_no as "wardNo",
              created_at as "createdAt"
       FROM assignments
       WHERE id = $1`,
      [assignmentId]
    );

    if (result.rows.length === 0) {
      throw new Error('Assignment not found');
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update Assignment
export const updateAssignment = async (assignmentId, assignmentData) => {
  try {
    const {
      routeId,
      autoId,
      driverId,
      assignmentDate,
      estimatedCompletionTime,
      status,
      petrolDetails,
      serviceCharges,
    } = assignmentData;

    const result = await pool.query(
      `UPDATE assignments
       SET route_id = COALESCE($1, route_id),
           auto_id = COALESCE($2, auto_id),
           driver_id = COALESCE($3, driver_id),
           assignment_date = COALESCE($4, assignment_date),
           estimated_completion_time = COALESCE($5, estimated_completion_time),
           status = COALESCE($6, status),
           petrol_details = COALESCE($7, petrol_details),
           service_charges = COALESCE($8, service_charges),
           updated_at = NOW()
       WHERE id = $9
       RETURNING id, route_id as "routeId", auto_id as "autoId", 
                 driver_id as "driverId", assignment_date as "assignmentDate",
                 estimated_completion_time as "estimatedCompletionTime",
                 status, petrol_details as "petrolDetails",
                 service_charges as "serviceCharges", ward_no as "wardNo",
                 created_at as "createdAt"`,
      [
        routeId || null,
        autoId || null,
        driverId || null,
        assignmentDate || null,
        estimatedCompletionTime || null,
        status || null,
        petrolDetails ? JSON.stringify(petrolDetails) : null,
        serviceCharges ? JSON.stringify(serviceCharges) : null,
        assignmentId,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Assignment not found');
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete Assignment
export const deleteAssignment = async (assignmentId) => {
  try {
    const result = await pool.query(
      'DELETE FROM assignments WHERE id = $1 RETURNING id',
      [assignmentId]
    );

    if (result.rows.length === 0) {
      throw new Error('Assignment not found');
    }

    return { success: true, message: 'Assignment deleted successfully' };
  } catch (error) {
    throw error;
  }
};
