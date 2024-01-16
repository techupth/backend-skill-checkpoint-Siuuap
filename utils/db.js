import { MongoClient } from "mongodb";

const connectionString = "mongodb://localhost:27017";
const dbName = "practice-mongo";

export const client = new MongoClient(connectionString);
export const db = client.db(dbName);
