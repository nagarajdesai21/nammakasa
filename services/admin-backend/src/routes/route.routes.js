import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createRoute,
  getRoutesByWard,
  getRouteById,
  updateRoute,
  deleteRoute,
} from '../services/routeService.js';

const router = express.Router();

// Middleware to attach user from token
router.use(authMiddleware);

// Get all routes for the admin's ward
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
      'SELECT COUNT(*) as count FROM routes WHERE ward_no = $1',
      [wardNo]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const routes = await getRoutesByWard(wardNo, limit, offset);

    res.json({
      success: true,
      data: routes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch routes',
    });
  }
});

// Get single route
router.get('/:id', async (req, res) => {
  try {
    const route = await getRouteById(req.params.id);

    res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(error.message === 'Route not found' ? 404 : 500).json({
      error: error.message || 'Failed to fetch route',
    });
  }
});

// Create new route
router.post('/', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;

    if (!wardNo) {
      return res.status(400).json({
        error: 'Ward number not found in user profile',
      });
    }

    const { routeName, routeCode, pinCodes, estimatedDuration, frequency, coordinates, description } = req.body;

    // Validation
    if (!routeName || !routeCode) {
      return res.status(400).json({
        error: 'Route name and code are required',
      });
    }

    if (!pinCodes || !Array.isArray(pinCodes) || pinCodes.length === 0) {
      return res.status(400).json({
        error: 'At least one pincode is required',
      });
    }

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({
        error: 'Route coordinates are required',
      });
    }

    const newRoute = await createRoute(req.body, wardNo);

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: newRoute,
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({
      error: error.message || 'Failed to create route',
    });
  }
});

// Update route
router.put('/:id', async (req, res) => {
  try {
    const updatedRoute = await updateRoute(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: updatedRoute,
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(error.message === 'Route not found' ? 404 : 500).json({
      error: error.message || 'Failed to update route',
    });
  }
});

// Delete route
router.delete('/:id', async (req, res) => {
  try {
    await deleteRoute(req.params.id);

    res.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(error.message === 'Route not found' ? 404 : 500).json({
      error: error.message || 'Failed to delete route',
    });
  }
});

export default router;
