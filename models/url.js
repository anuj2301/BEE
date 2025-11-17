const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
    fullUrl: String,
    shortUrl: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    isExpired: { type: Boolean, default: false },
    qrCode: { type: String, default: null }
});

// TTL index to automatically delete expired URLs
UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

module.exports = mongoose.model("Url", UrlSchema);