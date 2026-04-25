import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all complaints for a ward
export const getComplaintsByWard = async (wardNo) => {
  try {
    const result = await pool.query(
      `SELECT id, ward_no, issue_description, status, complaint_date, resolved_date, 
              resolved_in_hours, priority, category, location_details, contact_phone, 
              contact_email, created_at
       FROM complaints 
       WHERE ward_no = $1 
       ORDER BY complaint_date DESC`,
      [wardNo]
    );

    return {
      success: true,
      complaints: result.rows
    };
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

// Get complaints by status
export const getComplaintsByStatus = async (wardNo, status) => {
  try {
    const result = await pool.query(
      `SELECT id, ward_no, issue_description, status, complaint_date, resolved_date, 
              resolved_in_hours, priority, category, location_details, created_at
       FROM complaints 
       WHERE ward_no = $1 AND status = $2 
       ORDER BY complaint_date DESC`,
      [wardNo, status]
    );

    return {
      success: true,
      complaints: result.rows
    };
  } catch (error) {
    console.error('Error fetching complaints by status:', error);
    throw error;
  }
};

// Get active complaints (Pending + In Progress)
export const getActiveComplaints = async (wardNo) => {
  try {
    const result = await pool.query(
      `SELECT id, ward_no, issue_description, status, complaint_date, priority, 
              category, location_details, created_at
       FROM complaints 
       WHERE ward_no = $1 AND status IN ('Pending', 'In Progress')
       ORDER BY complaint_date DESC`,
      [wardNo]
    );

    return {
      success: true,
      count: result.rows.length,
      complaints: result.rows
    };
  } catch (error) {
    console.error('Error fetching active complaints:', error);
    throw error;
  }
};

// Get resolved complaints
export const getResolvedComplaints = async (wardNo, limit = 10) => {
  try {
    const result = await pool.query(
      `SELECT id, ward_no, issue_description, status, complaint_date, resolved_date, 
              resolved_in_hours, category, created_at
       FROM complaints 
       WHERE ward_no = $1 AND status = 'Resolved'
       ORDER BY resolved_date DESC
       LIMIT $2`,
      [wardNo, limit]
    );

    return {
      success: true,
      count: result.rows.length,
      complaints: result.rows
    };
  } catch (error) {
    console.error('Error fetching resolved complaints:', error);
    throw error;
  }
};

// Create a new complaint
export const createComplaint = async (complaintData) => {
  try {
    const {
      wardNo,
      issueDescription,
      category,
      priority,
      locationDetails,
      contactPhone,
      contactEmail,
      reportedByUserId,
    } = complaintData;

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO complaints 
       (id, ward_no, issue_description, category, priority, location_details, 
        contact_phone, contact_email, reported_by_user_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', NOW(), NOW())
       RETURNING id, ward_no, issue_description, category, priority, status, complaint_date, created_at`,
      [id, wardNo, issueDescription, category, priority, locationDetails, contactPhone, contactEmail, reportedByUserId]
    );

    return {
      success: true,
      message: 'Complaint registered successfully',
      complaint: result.rows[0]
    };
  } catch (error) {
    console.error('Error creating complaint:', error);
    throw error;
  }
};

// Update complaint status
export const updateComplaintStatus = async (complaintId, newStatus) => {
  try {
    let query = `UPDATE complaints 
                 SET status = $1, updated_at = NOW()`;
    const params = [newStatus, complaintId];

    // If marking as resolved, calculate resolution time
    if (newStatus === 'Resolved') {
      query += `, resolved_date = NOW(),
                  resolved_in_hours = EXTRACT(EPOCH FROM (NOW() - complaint_date)) / 3600`;
    }

    query += ` WHERE id = $2
              RETURNING id, status, resolved_date, resolved_in_hours`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      throw new Error('Complaint not found');
    }

    return {
      success: true,
      message: 'Complaint status updated',
      complaint: result.rows[0]
    };
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
};

// Assign complaint to staff member
export const assignComplaint = async (complaintId, staffId) => {
  try {
    const result = await pool.query(
      `UPDATE complaints 
       SET assigned_to_staff_id = $1, status = 'In Progress', updated_at = NOW()
       WHERE id = $2
       RETURNING id, assigned_to_staff_id, status`,
      [staffId, complaintId]
    );

    if (result.rows.length === 0) {
      throw new Error('Complaint not found');
    }

    return {
      success: true,
      message: 'Complaint assigned successfully',
      complaint: result.rows[0]
    };
  } catch (error) {
    console.error('Error assigning complaint:', error);
    throw error;
  }
};

// Get complaint statistics for a ward
export const getComplaintStatistics = async (wardNo) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
        AVG(CASE WHEN status = 'Resolved' THEN resolved_in_hours ELSE NULL END) as avg_resolution_hours
       FROM complaints 
       WHERE ward_no = $1`,
      [wardNo]
    );

    return {
      success: true,
      statistics: result.rows[0]
    };
  } catch (error) {
    console.error('Error fetching complaint statistics:', error);
    throw error;
  }
};

// Delete complaint (soft delete via status change or hard delete)
export const deleteComplaint = async (complaintId) => {
  try {
    const result = await pool.query(
      `DELETE FROM complaints WHERE id = $1 RETURNING id`,
      [complaintId]
    );

    if (result.rows.length === 0) {
      throw new Error('Complaint not found');
    }

    return {
      success: true,
      message: 'Complaint deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting complaint:', error);
    throw error;
  }
};
