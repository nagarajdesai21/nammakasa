import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createAssignment,
  getAssignmentsByWard,
  getAssignmentsByWardPaginated,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from '../services/assignmentService.js';

const router = express.Router();

// Middleware to attach user from token
router.use(authMiddleware);

// Get all assignments for the admin's ward
router.get('/', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    if (!wardNo) {
      return res.status(400).json({
        error: 'Ward number not found in user profile',
      });
    }

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM assignments WHERE ward_no = $1',
      [wardNo]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const assignments = await getAssignmentsByWardPaginated(wardNo, limit, offset);

    res.json({
      success: true,
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch assignments',
    });
  }
});

// Get single assignment
router.get('/:id', async (req, res) => {
  try {
    const assignment = await getAssignmentById(req.params.id);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(error.message === 'Assignment not found' ? 404 : 500).json({
      error: error.message || 'Failed to fetch assignment',
    });
  }
});

// Create new assignment
router.post('/', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;

    if (!wardNo) {
      return res.status(400).json({
        error: 'Ward number not found in user profile',
      });
    }

    const { routeId, autoId, driverId, assignmentDate } = req.body;

    // Validation
    if (!routeId || !autoId || !driverId || !assignmentDate) {
      return res.status(400).json({
        error: 'Route, auto, driver, and assignment date are required',
      });
    }

    const newAssignment = await createAssignment(req.body, wardNo);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: newAssignment,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      error: error.message || 'Failed to create assignment',
    });
  }
});

// Update assignment
router.put('/:id', async (req, res) => {
  try {
    const updatedAssignment = await updateAssignment(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: updatedAssignment,
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(error.message === 'Assignment not found' ? 404 : 500).json({
      error: error.message || 'Failed to update assignment',
    });
  }
});

// Delete assignment
router.delete('/:id', async (req, res) => {
  try {
    await deleteAssignment(req.params.id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(error.message === 'Assignment not found' ? 404 : 500).json({
      error: error.message || 'Failed to delete assignment',
    });
  }
});

export default router;
