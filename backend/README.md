# doQtoR Backend

Express server providing demo endpoints for auth, records, tokens, and logs.

## Run

```bash
cd backend
npm install
npm run start
# Server on http://localhost:4000
```

Health check: GET /health

## Env

- PORT (default 4000)
- CORS_ORIGIN (default *)
- TOKEN_TTL_SECONDS (default 60)

## Endpoints

- POST /api/auth/login { username, password, role }
- POST /api/auth/register { name, email, password, role }
- GET  /api/records?userId=...
- POST /api/records { ownerUserId, name, type?, url? }
- POST /api/tokens/generate { recordId }
- POST /api/tokens/redeem { token }
- GET  /api/logs
- POST /api/logs { user, action, accessLevel? }