import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";
export const questionRouter = Router();

questionRouter.get("/", async (req, res) => {
  const collection = db.collection("questions");
  const limit = req.query.limit || 10;
  const keywords = req.query.keywords;
  const categories = req.query.categories.split(" ");
  console.log(`keywords:`, keywords);
  console.log(`category:`, categories);
  const query = {};

  const elemMatchConditions = categories.map((element) => {
    console.log(`element`, element);
    return {
      ["category"]: { $elemMatch: { $eq: element } },
    };
  });
  console.log(`elemMatchConditions:`, elemMatchConditions);

  if (keywords) {
    query.question = new RegExp(keywords, "i");
  }
  if (categories) {
    query.category = categories;
  }

  try {
    const questions = await collection.find(query).limit(10).toArray();
    if (questions.length === 0) {
      return res.json({
        message: "Fetching successfully. No data was found in collection",
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
    const product = await collection.updateOne(
      { _id: id },
      { $set: updatedQuestion }
    );
    console.log(`Product from PUT method`, product);
    return res.json({ message: "Question has update successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Fail to update",
    });
  }
});

questionRouter.delete("/:questionId", async (req, res) => {
  const collection = db.collection("questions");
  const id = new ObjectId(req.params.questionId);
  try {
    const question = await collection.deleteOne({ _id: id });
    console.log(question);
    if (question.deletedCount !== 0) {
      return res.json({ message: "Delete successfully" });
    } else {
      return res.json({ message: "Fail to delete. id is not found" });
    }
  } catch (err) {
    return res.json({ message: "Fail to Delete" });
  }
});
