import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";
export const questionRouter = Router();

questionRouter.get("/", async (req, res) => {
  const collection = db.collection("questions");
  const limit = req.query.limit || 10;
  const keywords = req.query.keywords;
  const categories = req.query.categories;

  const query = {};
  console.log(`keywords:`, keywords);
  console.log(`category:`, categories);

  if (keywords) {
    query.question = new RegExp(keywords, "i");
  }
  if (categories) {
    query.category = { $all: categories.split(",") };
    console.log(query.category);
  }

  try {
    const questions = await collection
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
    if (questions.length === 0) {
      return res.json({
        message: "No data was found in collection",
      });
    } else {
      return res.json({ message: "Fetching successfully", data: questions });
    }
  } catch (err) {
    return res.status(400).json({ message: "Fail to fetch" });
  }
});

questionRouter.get("/:questionId", async (req, res) => {
  const collection = db.collection("questions");
  const id = new ObjectId(req.params.questionId);
  try {
    const question = await collection.findOne({ _id: id });
    return res.json({ message: "Fetching Successfully", data: question });
  } catch (err) {
    return res.json({
      message: "Fetching error",
    });
  }
});

questionRouter.post("/", async (req, res) => {
  const collection = db.collection("questions");
  const { question, description, category } = req.body;

  if (!question || !description || !category || !category[0]) {
    return res
      .status(400)
      .json({ message: "Invalid request. Missing required field" });
  }
  const newQuestion = {
    question,
    description,
    category,
    created_at: new Date(),
    vote: { upvote: 0, downvote: 0 },
  };
  try {
    const question = await collection.insertOne({ ...newQuestion });

    return res.json({ message: "Create new question successfully" });
  } catch (err) {
    return res.status(418).json({
      message: "Server fail to fetch",
    });
  }
});

questionRouter.put("/:questionId", async (req, res) => {
  const collection = db.collection("questions");
  const id = new ObjectId(req.params.questionId);
  const { question, description, category } = req.body;
  const updatedQuestion = {
    question,
    description,
    category,
    updated_at: new Date(),
  };

  try {
    const question = await collection.updateOne(
      { _id: id },
      { $set: updatedQuestion }
    );
    console.log(`Product from PUT method`, question);
    return res.json({ message: "Question has update successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Fail to update",
    });
  }
});
questionRouter.patch("/:questionId", async (req, res) => {
  const collection = db.collection("questions");
  const id = new ObjectId(req.params.questionId);
  const vote = req.query.vote;

  if (["upvote", "downvote"].includes(vote)) {
    const updateVote = `vote.${vote}`;
    try {
      await collection.updateOne({ _id: id }, { $inc: { [updateVote]: 1 } });
      return res.json({ message: "Update Vote successfully" });
    } catch {
      return res.status(500).json({
        message: "Fail to update vote",
      });
    }
  } else {
    return res.status(400).json({
      message: "Invalid vote",
    });
  }
});

questionRouter.delete("/:questionId", async (req, res) => {
  const collection = db.collection("questions");
  const id = new ObjectId(req.params.questionId);
  const commentCollection = db.collection("answers");
  try {
    const question = await collection.deleteOne({ _id: id });
    //
    await commentCollection.deleteMany({ questionId: req.params.questionId });
    //
    console.log(question);
    if (question.deletedCount !== 0) {
      return res.json({ message: "Delete successfully" });
    } else {
      return res
        .status(400)
        .json({ message: "Fail to delete. id is not found" });
    }
  } catch (err) {
    return res.json({ message: "Fail to Delete" });
  }
});
