// BACKUP of store/signup.js — saved before rollback
// === BEGIN BACKUP ===
// File: store/signup.js
// Purpose: State store for the Signup view and its form values.
// Notes: Form values are read by the client-side signup handler when submitting.
export default {
  header: "Sign Up",
  view: "signup", // view key must match exported view name in `views/index.js`
  form: {
    username: "", // Chosen username
    email: "", // User's email address
    password: "" // Account password
  }
};

// === END BACKUP ===
