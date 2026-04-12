# JWT Sessions & Token Management Strategy

## Q: Should I Create a JWT Sessions Table?

### SHORT ANSWER:
**YES** - Create the `jwt_sessions` table for government admin portals. You need session tracking for security audit, logout, and compliance.

---

## Two JWT Approaches

### Approach 1: Stateless JWT (No Table)
```
Client stores → Token { user: john, role: admin, exp: 2025-04-12 }
                 • Signed with JWT_SECRET
                 
Backend validates → Just check signature + expiry
                    • NO database lookup
                    • Super fast ⚡
```

**Pros:**
- ✅ No database calls needed
- ✅ Highly scalable
- ✅ Works perfectly for public APIs
- ✅ Microservices-friendly

**Cons:**
- ❌ Can't revoke tokens (token stays valid until expiry)
- ❌ Can't track active sessions
- ❌ If user is deleted, token still works
- ❌ No logout functionality (just delete client-side)
- ❌ Security compliance issues for government

---

### Approach 2: Session-based JWT (With Table) - RECOMMENDED FOR ADMIN
```
Client login → Backend creates JWT + stores in db
              ↓
              { id, user_id, token_hash, expires_at, ip_address }

Client sends request with JWT
              ↓
Backend checks:
  1. Token signature valid?
  2. Token exists in database? (active=true, not revoked)
  3. Token not expired?
  4. All 3 pass → Allow request ✅
```

**Pros:**
- ✅ Can logout (revoke token immediately)
- ✅ Track active sessions
- ✅ Security audit trail (IP, device, timestamp)
- ✅ Detect suspicious activity
- ✅ Admin can "logout all sessions"
- ✅ Compliance requirement for government/banking

**Cons:**
- ❌ Database lookup on every request (slight performance hit)
- ❌ More storage needed
- ❌ Cleanup of expired tokens needed

---

## For Nammakasa Admin Portal: **USE APPROACH 2**

### Why?
1. **Government compliance** - Need audit trail for admins
2. **Security** - Want instant logout
3. **Scale** - Admin panel (small user count) → DB lookups are fine
4. **Control** - Need to prevent token misuse

---

## JWT Sessions Table Structure

```sql
CREATE TABLE jwt_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,              -- Which admin user
  token_hash VARCHAR(255),   -- Hash of token (don't store full token!)
  refresh_token_hash,        -- Optional 2nd token for auto-refresh
  expires_at TIMESTAMP,      -- When token expires
  revoked_at TIMESTAMP,      -- When manually logged out
  ip_address VARCHAR(45),    -- Security audit
  user_agent TEXT,           -- Browser info
  device_name VARCHAR(100),  -- "Desktop", "Mobile", etc
  is_active BOOLEAN,         -- Quick status check
  created_at TIMESTAMP,      -- Login time
  last_activity TIMESTAMP    -- Last request time
);
```

---

## Implementation Flow

### Login Flow:
```
1. User enters email/password
2. Backend validates credentials ✓
3. Generate JWT token + store in jwt_sessions table
4. Send token to frontend
5. Frontend stores token in localStorage
```

### Request Flow:
```
1. Frontend sends request with header: Authorization: Bearer {token}
2. Backend extracts token
3. Hash the token
4. Query: SELECT * FROM jwt_sessions WHERE token_hash = ? AND is_active = true
5. If found AND not expired → Allow ✅
6. If not found OR expired OR revoked → Reject 401
```

### Logout Flow:
```
1. User clicks "Logout"
2. Frontend sends: DELETE /api/auth/logout { token }
3. Backend marks session as revoked: UPDATE jwt_sessions SET revoked_at = NOW(), is_active = FALSE
4. Frontend deletes token from localStorage
5. Token no longer works ✅
```

