import http from "node:http";
import { app } from "./app";
import ENV from "./shared/config/configEnv";
import { prisma } from "./shared/lib/prisma";

const server = http.createServer(app);

server.listen(ENV.PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${ENV.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Cerrando servidor: ${signal}`);

  const forceExit = setTimeout(() => {
    process.exit(1);
  }, 10_000);

  forceExit.unref();

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      clearTimeout(forceExit);
      process.exitCode = 0;
    }
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));