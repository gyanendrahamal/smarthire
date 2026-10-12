# SmartHire — Deployment Architecture Guide

## Production Topology

- **Frontend:** React 18 + Vite (SPA) deployed on Vercel or Netlify.
- **Backend:** Express.js REST API with Socket.IO deployed on Render, Railway, or AWS Elastic Beanstalk.
- **Database:** Managed PostgreSQL (e.g. Neon, Supabase, or AWS RDS).
- **Object Storage:** Amazon S3 or Supabase Storage for secure PDF resume hosting with signed URL access.

## Environment Variables Configuration

### Backend (`.env`)
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@aws-host:5432/smarthire?schema=public"
JWT_SECRET="secure_production_secret_key_minimum_32_characters"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://smarthire.app"
UPLOAD_DIR="./uploads/resumes"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your_api_key"
SMTP_FROM="SmartHire <noreply@smarthire.app>"
```

### Frontend (`.env`)
```bash
VITE_API_URL="https://api.smarthire.app"
```

## Migration & Deployment Steps

1. **Database Migration:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. **Frontend Production Build:**
   ```bash
   cd frontend
   npm run build
   # Outputs optimized static assets in dist/
   ```

3. **Backend Service Launch:**
   ```bash
   cd backend
   node src/server.js
   ```
