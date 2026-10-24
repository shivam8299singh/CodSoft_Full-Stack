# DineDesk — Restaurant Ordering & Table Management Platform

> **CodSoft Internship Task 2: Full-Stack Web Development Project**  
> An enterprise-grade, full-stack restaurant software platform connecting Customers, Floor Staff, Kitchen Chefs, and Administrators.

---

## 1. Project Overview

**DineDesk** is a modern, production-style restaurant management platform designed to digitize dining room and online delivery operations. It streamlines the lifecycle of restaurant hospitality:
- **Customers** browse an interactive digital menu, place dine-in, takeaway, or delivery orders, track kitchen cooking status in real-time, and reserve dining tables.
- **Restaurant Staff** view incoming orders, coordinate live floor tables (Available, Reserved, Occupied, Cleaning), manage reservations, and seat dining guests.
- **Kitchen Staff** work with an interactive Kitchen Display System (KDS) organized into ticket columns with real-time timers and cooking stage updates.
- **Administrators** control menu items, pricing, categories, staff accounts, floor tables, payment receipts, and financial analytics via Recharts.

---

## 2. Key Features

- **Digital Menu & Culinary Catalog**: 32+ gourmet menu items across 8 categories (Starters, Main Course, Pizza, Burgers, Indian, Chinese, Desserts, Beverages) with high-definition food photography, dietary indicators (Veg/Non-Veg), spice/ingredient notes, ratings, and preparation times.
- **Real-Time Filtering & Search**: Instant full-text search, category pills, Pure Vegetarian toggle, and multi-parameter sorting (Price, Rating, Name).
- **Dish Customization Modal**: Real-time add-on selections (Extra cheese, Gluten-free, Extra spicy, No onion/garlic) and custom kitchen instructions with automatic pricing computation.
- **Persistent Shopping Cart**: Slide-out cart drawer and dedicated cart page, quantity steppers, subtotal, 5% GST tax calculation, and flat delivery fees.
- **Multi-Mode Checkout**:
  - **Dine In**: Interactive table selector linked to available floor tables.
  - **Takeaway**: Pickup instructions and customer contact.
  - **Delivery**: Delivery address, landmark, and contact details.
- **Live Order Tracking**: Visual progress stepper (`PLACED` → `CONFIRMED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED`). Public lookup by Order Reference (e.g. `ORD-1001`).
- **Table Reservation System**: Guest booking calendar with time slots, party size (1–12 guests), seating zones (Indoor, Patio, Rooftop, VIP), and auto-table assignment.
- **Kitchen Display System (KDS)**: Kanban ticket display for chefs with elapsed time badges, special notes highlights, and 1-click status transitions.
- **Floor Table Management**: Interactive table matrix showing real-time states (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `CLEANING`).
- **Simulated Payment Sandbox**: Safe payment flow supporting Card, UPI, and Cash on Service with auto-generated transaction references and status updates.
- **Admin Control & Visual Analytics**: Interactive Recharts visualizations displaying daily revenue trends, order volume, status breakdown, and best-selling dishes.
- **1-Click Demo Logins**: Instant credential buttons on the login screen to test Admin, Staff, Kitchen, and Customer roles with zero manual typing.

---

## 3. User Roles & Permissions

| Role | Permissions & Workflows |
| :--- | :--- |
| **CUSTOMER** | Browse menu, customize dishes, manage cart, place orders, reserve tables, track orders, view order history, cancel pending reservations, edit profile. |
| **STAFF** | Floor management, view incoming orders, seat reservations, update order stages, track active kitchen tickets, review customer directory. |
| **KITCHEN** | Access Kitchen Display System (KDS), view ordered items and special cooking notes, transition orders from `PLACED` → `PREPARING` → `READY`. |
| **ADMIN** | Full administrative access: manage dishes & categories, create staff/kitchen accounts, manage tables, override order statuses, view transaction logs, access financial analytics, configure restaurant tax & delivery fees. |

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 + Vite (Clean SPA, NO Next.js)
- **Routing**: React Router DOM v6 (Nested layouts, protected routes, role guards)
- **Styling**: Tailwind CSS 3.4 (Modern culinary color palette, glassmorphism, responsive grid)
- **Icons**: Lucide React
- **HTTP Client**: Axios with request/response interceptors & Bearer JWT token handling
- **Form Management**: React Hook Form
- **Data Visualization**: Recharts (Line charts, Donut charts, Bar charts)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Architecture**: MVC & REST API with centralized error handling
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs password hashing
- **Security**: Role-Based Access Control (RBAC), CORS middleware, environment isolation
- **Logging**: Morgan HTTP logger

