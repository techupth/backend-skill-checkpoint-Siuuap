import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";
export const answerRouter = Router();

answerRouter.get("/:questionId/answers", async (req, res) => {
  const collection = db.collection("answers");
  const questionId = req.params.questionId;
  const query = {};
  if (questionId) {
    query.questionId = questionId;
  }
  try {
    const answers = await collection.find(query).toArray();
    return res.json({ message: "fetching successfully", data: answers });
  } catch {}
});

answerRouter.get("/:questionId/answers/:answerId", async (req, res) => {
  const collection = db.collection("answers");
  const id = new ObjectId(req.params.answerId);
  const questionId = req.params.questionId;
  if (!questionId) {
    return res.status(400).json({ message: "Require specific question Id" });
  }
  const query = {
    _id: id,
    questionId: questionId,
  };
  try {
    const answers = await collection.findOne(query);
    return res.json({ message: "fetching successfully", data: answers });
  } catch {
    return res.status(500).json({ message: "Server fail to fetch the data" });
  }
});

answerRouter.post("/:questionId/answers", async (req, res) => {
  const collection = db.collection("answers");
  const questionId = req.params.questionId;
  const description = req.body.description;
  if (!description || description.length > 300) {
    return res.status(400).json({
      message:
        "Require description and description must be less than 300 Characters",
    });
  }
  const newComment = {
    questionId: questionId,
    comment: description,
    created_at: new Date(),
    vote: { upvote: 0, downvote: 0 },
  };
  if (!description) {
    return res.status(400).json({ message: "Require an Id of the question" });
  }

  try {
    const result = await collection.insertOne(newComment);
    return res.json({ message: "Create new comment successfully" });
  } catch (err) {
    return res.json(err);
  }
});

answerRouter.put("/:questionId/answers/:answerId", async (req, res) => {
  const collection = db.collection("answers");

  const id = new ObjectId(req.params.answerId);
  const description = req.body.description;
  const questionId = req.params.questionId;

  if (!questionId) {
    return res.status(400).json({ message: "Require specific question Id" });
  }
  if (!description || description.length > 300) {
    return res.status(400).json({
      message:
        "Require description and description must be less than 300 Characters",
    });
  }
  const query = {
    _id: id,
  };
  const updatedComment = {
    comment: description,
    updated_at: new Date(),
  };

  try {
    const updated = await collection.updateOne(query, { $set: updatedComment });
    return res.json({ message: "Update successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Fail to update" });
  }
});

answerRouter.delete("/:questionId/answers/:answerId", async (req, res) => {
  const collection = db.collection("answers");
  const id = new ObjectId(req.params.answerId);
  const query = { _id: id };
  try {
    const deletedComment = await collection.deleteOne(query);
    return res.json({ message: "Delete Successfully" });
  } catch (err) {
    return res.json({ message: "Fail to delete" });
  }
});

answerRouter.patch("/:questionId/answers/:answerId", async (req, res) => {
  const collection = db.collection("answers");
  const id = new ObjectId(req.params.answerId);
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
