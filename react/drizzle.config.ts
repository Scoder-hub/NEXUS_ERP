import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrate',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_PATH ?? './dev.db',
  },
});