### Database & ORM
- **Database Engine**: PostgreSQL 17
- **ORM**: Prisma ORM (Schema migrations, relational models, typesafe queries, seed scripting)

---

## 5. Architectural Flow

```
[ React + Vite Client ]
          │  HTTP / REST (Axios + JWT)
          ▼
[ Express.js REST API ]
    ├── authRoutes
    ├── menuRoutes & categoryRoutes
    ├── orderRoutes & paymentRoutes
    ├── tableRoutes & reservationRoutes
    ├── dashboardRoutes
    └── userRoutes & settingRoutes
          │
          ▼
[ Prisma ORM Client ]
          │  TCP / 5432
          ▼
[ PostgreSQL 17 Database ]
    ├── User
    ├── Category & MenuItem
    ├── RestaurantTable & Reservation
    ├── Order & OrderItem
    ├── Payment
    └── RestaurantSetting
```

---

## 6. Folder Structure

```
Task2-DineDesk/
│
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Select, Modal, ConfirmDialog, Badge, Spinner
│   │   │   ├── layout/         # Navbar, Footer, Sidebar, DashboardLayout, CustomerLayout
│   │   │   ├── menu/           # FoodCard, FoodFilter, FoodDetailModal
│   │   │   ├── cart/           # CartDrawer
│   │   │   ├── orders/         # OrderTimeline, OrderDetailModal
│   │   │   └── tables/         # TableCard
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── pages/
│   │   │   ├── public/         # HomePage, MenuPage, ReservationPage, CartPage, CheckoutPage, OrderTrackPage, AboutPage
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── customer/       # CustomerDashboard, Orders, Reservations, Profile
│   │   │   ├── kitchen/        # KitchenDashboard (KDS)
│   │   │   ├── staff/          # StaffDashboard, Orders, Reservations, Tables, Customers
│   │   │   ├── admin/          # AdminDashboard, Menu, Categories, Tables, Orders, Users, Payments, Settings
│   │   │   └── NotFoundPage.jsx
│   │   ├── routes/             # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── services/           # api.js, authService, menuService, orderService, etc.
│   │   ├── utils/              # constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma       # Relational database models
│   │   └── seed.js             # Realistic demo seeder
│   ├── src/
│   │   ├── config/             # db.js (Prisma singleton)
│   │   ├── controllers/        # Express request handlers
│   │   ├── middleware/         # auth, roles, errorHandler
│   │   ├── routes/             # Express API routers
│   │   ├── utils/              # response.js, jwt.js
│   │   ├── app.js              # Express app setup & CORS
│   │   └── server.js           # Server listen & database check
│   ├── .env.example
│   ├── package.json
│   └── test-api.js             # Automated API test suite
│
├── .gitignore
└── README.md
```

---

## 7. Database Schema Overview

```
User (id, name, email, password, phone, role [CUSTOMER|STAFF|KITCHEN|ADMIN])
  ├── hasMany Orders
  ├── hasMany Reservations
  └── hasMany CartItems

Category (id, name, slug, description, image)
  └── hasMany MenuItems

MenuItem (id, name, description, price, categoryId, ingredients, imageUrl, isVegetarian, isAvailable, rating, prepTime)
  └── hasMany OrderItems

RestaurantTable (id, tableNumber, capacity, location [Indoor|Patio|Rooftop|VIP], status [AVAILABLE|RESERVED|OCCUPIED|CLEANING])
  ├── hasMany Reservations
  └── hasMany Orders

Reservation (id, customerId, customerName, customerPhone, tableId, guestsCount, reservationDate, reservationTime, status)

Order (id, orderNumber, customerId, customerName, orderType [DINE_IN|TAKEAWAY|DELIVERY], tableId, subtotal, tax, deliveryFee, totalAmount, status)
  ├── hasMany OrderItems
  └── hasOne Payment

Payment (id, orderId, amount, paymentMethod [CASH|CARD|ONLINE], status [PENDING|PAID|FAILED|REFUNDED], transactionId, paidAt)

RestaurantSetting (id, name, tagline, email, phone, address, taxRate, deliveryFee, openingHours)
```

---

## 8. Installation

Clone or locate the repository:
```bash
cd CodSoft/Task2-DineDesk
```

Install server and client dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## 9. PostgreSQL Setup

Ensure PostgreSQL is running locally on port `5432`. Create a dedicated database for the application:
```sql
CREATE DATABASE dinedesk;
```

---

## 10. Environment Variables

