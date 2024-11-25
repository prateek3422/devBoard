import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/Auth.models";
import { ApiError } from "./ApiError";

try {
  passport.serializeUser((user: any, next) => {
    next(null, user.id);
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
        const isUserExist = await User.findOne({ email: profile._json.email });

        if (isUserExist) {
          if (isUserExist.LoginType !== "google") {
            next(
              new ApiError(
                400,
                "You have previously registered using" +
                  isUserExist.LoginType?.toLowerCase()?.split("_").join(" ") +
                  ". please use the " +
                  isUserExist.LoginType?.toLowerCase()?.split("_").join("") +
                  "login option to access to your account"
              )
            );
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

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GIT_CLIENT_ID as string,
        clientSecret: process.env.GIT_CLIENT_SECRET as string,
        callbackURL: process.env.GIT_REDIRECT_URI as string,
      },
      //@ts-ignore
      async (accessToken, refreshToken, profile, next) => {
        const isUserExist = await User.findOne({ email: profile._json.email });

        if (isUserExist) {
          if (isUserExist.LoginType !== "github") {
            next(
              new ApiError(
                400,
                "You have previously registered using" +
                  isUserExist.LoginType?.toLowerCase()?.split("_").join(" ") +
                  ". please use the " +
                  isUserExist.LoginType?.toLowerCase()?.split("_").join("") +
                  "login option to access to your account"
              )
            );
          } else {
            next(null, isUserExist);
          }
        } else {
          if (!profile._json.email) {
            next(
              new ApiError(
                400,
                "User does not have a public email associated with their account. Please try another login method"
              ),
              null
            );
          } else {
            const userNameExist = await User.findOne({
              Username: profile?.username,
            });

            const newGitUser = await User.create({
              Fullname: profile._json.name,
              Username: userNameExist
                ? profile._json.email?.split("@")[0]
                : profile.username,
              email: profile._json.email,
              password: profile._json.sub,
              avatar: {
                url: profile._json.picture,
                public_id: "",
              },
              LoginType: profile.provider,
              isEmailVerified: "true",
              role: "user",
            });

            if (newGitUser) {
              next(null, newGitUser);
            } else {
              next(new ApiError(500, "Error while registering the user"), null);
            }
          }
        }
      }
    )
  );
} catch (error) {
  console.log("passport ", error);
}
