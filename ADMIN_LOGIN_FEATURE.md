# 🛡️ Admin Login Feature

## What's New

### 1. Enhanced Login Page
The login page now has a toggle between **User** and **Admin** login modes:

**User Mode (Default):**
- Login with email or phone
- Redirects to `/shows` after successful login
- Can register new accounts

**Admin Mode:**
- Login with email only (for security)
- Requires admin role verification
- Redirects to `/admin-dashboard` after successful login
- Blue color scheme to distinguish from user login

### 2. Admin Dashboard (`/admin-dashboard`)
A comprehensive dashboard for administrators with:

**Features:**
- ✅ View all movie shows in a grid layout
- ✅ Create new shows with a modal form
- ✅ Real-time seat status indicators (Available/Locked/Booked)
- ✅ Full show details display
- ✅ Protected page (only accessible by admin users)

**Create Show Form Includes:**
- Movie Title (required)
- Genre
- Language
- Rating (U, U/A, A, S)
- Duration
- Screen
- Show Time (datetime picker)
- Ticket Price

### 3. Updated Navigation
The Navbar now adapts based on user role:

**For Regular Users:**
- Shows "👤 Username"
- "My Bookings" link
- Category navigation (Movies, Stream, Events, etc.)

**For Admin Users:**
- Shows "🛡️ Username" (with shield icon)
- "Dashboard" link (blue color)
- No category navigation (cleaner interface)

### 4. Login Flow

**Admin Login:**
```
Login Page → Set to Admin Mode → Enter Email & Password
→ Backend validates credentials → Checks if user.role === "admin"
→ If admin: Redirects to /admin-dashboard
→ If not admin: Shows error "This account doesn't have admin privileges"
```

**User Login:**
```
Login Page → Keep at User Mode → Enter Email/Phone & Password
→ Backend validates credentials
→ Redirects to /shows page → Can browse and book shows
```

---

## 🔐 Test Admin Account

After seeding the database:

```
Email: admin@example.com
Password: admin123
Role: Admin
```

---

## 📋 Admin Dashboard Features

### View All Shows
- Grid layout with all shows
- Seat availability statistics
- Color-coded seat status:
  - 🟢 **Available** - Ready to book
  - 🟡 **Locked** - Selected by customers (5-min timeout)
  - 🔴 **Booked** - Already sold out

### Create New Show
- Modal form with all movie details
- Datetime picker for show time
- Form validation
- Success notification after creation
- Automatic list refresh

### Show Card Display
Each show displays:
- Movie title and genre
- Language and rating
- Screen number
- Price per ticket
- Total seats and breakdown by status

---

## 🔒 Security Features

✅ **Email-only login for admin** - Phone login not allowed for admin accounts
✅ **Role verification** - Backend confirms admin role before granting access
✅ **Protected routes** - `/admin-dashboard` checks for admin role on page load
✅ **Automatic redirect** - Non-admin users and non-authenticated users redirected appropriately

---

## 📁 Files Created/Modified

### New Files:
- `src/app/admin-dashboard/page.tsx` - Admin dashboard page

### Modified Files:
- `src/app/login/page.tsx` - Added user/admin toggle and validation
- `src/components/Navbar.tsx` - Role-based navigation rendering

---

## 💡 Usage Example

### As a Regular User:
1. Go to `/login`
2. Leave "User" tab selected (default)
3. Enter email/phone and password
4. Click "Login"
5. Redirected to `/shows` to browse and book movies

### As an Admin:
1. Go to `/login`
2. Click "Admin" tab
3. Enter admin email and password
4. Click "Admin Login"
5. Redirected to `/admin-dashboard`
6. Can create new shows, view bookings, manage content

---

## 🎨 UI/UX Changes

### Login Page:
- Dual toggle tabs at the top
- Red button for User login
- Blue button for Admin login
- Dynamic placeholder text
- Context-aware messaging

### Admin Dashboard:
- Professional dark theme
- Header with admin name
- Grid-based show layout
- Modal form for creating shows
- Real-time form validation

---

## 🚀 How to Test

1. **Start both servers:**
   ```bash
   # Terminal 1
   cd movie-booking-backend && npm run dev
   
   # Terminal 2
   cd movie-booking-frontend && npm run dev
   ```

2. **Admin Login:**
   - Go to http://localhost:3000/login
   - Click "Admin" tab
   - Enter: `admin@example.com` / `admin123`
   - Click "Admin Login"

3. **Create a Show:**
   - Click "+ Create New Show"
   - Fill in all fields
   - Click "Create Show"
   - See it appear in the grid

4. **Regular User Login:**
   - Go to http://localhost:3000/login
   - Keep "User" tab selected (default)
   - Enter: `john@example.com` / `password123`
   - Click "Login"
   - Browse shows and make bookings

---

## ✨ Future Enhancements

Potential features to add:
- View all bookings on admin dashboard
- Edit existing shows
- Delete shows
- View booking statistics/analytics
- Manage admin users
- OTP verification for admin login
- Two-factor authentication

---

**Status:** ✅ **Complete and Tested**
