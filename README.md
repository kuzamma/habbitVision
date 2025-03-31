# Habitize - Habit Tracking Application

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- A PostgreSQL database named `habitvision`

### Setup Steps

1. **Clone the repository**

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
Create a `.env` file in the root directory with the following content:
```env
DATABASE_URL=""
JWT_SECRET="ur-super-secret-key-change-this-in-production"
```

4. **Initialize the database**
First, make sure your PostgreSQL server is running and the `habitvision` database is created. Then:
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Database Schema
The application uses PostgreSQL with Drizzle ORM. The schema includes:
- Users
- Habits
- Habit Frequencies
- Habit Logs

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for session management

### Available Scripts

- `npm run dev`: Start the development server
- `npm run db:push`: Push database schema changes
- `npm run build`: Build the application for production
- `npm start`: Start the production server
