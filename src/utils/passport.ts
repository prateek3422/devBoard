import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/Auth.models";
import { ApiError } from "./ApiError";

try {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, next) => {
    try {
      const user = User.findById(id);
      if (user) {
        //@ts-ignore
        next(null, user);
      } else {
        next(new ApiError(404, "User not found"), null);
      }
    } catch (error) {
      return next(new ApiError(500, "Internal server error" + error), null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_REDIRECT_URI as string,
      },
      async (accessToken, refreshToken, profile, next) => {
        console.log(profile);
        const isUserExist = await User.findOne({ email: profile._json.email });

        if (isUserExist) {
          if (isUserExist.LoginType !== "google") {
            next(new ApiError(400, "You have previously registered using "));
          } else {
            //@ts-ignore
            next(null, isUserExist);
          }
        } else {
          const newUser = await User.create({
            Fullname: profile._json.name,
            Username: profile._json.name,
            email: profile._json.email,
            password: profile._json.sub,
            avatar: {
              url: profile._json.picture,
              public_id: "",
            },
            LoginType: profile.provider,
            isEmailVerified: profile._json.email_verified,
            role: "user",
          });

          //@ts-ignore
          next(null, newUser);
          if (newUser) {
            //@ts-ignore
            return next(null, newUser);
          } else {
            return next(new ApiError(500, "Error creating user"));
          }
        }
      }
    )
  );
} catch (error) {
  console.log(error);
}
