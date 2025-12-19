// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import User from "../models/User.js";
// import dotenv from "dotenv";
// import axios from "axios";

// dotenv.config(); 

// async function downloadImageAsBase64(imageUrl) {
//   try {
//     const response = await axios.get(imageUrl, {
//       responseType: "arraybuffer",
//       timeout: 5000,
//     });
//     const base64 = Buffer.from(response.data, "binary").toString("base64");
//     const contentType = response.headers["content-type"] || "image/jpeg";
//     return `data:${contentType};base64,${base64}`;
//   } catch (error) {
//     console.error("Failed to download image:", error.message);
//     return null;
//   }
// }

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:5000/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails[0].value;
//         const googleAvatarUrl = profile.photos?.[0]?.value;

//         let avatarDataUrl = null;
//         if (googleAvatarUrl) {
//           avatarDataUrl = await downloadImageAsBase64(googleAvatarUrl);
//         }

//         let user = await User.findOne({ email });

//         if (!user) {
//           user = await User.create({
//             name: profile.displayName,
//             email,
//             avatar: avatarDataUrl,
//             password: "oauth_user",
//           });
//         } else {
//           //update avator after login
//           if (avatarDataUrl) {
//             user.avatar = avatarDataUrl;
//             await user.save();
//           }
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );


// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// export default passport;
// auth/googlePassport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

async function downloadImageAsBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 5000,
    });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    const contentType = response.headers["content-type"] || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to download image:", error.message);
    return null;
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://real-estate-saas-crm.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleAvatarUrl = profile.photos?.[0]?.value;
        const googleName = profile.displayName || `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();

        let avatarDataUrl = null;
        if (googleAvatarUrl) {
          avatarDataUrl = await downloadImageAsBase64(googleAvatarUrl);
        }

        let user = await User.findOne({ email });

        if (!user) {
          // Create new user with Google name
          user = await User.create({
            name: googleName || "User",
            email,
            avatar: avatarDataUrl,
            password: "oauth_user",
            // you can also store googleId: profile.id if useful
            googleId: profile.id,
          });
        } else {
          // Don't overwrite an existing user's custom name.
          // Update avatar if new one available.
          if (avatarDataUrl) {
            user.avatar = avatarDataUrl;
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

/* --------------------------------------------------------------------------
   The following exports are your token-based Google login handler.
   Make sure this is exported from the same module or a controller file and
   that your route wiring imports it correctly.
   -------------------------------------------------------------------------- */

