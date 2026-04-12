import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
process.env.INTERNAL_DISABLE_DB_AUTO_BOOTSTRAP = "true";

async function main() {
  const [{ getServerEnv }, { db }, { seedDefaultAuthData }] = await Promise.all([
    import("../src/config/env/server-env"),
    import("../src/lib/db/client"),
    import("../src/lib/db/bootstrap-defaults"),
  ]);

  const env = getServerEnv(process.env);

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to run MongoDB seed.");
  }

  await seedDefaultAuthData(db, env);

  return db;
}

main()
  .then(async (db) => {
    await db.client.close();
  })
  .catch(async (error: unknown) => {
    console.error("MongoDB seed failed:", error);

    try {
      const { db } = await import("../src/lib/db/client");
      await db.client.close();
    } catch {
      // Ignore close errors when db client is not initialized.
    }

    process.exit(1);
  });