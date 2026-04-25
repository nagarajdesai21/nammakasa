import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getComplaintsByWard,
  getComplaintsByStatus,
  getActiveComplaints,
  getResolvedComplaints,
  createComplaint,
  updateComplaintStatus,
  assignComplaint,
  getComplaintStatistics,
  deleteComplaint,
} from '../services/complaintService.js';

const router = express.Router();

// All complaint routes require authentication
router.use(authMiddleware);

// Get all complaints for the user's ward
router.get('/', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;

    if (!wardNo) {
      return res.status(400).json({ error: 'Ward number not found in user profile' });
    }

    const result = await getComplaintsByWard(wardNo);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get active complaints (Pending + In Progress)
router.get('/active', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;

    if (!wardNo) {
      return res.status(400).json({ error: 'Ward number not found in user profile' });
    }

    const result = await getActiveComplaints(wardNo);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch active complaints' });
  }
});

// Get resolved complaints
router.get('/resolved', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    if (!wardNo) {
      return res.status(400).json({ error: 'Ward number not found in user profile' });
    }

    const result = await getResolvedComplaints(wardNo, limit);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch resolved complaints' });
  }
});

// Get complaints by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const wardNo = req.user.wardNo;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!wardNo) {
      return res.status(400).json({ error: 'Ward number not found in user profile' });
    }

    const result = await getComplaintsByStatus(wardNo, status);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get complaint statistics
router.get('/stats', async (req, res) => {
  try {
    const wardNo = req.user.wardNo;

    if (!wardNo) {
      return res.status(400).json({ error: 'Ward number not found in user profile' });
    }

    const result = await getComplaintStatistics(wardNo);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint statistics' });
  }
});

// Create a new complaint
router.post('/', async (req, res) => {
  try {
    const { issueDescription, category, priority, locationDetails, contactPhone, contactEmail } = req.body;
    const wardNo = req.user.wardNo;

    // Validation
    if (!issueDescription || !wardNo) {
      return res.status(400).json({ error: 'Issue description and ward number are required' });
    }

    if (issueDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Issue description must be at least 10 characters' });
    }

    const complaintData = {
      wardNo,
      issueDescription,
      category: category || 'Other',
      priority: priority || 'Medium',
      locationDetails: locationDetails || '',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || req.user.email,
      reportedByUserId: req.user.id,
    };

    const result = await createComplaint(complaintData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Update complaint status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await updateComplaintStatus(id, status);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    const message = error.message === 'Complaint not found' ? 'Complaint not found' : 'Failed to update complaint status';
    const statusCode = message === 'Complaint not found' ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
});

// Assign complaint to staff
router.patch('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    const result = await assignComplaint(id, staffId);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    const message = error.message === 'Complaint not found' ? 'Complaint not found' : 'Failed to assign complaint';
    const statusCode = message === 'Complaint not found' ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
});

// Delete complaint
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteComplaint(id);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    const message = error.message === 'Complaint not found' ? 'Complaint not found' : 'Failed to delete complaint';
    const statusCode = message === 'Complaint not found' ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
});

export default router;