### Logout All Sessions (Admin has logged in from multiple devices):
```
1. User clicks "Logout from all devices"
2. Backend executes:
   UPDATE jwt_sessions 
   SET revoked_at = NOW(), is_active = FALSE 
   WHERE user_id = ? AND is_active = true
3. All tokens for that user become invalid ✅
```

---

## Code Example: Token Validation

```javascript
// Backend middleware
import crypto from 'crypto';

export const verifySessionToken = async (token, req) => {
  try {
    // 1. Verify JWT signature
    const decoded = jwt.decode(token, JWT_SECRET);
    
    // 2. Hash the token for lookup
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // 3. Check if session exists in database
    const result = await pool.query(
      `SELECT * FROM jwt_sessions 
       WHERE token_hash = $1 
       AND is_active = true 
       AND expires_at > NOW()
       AND revoked_at IS NULL`,
      [tokenHash]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Session not found or revoked');
    }
    
    const session = result.rows[0];
    
    // 4. Optional: Update last activity
    await pool.query(
      `UPDATE jwt_sessions 
       SET last_activity = NOW() 
       WHERE id = $1`,
      [session.id]
    );
    
    return {
      valid: true,
      user: decoded,
      sessionId: session.id
    };
    
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
```

---

## Cleanup Strategy (IMPORTANT!)

Expired tokens clutter the database. Create a cleanup job:

```javascript
// Run once per day (e.g., 2 AM via cron job)
export const cleanupExpiredSessions = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM jwt_sessions 
       WHERE expires_at < NOW() 
       AND revoked_at IS NOT NULL`
    );
    console.log(`Cleaned up ${result.rowCount} expired sessions`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

// Or, keep last 30 days for audit:
export const archiveSessions = async () => {
  await pool.query(
    `DELETE FROM jwt_sessions 
     WHERE created_at < NOW() - INTERVAL '30 days'
     AND revoked_at IS NOT NULL`
  );
};
```

---

## Alternative: Hybrid Approach

**Use refresh tokens** for better security:

```
Access Token (short-lived, 15 mins):
  - JWT stored in jwt_sessions
  - Expires in 15 minutes
  
Refresh Token (long-lived, 7 days):
  - Stored in jwt_sessions as refresh_token_hash
  - Used to get new access token without re-login
```

Flow:
```
1. Login → get access_token (15 min) + refresh_token (7 day)
2. Make requests with access_token ✅
3. Token expires in 15 mins
4. Frontend uses refresh_token to get new access_token
5. Backend validates refresh_token, issues new access_token
6. No need to login again! ✅
7. After 7 days, user must login again
8. On logout → revoke both tokens
```

---

## Decision Matrix

| Feature | Stateless JWT | Session JWT | Hybrid (Refresh Tokens) |
|---------|---------------|-------------|------------------------|
| **Fast** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Logout** | ❌ | ✅ | ✅ |
| **Session Tracking** | ❌ | ✅ | ✅ |
| **Audit Trail** | ❌ | ✅ | ✅ |
| **Scalability** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Govt Compliance** | ❌ | ✅ | ✅ |
| **Complexity** | Simple | Medium | Complex |
| **Best For** | APIs | Admin Panel | High-Security Apps |

---

## Recommendation for Nammakasa

**Use Hybrid Approach:**
- Access Token: 15 minutes (session tracked in DB)
- Refresh Token: 7 days (also tracked in DB)
- Logout: Revokes both tokens immediately
- Logout All: Revokes all user's tokens

This gives you:
✅ Government compliance  
✅ Fast performance (JWT signature check)  
✅ Instant logout  
✅ Session tracking for audit  
✅ Device awareness (mobile vs desktop)  
✅ Security (can revoke compromised tokens)

---

## Next: Implement Sessions

1. Create table: `psql < JWT_SESSIONS_SCHEMA.sql`
2. Update `authService.js` to insert into jwt_sessions on login
3. Update `authMiddleware.js` to check jwt_sessions table
4. Add logout endpoint to revoke token
5. Add cleanup job (cleanup expired sessions daily)
