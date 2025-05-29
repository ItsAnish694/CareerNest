import { connect } from "mongoose";
import { DB_NAME } from "../const.js";

async function databaseConnection() {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL not defined in .env");
    }
    const conn = await connect(`${mongoUrl}/${DB_NAME}`);
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
}

export default databaseConnection;
