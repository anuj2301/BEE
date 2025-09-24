const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const User = require("./models/user");
const Url = require("./models/url");

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

// Auth middleware (verify JWT)
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
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

app.use(authMiddleware);

// Routes
app.get("/", (req, res) => res.render("index", { user: req.user }));

// Dashboard
app.get("/dashboard", requireAuth, async (req, res) => {
  const urls = await Url.find({ user: req.user.id });
  const host = req.protocol + '://' + req.get('host');
  const shortDomain = process.env.SHORT_DOMAIN || 'https://lnk.to';
  
  // Calculate total clicks
  const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const totalLinks = urls.length;
  const clickRate = totalLinks > 0 ? ((totalClicks / totalLinks).toFixed(1)) : 0;
  
  res.render("dashboard", { 
    user: req.user, 
    urls, 
    host, 
    shortDomain, 
    totalClicks, 
    totalLinks,
    clickRate 
  });
});

// Shorten
app.post("/shorten", requireAuth, async (req, res) => {
  const { fullUrl, custom } = req.body;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // validate fullUrl (basic)
  if (!fullUrl) return res.redirect('/dashboard');

  // helper to generate a 6-char code
  function generateCode() {
    let shortCode = '';
    for (let i = 0; i < 6; i++) {
      shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return shortCode;
  }

  // handle custom alias
  let short = custom && custom.trim() ? custom.trim() : null;
  if (short) {
    const exists = await Url.findOne({ shortUrl: short });
    if (exists) return res.send('Custom alias already taken');
  } else {
    // generate until unique (with a safety limit)
    let attempts = 0;
    do {
      short = generateCode();
      attempts++;
      var exists = await Url.findOne({ shortUrl: short });
    } while (exists && attempts < 5);
    if (exists) return res.send('Could not generate unique short URL, try again');
  }

  await Url.create({ fullUrl, shortUrl: short, user: req.user.id });
  res.redirect('/dashboard');
});

// Delete a short URL (only owner)
app.post('/delete/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  await Url.findOneAndDelete({ _id: id, user: req.user.id });
  res.redirect('/dashboard');
});

// Auth routes
app.get("/login", (req, res) => res.render("login", { message: "", user: req.user }));

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render("login", { message: "User not found", user: req.user });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.render("login", { message: "Invalid credentials", user: req.user });

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/dashboard");
});

app.get("/register", (req, res) => res.render("register", { message: "", user: req.user }));

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.render("register", { message: "Email already exists", user: req.user });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed });
  res.redirect("/login");
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// Redirect short URL (placed last so it doesn't override other routes)
app.get('/:short', async (req, res) => {
  const url = await Url.findOne({ shortUrl: req.params.short });
  if (!url) return res.send('URL not found');
  
  // Increment click count
  await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });
  
  res.redirect(url.fullUrl);
});

// Start
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
