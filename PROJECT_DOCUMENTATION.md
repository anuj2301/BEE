# LinkShort Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [URL Shortening Algorithm](#url-shortening-algorithm)
6. [Click Tracking System](#click-tracking-system)
7. [Frontend Implementation](#frontend-implementation)
8. [API Documentation](#api-documentation)
9. [Security Measures](#security-measures)
10. [Performance Optimization](#performance-optimization)
11. [Development Workflow](#development-workflow)
12. [Deployment Guide](#deployment-guide)
13. [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

LinkShort is a modern URL shortening service built with the MEAN stack (MongoDB, Express.js, Angular/EJS, Node.js). It provides users with the ability to create short, trackable links while maintaining detailed analytics and user management.

### Core Objectives
- **Simplicity**: Easy-to-use interface for creating short links
- **Security**: Robust authentication and data protection
- **Analytics**: Comprehensive click tracking and statistics
- **Scalability**: Designed to handle high traffic loads
- **User Experience**: Modern, responsive design with dark/light themes

### Target Audience
- Digital marketers tracking campaign performance
- Social media managers sharing links
- Businesses creating branded short links
- Developers needing programmatic URL shortening
- General users wanting cleaner, shareable links

## 🏗️ Architecture & Design

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │    Database     │
│                 │    │                 │    │                 │
│ • EJS Templates │◄──►│ • Express.js    │◄──►│ • MongoDB       │
│ • Tailwind CSS │    │ • Node.js       │    │ • Mongoose ODM  │
│ • JavaScript    │    │ • JWT Auth      │    │ • Collections   │
│ • SVG Icons     │    │ • bcrypt        │    │   - Users       │
│                 │    │ • Cookie Parser │    │   - URLs        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### MVC Pattern Implementation

**Models (`/models/`)**
- `user.js`: User data structure and validation
- `url.js`: URL schema with click tracking

**Views (`/views/`)**
- `index.ejs`: Landing page with features
- `dashboard.ejs`: User dashboard with URL management
- `login.ejs` & `register.ejs`: Authentication pages
- `partials/`: Reusable header and footer components

**Controller (`server.js`)**
- Route handling and business logic
- Authentication middleware
- Database operations
- Error handling

### Technology Stack Details

| Layer | Technology | Purpose | Version |
|-------|------------|---------|---------|
| **Runtime** | Node.js | Server-side JavaScript | v14+ |
| **Framework** | Express.js | Web application framework | Latest |
| **Database** | MongoDB | NoSQL document database | v4.4+ |
| **ODM** | Mongoose | MongoDB object modeling | Latest |
| **Authentication** | JWT | Token-based authentication | Latest |
| **Password** | bcryptjs | Password hashing | Latest |
| **Templating** | EJS | Embedded JavaScript templates | Latest |
| **Styling** | Tailwind CSS | Utility-first CSS framework | v3.0+ |
| **Icons** | Heroicons | SVG icon library | Latest |

## 🗄️ Database Schema

### User Collection

```javascript
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});
```

### URL Collection

```javascript
const UrlSchema = new mongoose.Schema({
    fullUrl: {
        type: String,
        required: true,
        validate: [validator.isURL, 'Invalid URL']
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        index: true // For fast lookups
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true // For user-specific queries
    },
    clicks: {
        type: Number,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
```

### Database Indexes

```javascript
// Compound index for user-specific URL queries
UrlSchema.index({ user: 1, createdAt: -1 });

// Unique index for short URL lookups
UrlSchema.index({ shortUrl: 1 }, { unique: true });

// User email index for authentication
UserSchema.index({ email: 1 }, { unique: true });
```

## 🔐 Authentication System

### JWT Implementation

**Token Structure:**
```javascript
{
    id: user._id,
    name: user.name,
    email: user.email,
    iat: timestamp,
    exp: timestamp + 1hour
}
```

**Authentication Flow:**

1. **Registration**
   ```javascript
   POST /register
   ├── Validate input data
   ├── Check if email exists
   ├── Hash password with bcrypt
   ├── Save user to database
   └── Redirect to login
   ```

2. **Login**
   ```javascript
   POST /login
   ├── Validate credentials
   ├── Compare hashed password
   ├── Generate JWT token
   ├── Set httpOnly cookie
   └── Redirect to dashboard
   ```

3. **Middleware Protection**
   ```javascript
   authMiddleware()
   ├── Extract token from cookie
   ├── Verify JWT signature
   ├── Attach user to request
   └── Continue or redirect
   ```

### Security Features

- **Password Hashing**: bcrypt with salt rounds (10)
- **JWT Secrets**: Environment-based secret keys
- **HTTP-Only Cookies**: Prevent XSS token theft
- **Input Validation**: Server-side validation for all inputs
- **Route Protection**: Authenticated routes with middleware

## ⚡ URL Shortening Algorithm

### Code Generation

```javascript
function generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';
    
    for (let i = 0; i < 6; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return shortCode;
}
```

### Collision Handling

```javascript
async function createUniqueShortCode() {
    let attempts = 0;
    let shortCode;
    let exists;
    
    do {
        shortCode = generateShortCode();
        exists = await Url.findOne({ shortUrl: shortCode });
        attempts++;
    } while (exists && attempts < 5);
    
    if (exists) {
        throw new Error('Unable to generate unique short code');
    }
    
    return shortCode;
}
```

### Custom Aliases

Users can provide custom aliases with validation:

```javascript
if (customAlias) {
    // Validate custom alias
    if (!/^[a-zA-Z0-9-_]+$/.test(customAlias)) {
        throw new Error('Invalid characters in custom alias');
    }
    
    if (customAlias.length > 20) {
        throw new Error('Custom alias too long');
    }
    
    // Check availability
    const exists = await Url.findOne({ shortUrl: customAlias });
    if (exists) {
        throw new Error('Custom alias already taken');
    }
}
```

## 📊 Click Tracking System

### Click Recording

```javascript
app.get('/:short', async (req, res) => {
    try {
        // Find URL by short code
        const url = await Url.findOne({ shortUrl: req.params.short });
        
        if (!url) {
            return res.status(404).send('URL not found');
        }
        
        // Increment click count atomically
        await Url.findByIdAndUpdate(url._id, { 
            $inc: { clicks: 1 } 
        });
        
        // Redirect to original URL
        res.redirect(301, url.fullUrl);
        
    } catch (error) {
        console.error('Click tracking error:', error);
        res.status(500).send('Server error');
    }
});
```

### Analytics Calculation

```javascript
// Dashboard statistics
const urls = await Url.find({ user: req.user.id });
const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
const totalLinks = urls.length;
const avgClicksPerLink = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : 0;

const stats = {
    totalLinks,
    totalClicks,
    avgClicksPerLink,
    topPerformer: urls.sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0]
};
```

### Real-time Updates

Click data updates immediately in the database using MongoDB's atomic operations:

```javascript
// Atomic increment operation
{ $inc: { clicks: 1 } }

// This ensures:
// - No race conditions
// - Immediate consistency
// - High performance
```

## 🎨 Frontend Implementation

### Template Structure

```
views/
├── partials/
│   ├── header.ejs       # Navigation + Dark mode toggle
│   └── footer.ejs       # Footer with links
├── index.ejs           # Landing page
├── login.ejs           # Login form
├── register.ejs        # Registration form
├── dashboard.ejs       # Main dashboard
└── layout.ejs          # Base layout (legacy)
```

### Responsive Design

**Tailwind CSS Classes Used:**
```css
/* Mobile-first responsive grid */
.grid.md:grid-cols-3     /* 1 col mobile, 3 cols desktop */
.flex.flex-col.lg:flex-row   /* Column mobile, row desktop */

/* Dark mode support */
.bg-white.dark:bg-gray-800   /* Light/dark backgrounds */
.text-gray-900.dark:text-gray-100   /* Light/dark text */

/* Interactive states */
.hover:shadow-lg.transition-all.duration-200   /* Smooth animations */
```

### Dark Mode Implementation

**JavaScript Toggle:**
```javascript
function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark.toString());
    updateDarkModeIcon(isDark);
}

function initDarkMode() {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'true' || (saved === null && prefersDark);
    
    if (shouldBeDark) {
        document.documentElement.classList.add('dark');
    }
    
    updateDarkModeIcon(shouldBeDark);
}
```

**Tailwind Configuration:**
```javascript
tailwind.config = {
    darkMode: 'class',  // Use class-based dark mode
    theme: {
        extend: {
            colors: {
                primary: '#231F20',
                secondary: '#BB4430',
                accent: '#7EBDC2'
            }
        }
    }
}
```

### Interactive Features

**Copy to Clipboard:**
```javascript
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const icon = button.querySelector('.copy-icon');
        const textSpan = button.querySelector('.copy-text');
        
        // Show success state
        icon.innerHTML = checkmarkSVG;
        textSpan.textContent = 'Copied!';
        button.classList.add('bg-green-500');
        
        // Reset after 2 seconds
        setTimeout(() => {
            icon.innerHTML = clipboardSVG;
            textSpan.textContent = 'Copy';
            button.classList.remove('bg-green-500');
        }, 2000);
    });
}
```

## 📡 API Documentation

### Authentication Endpoints

#### POST /register
Register a new user account.

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response:**
- Success: Redirect to `/login`
- Error: Render register page with error message

#### POST /login
Authenticate user and create session.

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response:**
- Success: Set JWT cookie, redirect to `/dashboard`
- Error: Render login page with error message

#### GET /logout
Clear user session and redirect to homepage.

**Response:**
- Clear JWT cookie
- Redirect to `/`

### URL Management Endpoints

#### GET /dashboard
Get user's dashboard with all URLs and statistics.

**Authentication:** Required

**Response Data:**
```javascript
{
    user: currentUser,
    urls: [/* user's URLs */],
    host: "http://localhost:3000",
    shortDomain: "https://lnk.to",
    totalClicks: 42,
    totalLinks: 5,
    clickRate: "8.4"
}
```

#### POST /shorten
Create a new shortened URL.

**Authentication:** Required

**Request Body:**
```json
{
    "fullUrl": "https://www.example.com/very/long/url",
    "custom": "mylink"  // Optional custom alias
}
```

**Response:**
- Success: Redirect to `/dashboard`
- Error: Display error message

#### POST /delete/:id
Delete a specific URL.

**Authentication:** Required
**Authorization:** URL must belong to authenticated user

**Parameters:**
- `id`: MongoDB ObjectId of the URL to delete

**Response:**
- Success: Redirect to `/dashboard`
- Error: 404 or 403 status

#### GET /:shortCode
Redirect to original URL and increment click counter.

**Parameters:**
- `shortCode`: The short URL identifier

**Response:**
- Success: 301 redirect to original URL
- Error: 404 "URL not found"

### Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).send('Invalid input data');
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.redirect('/login');
    }
    
    res.status(500).send('Internal Server Error');
});
```

## 🛡️ Security Measures

### Input Validation

**URL Validation:**
```javascript
const validator = require('validator');

function validateURL(url) {
    if (!validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true
    })) {
        throw new Error('Invalid URL format');
    }
    
    // Prevent shortened URL loops
    if (url.includes(process.env.SHORT_DOMAIN)) {
        throw new Error('Cannot shorten our own domain');
    }
}
```

**Custom Alias Validation:**
```javascript
function validateCustomAlias(alias) {
    // Allow only alphanumeric, hyphens, and underscores
    if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
        throw new Error('Invalid characters in alias');
    }
    
    // Length limits
    if (alias.length < 2 || alias.length > 20) {
        throw new Error('Alias must be 2-20 characters');
    }
    
    // Reserved words
    const reserved = ['api', 'admin', 'www', 'login', 'register'];
    if (reserved.includes(alias.toLowerCase())) {
        throw new Error('Alias is reserved');
    }
}
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later'
});

