// drizzle.config.ts
// 基于《德道经》第37章"道常无为而无不为"的Drizzle配置

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
