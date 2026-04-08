# 🎬 CineBook - Movie Booking System

A full-stack movie ticket booking application built with **Next.js** (frontend) and **Express.js** (backend).

## 🚀 Features

✅ **User Authentication**
- Email/Phone registration with password hashing
- Login with email or phone
- Google OAuth integration
- Forgot password with OTP verification

✅ **Seat Selection & Booking**
- Real-time seat availability using Socket.IO
- Seat locking mechanism (5-minute timeout)
- Booking confirmation
- Automatic unlock of expired locks (cron job)

✅ **Booking Management**
- View booking history
- Cancel bookings
- Booking receipt with ticket details

✅ **Admin Features**
- Create new movie shows with custom seat layouts
- View all bookings and shows

## 📋 Project Structure

```
movie-booking-backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/      # Auth middleware
│   ├── utils/           # Email, OTP, SMS utilities
│   ├── jobs/            # Cron jobs (auto-unlock)
│   └── server.js        # Main server file
├── scripts/
│   └── seed.js          # Database seeding script
└── .env                 # Environment variables

movie-booking-frontend/
├── src/
│   ├── app/             # Pages (login, register, shows, bookings)
│   ├── components/      # Reusable UI components
│   ├── lib/            # API client, socket.io
│   └── globals.css     # Tailwind styles
└── .env.local          # Frontend environment variables
```

## 🛠 Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd movie-booking-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (`.env` is already set up):
   ```
   MONGO_URI=mongodb+srv://Cinema765:Cinema765@cinema.ybitqup.mongodb.net/?appName=Cinema
   PORT=5000
   JWT_SECRET=some_long_random_string
   EMAIL_USER=cinemabooking.alerts@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   TWILIO_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH=your_twilio_auth_token
   TWILIO_PHONE=+919167112780
   ```

4. **Seed the database with test shows and users:**
   ```bash
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd movie-booking-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment is already configured** in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

## 🔐 Test Credentials

After running the seed script, you can login with:

| Email              | Password    | Role  |
|-------------------|------------|-------|
| john@example.com  | password123| User  |
| admin@example.com | admin123   | Admin |
| jane@example.com  | password123| User  |

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/google` - Google OAuth login

### Shows
- `GET /api/shows` - Get all shows
- `POST /api/shows` - Create show (Admin only)
- `GET /api/shows/:id` - Get show details
- `POST /api/shows/:id/lock` - Lock seats (5 min timeout)
- `POST /api/shows/:id/confirm` - Confirm booking

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/cancel` - Cancel booking

## 🗄 Database Schema

### User Model
- name, email, phone (unique)
- password (hashed with bcrypt)
- role (user/admin)
- OTP verification fields
- Login tracking (IP, timestamp)

### Show Model
- movieTitle, poster, genre, language, rating, duration
- screen, showTime, price
- seats array with status (available/locked/booked)

### Booking Model
- user ID, show ID
- seats array, total price
- payment & booking status
- timestamps

## 🔄 Real-time Features

The application uses **Socket.IO** for real-time seat updates:

1. Clients connect to `http://localhost:5000`
2. Join show-specific rooms: `socket.emit("join-show", showId)`
3. Listen for seat updates: `socket.on("seats-updated")`
4. Automatically refreshes seat list when others book

## ⏱ Auto-Unlock Mechanism

- Locked seats automatically unlock after **5 minutes**
- Implemented using **node-cron** (runs every minute)
- Keeps seats from being blocked indefinitely

## 📧 Email Integration

Project uses **Nodemailer** with Gmail SMTP for:
- OTP verification emails
- Security alerts (login, forgot password)
- Check console for OTP in development

## 🚀 Running Both Servers

**Terminal 1 (Backend):**
```bash
cd movie-booking-backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd movie-booking-frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

## 📱 Features Walkthrough

### 1. User Registration
- Create account with email/phone
- Auto-verified (OTP flow ready)
- Secure password hashing

### 2. Login
- Email or phone login
- JWT token-based session
- Auto-logout on 401

### 3. Browse Shows
- Homepage with movie cards
- Movie details with ratings/language badges

### 4. Seat Selection
- Interactive seat grid (A1-E10)
- Real-time seat status indicators
- Lock seats for 5 minutes

### 5. Booking Management
- View booking history
- Cancel active bookings
- Booking details with seat info

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "MONGO_URI not set" | Check `.env` file in backend |
| Port 5000 already in use | Change PORT in `.env` |
| Seats not updating in real-time | Ensure Socket.IO connection shows in console |
| Cannot login | Run seed script to create test users |
| Email not sending | Check `EMAIL_USER` and `EMAIL_PASS` in `.env` |

## 📦 Dependencies

**Backend:**
- Express 5.2.1
- MongoDB & Mongoose 9.2.1
- Socket.IO 4.8.3
- JWT, bcrypt for security
- Nodemailer for emails
- node-cron for scheduled tasks

**Frontend:**
- Next.js 16.1.6
- React 19.2.3
- Axios for API calls
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.IO client for real-time updates

## ✨ Project Completed!

All features have been implemented and integrated. The application is ready for deployment and testing.

---

**Last Updated:** April 1, 2026
