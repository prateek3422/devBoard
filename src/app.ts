import express, { Express, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware";
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

declare global {
  namespace Express {
    interface Request {
      user?: any; // Define the type of user appropriately
    }
  }
}

// * middleware
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(urlencoded({ extended: true, limit: "1mb" }));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: true,
  })
);
app.use(helmet());
app.use(cookieParser());

// TODO routes
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
