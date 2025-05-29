import "dotenv/config";
import databaseConnection from "./config/db.config.js";
import { PORT } from "./const.js";
import app from "./app.js";

(async function () {
  try {
    await databaseConnection();
    const server = app.listen(PORT, () => {
      console.log(`Server Running On: http://127.0.0.1:${PORT}`);
    });
    server.on("error", () => {
      throw new Error("Server Connection Error");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
})();
