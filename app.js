import express from "express";
import cors from "cors";
import { client } from "./utils/db.js";
import { questionRouter } from "./apps/question.js";
import { answerRouter } from "./apps/answer.js";

async function init() {
  const app = express();
  const port = 4001;

  try {
    await client.connect();
    console.log(`Connect to the server successfully`);
  } catch (err) {
    console.error(`Database connection error${err}`);
  }

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/questions", questionRouter);
  app.use("/questions", answerRouter);
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

init();
