# MarketHub — Multi-Vendor E-Commerce Marketplace

[![Production Ready](https://img.shields.io/badge/Production-Ready-emerald.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20PostgreSQL-indigo.svg)](#)
[![Internship](https://img.shields.io/badge/CodSoft-Task%204-orange.svg)](#)

MarketHub is an enterprise-grade multi-vendor e-commerce marketplace platform connecting **Customers**, **Vendors/Sellers**, **Delivery Logistics Partners**, and **Marketplace Administrators** within a single unified ecosystem.

Built with a decoupled **React + Vite** frontend, a scalable **Node.js + Express REST API**, and a robust **PostgreSQL** relational database managed via **Prisma ORM**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Project Structure](#6-project-structure)
7. [Database Design & Entity Relationships](#7-database-design--entity-relationships)
8. [Database Indexing Strategy](#8-database-indexing-strategy)
9. [Prerequisites](#9-prerequisites)
10. [Environment Variables](#10-environment-variables)
11. [Installation & Setup](#11-installation--setup)
12. [Database Migration & Seeding](#12-database-migration--seeding)
13. [Running Frontend & Backend](#13-running-frontend--backend)
14. [Demo Accounts & Credentials](#14-demo-accounts--credentials)
15. [REST API Documentation](#15-rest-api-documentation)
16. [Commission & Multi-Vendor Payout Model](#16-commission--multi-vendor-payout-model)
17. [Testing & Verification](#17-testing--verification)
18. [Future Improvements](#18-future-improvements)

---

## 1. Project Overview

Modern e-commerce requires complex transactions where a single shopping cart can contain items originating from separate independent vendors. MarketHub solves this challenge with an atomic multi-vendor architecture:

- **Unified Shopping Experience**: Shoppers browse products across diverse categories, compare side by side, and check out with multiple vendors simultaneously.
- **Automated Sub-Orders**: When an order is placed, MarketHub splits it into merchant-specific `VendorOrder` records so each vendor only sees their own fulfillment workload.
- **Configurable Marketplace Commission**: MarketHub automatically computes the platform fee (`Order Total - Commission = Vendor Net Earnings`) and logs payout records.
- **Carrier Logistics Integration**: Integrated delivery dashboard allowing courier partners to pick up, update transit milestones, and deliver packages with sandbox verification.

---

## 2. Key Features

### Customer Experience
- **Live Search & Autocomplete**: Instant search suggestions across titles, categories, and brands.
- **Multi-Faceted Filtering**: Filter by category, price slider, minimum customer rating, availability, and active sales.
- **Product Comparison**: Side-by-side spec comparison table for up to 4 products with direct add-to-cart.
- **Persistent Cart & Wishlist**: Multi-vendor grouped cart with live quantity controls and promotional coupons.
- **Checkout & Sandbox Payments**: Cash on Delivery (COD), Card (with test card autofill), and UPI simulators.
- **Visual Order Milestone Tracker**: Step timeline: `Order Placed` &rarr; `Confirmed` &rarr; `Processing` &rarr; `Shipped` &rarr; `Out for Delivery` &rarr; `Delivered`.
- **Verified Buyer Reviews**: Star ratings and reviews allowed only for verified purchasers.
- **In-App Notification Feed**: Milestone alerts for orders, shipments, and promo codes.

### Vendor Portal
- **Telemetry Dashboard**: Gross Sales, Net Earnings, Marketplace Commission, Order Volumes, and Recharts sales timeline.
- **Product Management**: Full CRUD operations with rich specifications, stock limits, SKU codes, and gallery URLs.
- **Inventory & Warehouse Control**: Live stock reservation, low-stock threshold alerts, and inline quick-stock updates.
- **Fulfillment Operations**: Review sub-orders, accept orders, and mark them as `CONFIRMED`, `PROCESSING`, and `SHIPPED`.
- **Store Promotions**: Create custom promotional discount vouchers (Percentage or Fixed amount).
- **Financials Ledger**: Complete financial audit trail detailing gross sales, marketplace deductions, and payout balances.

### Delivery Partner Hub
- **Mobile-Responsive Logistics View**: Dispatch jobs assigned to the carrier partner.
- **Customer Coordinates**: Direct address navigation, recipient phone dialing, and COD collection requirements.
- **Milestone Progressions**: Advance orders from `ASSIGNED` &rarr; `PICKED_UP` &rarr; `OUT_FOR_DELIVERY` &rarr; `DELIVERED`.
- **Sandbox OTP Verification**: Simulated delivery confirmation on doorstep handover.

### Administrator Console
- **Platform Telemetry**: Gross Merchandise Value (GMV), total marketplace commission, active orders, and vendor counts.
- **Vendor Governance**: Inspect vendor registrations with one-click `APPROVE`, `REJECT`, or `SUSPEND` actions.
- **User Directory**: Centralized user database with role filters and instant account deactivation/activation.
- **Taxonomy Management**: Create and edit categories with cover images and slug identifiers.
- **Master Order Oversight**: View all parent and child orders, override statuses, and assign delivery partners.
- **Commission Settlement**: Audit vendor net earnings and clear payout disbursements.

---

## 3. User Roles & Permissions

| Role | Permissions & Access Scope |
| :--- | :--- |
| **`CUSTOMER`** | Browse catalog, search, wishlist, multi-vendor cart, sandbox checkout, order tracking, product reviews, profile. |
| **`VENDOR`** | Dedicated vendor portal, manage store products, inventory stock adjustments, vendor orders, promotions, revenue analytics. |
| **`DELIVERY_PARTNER`** | Dedicated logistics portal, view assigned packages, update transit status (`PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`). |
| **`ADMIN`** | Complete marketplace governance, vendor approvals, user security, category taxonomy, order management, commission payouts, analytics. |

---

## 4. Technology Stack

### Frontend
- **React 19** with **Vite 6** (Fast HMR, modern build pipeline)
- **React Router DOM 7** (Declarative client routing & protected routes)
- **Tailwind CSS 3** (Custom responsive design system & palette)
- **Axios** (Configured with request/response interceptors & token refresh)
- **Lucide React** (Consistent modern iconography)
- **Recharts** (Interactive business intelligence area, pie, and bar charts)

### Backend
- **Node.js (v20+)** & **Express.js 4**
- **JSON Web Tokens (JWT)** for stateless persistent authentication
- **bcryptjs** for salted password hashing
- **Role-Based Access Control (RBAC)** middleware
- **Centralized Error Handling** with mapped HTTP status codes

### Database & ORM
- **PostgreSQL 17** (Enterprise ACID-compliant relational database)
- **Prisma ORM 6** (Type-safe query engine, migrations, and schema validation)
- In-memory caching layer with Redis-compatible interface for high throughput

---

## 5. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite Client                  │
│   (Customer Storefront / Vendor / Delivery / Admin)    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP REST (JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Node.js + Express REST API               │
│   Auth / Products / Cart / Orders / Vendor / Admin     │
└────────────┬─────────────────────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐    ┌──────────────────────────┐
│   Prisma ORM Client    │    │ Memory Cache / Redis Opt │
└────────────┬───────────┘    └──────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                   │
│   Users, Vendors, Products, Orders, Sub-Orders, etc.   │
└────────────────────────────────────────────────────────┘
```

---

## 6. Project Structure

```
CodSoft/MarketHub/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # Reusable UI (Button, Input, Modal, ProductCard, Navbar, etc.)
│   │   ├── context/          # Context Providers (Auth, Cart, Wishlist, Compare, Toast, Notif)
│   │   ├── hooks/
│   │   ├── layouts/          # CustomerLayout, VendorLayout, AdminLayout, DeliveryLayout
│   │   ├── pages/            # Customer, Auth, Vendor, Delivery, Admin pages
│   │   ├── routes/           # Protected routes and navigation tree
│   │   ├── services/         # Axios API client
│   │   ├── utils/            # Formatters and status helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma     # Relational models and indexes
│   │   └── seed.js           # 52 Products, 5 Vendors, 20 Customers, Admin, Orders
│   ├── src/
│   │   ├── config/           # Database and cache configuration
│   │   ├── controllers/      # API Controllers
│   │   ├── middleware/       # Auth, role guard, error handler
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/
│   │   ├── utils/            # JWT, encryption helpers
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 7. Database Design & Entity Relationships

The relational database enforces data integrity across all multi-vendor operations:

- **`User`** &larr; (1:1) &rarr; **`Vendor`** (for merchant profiles)
- **`User`** &larr; (1:1) &rarr; **`DeliveryPartner`** (for logistics partners)
- **`Vendor`** &larr; (1:N) &rarr; **`Product`**
- **`Category`** &larr; (1:N) &rarr; **`Product`**
- **`Product`** &larr; (1:1) &rarr; **`Inventory`**
- **`Product`** &larr; (1:N) &rarr; **`ProductImage`**
- **`User`** &larr; (1:1) &rarr; **`Cart`** &larr; (1:N) &rarr; **`CartItem`**
- **`User`** &larr; (1:1) &rarr; **`Wishlist`** &larr; (1:N) &rarr; **`WishlistItem`**
- **`User`** &larr; (1:N) &rarr; **`Order`** (Main parent order)
- **`Order`** &larr; (1:N) &rarr; **`OrderItem`**
- **`Order`** &larr; (1:N) &rarr; **`VendorOrder`** (Vendor sub-orders)
- **`VendorOrder`** &larr; (1:1) &rarr; **`Commission`** (Platform fee calculation)
- **`Order`** &larr; (1:1) &rarr; **`Payment`** (Sandbox payment record)
- **`Order`** &larr; (1:1) &rarr; **`Delivery`** &larr; (N:1) &rarr; **`DeliveryPartner`**
- **`Product`** &larr; (1:N) &rarr; **`Review`** &larr; (N:1) &rarr; **`User`**
- **`Vendor`** &larr; (1:N) &rarr; **`Promotion`** &larr; (1:N) &rarr; **`PromotionUsage`**
- **`User`** &larr; (1:N) &rarr; **`Notification`**

---

## 8. Database Indexing Strategy

Prisma schema defines targeted indexes to optimize read queries:
- **`Product`**: `categoryId`, `vendorId`, `name`, `sku`, `price`, `rating`, `status`
- **`Order`**: `userId`, `status`, `createdAt`
- **`VendorOrder`**: `orderId`, `vendorId`, `status`
- **`OrderItem`**: `orderId`, `productId`, `vendorId`
- **`Inventory`**: `status`
- **`Review`**: `productId`, `userId`
- **`Promotion`**: `code`, `isActive`
- **`Commission`**: `vendorId`, `isSettled`

---

## 9. Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher (running on port `5432`)
- **npm** or **yarn**

---

## 10. Environment Variables

Create `.env` inside `server/` with the following parameters:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/markethub?schema=public"
JWT_SECRET="markethub_jwt_secret_production_ready_key_2026"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
REDIS_URL="redis://localhost:6379"
DEFAULT_COMMISSION_PERCENT=10.0
```

---

## 11. Installation & Setup

1. **Clone or navigate to the repository:**
   ```bash
   cd CodSoft/MarketHub
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

## 12. Database Migration & Seeding

1. **Push Prisma Schema to PostgreSQL:**
   ```bash
   cd server
   npx prisma db push
   ```

2. **Seed Realistic Multi-Vendor Data:**
   ```bash
   node prisma/seed.js
   ```
   *Seeds 1 Admin, 5 Approved Vendors, 1 Pending Vendor, 3 Delivery Partners, 20 Customers, 52 Products across 8 Categories, Orders, Reviews, and Coupons.*

---

## 13. Running Frontend & Backend

### Start Backend Server:
```bash
cd server
npm start
# Server listens at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Start Frontend Client:
```bash
cd client
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 14. Demo Accounts & Credentials

The navigation bar features **Instant 1-Click Demo Login Buttons** for instant evaluation of all 4 roles.

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@markethub.com` | `Admin@123` | Full marketplace operator console |
| **Vendor** | `vendor@markethub.com` | `Vendor@123` | TechPulse Global Storefront |
| **Delivery** | `delivery@markethub.com` | `Delivery@123` | Motorcycle Delivery Logistics Partner |
| **Customer** | `customer@markethub.com` | `Customer@123` | Priya Patel (Shopper account) |

---

## 15. REST API Documentation

### Authentication
- `POST /api/auth/register` &mdash; Register customer, vendor, or delivery partner
- `POST /api/auth/login` &mdash; Authenticate and receive JWT token
- `POST /api/auth/logout` &mdash; Terminate session
- `GET /api/auth/me` &mdash; Retrieve authenticated user profile and roles
- `PUT /api/auth/profile` &mdash; Update personal name and phone

### Products & Search
- `GET /api/products` &mdash; Filterable catalog (`search`, `category`, `vendor`, `minPrice`, `maxPrice`, `minRating`, `inStock`, `sort`, `page`, `limit`)
- `GET /api/products/suggestions?q=...` &mdash; Autocomplete matching products & categories
- `GET /api/products/:id` &mdash; Product details with images, specs, reviews & related items
- `POST /api/products` &mdash; Vendor/Admin create new product
- `PUT /api/products/:id` &mdash; Vendor/Admin update product & stock
- `DELETE /api/products/:id` &mdash; Vendor/Admin delete product

### Shopping Cart
- `GET /api/cart` &mdash; Retrieve user cart grouped by vendor with totals
- `POST /api/cart/items` &mdash; Add product to cart with quantity
- `PUT /api/cart/items/:id` &mdash; Modify item quantity
- `DELETE /api/cart/items/:id` &mdash; Remove item
- `DELETE /api/cart` &mdash; Clear entire cart

### Orders & Checkout
- `POST /api/orders` &mdash; Multi-vendor checkout (creates parent `Order`, child `VendorOrder`s, stock decrement, `Payment`, and `Delivery`)
- `GET /api/orders` &mdash; Customer order history
- `GET /api/orders/:id` &mdash; Order details, invoice data, and tracking milestones
- `PUT /api/orders/:id/cancel` &mdash; Cancel order and restore product stock
- `PUT /api/orders/:id/return` &mdash; Request return for delivered package

### Vendor Management
- `GET /api/vendor/dashboard` &mdash; Sales analytics, revenue, top products, pending fulfillment
- `GET /api/vendor/orders` &mdash; Vendor-specific sub-orders
- `PUT /api/vendor/orders/:id/status` &mdash; Advance status (`CONFIRMED`, `PROCESSING`, `SHIPPED`)
- `GET /api/vendor/inventory` &mdash; Warehouse stock levels and low-stock indicators
- `PUT /api/vendor/inventory/:productId` &mdash; Update stock & low-stock safety thresholds
- `GET /api/vendor/promotions` &mdash; List active store discount coupons
- `POST /api/vendor/promotions` &mdash; Create promotional discount code

### Delivery Partner
- `GET /api/delivery/orders` &mdash; List assigned delivery packages
- `PUT /api/delivery/orders/:id/status` &mdash; Update delivery progress (`PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`)

### Administrator Operations
- `GET /api/admin/dashboard` &mdash; Marketplace GMV, commission profits, active deliveries
- `GET /api/admin/vendors` &mdash; List vendor applications
- `PUT /api/admin/vendors/:id/status` &mdash; Approve, reject, suspend, or set commission rate
- `GET /api/admin/users` &mdash; User directory & role filtering
- `PUT /api/admin/users/:id/toggle-status` &mdash; Activate / suspend account
- `GET /api/admin/commissions` &mdash; Commission balance ledger
- `PUT /api/admin/commissions/:id/settle` &mdash; Clear vendor payout disbursement

---

## 16. Commission & Multi-Vendor Payout Model

```
Gross Vendor Subtotal
  - Marketplace Commission Fee (Default: 10%)
  = Net Vendor Payable Earnings
```

1. **Customer Checkout**: Customer pays `₹10,000` across items from Vendor A (`₹6,000`) and Vendor B (`₹4,000`).
2. **Sub-Order Splitting**:
   - Vendor A Sub-Order: `₹6,000` gross &rarr; `₹600` platform fee &rarr; `₹5,400` net vendor payout.
   - Vendor B Sub-Order: `₹4,000` gross &rarr; `₹400` platform fee &rarr; `₹3,600` net vendor payout.
3. **Disbursement Clearance**: Admin console verifies delivery completion and settles payouts.

---

## 17. Testing & Verification

An automated end-to-end integration test is provided in `server/src/test-e2e.js`:

```bash
cd server
node src/test-e2e.js
```

The test validates:
- System health
- Customer authentication
- Catalog queries & search
- Multi-vendor cart grouping
- Promotional discount validation
- Multi-vendor checkout & transaction splitting
- Vendor portal order recognition
- Delivery partner package tracking
- Admin approval & commission settlement

---

## 18. Future Improvements

- Automated AWS S3 / Cloudflare R2 bucket integration for direct file uploads.
- Real-time WebSocket / Socket.io live driver location tracking on interactive maps.
- Automated payment gateway webhooks (Stripe / Razorpay live webhooks).
- PDF invoice generation engine with downloadable receipts.

---

*Crafted for CodSoft Full-Stack Web Development Internship — Task 4.*
