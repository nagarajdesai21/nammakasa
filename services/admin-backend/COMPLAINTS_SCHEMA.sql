-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_no INTEGER NOT NULL,
  issue_description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, In Progress, Resolved
  complaint_date TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_date TIMESTAMP,
  resolved_in_hours DECIMAL(10, 2),
  reported_by_user_id UUID,
  assigned_to_staff_id UUID,
  priority VARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High, Urgent
  category VARCHAR(100), -- Overflowing bins, Delayed collection, Spillage, etc.
  location_details TEXT,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_complaints_ward_no ON complaints(ward_no);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_date ON complaints(complaint_date);

-- Sample data
INSERT INTO complaints (ward_no, issue_description, status, complaint_date, priority, category, location_details)
VALUES
  (45, 'Garbage overflow on Indiranagar North', 'Pending', NOW() - INTERVAL '1 day', 'High', 'Overflowing bins', 'Near market area'),
  (45, 'Overflowing bins near market area', 'In Progress', NOW() - INTERVAL '2 days', 'High', 'Overflowing bins', 'Main market junction'),
  (46, 'Collection not done in Koramangala zone', 'Pending', NOW() - INTERVAL '3 days', 'High', 'Delayed collection', 'Koramangala main street'),
  (47, 'Vehicle delayed beyond scheduled time', 'In Progress', NOW() - INTERVAL '4 days', 'Medium', 'Delayed collection', 'Whitefield area'),
  (48, 'Unauthorized dumping near residential area', 'Pending', NOW() - INTERVAL '5 days', 'Urgent', 'Unauthorized dumping', 'Residential complex B'),
  (45, 'Garbage overflow on Whitefield road', 'Resolved', NOW() - INTERVAL '6 days', 'Medium', 'Overflowing bins', 'Whitefield main road', NOW() - INTERVAL '5 days', 4),
  (46, 'Missing collection in Ward 46', 'Resolved', NOW() - INTERVAL '7 days', 'High', 'Missed collection', 'Zone 1', NOW() - INTERVAL '6 days', 2),
  (47, 'Spillage during collection', 'Resolved', NOW() - INTERVAL '8 days', 'Medium', 'Spillage', 'Apartment complex', NOW() - INTERVAL '7 days', 3),
  (48, 'Vehicle parked on road blocking traffic', 'Resolved', NOW() - INTERVAL '9 days', 'Medium', 'Traffic obstruction', 'Main highway', NOW() - INTERVAL '8 days', 1)
ON CONFLICT DO NOTHING;
