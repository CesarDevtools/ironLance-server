# IronLance - Backend

## Description

**IronLance** is a job board platform that connects Ironhack alumni (Ironhackers) with companies offering job opportunities. This is the **Backend API** built with **Express**.

### Technologies Used

- **Express.js** - Web framework
- **MongoDB / Mongoose** - Database and ODM
- **JSON Web Token (JWT)** - Authentication
- **Bcrypt** - Password hashing
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **Dotenv** - Environment variable management

### Related Repository

The frontend for this application is hosted in a separate repository. You can find it here:

🔗 **[IronLance Frontend (React)](https://github.com/CesarDevtools/ironLance-client)**

---

## Instructions to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/CesarDevtools/ironLance-server.git
cd ironlance-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ironlance

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URL (for CORS)
ORIGIN=http://localhost:5173
```

> **Database Setup:** You need a MongoDB instance running locally or use MongoDB Atlas. If using local MongoDB, make sure it's running before starting the server.

### 4. Seed the database (Optional but recommended)

This project includes a `seeds.js` file that populates the database with sample data for testing purposes.

**What the seed creates:**
- **3 Companies:** Google, Meta, and Amazon (password: `Password123`)
- **20 Ironhackers:** Sample students with profiles (password: `Password123`)
- **30 Job Listings:** Various positions across the companies

**To seed the database:**

```bash
npm run seed
```

> **Note:** Running the seed will **delete all existing data** and replace it with the sample data.

**Test Accounts:**

| Role | Email | Password |
|------|-------|----------|
| Company | `google@google.com` | `Password123` |
| Company | `meta@meta.com` | `Password123` |
| Company | `amazon@amazon.com` | `Password123` |
| Ironhacker | `estudiante1@ironhackers.com` | `Password123` |

### 5. Run the application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The API will be available at `http://localhost:5000/api`

---

## Demo

🌐 **API Base URL:** [https://ironlance-server.vercel.app](https://ironlance-server.vercel.app/)

> The backend is deployed on Vercel alongside the frontend.

---

## API Endpoints Documentation

### Base

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check endpoint | No |

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user (Ironhacker or Company) | No |
| POST | `/auth/login` | Login and receive JWT token | No |
| PUT | `/auth/update` | Update user profile and regenerate token | Yes |
| GET | `/auth/verify` | Verify current token | Yes |

### Jobs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/jobs` | List all active job postings | No |
| GET | `/jobs/:id` | Get job details | No |
| POST | `/jobs` | Create a new job (Company only) | Yes |
| PUT | `/jobs/:id` | Update a job (Owner only) | Yes |
| DELETE | `/jobs/:id` | Delete a job and its applications (Owner only) | Yes |
| GET | `/my-jobs` | Get company's own job postings | Yes (Company) |

### Applications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/applications` | Apply to a job (Ironhacker only) | Yes |
| GET | `/my-applications` | Get my applications (Ironhacker) | Yes |
| GET | `/applications/:id` | Get application details (Company owner) | Yes |
| GET | `/jobs/:jobId/applications` | Get applicants for a job (Company owner) | Yes |
| PUT | `/applications/:id` | Update application status (Company owner) | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/ironhackers` | List public Ironhacker profiles (Company only) | Yes |
| GET | `/users/:userId` | Get Ironhacker profile details | Yes |

---

## Request/Response Notes

- **Authentication:** All protected routes require a JWT token sent via HTTP-only cookie.
- **Roles:** Users have either `IRONHACKER` or `COMPANY` role, determining their access to certain endpoints.
- **Error Handling:** Returns appropriate HTTP status codes (400, 401, 403, 404, 500) with JSON error messages.