import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// ---------------------- SIGNUP ----------------------
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if username or email already exists
    const exists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "User already exists with email or username" });
    }

    // Create user
    const user = await User.create({ username, email, password });

    // Send welcome email (uses helper which handles missing API key)
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Cinemetrics!",
        html: `
          <h1>Welcome to Cinemetrics!</h1>

          <p>Every great story begins with a single moment… and this is yours.</p>

          <p>You’re now part of a platform built to elevate the movie experience — from massive upcoming blockbusters to hidden indie gems.</p>

          <p><strong>Your Cinemetrics membership unlocks:</strong></p>
          <ul>
            <li>🚀 Curated lists of 2026–2027’s most anticipated films</li>
            <li>🎞️ High-quality trailers and cast details</li>
            <li>📊 Real-time movie ratings and insights</li>
            <li>🗣️ A growing community of movie fans</li>
          </ul>

          <p>The Cinemetrics universe is expanding fast — and now you’re at the center of it.</p>

          <p><strong>Lights. Camera. Action.</strong></p>

          <p><strong>James Nguyen</strong><br>
          CEO of Cinemetrics<br>
          <em>“Together, we’re building the future of movie discovery.”</em></p>
        `
      });
    } catch (emailErr) {
      console.log(
        "Email send error:",
        emailErr && emailErr.message ? emailErr.message : emailErr
      );
    }

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- LOGIN ----------------------
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // Login with either username OR email
    // Normalize lookup to lowercase because User schema lowercases username/email on save
    const lookup = (loginId || "").toString().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: lookup }, { email: lookup }]
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password against hashed password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Create signed JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
