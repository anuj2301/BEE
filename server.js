const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const QRCode = require("qrcode");
const fs = require("fs");
const https = require("https");
const http = require("http");
require("dotenv").config({ quiet: true });

const User = require("./models/user");
const Url = require("./models/url");

// Redis client (optional - falls back gracefully if Redis not available)
let cache = null;
if (process.env.ENABLE_REDIS !== 'false') {
  try {
    const redisModule = require("./redis-client");
    cache = redisModule.cache;
  } catch (error) {
    console.log("Redis not available, continuing without cache");
  }
}

const app = express();

const PORT = process.env.PORT || 3000;

// DB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

// Auth middleware (verify JWT and check Redis session)
async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    // First verify JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If Redis is enabled, check if session exists and is not blacklisted
    if (cache) {
      // Check if token is blacklisted
      const isBlacklisted = await cache.isTokenBlacklisted(token);
      if (isBlacklisted) {
        res.clearCookie("token");
        req.user = null;
        return next();
      }
      
      // Check if session exists in Redis
      const session = await cache.getSession(token);
      if (!session) {
        // Session expired or was invalidated (logout)
        res.clearCookie("token");
        req.user = null;
        return next();
      }
      
      // Use session data from Redis (more up-to-date than JWT)
      req.user = session;
    } else {
      // Fallback to JWT data if Redis not available
      req.user = decoded;
    }
    
    next();
  } catch (err) {
    res.clearCookie("token");
    req.user = null;
    next();
  }
}

// Protect routes
function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/login");
  next();
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect("/login");
  if (!req.user.isAdmin) return res.redirect("/dashboard");
  next();
}

app.use(authMiddleware);

// Routes
app.get("/", (req, res) => res.render("index", { user: req.user }));

// Dashboard
app.get("/dashboard", requireAuth, async (req, res) => {
  // Always fetch fresh data from database to show accurate click counts
  // (URLs are frequently accessed/clicked, so cache would be stale)
  const urls = await Url.find({ user: req.user.id }).sort({ createdAt: -1 });
  
  const host = req.protocol + "://" + req.get("host");
  const shortDomain = process.env.SHORT_DOMAIN || "https://lnk.to";

  // Calculate total clicks
  const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const totalLinks = urls.length;
  const clickRate = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : 0;

  res.render("dashboard", {
    user: req.user,
    urls,
    host,
    shortDomain,
    totalClicks,
    totalLinks,
    clickRate,
    redisEnabled: !!cache,
  });
});

// Shorten
app.post("/shorten", requireAuth, async (req, res) => {
  const { fullUrl, custom, validityValue, validityUnit, generateQR } = req.body;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // validate fullUrl (basic)
  if (!fullUrl) return res.redirect("/dashboard");

  // helper to generate a 6-char code
  function generateCode() {
    let shortCode = "";
    for (let i = 0; i < 6; i++) {
      shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return shortCode;
  }

  // handle custom alias
  let short = custom && custom.trim() ? custom.trim() : null;
  if (short) {
    const exists = await Url.findOne({ shortUrl: short });
    if (exists) return res.send("Custom alias already taken");
  } else {
    // generate until unique (with a safety limit)
    let attempts = 0;
    do {
      short = generateCode();
      attempts++;
      var exists = await Url.findOne({ shortUrl: short });
    } while (exists && attempts < 5);
    if (exists)
      return res.send("Could not generate unique short URL, try again");
  }

  // Calculate expiration date based on unit
  let expiresAt = null;
  if (validityValue && validityValue > 0) {
    expiresAt = new Date();
    const value = parseInt(validityValue);

    if (validityUnit === "minutes") {
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
    } else if (validityUnit === "hours") {
      expiresAt.setHours(expiresAt.getHours() + value);
    } else if (validityUnit === "days") {
      expiresAt.setDate(expiresAt.getDate() + value);
    }
  }

  // Generate QR code if requested
  let qrCodeDataUrl = null;
  if (generateQR === "on" || generateQR === true) {
    const shortDomain = process.env.SHORT_DOMAIN || "https://lnk.to";
    const shortUrlFull = `${shortDomain}/${short}`;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(fullUrl);
    } catch (err) {
      console.error("QR Code generation error:", err);
    }
  }

  const newUrl = await Url.create({
    fullUrl,
    shortUrl: short,
    user: req.user.id,
    expiresAt,
    qrCode: qrCodeDataUrl,
  });
  
  res.redirect("/dashboard");
});

