// File: store/login.js
// Purpose: State store for the Login view and its form values.
// Notes: Form values are read by the client-side auth handler when submitting.
export default {
  header: "Login",
  view: "login",
  form: {
    loginId: "",
    password: ""
  }
};