// Strict rate limiting for URL creation
const createLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 URL creations per minute
    message: 'Too many URLs created, please wait'
});

app.use('/shorten', createLimiter);
app.use(generalLimiter);
```

### SQL Injection Prevention

Using Mongoose ODM prevents SQL injection attacks:

```javascript
// Safe parameterized queries
await Url.findOne({ shortUrl: req.params.short });
await User.findOne({ email: req.body.email });

// Mongoose automatically escapes and validates
```

### XSS Prevention

**EJS Auto-escaping:**
```html
<!-- Automatically escaped -->
<%= userInput %>

<!-- Manual escaping when needed -->
<%- escapeHtml(userInput) %>
```

**Content Security Policy:**
```javascript
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; " +
        "style-src 'self' 'unsafe-inline';"
    );
    next();
});
```

## ⚡ Performance Optimization

### Database Optimization

**Indexing Strategy:**
```javascript
// Primary indexes
UrlSchema.index({ shortUrl: 1 }, { unique: true });  // Fast lookups
UserSchema.index({ email: 1 }, { unique: true });    // Authentication

// Compound indexes
UrlSchema.index({ user: 1, createdAt: -1 });         // User dashboard queries
UrlSchema.index({ user: 1, clicks: -1 });            // Top performing URLs
```

**Query Optimization:**
```javascript
// Efficient user URL fetching
const urls = await Url.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();  // Return plain JS objects, not Mongoose docs

