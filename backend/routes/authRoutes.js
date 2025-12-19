// import express from "express";
// import passport from "passport";
// import jwt from "jsonwebtoken";

// const router = express.Router();

// // Google OAuth Login
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Google OAuth Callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: `${
//       process.env.FRONTEND_URL || "http://localhost:3000"
//     }/plans`,
//   }),
//   (req, res) => {
//     console.log("Google OAuth Callback - User:", {
//       id: req.user._id,
//       name: req.user.name,
//       email: req.user.email,
//       avatar: req.user.avatar,
//     });

//     // Generate JWT token
//     const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     // Store user and token in query params and redirect to frontend
//     const userData = JSON.stringify({
//       id: req.user._id,
//       name: req.user.name,
//       email: req.user.email,
//       role: req.user.role,
//       avatar: req.user.avatar,
//     });

//     console.log("Redirecting with userData:", userData);

//     const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//     // Redirect to frontend with token and user data
//     res.redirect(
//       `${frontendUrl}/#/dashboard?token=${encodeURIComponent(
//         token
//       )}&user=${encodeURIComponent(userData)}`
//     );
//   }
// );

// export default router;
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Google OAuth Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/plans`,
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/plans`);
    }

    console.log("Google OAuth Callback - User:", {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });

    // Generate JWT token with user info
    const token = jwt.sign(
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar, // Optional: include avatar if needed
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Redirect to frontend with only token in URL
    res.redirect(`${frontendUrl}/#/dashboard?token=${encodeURIComponent(token)}`);
  }
);

export default router;
