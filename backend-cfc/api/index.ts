import app from "../src/app.js";
import databaseLoader from "../src/loaders/database.js";

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    await databaseLoader();
    isConnected = true;
  }

  return app(req, res);
}