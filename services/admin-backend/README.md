# Nammakasa Admin Backend

Backend API for the waste management admin panel.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## API Endpoints

### Authentication - OTP Verification

#### Send OTP
```
POST /api/auth/send-otp
Body: { email: "admin@example.com" }
Response: { success: true, message: "OTP sent to your email" }
```

#### Verify OTP
```
POST /api/auth/verify-otp
Body: { email: "admin@example.com", otp: "123456" }
Response: { success: true, message: "OTP verified successfully" }
```

## Database Setup

```sql
-- Create OTP table
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  otp VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_email ON otp_verifications(email);
```

## Environment Variables

See `.env.example` for all required variables.

**Key variables:**
- `DB_*`: PostgreSQL database connection
- `EMAIL_*`: Gmail SMTP credentials
- `JWT_SECRET`: Secret key for JWT tokens
- `OTP_EXPIRY_MINUTES`: OTP expiry time (default: 10)
- `OTP_LENGTH`: OTP digit length (default: 6)
