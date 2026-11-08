import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";
import { resolveDatabasePath } from "./src/db/path";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // 서버(src/db/index.ts)와 같은 규칙으로 DB 파일 위치를 정한다.
    url: resolveDatabasePath(process.env.DATABASE_URL, {
      isTest: false,
      baseDir: fileURLToPath(new URL(".", import.meta.url)),
    }),
  },
});
