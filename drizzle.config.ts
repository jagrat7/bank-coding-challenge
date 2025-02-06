import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  out: './drizzle',
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["bank-coding-challange_*"],
} satisfies Config;
