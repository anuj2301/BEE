const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
    fullUrl: String,
    shortUrl: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Url", UrlSchema);