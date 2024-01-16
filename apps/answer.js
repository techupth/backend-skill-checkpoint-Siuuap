import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";
export const answerRouter = Router();

answerRouter.get("/", (req, res) => {
  const collection = db.collection("answers");
});

answerRouter.get("/", (req, res) => {
  const collection = db.collection("answers");
});
