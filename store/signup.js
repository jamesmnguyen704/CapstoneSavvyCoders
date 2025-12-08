// File: store/signup.js
// Purpose: State store for the Signup view and its form values.
// Notes: Form values are read by the client-side signup handler when submitting.
export default {
  header: "Sign Up",
  view: "signup",
  form: {
    username: "",
    email: "",
    password: ""
  }
};