// Aggregation for statistics
const stats = await Url.aggregate([
    { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
    { $group: {
        _id: null,
        totalUrls: { $sum: 1 },
        totalClicks: { $sum: '$clicks' },
        avgClicks: { $avg: '$clicks' }
    }}
]);
```

### Caching Strategy

**In-Memory Caching:**
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

// Cache popular short URLs
app.get('/:short', async (req, res) => {
    const cacheKey = `url:${req.params.short}`;
    let url = cache.get(cacheKey);
    
    if (!url) {
        url = await Url.findOne({ shortUrl: req.params.short });
        if (url) {
            cache.set(cacheKey, url);
        }
    }
    
    if (!url) {
        return res.status(404).send('URL not found');
    }
    
    // Increment counter (don't wait)
    Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } }).exec();
    
    res.redirect(301, url.fullUrl);
});
```

**Redis Integration (Production):**
```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache with Redis
async function getCachedUrl(shortCode) {
    const cached = await client.get(`url:${shortCode}`);
    if (cached) {
        return JSON.parse(cached);
    }
    
    const url = await Url.findOne({ shortUrl: shortCode });
    if (url) {
        await client.setex(`url:${shortCode}`, 300, JSON.stringify(url));
    }
    
    return url;
}
```

### Frontend Optimization

**Asset Optimization:**
```html
<!-- Preload critical resources -->
<link rel="preload" href="https://cdn.tailwindcss.com" as="style">

<!-- Lazy load non-critical scripts -->
<script defer src="/js/analytics.js"></script>

<!-- Optimize images -->
<img src="logo.webp" alt="Logo" loading="lazy">
```

**JavaScript Optimization:**
```javascript
// Debounced search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const searchUrls = debounce((query) => {
    // Search implementation
}, 300);
```

## 🔄 Development Workflow

### Git Workflow

```bash
# Feature development
git checkout -b feature/click-analytics
git add .
git commit -m "Add click analytics dashboard"
git push origin feature/click-analytics

# Create pull request
# Code review
# Merge to main
```

### Testing Strategy

**Unit Tests:**
```javascript
const request = require('supertest');
const app = require('../server');

describe('URL Shortening', () => {
    test('should create short URL', async () => {
        const response = await request(app)
            .post('/shorten')
            .send({
                fullUrl: 'https://example.com',
                custom: 'test123'
            })
            .expect(302);  // Redirect after creation
    });
    
    test('should increment clicks', async () => {
        const url = await Url.create({
            fullUrl: 'https://example.com',
            shortUrl: 'test123',
            user: userId
        });
        
        await request(app)
            .get('/test123')
            .expect(301);
            
        const updated = await Url.findById(url._id);
        expect(updated.clicks).toBe(1);
    });
});
```

**Integration Tests:**
```javascript
describe('Authentication Flow', () => {
    test('should register and login user', async () => {
        // Register
        await request(app)
            .post('/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
            
        // Login
        const response = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
            
        expect(response.headers['set-cookie']).toBeDefined();
    });
});
```

### Code Quality

**ESLint Configuration:**
```json
{
    "extends": ["eslint:recommended", "node"],
    "rules": {
        "no-console": "warn",
        "no-unused-vars": "error",
        "semi": ["error", "always"],
        "quotes": ["error", "single"]
    }
}
```

**Prettier Configuration:**
```json
{
    "singleQuote": true,
    "trailingComma": "es5",
    "tabWidth": 2,
    "semi": true,
    "printWidth": 80
}
```

## 🚀 Deployment Guide

### Environment Setup

**Production Environment Variables:**
```env
# Database
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/linkshort

# Security
JWT_SECRET=your-super-secure-random-string-here
NODE_ENV=production

# Server
PORT=443
DOMAIN=yourdomain.com
SHORT_DOMAIN=https://yourdomain.com

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Optional: Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S linkshort -u 1001

# Change ownership
RUN chown -R linkshort:nodejs /app
USER linkshort

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGO_URL=mongodb://mongo:27017/linkshort
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    restart: unless-stopped

  redis:
    image: redis:6.2-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongodb_data:
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /public {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Monitoring & Logging

**PM2 Configuration:**
```json
{
  "apps": [{
    "name": "linkshort",
    "script": "server.js",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production",
      "PORT": 3000
    },
    "log_file": "logs/combined.log",
    "out_file": "logs/out.log",
    "error_file": "logs/error.log",
    "log_date_format": "YYYY-MM-DD HH:mm Z"
  }]
}
```

**Winston Logging:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'linkshort' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues

**Problem:** `MongoServerError: Authentication failed`

**Solution:**
```javascript
// Check connection string format
MONGO_URL=mongodb://username:password@host:port/database

