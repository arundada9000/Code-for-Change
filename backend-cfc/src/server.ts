import app from "./app.js";
import databaseLoader from "./loaders/database.js";
import { ENV } from "./shared/configs/env.js";

const startServer = async () => {
  try {
    // Database
    await databaseLoader();

    // Start Express
    const server = app.listen(ENV.PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 Code for Change Backend                       ║
║   Environment: ${ENV.NODE_ENV.padEnd(35)} ║
║   Port:        ${String(ENV.PORT).padEnd(35)} ║
║   URL:         http://localhost:${ENV.PORT}               ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);
    });

    // Graceful Shutdown
    const gracefulShutdown = () => {
      console.log("\nReceived shutdown signal. Closing server...");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
