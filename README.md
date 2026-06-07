# ModernShop Pro 🛒

> A production-ready, Amazon-like e-commerce platform built with the MERN stack. Features a stunning premium UI, Stripe payments, Cloudinary storage, JWT authentication, and a full Admin Dashboard.

![ModernShop Pro Banner](https://via.placeholder.com/1200x400/6d28d9/ffffff?text=ModernShop+Pro)

## ✨ Features

### Customer
- 🔐 JWT Auth (Register, Login, Forgot/Reset Password)
- 🛍️ Browse, Search & Filter Products
- 🛒 Shopping Cart with Coupon Support
- ❤️ Wishlist Management
- 💳 Stripe Payment Integration
- 📦 Order Tracking with Status Timeline
- ⭐ Product Reviews & Ratings
- 👤 Profile & Address Management

### Admin
- 📊 Analytics Dashboard with Charts
- 📦 Product & Category Management
- 🧾 Order Management & Status Updates
- 👥 User Management
- 🏷️ Coupon Management
- 💬 Review Moderation
- 📉 Low Stock Alerts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | Redux Toolkit, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, Bcrypt |
| Payments | Stripe |
| Storage | Cloudinary |
| Email | Nodemailer |

---

## 📁 Project Structure

```
modernshop-pro/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios API functions
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store & slices
│   │   └── utils/          # Utilities
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # DB & Cloudinary config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── scripts/            # Seed scripts
│   ├── services/           # Email & Stripe
│   ├── utils/              # Utilities
│   └── server.js           # App entry point
└── package.json            # Root monorepo
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- Stripe account (test keys)
- Cloudinary account
- Gmail app password (for emails)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/modernshop-pro.git
cd modernshop-pro
npm run install:all
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/modernshop
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=ModernShop Pro <noreply@modernshoppro.com>

ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@modernshoppro.com
ADMIN_PASSWORD=Admin@123456

TAX_RATE=0.10
SHIPPING_THRESHOLD=50
SHIPPING_COST=5.99
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_APP_NAME=ModernShop Pro
```

### 3. Seed Database

```bash
npm run seed
```

This creates:
- Admin user (credentials from `.env`)
- 6 default categories
- 10 sample products

### 4. Run Development Server

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@modernshoppro.com | Admin@123456 |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filter/sort/paginate) |
| GET | `/api/products/:id` | Get product details |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/new-arrivals` | New arrivals |
| GET | `/api/products/best-sellers` | Best sellers |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my-orders` | User's orders |
| GET | `/api/orders/:id` | Order details |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/admin/orders` | All orders (Admin) |
| PUT | `/api/admin/orders/:id/status` | Update status (Admin) |

---

## 💳 Stripe Testing

Use Stripe test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

For Stripe webhooks locally, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd client
npm run build
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_API_URL` = your Render backend URL
- `VITE_STRIPE_PUBLISHABLE_KEY` = your Stripe publishable key

### Backend → Render

1. Connect GitHub repo to Render
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add all environment variables from `server/.env`

### Database → MongoDB Atlas

1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add IP whitelist: `0.0.0.0/0` (allow all for Render)
3. Copy connection string to `MONGO_URI`

---

## 🔒 Security Features

- JWT Access + Refresh Token rotation
- Bcrypt password hashing (12 rounds)
- HTTP-only secure cookies
- Helmet.js security headers
- CORS with origin whitelist
- MongoDB injection sanitization
- XSS protection
- Rate limiting (20 req/15min for auth, 200 req/15min for API)
- Input validation with express-validator

---

## 📄 License

MIT License — feel free to use for commercial projects.

---

## 🙌 Credits

Built with ❤️ using the MERN stack. Design inspired by modern e-commerce leaders.
