// BACKUP of store/login.js — saved before rollback
// === BEGIN BACKUP ===
// File: store/login.js
// Purpose: State store for the Login view and its form values.
// Notes: Form values are read by the client-side auth handler when submitting.
export default {
  header: "Login",
  view: "login", // view key must match exported view name in `views/index.js`
  form: {
    loginId: "", // Username or email input
    password: "" // Password input
  }
};

// === END BACKUP ===
