# CampusHub Backend Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

1. **Create your `.env` file:**

   ```bash
   cp .env.example .env
   ```

2. **Set up your Neon Database:**

   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project: `CampusHub`
   - Copy your connection string
   - Update `.env` file with your `DATABASE_URL`

   ```bash
   # Example DATABASE_URL from Neon
   DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-2.aws.neon.tech/campushub?sslmode=require
   ```

3. **Generate JWT Secret:**
   ```bash
   # Generate a secure JWT secret
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and update your `.env` file.

### 2. Database Setup

1. **Generate and run migrations:**

   ```bash
   # Generate migration files from schema
   npm run db:generate

   # Push schema to your Neon database
   npm run db:push

   # Verify tables were created
   npm run db:studio
   ```

2. **Seed initial data (optional):**
   ```bash
   npm run db:seed
   ```

### 3. Start Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev:server
```

The API will be available at: `http://localhost:5000/api`

---

## 🛠️ Available Scripts

| Script                | Description                               |
| --------------------- | ----------------------------------------- |
| `npm run dev:server`  | Start development server with auto-reload |
| `npm run dev:full`    | Start both frontend and backend           |
| `npm run build`       | Build for production                      |
| `npm run start`       | Start production server                   |
| `npm run db:push`     | Push schema changes to database           |
| `npm run db:generate` | Generate migration files                  |
| `npm run db:studio`   | Open Drizzle Studio (database GUI)        |
| `npm run db:seed`     | Seed database with sample data            |

---

## 🔧 Configuration

### Environment Variables

| Variable       | Description                            | Default               | Required |
| -------------- | -------------------------------------- | --------------------- | -------- |
| `DATABASE_URL` | Neon PostgreSQL connection string      | -                     | ✅       |
| `JWT_SECRET`   | Secret key for JWT tokens              | -                     | ✅       |
| `NODE_ENV`     | Environment (development/production)   | development           | ❌       |
| `PORT`         | Server port                            | 5000                  | ❌       |
| `FRONTEND_URL` | Frontend URL for CORS                  | http://localhost:3000 | ❌       |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | http://localhost:3000 | ❌       |

### Security Settings

| Variable                  | Description                  | Default                       |
| ------------------------- | ---------------------------- | ----------------------------- |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window (ms)       | 900000 (15 min)               |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window      | 100                           |
| `MAX_FILE_SIZE`           | Max upload file size (bytes) | 10485760 (10MB)               |
| `ALLOWED_FILE_TYPES`      | Allowed file extensions      | pdf,doc,docx,jpg,jpeg,png,gif |

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID

### Notices

- `GET /api/notices` - Get notices (with filters)
- `GET /api/notices/:id` - Get single notice
- `POST /api/notices` - Create notice (Faculty+)
- `POST /api/notices/:id/read` - Mark notice as read

### Applications

- `GET /api/applications` - Get applications
- `POST /api/applications` - Create application

### Notifications

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/unread-count` - Get unread count

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

### Departments

- `GET /api/departments` - Get all departments

### Health Check

- `GET /api/health` - Server health status

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Request Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### User Roles

- `STUDENT` - Regular students
- `FACULTY` - Faculty members
- `HOD` - Head of Department
- `DEAN` - Dean
- `ADMIN` - System administrators

### Role Permissions

| Role      | Permissions                                                    |
| --------- | -------------------------------------------------------------- |
| `STUDENT` | View notices, create applications, view own data               |
| `FACULTY` | All student permissions + create notices, approve applications |
| `HOD`     | All faculty permissions + department management                |
| `DEAN`    | All HOD permissions + cross-department access                  |
| `ADMIN`   | Full system access                                             |

---

## 📊 Database Schema

The database includes the following main tables:

- **users** - User accounts and profiles
- **departments** - Department information
- **notices** - System announcements
- **notice_reads** - Notice read tracking
- **applications** - Student applications
- **application_files** - File attachments
- **forms** - Digital forms
- **form_submissions** - Form responses
- **notifications** - In-app notifications
- **user_sessions** - Active sessions

See `Schema.md` for detailed database schema.

---

## 🧪 Testing the API

### Using cURL

1. **Health Check:**

   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register a user:**

   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john.doe@example.com",
       "password": "SecurePass123!",
       "role": "STUDENT",
       "department": "Computer Science",
       "year": "B. Tech",
       "enrollmentNumber": "21CS001"
     }'
   ```

3. **Login:**

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john.doe@example.com",
       "password": "SecurePass123!"
     }'
   ```

4. **Get notices (with token):**
   ```bash
   curl -X GET http://localhost:5000/api/notices \
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
   ```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: Your JWT token after login
3. Use `{{baseUrl}}` and `{{token}}` in your requests

---

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error:**

   - Verify your `DATABASE_URL` is correct
   - Ensure your Neon database is active
   - Check if your IP is whitelisted in Neon console

2. **JWT Errors:**

   - Make sure `JWT_SECRET` is set in `.env`
   - Verify the token format: `Bearer <token>`
   - Check if token has expired (default: 1 hour)

3. **CORS Issues:**

   - Update `CORS_ORIGINS` in `.env`
   - Ensure frontend URL is included

4. **Rate Limiting:**
   - Adjust `RATE_LIMIT_MAX_REQUESTS` if needed
   - Wait for the rate limit window to reset

### Debug Mode

Set `NODE_ENV=development` in `.env` for detailed error messages and request logging.

---

## 🔄 Database Migrations

### Generate Migration

```bash
npm run db:generate
```

### Apply Changes

```bash
npm run db:push
```

### Database Studio

```bash
npm run db:studio
```

Opens Drizzle Studio at `https://local.drizzle.studio`

---

## 🚀 Production Deployment

### Vercel Deployment

1. **Create `vercel.json`:**

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/index.js"
       }
     ]
   }
   ```

2. **Set Environment Variables in Vercel:**

   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

3. **Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

### Railway Deployment

1. **Connect GitHub repo to Railway**
2. **Set environment variables**
3. **Deploy automatically on push**

---

## 📝 Notes

- **In-app Notifications:** The system creates in-app notifications (not emails)
- **File Uploads:** Configured for local storage (extend for cloud storage)
- **Rate Limiting:** Prevents API abuse
- **Security:** Helmet.js for security headers, bcrypt for passwords
- **Validation:** Input validation with express-validator
- **Error Handling:** Comprehensive error responses

---

## 🆘 Need Help?

1. Check the logs in development mode
2. Use Drizzle Studio to inspect database
3. Test API endpoints with Postman/cURL
4. Verify environment variables are set correctly

Happy coding! 🎉
