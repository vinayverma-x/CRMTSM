# Database Setup Instructions

This project uses PostgreSQL database (Neon) for storing user and student data.

## Database Connection

The database connection string is configured in `lib/db.ts`. The connection string is:
```
postgresql://neondb_owner:npg_j2J4eydRhPHf@ep-calm-heart-ahxf6w1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Initializing the Database

To initialize the database with the schema and seed data:

1. **Option 1: Using API Route (Recommended)**
   - Start your Next.js development server: `npm run dev`
   - Make a POST request to `/api/db/init`:
     ```bash
     curl -X POST http://localhost:3000/api/db/init
     ```
   - Or use any HTTP client (Postman, Thunder Client, etc.)

2. **Option 2: Using Script (Alternative)**
   - Run the initialization script:
     ```bash
     npx tsx scripts/init-db.ts
     ```

## Database Schema

The database includes the following tables:
- `users` - Stores admin, counselor, and student user accounts
- `students` - Stores student-specific information (extends users)

## Seed Data

The database will be seeded with:
- 1 Super Admin user
- 1 Admin user
- 3 Counselor users
- 3 Student users with full details

### Default Login Credentials

For demo purposes, all users have the password: `password123`

- **Super Admin**: superadmin@tsm.university
- **Admin**: admin@tsm.university
- **Counselor**: sarah.johnson@tsm.university
- **Student**: raj.kumar@tsm.university

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users (admins and counselors)
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create a new student
- `GET /api/students/[id]` - Get student by ID
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

## Notes

- Password hashing is currently disabled for demo purposes. In production, implement proper password hashing using bcryptjs.
- The database connection uses SSL for secure connections.
- All timestamps are stored in UTC.

