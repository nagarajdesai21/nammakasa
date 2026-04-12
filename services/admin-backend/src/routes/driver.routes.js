import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createDriver,
  getDriversByWard,
  getDriversByWardPaginated,
  getDriverById,
  updateDriver,
  deleteDriver,
} from '../services/driverService.js';

const router = express.Router();

// Middleware to attach user from token
router.use(authMiddleware);

// Get all drivers for the admin's ward
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
      'SELECT COUNT(*) as count FROM drivers WHERE ward_no = $1',
      [wardNo]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const drivers = await getDriversByWardPaginated(wardNo, limit, offset);

    res.json({
      success: true,
      data: drivers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch drivers',
    });
  }
});

// Get single driver
router.get('/:id', async (req, res) => {
  try {
    const driver = await getDriverById(req.params.id);

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(error.message === 'Driver not found' ? 404 : 500).json({
      error: error.message || 'Failed to fetch driver',
    });
  }
});

// Create new driver
router.post('/', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;

    if (!wardNo) {
      return res.status(400).json({
        error: 'Ward number not found in user profile',
      });
    }

    const { name, phone, age, yearsOfService, salary, licenseNumber, licenseExpiry } = req.body;

    // Validation
    if (!name || !phone || !age) {
      return res.status(400).json({
        error: 'Name, phone and age are required',
      });
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        error: 'Phone number must be 10 digits',
      });
    }

    if (Number(age) < 18 || Number(age) > 70) {
      return res.status(400).json({
        error: 'Age must be between 18 and 70',
      });
    }

    const newDriver = await createDriver(req.body, wardNo);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: newDriver,
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      error: error.message || 'Failed to create driver',
    });
  }
});

// Update driver
router.put('/:id', async (req, res) => {
  try {
    const updatedDriver = await updateDriver(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: updatedDriver,
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(error.message === 'Driver not found' ? 404 : 500).json({
      error: error.message || 'Failed to update driver',
    });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    await deleteDriver(req.params.id);

    res.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(error.message === 'Driver not found' ? 404 : 500).json({
      error: error.message || 'Failed to delete driver',
    });
  }
});

export default router;
