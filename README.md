# Store Ratings App

A full-stack web application that allows users to submit ratings for stores registered on the platform. Built as a portfolio project to demonstrate full-stack development skills including role-based authentication, RESTful API design, and relational database management.

---

## Tech Stack

**Backend**
- Node.js + Express.js
- PostgreSQL (database)
- Prisma ORM (schema + migrations)
- JWT (authentication)
- bcryptjs (password hashing)

**Frontend**
- React + Vite
- React Router DOM (routing)
- Axios (API requests)
- React Hook Form (form validation)

---

## Features

### Three User Roles

**System Administrator**
- Dashboard with total users, stores, and ratings count
- Add new users (Admin, Normal User, Store Owner)
- Add new stores and assign them to store owners
- View and filter all users by name, email, address, and role
- View and filter all stores by name and address
- Sortable tables (ascending/descending) for all key fields

**Normal User**
- Register and log in
- Browse all registered stores
- Search stores by name and address
- Submit a rating (1–5 stars) for any store
- Update a previously submitted rating
- View their own submitted rating on each store card
- Change password

**Store Owner**
- Log in to their account
- View all users who have rated their store
- See their store's average rating
- Change password

---

## Form Validations

| Field    | Rule |
|----------|------|
| Name     | 6–60 characters |
| Address  | Max 400 characters |
| Password | 8–16 characters, at least one uppercase letter and one special character |
| Email    | Standard email format |

---

## Project Structure

```
store-ratings-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.js       # Prisma client instance
│   │   │   └── seed.js         # Database seeder
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT authentication + role authorization
│   │   ├── modules/
│   │   │   ├── auth/           # Login, register, change password
│   │   │   ├── users/          # User CRUD + dashboard stats
│   │   │   ├── stores/         # Store CRUD + owner dashboard
│   │   │   └── ratings/        # Submit and update ratings
│   │   └── index.js            # Express server entry point
│   ├── .env                    # Environment variables (not committed)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with auth interceptor
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state
    │   └── pages/
    │       ├── auth/           # Login, Register
    │       ├── admin/          # Dashboard, UserList, StoreList, AddUser, AddStore
    │       ├── user/           # Store listing with ratings
    │       ├── owner/          # Owner dashboard
    │       └── shared/         # Change Password
    └── package.json
```

---

## Database Schema

Three tables with the following relationships:

- `users` — stores all roles (ADMIN, USER, STORE_OWNER) via a role field
- `stores` — each store has an `ownerId` foreign key pointing to a user
- `ratings` — links users and stores with a `UNIQUE(userId, storeId)` constraint (one rating per user per store)

Average ratings are computed dynamically via SQL aggregation — not stored as a column.

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/store-ratings-app.git
cd store-ratings-app
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/store_ratings_db"
JWT_SECRET="your-secret-key"
PORT=5000
```

Run database migrations:

```bash
npx prisma migrate dev
```

Seed the database with initial users:

```bash
node src/config/seed.js
```

Start the backend server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Default Credentials (after seeding)

| Role        | Email                  | Password        |
|-------------|------------------------|-----------------|
| Admin       | admin_1@gmail.com      | Password@admin1 |
| Normal User | user_1@gmail.com       | Password@user1  |
| Store Owner | owner_1@gmail.com      | Password@owner1 |

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| PUT | `/api/auth/change-password` | Authenticated |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users` | Admin |
| GET | `/api/users/dashboard` | Admin |
| GET | `/api/users/:id` | Admin |
| POST | `/api/users` | Admin |

### Stores
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/stores` | Authenticated |
| GET | `/api/stores/:id` | Authenticated |
| POST | `/api/stores` | Admin |
| GET | `/api/stores/owner/dashboard` | Store Owner |

### Ratings
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/ratings` | Normal User |
| PUT | `/api/ratings/:id` | Normal User |
| GET | `/api/ratings/my-rating/:storeId` | Normal User |

---

## Key Implementation Details

- Passwords are hashed using bcryptjs before storage — raw passwords are never saved
- JWT tokens contain the user's `id` and `role`, and expire after 7 days
- Role-based access is enforced on both the frontend (ProtectedRoute) and backend (authorize middleware)
- The `UNIQUE(userId, storeId)` constraint on the ratings table is enforced at the database level, preventing duplicate ratings
- All tables support ascending/descending sorting on key fields
- Filtering is case-insensitive and supports partial matches

---

## Screenshots

> Add screenshots of the login page, admin dashboard, store listing, and owner dashboard here.

---

## License

This project is open source and available under the [MIT License](LICENSE).