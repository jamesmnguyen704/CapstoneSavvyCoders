import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

// Warn if API key missing (prevents hard crashes)
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ WARNING: RESEND_API_KEY missing — emails will not send");
}

// Safe Resend initialization so server doesn't crash
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  // fallback prevents throwing "Missing API key" error
  resend = null;
}

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

    // OPTIONAL — Send welcome email (only if resend is active)
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Welcome to Cinemetrics!",
          html: `
            <h2>Hello ${user.username}!</h2>
            <p>Your Cinemetrics account is now active.</p>
            <p>Enjoy exploring movies, trailers, and stats!</p>
          `
        });
      } catch (emailErr) {
        console.log("Email send error:", emailErr.message);
      }
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
