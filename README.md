# Football Prediction Admin Panel

This is the admin panel for the Football Prediction application.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values:
   - VITE_API_BASE_URL (default: http://localhost:3001/api)
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The admin panel will be available at `http://localhost:8081`

## Features

- League management (CRUD operations)
- Team management (CRUD operations)
- Match management (CRUD operations with team selection)
- User management (CRUD operations with activity tracking)
- Analytics dashboard with statistics
- Responsive design using shadcn/ui components

## Authentication

The admin panel requires authentication to access. Use one of the following admin accounts:

1. Default admin:
   - Email: admin@example.com
   - Password: admin123

2. Additional admin:
   - Email: admin@gmail.com
   - Password: admin123

## Project Structure

- `/src/pages` - Page components
- `/src/components` - Reusable UI components
- `/src/services` - API service functions
- `/src/contexts` - React context providers
- `/src/hooks` - Custom React hooks

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router v6
- TanStack Query
- Supabase JavaScript client

## Deployment

To build for production:
```bash
npm run build
```

The built files will be in the `dist` folder.