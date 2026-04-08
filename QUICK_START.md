# 🚀 Quick Start - CineBook

## ⚡ 30-Second Setup

### Backend (Terminal 1)
```bash
cd movie-booking-backend
npm install
npm run seed    # Seeds 10 movies + 3 test users
npm run dev     # Runs on port 5000
```

### Frontend (Terminal 2)
```bash
cd movie-booking-frontend
npm install
npm run dev     # Runs on port 3000
```

✅ **Open browser:** http://localhost:3000

---

## 🔑 Instant Login

Use any of these after seeding:

```
📧 john@example.com     🔐 password123
📧 admin@example.com    🔐 admin123
📧 jane@example.com     🔐 password123
```

---

## 📋 What You Get

| Feature | Where |
|---------|-------|
| 🎬 Browse 10+ Movies | Homepage |
| 🎫 Show Details & Seats | `/shows` page |
| 💺 Real-time Seat Selection | Interactive Grid |
| ✅ Confirm Booking | Instant confirmation |
| 📚 View Bookings | `/bookings` page |
| ❌ Cancel Bookings | Booking details |

---

## 🔧 Full Setup Guide

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- Detailed installation steps
- Environment variables
- Database models
- API endpoints
- Troubleshooting

---

## ✅ Completion Checklist

- ✅ Backend auto-unlock job (5-min seat unlock)
- ✅ Booking model & tracking
- ✅ Real-time seat updates (Socket.IO)
- ✅ API environment variables
- ✅ Booking history page
- ✅ Database seeding with test data
- ✅ All components integrated
- ✅ Error handling & TypeScript fixes

---

## 📦 Project Structure

```
movie-booking-backend/
├── src/models/         ← User, Show, Booking models
├── src/routes/         ← Auth, Show, Booking APIs
├── src/controllers/    ← Business logic
├── scripts/seed.js     ← Database seeding
└── .env               ← Already configured

movie-booking-frontend/
├── src/app/           ← Pages (bookings/ added)
├── src/lib/api.ts     ← API client (newly created)
├── src/components/    ← Reusable components
└── .env.local        ← Already configured
```

---

## 🎯 Next Steps

1. **Run both servers** (see Quick Start above)
2. **Register** or login with test credentials
3. **Browse shows** on homepage
4. **Select seats** on show detail page
5. **Confirm booking** and check booking history
6. **Cancel booking** to test refund flow

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| Port 5000 in use | Change `PORT` in backend `.env` |
| MongoDB connection error | Verify `MONGO_URI` in `.env` |
| Can't create accounts | Run `npm run seed` first |
| Seats not updating | Check Socket.IO connection in browser console |
| Email not sending | Check `EMAIL_USER` and `EMAIL_PASS` in `.env` |

---

**Status:** ✅ **Production Ready**
