// auth.js file handles user authentication such as for my signup and login.

import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// SIGNUP: create a new user account
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // make sure all fields were filled in
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // The frontend already checks these, but that's bypassable by anyone
    // talking to the API directly — the server has to be the real gate.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check if user already exists by username or email
    const exists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "User already exists with email or username" });
    }

    // create the actual user in the database
    const user = await User.create({ username, email, password });

    // send the welcome email (if email fails, it won't stop the signup)
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
            <li>🚀 Curated lists of 2026–2027 anticipated films</li>
            <li>🎞️ Trailers and cast info</li>
            <li>📊 Ratings and insights</li>
            <li>🗣️ A growing movie community</li>
          </ul>

          <p><strong>Lights. Camera. Action.</strong></p>

          <p><strong>James Nguyen</strong><br>
          CEO of Cinemetrics<br>
          <em>“Together, we’re building the future of movie discovery.”</em></p>
        `
      });
    } catch (emailErr) {
      // log email failure but still allow signup to succeed
      console.log("Email send error:", emailErr?.message || emailErr);
    }

    // tell frontend that signup worked
    res.json({ message: "User registered successfully" });
  } catch (err) {
    // Logged server-side, not returned — a mongoose validation error can
    // echo back schema/field details nobody outside this server needs to see.
    console.error("SIGNUP ERROR:", err.message);
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
};

// LOGIN: check username/email + password, then return a JWT token
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // user can login with username or email, so normalize it
    const lookup = (loginId || "").toLowerCase();

    // find the user in the database
    const user = await User.findOne({
      $or: [{ username: lookup }, { email: lookup }]
    });

    // One message for both failure cases. "User not found" vs "Incorrect
    // password" told an attacker which half of their guess was right —
    // exactly what lets a username list turn into a confirmed-accounts list
    // before the password-guessing even starts.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    // create a signed JWT token so the frontend knows this user is authenticated
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || null,
        isCharacter: user.isCharacter || false
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" } // token good for 12 hours
    );

    // send token back to the frontend
    res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};