// For MongoDB Atlas
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database

// Local MongoDB without auth
MONGO_URL=mongodb://localhost:27017/linkshort
```

#### 2. JWT Token Issues

**Problem:** `JsonWebTokenError: invalid signature`

**Solution:**
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Set in .env
JWT_SECRET=your-generated-secret-here
```

#### 3. Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm start
```

#### 4. Dark Mode Not Working

**Problem:** Dark mode toggle doesn't work

**Solution:**
```javascript
// Ensure Tailwind config includes darkMode
tailwind.config = {
    darkMode: 'class',  // This is required
    // ... rest of config
}

// Check localStorage
console.log(localStorage.getItem('darkMode'));

// Manual toggle
document.documentElement.classList.toggle('dark');
```

#### 5. Click Tracking Not Working

**Problem:** Clicks not incrementing

**Solution:**
```javascript
// Check database indexes
db.urls.getIndexes()

// Verify update operation
await Url.findByIdAndUpdate(
    url._id, 
    { $inc: { clicks: 1 } },
    { new: true }  // Return updated document
);

// Check for errors in logs
console.log('Click increment result:', result);
```

### Performance Issues

#### 1. Slow Database Queries

**Diagnosis:**
```javascript
// Enable MongoDB query logging
mongoose.set('debug', true);

// Profile slow queries
db.setProfilingLevel(2, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

**Solutions:**
```javascript
// Add missing indexes
UrlSchema.index({ user: 1, createdAt: -1 });

// Use lean queries
const urls = await Url.find({ user: userId }).lean();

// Limit results
const urls = await Url.find({ user: userId }).limit(50);
```

#### 2. Memory Leaks

**Diagnosis:**
```bash
# Monitor memory usage
node --inspect server.js

# Use clinic.js
npm install -g clinic
clinic doctor -- node server.js
```

**Solutions:**
```javascript
// Proper error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Close database connections
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
```

### Deployment Issues

#### 1. SSL Certificate Problems

```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com

# Verify SSL
openssl s_client -connect yourdomain.com:443
```

#### 2. Docker Issues

```bash
# Build issues
docker build --no-cache -t linkshort .

# Container logs
docker logs linkshort-container

# Connect to container
docker exec -it linkshort-container /bin/sh
```

## 📚 Additional Resources

### Documentation Links
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [EJS Template Engine](https://ejs.co/)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Performance Resources
- [Node.js Performance Monitoring](https://nodejs.org/en/docs/guides/simple-profiling/)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)

---

**This documentation is maintained alongside the project. For updates and contributions, please refer to the main repository.**