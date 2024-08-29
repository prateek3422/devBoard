import dotenv from "dotenv";
dotenv.config({});

// "dev": "ts-node-dev --respawn --transpile-only ./src/index.ts",
// "dev": "concurrently \"tsc -w & tsc-alias -w \" \"nodemon dist/server.js\"",
// "lint": "tsc",
// "build": "rm -rf dist & tsc -p tsconfig.json && tsc-alias",
// "start": "tsc --build && node --max-old-space-size=4096 dist/index.js",
// "start:pm2": "pm2 start dist/index.js",
// "stop": "pm2 stop dist/main.js"

import { app } from "./app";
import { DBConnection } from "./database/index";

DBConnection()
  .then(() => {
    console.log("connection successfull");
  })
  .catch((err: string) => {
    console.log("database connection failed");
  });

app.listen(process.env.PORT, () => {
  console.info(`your server is running on Port no ${process.env.PORT}`);
});