// Delete a short URL (only owner)
app.post("/delete/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  await Url.findOneAndDelete({ _id: id, user: req.user.id });
  res.redirect("/dashboard");
});

// Download QR Code
app.get("/qr/download/:id", requireAuth, async (req, res) => {
  const url = await Url.findOne({ _id: req.params.id, user: req.user.id });
  if (!url || !url.qrCode) {
    return res.send("QR Code not found");
  }

  // Convert base64 data URL to buffer
  const base64Data = url.qrCode.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  res.setHeader("Content-Type", "image/png");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="qr-${url.shortUrl}.png"`
  );
  res.send(buffer);
});

// Auth routes
app.get("/login", (req, res) =>
  res.render("login", { message: "", user: req.user })
);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.render("login", { message: "User not found", user: req.user });

  // Check if user is blacklisted
  if (user.isBlacklisted)
    return res.render("login", {
      message: "Your account has been suspended. Please contact support.",
      user: req.user,
    });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.render("login", {
      message: "Invalid credentials",
      user: req.user,
    });

  const userData = { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin || false };
  const token = jwt.sign(
    userData,
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  
  // Store session in Redis for instant invalidation capability
  if (cache) {
    await cache.setSession(token, userData, 3600); // 1 hour TTL
  }
  
  res.cookie("token", token, { httpOnly: true });
  
  // Redirect admin to admin panel, regular users to dashboard
  if (user.isAdmin) {
    res.redirect("/admin");
  } else {
    res.redirect("/dashboard");
  }
});

app.get("/register", (req, res) =>
  res.render("register", { message: "", user: req.user })
);

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.render("register", {
      message: "Email already exists",
      user: req.user,
    });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed });
  res.redirect("/login");
});

// Logout - invalidate session in Redis for instant logout
app.get("/logout", async (req, res) => {
  const token = req.cookies.token;
  
  // Delete session from Redis for instant invalidation
  if (token && cache) {
    await cache.deleteSession(token);
    // Also add to blacklist for the remaining JWT validity period
    await cache.blacklistToken(token, 3600);
  }
  
  res.clearCookie("token");
  res.redirect("/");
});

// Admin Panel Routes
app.get("/admin", requireAdmin, async (req, res) => {
  const users = await User.find().sort({ _id: -1 });
  const allUrls = await Url.find().populate("user").sort({ createdAt: -1 });
  
  // Calculate statistics
  const totalUsers = users.length;
  const totalLinks = allUrls.length;
  const totalClicks = allUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  
  res.render("admin", {
    user: req.user,
    users,
    allUrls,
    totalUsers,
    totalLinks,
    totalClicks
  });
});

// Admin: Delete user and all their URLs
app.post("/admin/delete-user/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  // Delete all URLs belonging to this user
  await Url.deleteMany({ user: id });
  
  // Delete the user
  await User.findByIdAndDelete(id);
  
  res.redirect("/admin");
});

// Admin: Delete any URL
app.post("/admin/delete-url/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await Url.findByIdAndDelete(id);
  res.redirect("/admin");
});

// Admin: Blacklist a user
app.post("/admin/blacklist-user/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  // Don't allow blacklisting admins
  if (user && !user.isAdmin) {
    await User.findByIdAndUpdate(id, { isBlacklisted: true });
    
    // If Redis is enabled, invalidate all user sessions
    if (cache) {
      // Note: This is a basic implementation. For production, you'd want to track user sessions
      // and invalidate them specifically. For now, the user won't be able to login again.
    }
  }
  
  // Redirect back based on referer
  const referer = req.get('Referer');
  if (referer && referer.includes('/admin/user/')) {
    res.redirect(referer);
  } else {
    res.redirect("/admin");
  }
});

// Admin: Unblacklist a user
app.post("/admin/unblacklist-user/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { isBlacklisted: false });
  
  // Redirect back based on referer
  const referer = req.get('Referer');
  if (referer && referer.includes('/admin/user/')) {
    res.redirect(referer);
  } else {
    res.redirect("/admin");
  }
});

// User Profile - regular users can view their own profile
app.get("/profile", requireAuth, async (req, res) => {
  const viewUser = await User.findById(req.user.id);
  
  if (!viewUser) {
    return res.redirect("/dashboard");
  }
  
  const userUrls = await Url.find({ user: req.user.id }).sort({ createdAt: -1 });
  const totalClicks = userUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const totalLinks = userUrls.length;
  
  res.render("user-detail", {
    user: req.user,
    viewUser,
    userUrls,
    totalClicks,
    totalLinks,
    isOwnProfile: true,
    canDelete: false
  });
});

// Admin: View any user's details
app.get("/admin/user/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const viewUser = await User.findById(id);
  
  if (!viewUser) {
    return res.redirect("/admin");
  }
  
  const userUrls = await Url.find({ user: id }).sort({ createdAt: -1 });
  const totalClicks = userUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const totalLinks = userUrls.length;
  
  res.render("user-detail", {
    user: req.user,
    viewUser,
    userUrls,
    totalClicks,
    totalLinks,
    isOwnProfile: req.user.id === id,
    canDelete: true
  });
});

// Redis status API endpoint
app.get("/api/redis-status", requireAuth, async (req, res) => {
  if (!cache) {
    return res.json({ enabled: false, message: "Redis not configured" });
  }
  
  try {
    const keys = await cache.getKeys('*');
    const sessionKeys = keys.filter(k => k.startsWith('session:')).length;
    const refreshKeys = keys.filter(k => k.startsWith('refresh:')).length;
    const blacklistKeys = keys.filter(k => k.startsWith('blacklist:')).length;
    
    res.json({
      enabled: true,
      connected: true,
      stats: {
        totalKeys: keys.length,
        activeSessions: sessionKeys,
        refreshTokens: refreshKeys,
        blacklistedTokens: blacklistKeys
      }
    });
  } catch (error) {
    res.json({ enabled: true, connected: false, error: error.message });
  }
});

// Redirect short URL (placed last so it doesn't override other routes)
app.get("/:short", async (req, res) => {
  const url = await Url.findOne({ shortUrl: req.params.short });
  if (!url) return res.send("URL not found");

  // Check if URL has expired
  if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
    await Url.findByIdAndDelete(url._id);
    return res.send("This link has expired");
  }

  // Increment click count in database
  await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });

  res.redirect(url.fullUrl);
});

// Start server (HTTP or HTTPS based on configuration)
const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const HTTP_PORT = process.env.HTTP_PORT || PORT;

if (ENABLE_HTTPS) {
  // Try to start HTTPS server
  try {
    const HTTPS_KEY = process.env.HTTPS_KEY_PATH || './certs/localhost-key.pem';
    const HTTPS_CERT = process.env.HTTPS_CERT_PATH || './certs/localhost.pem';
    
    const key = fs.readFileSync(HTTPS_KEY);
    const cert = fs.readFileSync(HTTPS_CERT);
    
    const httpsServer = https.createServer({ key, cert }, app);
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`✓ HTTPS server running on https://localhost:${HTTPS_PORT}`);
    });
    
    // HTTP redirect server
    http.createServer((req, res) => {
      const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
      res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
      res.end();
    }).listen(HTTP_PORT, () => {
      console.log(`HTTP redirect server running on port ${HTTP_PORT} (redirects to HTTPS)`);
    });
  } catch (err) {
    console.error('Failed to start HTTPS server:', err.message);
    console.log('Falling back to HTTP. Run "node generate-certs.js" to generate certificates.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
} else {
  // Standard HTTP server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