Create `server/.env` with your PostgreSQL credentials and JWT secret:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/dinedesk?schema=public"
JWT_SECRET="dinedesk_super_secret_jwt_key_restaurant_management_2026"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

A template is provided in `server/.env.example`.

---

## 11. Prisma Setup & Database Generation

From the `server/` directory:
```bash
cd server
npx prisma generate
```

---

## 12. Migration & Schema Push Commands

Synchronize your PostgreSQL database with the Prisma schema:
```bash
npx prisma db push
```

---

## 13. Seed Commands

Populate the database with realistic demo data (32+ menu items, 12 tables, sample orders, reservations, and 4 role accounts):
```bash
node prisma/seed.js
```
*(Or use shortcut: `npm run db:setup` which runs generate, db push, and seed in sequence).*

---

## 14. Running the Backend

From the `server/` directory:
```bash
npm run dev
# Or for standard production start:
npm start
```
The server will start on `http://localhost:5000` with the health check available at `http://localhost:5000/api/health`.

---

## 15. Running the Frontend

From the `client/` directory:
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 16. Demo Credentials

You can use the **1-Click Demo Login** buttons on the `/login` page or use these credentials:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@dinedesk.com` | `admin123` | `/admin` |
| **👔 Staff** | `staff@dinedesk.com` | `staff123` | `/staff` |
| **🍳 Kitchen** | `kitchen@dinedesk.com` | `kitchen123` | `/kitchen` |
| **🛒 Customer** | `customer@dinedesk.com` | `customer123` | `/customer` |

---

## 17. REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a customer account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get authenticated user profile
- `PUT /api/auth/profile` — Update name, phone, or password

### Digital Menu & Categories
- `GET /api/menu` — Filter menu by category, search query, vegetarian, sorting
- `GET /api/menu/:id` — Get dish details
- `POST /api/menu` — (Admin) Create dish
- `PUT /api/menu/:id` — (Admin) Update dish
- `PATCH /api/menu/:id/availability` — (Admin/Staff) Toggle dish availability
- `DELETE /api/menu/:id` — (Admin) Delete dish
- `GET /api/categories` — Get all categories with dish counts
- `POST /api/categories` — (Admin) Create category

### Orders & Tracking
- `POST /api/orders` — Create new order (Dine-in, Takeaway, Delivery)
- `GET /api/orders/track/:orderNumber` — Public tracking endpoint
- `GET /api/orders/my` — Customer order history
- `GET /api/orders` — (Staff/Kitchen/Admin) Filtered order queue
- `PATCH /api/orders/:id/status` — Advance order status (`PLACED` → `CONFIRMED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED`)

### Table Management & Reservations
- `GET /api/tables` — List tables by location, capacity, and status
- `POST /api/tables` — (Admin) Add new table
- `PATCH /api/tables/:id/status` — (Staff/Admin) Change table status
- `POST /api/reservations` — Book a table
- `GET /api/reservations/my` — Customer table bookings
- `GET /api/reservations` — (Staff/Admin) Reservation ledger
- `PATCH /api/reservations/:id/status` — Confirm, seat, or cancel reservation

### Payments & Dashboard Analytics
- `POST /api/payments/process` — Process simulated payment
- `GET /api/payments` — (Admin) Transaction log
- `GET /api/dashboard/admin` — Financial KPIs, daily revenue charts, popular dishes
- `GET /api/dashboard/staff` — Operational floor metrics, today's bookings
- `GET /api/dashboard/kitchen` — Live KDS tickets grouped by stage
- `GET /api/dashboard/customer` — Customer stats and active orders

---

## 18. Automated API Verification

To verify all backend endpoints automatically, run:
```bash
node server/test-api.js
```
Expected output:
```
1. Health Check: PASSED ✅
2. Admin Login: PASSED ✅
3. Menu Fetch: PASSED ✅ (32 items)
4. Categories Fetch: PASSED ✅ (8 categories)
5. Tables Fetch: PASSED ✅ (12 tables)
6. Admin Dashboard: PASSED ✅
7. Kitchen Dashboard: PASSED ✅
🎉 ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!
```

---

## 19. Future Improvements

1. **WebSocket / Socket.io Sync**: Implement real-time WebSockets to broadcast incoming order tickets directly to the kitchen display without periodic polling.
2. **Table QR Code Generation**: Dynamic QR codes placed on physical tables that auto-populate the table ID when scanned by a dining guest's smartphone camera.
3. **Live Payment Gateway**: Production integration with Stripe or Razorpay for live card transactions.
4. **Kitchen Ticket Thermal Printing**: Integration with ESC/POS thermal receipt printers.
