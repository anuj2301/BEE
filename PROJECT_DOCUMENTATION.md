# LinkShort - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Database Models](#database-models)
7. [API Endpoints](#api-endpoints)
8. [Application Workflow](#application-workflow)
9. [Caching Strategy](#caching-strategy)
10. [Security](#security)
11. [Testing](#testing)
12. [Environment Configuration](#environment-configuration)
13. [Development Setup](#development-setup)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

**LinkShort** is a production-ready URL shortener application built with Node.js, Express, and MongoDB. It provides a complete solution for creating, managing, and tracking shortened URLs with enterprise-grade features including user authentication, Redis caching, QR code generation, and comprehensive analytics.

### Key Capabilities

- **URL Shortening**: Generate short, memorable links from long URLs
- **Custom Aliases**: Allow users to create branded short links
- **Link Expiration**: Set time-based expiration for temporary links
- **Click Tracking**: Real-time analytics for link performance
- **QR Codes**: Automatic QR code generation for mobile sharing
- **User Management**: Secure authentication and authorization
- **Caching**: Redis-powered caching for high performance
- **HTTPS Support**: SSL/TLS encryption for secure connections

---

## Architecture & Design

### High-Level Architecture

```
┌─────────────┐      HTTPS/HTTP      ┌──────────────┐
│   Browser   │ ◄──────────────────► │   Express    │
│   Client    │                      │   Server     │
└─────────────┘                      └──────┬───────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
              ┌─────▼─────┐          ┌─────▼─────┐          ┌─────▼─────┐
              │  MongoDB  │          │   Redis   │          │   JWT     │
              │  Database │          │   Cache   │          │   Auth    │
              └───────────┘          └───────────┘          └───────────┘
```

### Request Flow

1. **Client Request** → Browser sends HTTP/HTTPS request
2. **Authentication Middleware** → Validates JWT token from cookies
3. **Route Handler** → Processes request based on endpoint
4. **Cache Layer** → Checks Redis cache for frequently accessed data
5. **Database Layer** → Queries MongoDB if cache miss
6. **Response** → Returns data to client (HTML/JSON/Redirect)

### Design Patterns

- **MVC Pattern**: Separation of Models, Views, and Controllers
- **Middleware Pattern**: Reusable authentication and error handling
- **Repository Pattern**: Database abstraction through Mongoose models
- **Factory Pattern**: Dynamic URL generation with uniqueness checks
- **Cache-Aside Pattern**: Redis caching with database fallback

---

## Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v14+ | Runtime environment |
| Express.js | ^4.18.2 | Web framework |
| MongoDB | - | Primary database |
| Mongoose | ^7.6.3 | MongoDB ODM |
| Redis | - | Caching layer |
| ioredis | ^5.8.2 | Redis client |

### Authentication & Security

| Technology | Version | Purpose |
|------------|---------|---------|
| JWT | ^9.0.2 | Token-based authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| cookie-parser | ^1.4.7 | Cookie handling |
| node-forge | ^1.3.1 | SSL certificate generation |

### Frontend Technologies

| Technology | Purpose |
|------------|---------|
| EJS | Server-side templating |
| Tailwind CSS | Utility-first CSS framework |
| Vanilla JavaScript | Client-side interactions |
| localStorage | Client-side caching |

### Testing & Quality

| Technology | Version | Purpose |
|------------|---------|---------|
| Jest | ^29.7.0 | Unit testing framework |
| Playwright | ^1.56.1 | E2E browser testing |
| Supertest | ^6.3.4 | HTTP assertion library |

### Development Tools

| Tool | Purpose |
|------|---------|
| Nodemon | Auto-restart on file changes |
| dotenv | Environment variable management |
| ESLint | Code linting (optional) |

---

## Project Structure

```
BEE/
├── 📁 models/                    # Database models
│   ├── user.js                   # User schema and model
│   └── url.js                    # URL schema and model
│
├── 📁 views/                     # EJS templates
│   ├── 📁 partials/              # Reusable template components
│   │   ├── header.ejs            # Header with navigation and dark mode
│   │   └── footer.ejs            # Footer component
│   ├── index.ejs                 # Homepage/landing page
│   ├── login.ejs                 # User login page
│   ├── register.ejs              # User registration page
│   ├── dashboard.ejs             # User dashboard with URL management
│   └── layout.ejs                # Base layout template
│
├── 📁 public/                    # Static assets
│   ├── 📁 css/                   # Custom stylesheets (empty - using CDN)
│   └── 📁 js/                    # Client-side JavaScript (empty)
│
├── 📁 __tests__/                 # Unit and integration tests
│   ├── auth.test.js              # Authentication tests
│   ├── models.test.js            # Database model tests
│   ├── utils.test.js             # Utility function tests
│   ├── integration.test.js       # Integration tests
│   └── setup.js                  # Test environment configuration
│
├── 📁 e2e/                       # End-to-end tests
│   └── app.spec.js               # Playwright browser tests
│
├── 📁 certs/                     # SSL certificates (gitignored)
│   ├── localhost.pem             # Self-signed certificate
│   └── localhost-key.pem         # Private key
│
├── 📁 coverage/                  # Test coverage reports
│   ├── lcov-report/              # HTML coverage report
│   └── coverage-final.json       # JSON coverage data
│
├── 📁 utils/                     # Utility functions (empty)
│
├── 📄 server.js                  # Main application entry point
├── 📄 redis-client.js            # Redis cache configuration
├── 📄 generate-certs.js          # SSL certificate generator
├── 📄 playwright.config.js       # Playwright test configuration
├── 📄 package.json               # Dependencies and scripts
├── 📄 README.md                  # Project readme
├── 📄 todo.txt                   # Development todo list
└── 📄 .env                       # Environment variables (gitignored)
```

### File Descriptions

#### Root Files

##### `server.js` (378 lines)
**Purpose**: Main application file containing all routes, middleware, and server configuration.

**Key Responsibilities**:
- Express app initialization and configuration
- Database connection (MongoDB)
- Redis cache integration with graceful fallback
- Authentication middleware (JWT verification)
- Route definitions (all application routes)
- URL shortening logic with collision detection
- HTTPS/HTTP server setup with conditional switching
- Click tracking and analytics
- QR code generation

**Key Functions**:
- `authMiddleware(req, res, next)`: Verifies JWT token from cookies
- `requireAuth(req, res, next)`: Protects routes requiring authentication
- `generateCode()`: Creates random 6-character short codes
- Server startup with HTTPS/HTTP selection

##### `redis-client.js` (137 lines)
**Purpose**: Redis client configuration and cache helper functions.

**Key Features**:
- Redis connection with retry strategy
- Cache helper functions for common operations
- Error handling and graceful degradation
- TTL (Time-To-Live) management

**Cache Functions**:
- `getUrl(shortUrl)`: Retrieve cached URL data
- `setUrl(shortUrl, urlData, ttl)`: Cache URL data (default 1 hour)
- `deleteUrl(shortUrl)`: Remove URL from cache
- `incrementClicks(shortUrl)`: Atomic click counter increment
- `getClicks(shortUrl)`: Retrieve click count
- `setUserUrls(userId, urls)`: Cache user's URL list (5 minutes)
- `getUserUrls(userId)`: Retrieve cached user URLs
- `invalidateUserUrls(userId)`: Clear user URL cache
- `getKeys(pattern)`: Debug function to list keys
- `flushAll()`: Clear entire cache

##### `generate-certs.js` (114 lines)
**Purpose**: Generate self-signed SSL certificates for local HTTPS development.

**Features**:
- Uses `node-forge` library (no OpenSSL dependency)
- Generates RSA 2048-bit key pairs
- Creates certificates valid for 1 year
- Includes Subject Alternative Names (SANs) for localhost
- Outputs to `certs/` directory
- Instructions for enabling HTTPS in `.env`

**Usage**:
```bash
node generate-certs.js
```

##### `playwright.config.js` (32 lines)
**Purpose**: Configuration for Playwright end-to-end browser testing.

**Configuration**:
- Test directory: `./e2e`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Auto-start server for testing
- Screenshot on failure
- Trace on first retry

##### `package.json` (55 lines)
**Purpose**: Project metadata, dependencies, and npm scripts.

**Key Scripts**:
- `npm start`: Start production server
- `npm run dev`: Start with nodemon (hot reload)
- `npm test`: Run Jest unit tests with coverage
- `npm run test:watch`: Watch mode for tests
- `npm run test:integration`: Run Playwright E2E tests
- `npm run test:integration:ui`: Playwright UI mode

**Dependencies**: 14 production, 5 development

#### Models Directory

##### `models/user.js` (8 lines)
**Purpose**: Mongoose schema for user data.

**Schema Fields**:
```javascript
{
  name: String,              // User's full name
  email: String (unique),    // Email address (login identifier)
  password: String           // Bcrypt hashed password
}
```

**Features**:
- Unique email constraint
- No timestamps (can be added if needed)

##### `models/url.js` (14 lines)
**Purpose**: Mongoose schema for shortened URLs.

**Schema Fields**:
```javascript
{
  fullUrl: String,           // Original long URL
  shortUrl: String (unique), // Short code (6 chars)
  user: ObjectId,            // Reference to User model
  clicks: Number,            // Click counter (default: 0)
  createdAt: Date,           // Creation timestamp (auto)
  expiresAt: Date,           // Optional expiration date
  isExpired: Boolean,        // Expiration flag (default: false)
  qrCode: String             // Base64 encoded QR code image
}
```

**Features**:
- Unique short URL constraint
- TTL index for automatic deletion of expired URLs
- Reference to user who created the link
- QR code storage as data URL

**Indexes**:
- `{ expiresAt: 1 }` with `expireAfterSeconds: 0` (sparse)

#### Views Directory

##### `views/index.ejs` (84 lines)
**Purpose**: Landing page/homepage.

**Features**:
- Hero section with gradient text
- Feature cards (Lightning Fast, Secure & Reliable, Track & Manage)
- SVG icons for visual appeal
- Call-to-action buttons
- Responsive grid layout
- Dark mode support

##### `views/login.ejs` (84 lines)
**Purpose**: User login page.

**Features**:
- Email and password input fields
- Error message display
- Link to registration page
- "Remember me" functionality
- Responsive card design
- Dark mode support

##### `views/register.ejs` (similar structure)
**Purpose**: User registration page.

**Features**:
- Name, email, and password fields
- Email validation
- Error handling
- Link to login page
- Terms acceptance (optional)

##### `views/dashboard.ejs` (425 lines)
**Purpose**: Main user dashboard for URL management.

**Features**:
- URL shortening form with:
  - Full URL input
  - Custom alias option
  - Expiration settings (minutes/hours/days)
  - QR code generation toggle
- Statistics cards:
  - Total links
  - Total clicks
  - Click rate
- URL list table with:
  - Short URL display
  - Full URL
  - Click count
  - Creation date
  - Expiration status
  - QR code download
  - Copy to clipboard
  - Delete action
- Real-time Redis status indicator
- Dark mode toggle
- Responsive layout

##### `views/partials/header.ejs` (152 lines)
**Purpose**: Reusable header component with navigation.

**Features**:
- Logo/brand name
- Navigation menu:
  - Home
  - Dashboard (authenticated only)
  - Login/Register (unauthenticated)
  - Logout (authenticated)
- Dark mode toggle button
- Responsive hamburger menu (mobile)
- Tailwind CSS configuration in `<head>`
- Dark mode persistence via localStorage
- User greeting display

##### `views/partials/footer.ejs`
**Purpose**: Reusable footer component.

**Features**:
- Copyright information
- Links (About, Privacy, Terms)
- Social media icons (optional)

#### Tests Directory

##### `__tests__/auth.test.js` (100 lines)
**Purpose**: Unit tests for authentication utilities.

**Test Suites**:
1. **Password Hashing**:
   - Hash generation
   - Password comparison (correct)
   - Password comparison (incorrect)

2. **JWT Token Operations**:
   - Token creation
   - Token verification
   - Invalid token rejection
   - Wrong secret rejection

##### `__tests__/models.test.js`
**Purpose**: Tests for database models.

**Tests**:
- User model validation
- URL model validation
- Schema constraints
- Default values

##### `__tests__/integration.test.js`
**Purpose**: Integration tests for API endpoints.

**Tests**:
- User registration flow
- Login flow
- URL creation
- URL redirection
- Click tracking

##### `__tests__/setup.js` (8 lines)
**Purpose**: Jest test environment configuration.

**Configuration**:
- Sets `NODE_ENV=test`
- Defines test JWT secret
- Sets test MongoDB URL
- Configures Jest timeout (10s)

##### `e2e/app.spec.js` (276 lines)
**Purpose**: Playwright end-to-end browser tests.

**Test Cases**:
- Homepage load
- Navigation to login/register
- Form validation
- User registration flow
- Login flow
- URL shortening
- Dashboard interactions
- Dark mode toggle
- QR code generation
- URL deletion

---

## Core Features

### 1. URL Shortening Engine

**Algorithm**:
1. Validate input URL
2. Check for custom alias or generate random 6-char code
3. Verify uniqueness (up to 5 attempts)
4. Calculate expiration if specified
5. Generate QR code if requested
6. Store in MongoDB
7. Cache in Redis
8. Return short URL to user

**Character Set**: `A-Z, a-z, 0-9` (62 characters)
**Code Length**: 6 characters
**Total Possible Combinations**: 62^6 = 56,800,235,584

**Collision Handling**: Regenerate up to 5 times if duplicate found

### 2. User Authentication

**Registration Flow**:
1. User submits name, email, password
2. Check if email exists
3. Hash password with bcrypt (salt rounds: 10)
4. Store user in database
5. Redirect to login

**Login Flow**:
1. User submits email, password
2. Find user by email
3. Compare password with bcrypt
4. Generate JWT token (expires in 1 hour)
5. Set HTTP-only cookie
6. Redirect to dashboard

**JWT Payload**:
```javascript
{
  id: user._id,
  name: user.name,
  email: user.email,
  iat: timestamp,
  exp: timestamp + 3600
}
```

### 3. Click Tracking

**Tracking Mechanism**:
1. User clicks short link
2. Check cache for URL data
3. Fallback to database if cache miss
4. Verify expiration status
5. Increment click counter in DB (`$inc`)
6. Increment counter in Redis (atomic)
7. Invalidate cache entry (force refresh)
8. Redirect to original URL

**Analytics Data**:
- Total clicks per URL
- Total clicks across all URLs
- Average click rate
- Click timestamps (can be extended)

### 4. Link Expiration

**Expiration Types**:
- **Minutes**: Short-lived links (1-60 min)
- **Hours**: Medium-duration links (1-24 hours)
- **Days**: Long-duration links (1-365 days)
- **Never**: Permanent links (null expiration)

**Expiration Handling**:
- MongoDB TTL index automatically deletes expired URLs
- Manual check during redirect
- Expired links show "This link has expired" message
- Cached expired links removed immediately

### 5. QR Code Generation

**Implementation**:
- Library: `qrcode` npm package
- Format: PNG image as Base64 data URL
- Storage: Embedded in URL document
- Size: ~2-5 KB per QR code

**QR Code Features**:
- Encodes full original URL (not short URL)
- Download as PNG file
- Scannable by any QR reader
- High error correction level

### 6. Custom Aliases

**Rules**:
- Must be unique
- Alphanumeric characters recommended
- No length restriction (reasonable)
- Case-sensitive

**Validation**:
- Check database for existing alias
- Return error if taken
- Allow user to try alternative

---

## Database Models

### User Model (MongoDB)

```javascript
{
  _id: ObjectId,              // Auto-generated
  name: String,               // Required
  email: String,              // Required, unique
  password: String,           // Bcrypt hash
  __v: Number                 // Version key
}
```

**Indexes**:
- `email`: Unique index for fast lookups

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "__v": 0
}
```

### URL Model (MongoDB)

```javascript
{
  _id: ObjectId,              // Auto-generated
  fullUrl: String,            // Required
  shortUrl: String,           // Required, unique
  user: ObjectId,             // Required, ref: User
  clicks: Number,             // Default: 0
  createdAt: Date,            // Default: Date.now
  expiresAt: Date,            // Optional, null for permanent
  isExpired: Boolean,         // Default: false
  qrCode: String,             // Base64 data URL
  __v: Number                 // Version key
}
```

**Indexes**:
- `shortUrl`: Unique index for fast lookups
- `expiresAt`: TTL index (sparse, expireAfterSeconds: 0)
- `user`: Index for user's URLs query

**Sample Document**:
```json
{
  "_id": "507f191e810c19729de860ea",
  "fullUrl": "https://example.com/very-long-url",
  "shortUrl": "aBc123",
  "user": "507f1f77bcf86cd799439011",
  "clicks": 42,
  "createdAt": "2025-11-24T10:30:00.000Z",
  "expiresAt": "2025-12-24T10:30:00.000Z",
  "isExpired": false,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "__v": 0
}
```

---

## API Endpoints

### Public Routes

#### `GET /`
**Description**: Homepage/landing page
**Authentication**: None
**Response**: HTML (index.ejs)

#### `GET /:short`
**Description**: Redirect short URL to original URL
**Authentication**: None
**Parameters**: 
- `short` (string): 6-character short code
**Response**: 
- 302 Redirect to original URL
- 404 "URL not found"
- 410 "This link has expired"
**Side Effects**:
- Increments click counter
- Updates cache

### Authentication Routes

#### `GET /login`
**Description**: Login page
**Authentication**: None
**Response**: HTML (login.ejs)

#### `POST /login`
**Description**: Authenticate user
**Authentication**: None
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
- Success: 302 Redirect to /dashboard with JWT cookie
- Error: HTML with error message

#### `GET /register`
**Description**: Registration page
**Authentication**: None
**Response**: HTML (register.ejs)

#### `POST /register`
**Description**: Create new user account
**Authentication**: None
**Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
- Success: 302 Redirect to /login
- Error: HTML with error message

#### `GET /logout`
**Description**: Logout user
**Authentication**: Optional
**Response**: 302 Redirect to / (clears JWT cookie)

### Protected Routes (Require Authentication)

#### `GET /dashboard`
**Description**: User dashboard with URL management
**Authentication**: Required
**Response**: HTML (dashboard.ejs) with:
- User's URL list
- Statistics (total links, clicks, rate)
- Redis status

#### `POST /shorten`
**Description**: Create shortened URL
**Authentication**: Required
**Body**:
```json
{
  "fullUrl": "https://example.com/long-url",
  "custom": "mylink",
  "validityValue": "30",
  "validityUnit": "days",
  "generateQR": "on"
}
```
**Response**: 302 Redirect to /dashboard
**Side Effects**:
- Creates URL document
- Caches in Redis
- Generates QR code if requested

#### `POST /delete/:id`
**Description**: Delete shortened URL
**Authentication**: Required (owner only)
**Parameters**:
- `id` (string): MongoDB ObjectId
**Response**: 302 Redirect to /dashboard
**Side Effects**:
- Deletes URL document
- Removes from cache

#### `GET /qr/download/:id`
**Description**: Download QR code image
**Authentication**: Required (owner only)
**Parameters**:
- `id` (string): MongoDB ObjectId
**Response**: PNG image file
**Headers**:
- `Content-Type: image/png`
- `Content-Disposition: attachment; filename="qr-<shortcode>.png"`

### API Routes

#### `GET /api/redis-status`
**Description**: Redis cache statistics
**Authentication**: Required
**Response**:
```json
{
  "enabled": true,
  "connected": true,
  "stats": {
    "totalKeys": 150,
    "urlsCached": 100,
    "clickCounters": 40,
    "userCaches": 10
  }
}
```

---

## Application Workflow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                     1. User Visits Site                      │
│                         GET /                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼───────┐       ┌────────▼────────┐
         │   Browse     │       │   Register      │
         │   Features   │       │   GET /register │
         └──────┬───────┘       └────────┬────────┘
                │                        │
                │                 POST /register
                │                        │
         ┌──────▼────────────────────────▼─────┐
         │           Login                     │
         │        POST /login                  │
         └──────┬──────────────────────────────┘
                │
                │ (JWT Cookie Set)
                │
         ┌──────▼───────────────────────────────┐
         │         Dashboard                     │
         │      GET /dashboard                   │
         │                                       │
         │  ┌─────────────────────────────────┐ │
         │  │  Create Short Link              │ │
         │  │  POST /shorten                  │ │
         │  └────────┬────────────────────────┘ │
         │           │                           │
         │  ┌────────▼────────────────────────┐ │
         │  │  View Links & Stats             │ │
         │  │  - Total Clicks                 │ │
         │  │  - Click Rate                   │ │
         │  │  - Link List                    │ │
         │  └────────┬────────────────────────┘ │
         │           │                           │
         │  ┌────────▼────────────────────────┐ │
         │  │  Manage Links                   │ │
         │  │  - Copy Short URL               │ │
         │  │  - Download QR Code             │ │
         │  │  - Delete Link                  │ │
         │  └─────────────────────────────────┘ │
         └──────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              2. Share Short Link (External User)              │
│                    GET /:short                                │
└────────────────────────────┬─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Check Cache    │
                    │   (Redis)       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Query Database │
                    │   (if needed)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Check          │
                    │  Expiration     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Increment      │
                    │  Click Counter  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  302 Redirect   │
                    │  to Full URL    │
                    └─────────────────┘
```

### Typical Use Cases

#### Use Case 1: First-Time User
1. Visit homepage (`/`)
2. Click "Get Started" or "Register"
3. Fill registration form
4. Confirm email (optional - not implemented)
5. Login with credentials
6. Redirected to dashboard

#### Use Case 2: Create Short Link
1. User logs in
2. Navigate to dashboard
3. Enter long URL in form
4. Optionally set custom alias
5. Optionally set expiration
6. Toggle QR code generation
7. Click "Shorten"
8. View new link in dashboard table
9. Copy short URL
10. Share with others

#### Use Case 3: Track Link Performance
1. User logs in
2. View dashboard
3. See statistics:
   - Total links created
   - Total clicks across all links
   - Average click rate
4. View individual link metrics in table
5. Monitor real-time click updates

#### Use Case 4: Share Link
1. Copy short URL from dashboard
2. Share via email, social media, QR code
3. Recipients click link
4. System tracks click
5. Redirects to original URL
6. Click count updates in dashboard

---

## Caching Strategy

### Redis Cache Architecture

**Cache Keys Pattern**:
- `url:<shortCode>`: URL document data
- `clicks:<shortCode>`: Click counter
- `user:<userId>:urls`: User's URL list

**TTL (Time-To-Live) Settings**:
- URL data: 3600 seconds (1 hour)
- User URLs: 300 seconds (5 minutes)
- Click counters: No expiration (persistent)

### Caching Flow

#### Cache Hit (Fast Path)
```
Request → Redis Cache → Return Data (< 5ms)
```

#### Cache Miss (Slow Path)
```
Request → Redis Cache (miss) → MongoDB → Cache Result → Return Data (50-100ms)
```

### Cache Invalidation Strategy

**Invalidation Triggers**:
1. **URL Creation**: Cache new URL immediately
2. **URL Deletion**: Remove from cache
3. **Click Tracking**: Invalidate URL cache (force fresh data)
4. **User URL List**: Invalidate on any URL change

**Pattern**:
```javascript
// Write-through cache
await Url.create(data);           // Write to DB
await cache.setUrl(short, data);  // Write to cache

// Cache-aside with invalidation
await Url.update({ $inc: { clicks: 1 } });  // Update DB
await cache.deleteUrl(short);               // Invalidate cache
```

### Performance Benefits

**Without Redis**:
- Every redirect: ~50-100ms (MongoDB query)
- 1000 requests/sec = 1000 DB queries/sec

**With Redis**:
- Cache hit: ~5ms
- Cache miss: ~50-100ms (then cached)
- 1000 requests/sec = ~950 cache hits, 50 DB queries

**Estimated Performance Improvement**: 10-20x faster response times

---

## Security

### Authentication Security

**Password Security**:
- Hashing algorithm: bcrypt
- Salt rounds: 10
- Rainbow table resistant
- Timing attack resistant

**JWT Security**:
- HTTP-only cookies (prevents XSS)
- Signed tokens (prevents tampering)
- 1-hour expiration
- Secret key from environment variable
- No sensitive data in payload

### HTTPS/SSL Support

**Certificate Options**:
1. **Development**: Self-signed (generated via `generate-certs.js`)
2. **Production**: Let's Encrypt or AWS Certificate Manager

**HTTPS Configuration**:
```env
ENABLE_HTTPS=true
HTTPS_PORT=3443
HTTPS_CERT_PATH=./certs/localhost.pem
HTTPS_KEY_PATH=./certs/localhost-key.pem
```

**Features**:
- TLS 1.2/1.3 support
- HTTP to HTTPS redirect
- Secure cookie flag (production)

### Input Validation

**URL Validation**:
- HTML5 `type="url"` validation
- Server-side URL format check
- Protocol requirement (http/https)

**SQL Injection Prevention**:
- Mongoose parameterized queries
- No raw query string concatenation

**XSS Prevention**:
- EJS auto-escaping
- HTTP-only cookies
- Content Security Policy (can be added)

### Access Control

**Authorization Rules**:
- Users can only view/delete their own URLs
- Dashboard requires authentication
- JWT verification on protected routes
- Owner check before URL deletion

---

## Testing

### Test Coverage

**Current Coverage** (from `coverage/` directory):
- Statements: High
- Branches: Medium
- Functions: High
- Lines: High

### Unit Tests (`__tests__/`)

**Test Framework**: Jest

**Test Suites**:

1. **auth.test.js** - Authentication utilities
   - Password hashing
   - Password comparison
   - JWT token creation
   - JWT token verification
   - Token rejection (invalid/expired)

2. **models.test.js** - Database models
   - User schema validation
   - URL schema validation
   - Default values
   - Required fields
   - Unique constraints

3. **utils.test.js** - Utility functions
   - Helper functions
   - Validation logic

4. **integration.test.js** - API integration
   - User registration
   - User login
   - URL creation
   - URL deletion
   - Click tracking

**Running Unit Tests**:
```bash
npm test              # Run once with coverage
npm run test:watch   # Watch mode
```

### End-to-End Tests (`e2e/`)

**Test Framework**: Playwright

**Browser Coverage**:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

**Test Scenarios**:

1. **Navigation**
   - Homepage load
   - Login page navigation
   - Register page navigation

2. **Authentication**
   - User registration
   - User login
   - Login validation
   - Logout

3. **URL Management**
   - Create short URL
   - Custom alias
   - Set expiration
   - Generate QR code
   - Copy to clipboard
   - Delete URL

4. **UI/UX**
   - Dark mode toggle
   - Responsive design
   - Form validation
   - Error messages

**Running E2E Tests**:
```bash
npm run test:integration      # Headless mode
npm run test:integration:ui   # UI mode (interactive)
```

### Test Environment

**Configuration** (`__tests__/setup.js`):
```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGO_URL = 'mongodb://localhost:27017/linkshort-test';
jest.setTimeout(10000);
```

**Isolation**:
- Separate test database
- Test JWT secret
- No production data affected

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# ==========================================
# REQUIRED VARIABLES
# ==========================================

# MongoDB connection string
MONGO_URL=mongodb://localhost:27017/linkshort

# JWT secret key (use strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# ==========================================
# OPTIONAL VARIABLES
# ==========================================

# Server Configuration
PORT=3000
NODE_ENV=development

# Short URL Display Domain (for UI display only)
SHORT_DOMAIN=https://lnk.to

# Redis Configuration
ENABLE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# HTTPS Configuration
ENABLE_HTTPS=false
HTTPS_PORT=3443
HTTPS_CERT_PATH=./certs/localhost.pem
HTTPS_KEY_PATH=./certs/localhost-key.pem
HTTP_PORT=3000
```

### Configuration Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MONGO_URL` | string | *required* | MongoDB connection string |
| `JWT_SECRET` | string | *required* | Secret key for JWT signing (min 32 chars recommended) |
| `PORT` | number | `3000` | HTTP server port |
| `NODE_ENV` | string | `development` | Environment (`development`, `production`, `test`) |
| `SHORT_DOMAIN` | string | `https://lnk.to` | Display domain for short links (UI only) |
| `ENABLE_REDIS` | boolean | `true` | Enable Redis caching |
| `REDIS_HOST` | string | `localhost` | Redis server hostname |
| `REDIS_PORT` | number | `6379` | Redis server port |
| `REDIS_PASSWORD` | string | - | Redis authentication password |
| `ENABLE_HTTPS` | boolean | `false` | Enable HTTPS server |
| `HTTPS_PORT` | number | `3443` | HTTPS server port |
| `HTTPS_CERT_PATH` | string | `./certs/localhost.pem` | Path to SSL certificate |
| `HTTPS_KEY_PATH` | string | `./certs/localhost-key.pem` | Path to SSL private key |
| `HTTP_PORT` | number | `3000` | HTTP port (redirects to HTTPS if enabled) |

### Production Environment

**Production `.env` Example**:
```env
NODE_ENV=production
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/linkshort?retryWrites=true&w=majority
JWT_SECRET=<64-character-random-string>
PORT=8080
SHORT_DOMAIN=https://lnk.yourdomain.com
ENABLE_REDIS=true
REDIS_HOST=your-redis-host.cache.amazonaws.com
REDIS_PORT=6379
ENABLE_HTTPS=true
HTTPS_PORT=443
HTTPS_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
HTTPS_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Security Recommendations**:
- Use strong, random JWT secret (64+ characters)
- Enable HTTPS in production
- Use MongoDB Atlas or managed MongoDB
- Use AWS ElastiCache or managed Redis
- Set secure cookie flags
- Enable rate limiting (add middleware)
- Implement CORS policies
- Add helmet.js for security headers

---

## Development Setup

### Prerequisites

**Required Software**:
- Node.js v14.0.0 or higher
- npm v6.0.0 or higher
- MongoDB v4.4 or higher
- Redis v6.0 or higher (optional but recommended)
- Git

**Recommended Tools**:
- Visual Studio Code
- MongoDB Compass (GUI for MongoDB)
- Redis Insight (GUI for Redis)
- Postman (API testing)

### Step-by-Step Setup

#### 1. Clone Repository
```bash
git clone https://github.com/anuj2301/BEE.git
cd BEE
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Install MongoDB

**Windows**:
```powershell
# Download from https://www.mongodb.com/try/download/community
# Run installer
# Start MongoDB service
net start MongoDB
```

**macOS**:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux**:
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

#### 4. Install Redis (Optional)

**Windows**:
```powershell
# Download from https://github.com/tporadowski/redis/releases
# Run installer
# Start Redis service
redis-server
```

**macOS**:
```bash
brew install redis
brew services start redis
```

**Linux**:
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

#### 5. Configure Environment
```bash
# Copy example (if exists) or create new
cp .env.example .env

# Edit .env file
notepad .env  # Windows
nano .env     # Linux/Mac
```

**Minimal `.env` for development**:
```env
MONGO_URL=mongodb://localhost:27017/linkshort
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
PORT=3000
ENABLE_REDIS=true
```

#### 6. Generate SSL Certificates (Optional)
```bash
node generate-certs.js
```

Update `.env`:
```env
ENABLE_HTTPS=true
HTTPS_PORT=3443
```

#### 7. Start Development Server
```bash
npm run dev
```

Server will start at:
- HTTP: `http://localhost:3000`
- HTTPS: `https://localhost:3443` (if enabled)

#### 8. Verify Setup

**Check MongoDB Connection**:
- Look for "MongoDB connected" in console

**Check Redis Connection**:
- Look for "✓ Redis connected" in console
- If Redis fails, app continues without caching

**Access Application**:
- Open browser to `http://localhost:3000`
- Register a new account
- Create a short URL
- Test redirection

### Development Workflow

#### Hot Reload
```bash
npm run dev  # Uses nodemon for auto-restart
```

#### Debugging
```javascript
// Add breakpoints in VS Code
// Use debugger; statement
// Check console.log() output
```

#### Database Inspection
```bash
# MongoDB Shell
mongosh
use linkshort
db.users.find()
db.urls.find()

# OR use MongoDB Compass GUI
```

#### Cache Inspection
```bash
# Redis CLI
redis-cli
KEYS *
GET url:aBc123
```

---

## Deployment

### AWS Elastic Beanstalk (Recommended)

#### Prerequisites
- AWS account
- AWS CLI installed
- EB CLI installed

#### Deployment Steps

1. **Initialize Elastic Beanstalk**:
```bash
eb init -p node.js-14 linkshort-app --region us-east-1
```

2. **Create Environment**:
```bash
eb create linkshort-env
```

3. **Configure Environment Variables**:
```bash
eb setenv MONGO_URL=<mongodb-atlas-url> \
          JWT_SECRET=<production-secret> \
          ENABLE_REDIS=true \
          REDIS_HOST=<elasticache-endpoint>
```

4. **Deploy Application**:
```bash
eb deploy
```

5. **Open Application**:
```bash
eb open
```

#### AWS Services Used

- **Elastic Beanstalk**: Application hosting
- **MongoDB Atlas**: Managed MongoDB
- **ElastiCache (Redis)**: Managed Redis cache
- **Route 53**: DNS management
- **Certificate Manager**: SSL/TLS certificates
- **CloudWatch**: Logging and monitoring

### Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Build and Run
```bash
# Build image
docker build -t linkshort:latest .

# Run container
docker run -d -p 3000:3000 \
  -e MONGO_URL=mongodb://mongo:27017/linkshort \
  -e JWT_SECRET=your-secret \
  --name linkshort \
  linkshort:latest
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/linkshort
      - JWT_SECRET=your-secret
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create linkshort-app

# Add MongoDB
heroku addons:create mongolab:sandbox

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# Open app
heroku open
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Select Node.js environment
3. Add environment variables
4. Configure MongoDB (managed database)
5. Deploy

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret (64+ chars)
- [ ] Enable HTTPS
- [ ] Use managed MongoDB (Atlas, AWS DocumentDB)
- [ ] Use managed Redis (ElastiCache, Redis Labs)
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable gzip compression
- [ ] Set up logging (Winston, CloudWatch)
- [ ] Configure monitoring (New Relic, Datadog)
- [ ] Set up error tracking (Sentry)
- [ ] Enable rate limiting
- [ ] Configure CORS policies
- [ ] Add security headers (helmet.js)
- [ ] Set up backups (automated)
- [ ] Configure CDN (CloudFront, Cloudflare)
- [ ] Set up CI/CD pipeline
- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solutions**:
- Check MongoDB is running: `mongosh` or `sudo systemctl status mongod`
- Verify `MONGO_URL` in `.env`
- Check MongoDB port (default: 27017)
- Firewall blocking connection?
- MongoDB Atlas: Check IP whitelist

#### 2. Redis Connection Failed

**Error**: `Redis connection error: ECONNREFUSED`

**Solutions**:
- Redis is optional; app continues without it
- Check Redis is running: `redis-cli ping`
- Verify `REDIS_HOST` and `REDIS_PORT`
- Set `ENABLE_REDIS=false` to disable

#### 3. JWT Token Invalid

**Error**: `JsonWebTokenError: invalid signature`

**Solutions**:
- Check `JWT_SECRET` in `.env`
- Clear browser cookies
- Re-login to get new token
- Ensure JWT_SECRET is same across app restarts

#### 4. HTTPS Certificate Error

**Error**: `Error: ENOENT: no such file or directory`

**Solutions**:
- Generate certificates: `node generate-certs.js`
- Check `HTTPS_CERT_PATH` and `HTTPS_KEY_PATH`
- Set `ENABLE_HTTPS=false` for HTTP-only
- Browser warning for self-signed cert (expected in dev)

#### 5. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

#### 6. npm install Failures

**Error**: `npm ERR! code EINTEGRITY`

**Solutions**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 7. Test Failures

**Error**: `FAIL __tests__/auth.test.js`

**Solutions**:
- Check test database is accessible
- Verify `JWT_SECRET` in setup.js
- Run tests individually: `npm test -- auth.test.js`
- Clear test database

#### 8. Click Counter Not Updating

**Symptoms**: Clicks not incrementing in dashboard

**Solutions**:
- Check MongoDB connection
- Verify URL exists in database
- Check Redis cache invalidation
- Refresh dashboard page
- Check browser console for errors

### Debug Mode

**Enable verbose logging**:
```javascript
// In server.js, add:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

**MongoDB debug**:
```javascript
mongoose.set('debug', true);
```

**Redis debug**:
```javascript
redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));
redis.on('ready', () => console.log('Redis ready'));
```

### Performance Issues

**Slow Response Times**:
- Check MongoDB indexes: `db.urls.getIndexes()`
- Enable Redis caching
- Use MongoDB Atlas with nearby region
- Add database connection pooling
- Optimize queries (use `.lean()`)

**High Memory Usage**:
- Limit query results (`.limit()`)
- Use pagination
- Clear expired URLs regularly
- Monitor Redis memory usage

### Security Audit

**Run security check**:
```bash
npm audit
npm audit fix
```

**Update dependencies**:
```bash
npm outdated
npm update
```

---

## Contributing

### Development Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Write tests for new features
4. Ensure tests pass: `npm test`
5. Follow code style (consider adding ESLint)
6. Commit with clear messages
7. Push to branch: `git push origin feature-name`
8. Create Pull Request

### Code Style

- Use 2-space indentation
- Use semicolons
- Use camelCase for variables
- Use PascalCase for models
- Add comments for complex logic
- Keep functions small and focused

---

## License

This project is open-source. See LICENSE file for details.

---

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/anuj2301/BEE/issues
- Pull Requests: https://github.com/anuj2301/BEE/pulls
- Email: (add if available)

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Maintainer**: anuj2301
