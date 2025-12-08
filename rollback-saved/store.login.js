// BACKUP of store/login.js — saved before rollback
// === BEGIN BACKUP ===
// File: store/login.js
// Purpose: State store for the Login view and its form values.
// Notes: Form values are read by the client-side auth handler when submitting.
export default {
  header: "Login",
  view: "Login", // Must match the component name exactly
  form: {
    loginId: "",   // Username or email input
    password: ""   // Password input
  }
};

// === END BACKUP ===
