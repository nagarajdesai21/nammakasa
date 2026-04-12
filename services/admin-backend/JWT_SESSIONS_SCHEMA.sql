-- JWT_SESSIONS TABLE
-- For tracking active admin sessions and token revocation
CREATE TABLE jwt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,  -- Hash of JWT token for verification
  refresh_token_hash VARCHAR(255) UNIQUE,   -- Optional refresh token
  expires_at TIMESTAMP NOT NULL,            -- When token expires
  revoked_at TIMESTAMP,                     -- When token was manually revoked (logout)
  ip_address VARCHAR(45),                   -- Store IP for security audit
  user_agent TEXT,                          -- Browser/client info
  device_name VARCHAR(100),                 -- Optional: device identifier
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATION_LOGS TABLE (optional, for audit trails)
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50),  -- 'SIGNUP_OTP', 'APPROVAL', 'LOGIN_ALERT', etc
  recipient_email VARCHAR(255),
  status VARCHAR(20),              -- 'SENT', 'FAILED', 'BOUNCED'
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT
);

CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
