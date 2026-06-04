# Store Ratings Platform

A full-stack web application that allows users to submit and manage ratings for stores registered on the platform.

## Features

### Authentication & Authorization

* JWT-based authentication
* Role-based access control
* Secure password hashing
* Change password functionality

### User Roles

#### System Administrator

* Manage users and stores
* Create Admin, User, and Store Owner accounts
* View platform statistics
* Filter and search users and stores

#### Normal User

* Register and login
* Browse stores
* Search stores by name and address
* Submit and update store ratings
* View personal ratings

#### Store Owner

* View ratings submitted for their store
* Monitor average store rating
* Access store-specific dashboard

## Tech Stack

### Frontend

* React.js
* React Router
* Axios

### Backend

* Express.js
* JWT Authentication
* Bcrypt

### Database

* PostgreSQL
* Prisma ORM

## Database Schema

### Users

* id
* name
* email
* password
* address
* role

### Stores

* id
* name
* email
* address
* ownerId

### Ratings

* id
* userId
* storeId
* rating

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd store-ratings-app
```

### Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=
JWT_SECRET=
PORT=5000
```

### Run Application

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm start
```

## Project Structure

```text
store-ratings-app
├── backend
│   ├── src
│   ├── prisma
│   └── package.json
│
├── frontend
│   ├── src
│   └── package.json
│
└── README.md
```

## Future Enhancements

* Pagination
* Dashboard charts
* Docker support
* Automated testing
* CI/CD pipeline

## Author

Arav Patel
