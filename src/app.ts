import express, { Express, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware";
import session from "express-session";

import {
  AuthRouter,
  BlogRouter,
  QuestionRoutes,
  TagRouter,
  AnswerRoutes,
  LikeRouter,
  CommentRoutes,
} from "./routes";

import { LeaderBoardRouter } from "./routes/LeaderBoard.routes";

const app: Express = express();
import passport from "passport";
// declare global {
//   namespace Express {

//     interface Request {
//       user: any; // Define the type of user appropriately
//     }
//   }
// }

// passport middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// * middleware
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(urlencoded({ extended: true, limit: "1mb" }));

app.use(
  cors({
    origin: ["https://devwave.prateekdev.me", "http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: true,
  })
);
app.use(helmet());
app.use(cookieParser());

//* routes
app.use("/api/v1/users", AuthRouter);
app.use("/api/v1/Blogs", BlogRouter);
app.use("/api/v1/Tags", TagRouter);
app.use("/api/v1/Questions", QuestionRoutes);
app.use("/api/v1/Answers", AnswerRoutes);
app.use("/api/v1/Likes", LikeRouter);
app.use("/api/v1/Comments", CommentRoutes);
app.use("/api/v1/LeaderBoards", LeaderBoardRouter);

app.use(errorHandler);
export { app };
