import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createAuto,
  getAutosByWard,
  getAutosByWardPaginated,
  getAutoById,
  updateAuto,
  deleteAuto,
} from '../services/autoService.js';

const router = express.Router();

// Middleware to attach user from token
router.use(authMiddleware);

// Get all autos for the admin's ward
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
      'SELECT COUNT(*) as count FROM autos WHERE ward_no = $1',
      [wardNo]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const autos = await getAutosByWardPaginated(wardNo, limit, offset);

    res.json({
      success: true,
      data: autos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching autos:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch autos',
    });
  }
});

// Get single auto
router.get('/:id', async (req, res) => {
  try {
    const auto = await getAutoById(req.params.id);

    res.json({
      success: true,
      data: auto,
    });
  } catch (error) {
    console.error('Error fetching auto:', error);
    res.status(error.message === 'Auto not found' ? 404 : 500).json({
      error: error.message || 'Failed to fetch auto',
    });
  }
});

// Create new auto
router.post('/', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;

    if (!wardNo) {
      return res.status(400).json({
        error: 'Ward number not found in user profile',
      });
    }

    const { autoNumber, registrationNumber, capacity, purchaseDate, condition, fuelType } = req.body;

    // Validation
    if (!autoNumber || !registrationNumber) {
      return res.status(400).json({
        error: 'Auto number and registration number are required',
      });
    }

    if (!condition || !fuelType) {
      return res.status(400).json({
        error: 'Condition and fuel type are required',
      });
    }

    const newAuto = await createAuto(req.body, wardNo);

    res.status(201).json({
      success: true,
      message: 'Auto created successfully',
      data: newAuto,
    });
  } catch (error) {
    console.error('Error creating auto:', error);
    res.status(error.message.includes('already exists') ? 409 : 500).json({
      error: error.message || 'Failed to create auto',
    });
  }
});

// Update auto
router.put('/:id', async (req, res) => {
  try {
    const updatedAuto = await updateAuto(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Auto updated successfully',
      data: updatedAuto,
    });
  } catch (error) {
    console.error('Error updating auto:', error);
    res.status(error.message === 'Auto not found' ? 404 : 500).json({
      error: error.message || 'Failed to update auto',
    });
  }
});

// Delete auto
router.delete('/:id', async (req, res) => {
  try {
    await deleteAuto(req.params.id);

    res.json({
      success: true,
      message: 'Auto deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting auto:', error);
    res.status(error.message === 'Auto not found' ? 404 : 500).json({
      error: error.message || 'Failed to delete auto',
    });
  }
});

export default router;
