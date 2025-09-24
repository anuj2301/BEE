# LinkShort - URL Shortener

A modern, full-featured URL shortener built with Node.js, Express, and MongoDB. Create short, shareable links with click tracking and user management.

![LinkShort Dashboard](https://img.shields.io/badge/Status-Active-green)
![Node.js](https://img.shields.io/badge/Node.js-v14+-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## ✨ Features

- 🔗 **URL Shortening**: Convert long URLs into short, memorable links
- 👤 **User Authentication**: Secure registration and login system
- 📊 **Click Tracking**: Monitor how many times your links are clicked
- 🎨 **Modern UI**: Beautiful, responsive design with dark/light mode
- 📱 **Mobile Friendly**: Fully responsive across all devices
- 🔒 **Secure**: JWT-based authentication and input validation
- ⚡ **Fast**: Optimized for performance with MongoDB indexing
- 🎯 **Custom Aliases**: Create custom short codes for your URLs

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
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📦 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/linkshort` | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `PORT` | Server port | `3000` | ❌ |
| `SHORT_DOMAIN` | Domain for short links display | `https://lnk.to` | ❌ |

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: EJS templating, Tailwind CSS
- **Security**: bcryptjs for password hashing
- **Development**: Nodemon for hot reloading

## 📁 Project Structure

```
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
│   ├── css/            # Custom stylesheets
│   └── js/             # Client-side JavaScript
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
└── README.md          # Project documentation
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
- `GET /dashboard` - User dashboard with URL list
- `POST /shorten` - Create new short URL
- `POST /delete/:id` - Delete a URL (authenticated)
- `GET /:shortCode` - Redirect to original URL (increments clicks)

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

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
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

**Made with ❤️**