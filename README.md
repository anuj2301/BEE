# LinkShort - URL Shortener

A modern, full-featured URL shortener built with Node.js, Express, and MongoDB. Create short, shareable links with click tracking and user management.

![LinkShort Dashboard](https://img.shields.io/badge/Status-Active-green)
![Node.js](https://img.shields.io/badge/Node.js-v14+-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## ✨ Features

### Core Features
- 🔗 **URL Shortening**: Convert long URLs into short, memorable links
- 👤 **User Authentication**: Secure registration and login system with JWT
- 📊 **Click Tracking**: Monitor how many times your links are clicked
- 🎯 **Custom Aliases**: Create custom short codes for your URLs
- ⏱️ **Link Expiration**: Set expiration dates for temporary links
- 📱 **QR Code Generation**: Generate QR codes for easy mobile sharing

### UI/UX Features
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🌓 **Dark/Light Mode**: Theme toggle with localStorage persistence
- 📱 **Mobile Friendly**: Fully responsive across all devices
- 🎭 **SVG Icons**: Professional iconography throughout

### Performance & Caching
- 🚀 **Redis Caching**: Server-side caching for improved performance
- 💾 **Browser Caching**: Client-side localStorage for faster loading
- ⚡ **Optimized**: MongoDB indexing and efficient queries

### Security & Production
- 🔒 **HTTPS/SSL Support**: Secure connections with multiple certificate options
- 🔐 **Secure Authentication**: JWT tokens and bcrypt password hashing
- ☁️ **AWS Ready**: Pre-configured for Elastic Beanstalk deployment
- 🧪 **Tested**: Unit tests, integration tests, and browser automation

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/anuj2301/BEE.git
   cd BEE
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   MONGO_URL=mongodb://localhost:27017/linkshort
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   SHORT_DOMAIN=https://lnk.to
   
   # Redis (optional but recommended)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ENABLE_REDIS=true
   
   # HTTPS (optional for local dev)
   ENABLE_HTTPS=false
   HTTPS_PORT=3443
   HTTPS_CERT_PATH=./certs/localhost.pem
   HTTPS_KEY_PATH=./certs/localhost-key.pem
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🧪 Testing

This project includes comprehensive testing:

### Unit & Integration Tests (Jest)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Browser Integration Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run integration tests
npm run test:integration

# Run with UI mode
npm run test:integration:ui
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 📦 Environment Variables

| Variable            | Description                    | Default                               | Required |
| ------------------- | ------------------------------ | ------------------------------------- | -------- |
| `MONGO_URL`         | MongoDB connection string      | `mongodb://localhost:27017/linkshort` | ✅       |
| `JWT_SECRET`        | Secret key for JWT tokens      | -                                     | ✅       |
| `PORT`              | Server port                    | `3000`                                | ❌       |
| `SHORT_DOMAIN`      | Domain for short links display | `https://lnk.to`                      | ❌       |
| `REDIS_HOST`        | Redis server host              | `localhost`                           | ❌       |
| `REDIS_PORT`        | Redis server port              | `6379`                                | ❌       |
| `ENABLE_REDIS`      | Enable Redis caching           | `true`                                | ❌       |
| `ENABLE_HTTPS`      | Enable HTTPS server            | `false`                               | ❌       |
| `HTTPS_PORT`        | HTTPS server port              | `3443`                                | ❌       |
| `HTTPS_CERT_PATH`   | Path to SSL certificate        | `./certs/localhost.pem`               | ❌       |
| `HTTPS_KEY_PATH`    | Path to SSL private key        | `./certs/localhost-key.pem`           | ❌       |

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis with ioredis client
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing, HTTPS/SSL support

### Frontend
- **Templating**: EJS (Embedded JavaScript)
- **Styling**: Tailwind CSS v3.0+
- **Icons**: SVG icons (Heroicons)
- **Caching**: localStorage for client-side caching

### Testing
- **Unit Tests**: Jest with Supertest
- **Integration Tests**: Playwright for browser automation
- **Coverage**: Built-in code coverage reporting

### DevOps
- **Development**: Nodemon for hot reloading
- **Deployment**: AWS Elastic Beanstalk ready
- **SSL**: Multiple options (self-signed, Let's Encrypt, ACM)

## 📁 Project Structure

``` text
BEE/
├── models/
│   ├── user.js          # User model schema
│   └── url.js           # URL model schema
├── views/
│   ├── partials/
│   │   ├── header.ejs   # Navigation header
│   │   └── footer.ejs   # Footer component
│   ├── index.ejs        # Homepage
│   ├── login.ejs        # Login page
│   ├── register.ejs     # Registration page
│   ├── dashboard.ejs    # User dashboard
│   └── layout.ejs       # Base layout (unused)
├── public/
│   ├── css/                    # Custom stylesheets
│   └── js/                     # Client-side JavaScript
├── __tests__/                  # Test files
│   ├── models.test.js          # Model tests
│   ├── auth.test.js            # Auth tests
│   ├── utils.test.js           # Utility tests
│   └── integration.test.js     # Integration tests
├── e2e/                        # End-to-end tests
│   └── app.spec.js             # Playwright browser tests
├── .ebextensions/              # AWS EB configuration
│   ├── nodecommand.config      # Node.js settings
│   └── redis.config            # Redis setup
├── certs/                      # SSL certificates (gitignored)
├── server.js                   # Main application file
├── redis-client.js             # Redis cache helper
├── generate-certs.js           # SSL certificate generator
├── playwright.config.js        # Playwright configuration
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
├── AWS_DEPLOYMENT_GUIDE.md     # AWS deployment instructions
├── SSL_SETUP_GUIDE.md          # SSL/HTTPS setup guide
└── README.md                   # Project documentation
```

## 🎯 API Endpoints

### Authentication Routes

- `GET /` - Homepage
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /register` - Registration page
- `POST /register` - Process registration
- `GET /logout` - Logout user

### URL Management Routes

- `GET /dashboard` - User dashboard with URL list (Redis cached)
- `POST /shorten` - Create new short URL
- `POST /delete/:id` - Delete a URL (authenticated)
- `GET /:shortCode` - Redirect to original URL (Redis cached, increments clicks)
- `GET /qr/download/:id` - Download QR code for URL
- `GET /api/redis-status` - Check Redis cache status (authenticated)

## 🔧 Usage

### Creating Short URLs

1. **Register/Login** to your account
2. **Navigate** to the dashboard
3. **Enter** your long URL in the form
4. **Optional**: Add a custom alias
5. **Click** "Shorten URL"
6. **Copy** and share your new short link!

### Tracking Clicks

- View click statistics on your dashboard
- See total clicks across all your links
- Monitor individual URL performance
- Track creation dates and click rates

### Dark Mode

Click the moon/sun icon in the navigation to toggle between light and dark themes. Your preference is saved automatically.

## 📊 Features in Detail

### URL Shortening Algorithm

- Generates 6-character alphanumeric codes
- Ensures uniqueness with collision detection
- Supports custom aliases for branded links

### Click Analytics

- Real-time click tracking
- Individual URL statistics
- Dashboard overview with totals
- Average clicks per link calculation

### Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Protected routes and user isolation

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production Build

```bash
npm start
```

### AWS Elastic Beanstalk Deployment

Complete guide available in [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

Quick start:
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init
eb create linksnap-prod
eb deploy
```

### SSL/HTTPS Setup

Multiple options available - see [SSL_SETUP_GUIDE.md](./SSL_SETUP_GUIDE.md):

- **Local Development**: mkcert or self-signed certificates
- **Production VPS**: Let's Encrypt with Certbot
- **AWS**: Certificate Manager (ACM)
- **Simple**: Cloudflare SSL proxy

Quick local HTTPS:
```bash
node generate-certs.js
# Update .env: ENABLE_HTTPS=true
npm start
```

### Redis Setup

**Local (Windows)**:
```powershell
# Download Redis from https://github.com/microsoftarchive/redis/releases
# Or use Docker:
docker run -d -p 6379:6379 redis:alpine
```

**Linux/Mac**:
```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Mac
brew install redis
brew services start redis
```

Update `.env`:
```env
ENABLE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [https://github.com/anuj2301/BEE](https://github.com/anuj2301/BEE)
- **Issues**: [Report a bug](https://github.com/anuj2301/BEE/issues)

## 🙏 Acknowledgments

- Built with ❤️ using Node.js and MongoDB
- UI powered by Tailwind CSS
- Icons from Heroicons
- Inspiration from modern URL shortening services

---
Adding in some changes
