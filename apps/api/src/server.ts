import "dotenv/config";

import { prisma } from "@a11yscope/database";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

async function shutdown() {
  console.log("Shutting down...");

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
