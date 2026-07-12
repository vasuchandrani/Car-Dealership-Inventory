# CARPORT - Car Dealership Inventory System

CARPORT is a premium, modern, and secure Car Dealership Inventory Management System. It features a responsive customer-facing showcase for searching, filtering, and booking cars alongside a comprehensive admin control room for inventory management, secure payments, and image uploads.

---

## Technical Stack

*   **Backend API**: Java 21 / Spring Boot 3.5 (RESTful Web Services, Spring Security JWT, JPA/Hibernate, Transaction Management)
*   **Database**: PostgreSQL
*   **Frontend SPA**: React 19, React Router v7, Axios, Tailwind CSS v4
*   **Integrations**: 
    *   **Cloudinary**: High-resolution image storage and management.
    *   **Razorpay**: Payment processing checkout and dynamic HMAC-SHA256 signature verification.

---

## Features

1.  **User Authentication & Security**:
    *   Full registration and login flow for customers.
    *   Secure stateless token-based authentication (JWT) with automated interceptor headers in frontend API calls.
    *   Pre-seeded Admin credentials for administrative catalog access.
2.  **Customer Showroom**:
    *   Responsive vehicle catalog with real-time stock indicators.
    *   Granular filter options: search by Make, Model, Category, and Price Range (Min/Max).
    *   Interactive vehicle details overlays.
3.  **Razorpay Purchase Flow**:
    *   Dynamic quantity checkout (stocks updated transactionally).
    *   HMAC-SHA256 signature checks validation on backend to secure purchases.
    *   Simulated Payment Gateway fallback for local development environments.
4.  **Admin Control Panel**:
    *   Full CRUD control: Add, Edit, and Delete vehicle parameters.
    *   Integrated Cloudinary file picker uploads for car images.
    *   One-click stock restocking and soft-deletion protection.

---

## API Endpoints Reference

### Public Endpoints
*   `GET /health`: Returns application operational status (used for uptime checkers).
*   `POST /api/auth/register`: Create a new user profile.
*   `POST /api/auth/login`: Authenticate credentials and receive a JWT authorization token.

### Protected Vehicles Endpoints (Requires Authorization Token header)
*   `GET /api/vehicles`: Paginated listing of available vehicles.
*   `GET /api/vehicles/search`: Search and filter catalog listings.
*   `POST /api/vehicles`: Add a new vehicle record (Admin only).
*   `PUT /api/vehicles/{id}`: Modify details of an existing vehicle (Admin only).
*   `DELETE /api/vehicles/{id}`: Soft delete an existing vehicle (Admin only).

### Protected Inventory Endpoints (Requires Authorization Token header)
*   `POST /api/inventory/vehicles/{id}/purchase`: Purchase units of a vehicle using Razorpay checkout parameters.
*   `POST /api/inventory/vehicles/{id}/restock`: Restock quantities of a vehicle (Admin only).

---

## Local Setup & Running Instructions

### Backend (Spring Boot)

#### 1. Requirements
*   Java JDK 21
*   PostgreSQL Database instance

#### 2. Configure Environment `.env`
Create a `.env` file in the `backend/` directory with the following variables:
```properties
DB_URL=jdbc:postgresql://localhost:5432/cardealership
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_base64_or_hex_jwt_signature_secret_key_32_bytes_or_more
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
*Note: If `RAZORPAY_KEY_SECRET` is left blank, the application automatically launches in safe fallback mockup mode.*

#### 3. Compile and Run
Open your terminal in the `backend/` directory and run:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

The server runs on `http://localhost:8080`.

---

### Frontend (React)

#### 1. Requirements
*   Node.js (v18+)

#### 2. Install and Run
Open your terminal in the `frontend/` directory and run:
```bash
# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

The application runs on `http://localhost:5173`.

*Default Admin Credentials for testing:*
*   **Email**: `admin@cardealership.com`
*   **Password**: `admin123`

---

## Test Suite Report

The application uses Test-Driven Development (TDD) principles to test business logic and REST layers.

To run tests in the `backend/` directory, run:
```bash
.\mvnw.cmd test
```

### Test Suite Execution Summary:
*   **Total Tests Executed**: 42
*   **Passed**: 42
*   **Failures**: 0
*   **Errors**: 0
*   **Skipped**: 0
*   **Build Status**: **SUCCESS**

---

## Screenshots

### 1. Showroom Landing Page (Premium Light Theme)
![Landing Page](./screenshots/showroom_landing.png)

*(Note: To preview screenshots in your workspace, please ensure you place your application screenshots inside a root `/screenshots/` directory when uploading to your public repository).*

---

## My AI Usage

### 1. AI Tools Used
*   **Claude (Anthropic)**: Used for initial structural analysis, requirement mapping, system architecture definitions, and establishing the chronological Step-by-Step Implementation Plan.
*   **Gemini (Google DeepMind)**: Used as the coding agent to execute the implementation plan sequentially, write JUnit tests, write controller/service endpoints, structure React hooks, refactor layouts to a clean light theme, and prepare deployment files.

### 2. How They Were Used
*   **Claude**: I described the assessment objectives and requirements to Claude, asking it to partition the tasks cleanly. It generated a 28-step plan (from setting up database schemas to payment verifications and production bundles).
*   **Gemini**: I directed Gemini to follow the plan step-by-step. For each component (Authentication, Vehicle, Purchase layers), I requested Gemini to first write the unit tests (Red phase), run tests (verifying failure), write the implementation (Green phase), and refactor files for cleanliness. Gemini also handled CORS, PostCSS Tailwind imports, and mock signature bypasses for development.

### 3. Reflections on Workflow
Integrating Claude for top-level system architecture planning and Gemini for test-driven coding execution created an incredibly efficient workflow. AI excelled at generating boilerplate, translating plan requirements to robust MockMvc integration tests, and styling complex layouts in CSS. Human review guided the style theme choices (e.g. pivoting from dark mode to a premium light mode), debugged container port mappings, and verified edge-case validation checks.

---

## Future Implementations & Improvements

In future updates, the following features and improvements are planned:
1.  **Mail OTP Validation**: Integrating **Brevo (Sendinblue)** to send OTP verification codes during user registration to confirm active email profiles.
2.  **Forgot & Reset Password**: A secure reset workflow using password tokens sent to the verified user email.
3.  **Distributed Lock (Redis)**: Utilizing Redis-based transaction locks to prevent concurrency race conditions when multiple users try to buy the last remaining stock of a vehicle at the exact same millisecond.
4.  **Multiple Vehicle Images**: Expanding the database schema and Cloudinary vault to support multiple photos (interior, engine, dashboard, trunk) per vehicle.
5.  **Image Cleanups on Update**: Automatically invoking the Cloudinary API to delete the previous image asset from storage when an Admin updates or replaces a vehicle image.