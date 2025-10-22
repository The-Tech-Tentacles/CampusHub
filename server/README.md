# CampusHub Backend

A robust and scalable backend API for CampusHub - Campus Management System.

## 🏗️ Architecture

This backend follows a clean, modular architecture with proper separation of concerns:

```
server/
├── src/
│   ├── config/               # Configuration files
│   │   ├── index.ts          # Main config and environment validation
│   │   └── database.ts       # Database connection and setup
│   ├── controllers/          # Request handlers and business logic
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # Authentication and authorization
│   │   ├── validation.ts     # Input validation
│   │   └── errorHandler.ts   # Error handling
│   ├── services/             # Business logic and data access
│   ├── routes/               # Route definitions
│   ├── utils/                # Utility functions
│   └── index.ts              # Express app setup
├── migrations/               # Database migration files
├── Docs/                     # Backend documentation
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (STUDENT, FACULTY, HOD, DEAN, ADMIN)
- Secure password hashing with bcrypt
- Refresh token support

### Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection prevention

### Database

- PostgreSQL with Neon DB
- Drizzle ORM for type-safe queries
- Database migrations
- Connection pooling
- Health checks

### API Features

- RESTful API design
- Comprehensive error handling
- Request/Response logging
- API versioning
- Pagination support
- File upload support

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Drizzle ORM
- **Authentication**: JWT
- **Validation**: express-validator + Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: tsx, ESLint, Jest

## 🚀 Quick Start

### 1. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL=your_neon_database_url_here

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Run the database migrations:

```bash
npm run migrate
```

Or push the schema directly (for development):

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Production Build

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Users (Admin/Faculty Access)

- `GET /api/users` - List all users
- `GET /api/users/search` - Search users
- `GET /api/users/role/:role` - Get users by role
- `GET /api/users/department/:department` - Get users by department
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/activate` - Activate user
- `POST /api/users/:id/deactivate` - Deactivate user

### Notices

- `GET /api/notices` - Get notices (with pagination)
- `GET /api/notices/unread` - Get unread notices
- `GET /api/notices/:id` - Get notice by ID
- `GET /api/notices/:id/stats` - Get notice read statistics
- `POST /api/notices` - Create notice (Faculty+)
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice
- `POST /api/notices/:id/read` - Mark notice as read

## 🔒 Authentication

All API requests (except public endpoints) require authentication via JWT token:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **STUDENT**: Basic access to notices, forms, applications
- **FACULTY**: Can create notices, view student applications
- **HOD**: Department-level administrative access
- **DEAN**: College-level administrative access
- **ADMIN**: Full system access

## 🗃️ Database Schema

The system uses the following main entities:

- **Users**: Student/Faculty profiles with role-based access
- **Departments**: Academic departments
- **Notices**: Announcements, circulars, news, events
- **Applications**: Form submissions and their lifecycle
- **Forms**: Dynamic form definitions
- **Notifications**: In-app notifications
- **Schedules**: Timetables and events

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run migrate      # Run database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Database Management

View and manage your database:

```bash
npm run db:studio
```

Generate and run migrations:

```bash
npm run migrate
```

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong secret key for JWT signing
- `NODE_ENV`: Set to 'production'
- `CORS_ORIGINS`: Allowed frontend origins

### Health Check

The API provides a health check endpoint:

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the API documentation
- Review the health check endpoint
- Check application logs
- Verify database connectivity
