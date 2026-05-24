import { connectToDatabase } from "../lib/db/connect";

async function main() {
  const db = await connectToDatabase();
  if (!db) {
    console.log("MONGODB_URI not configured.");
    process.exit(1);
  }
  console.log(`Connected to MongoDB: ${db.connection.name}`);
  await db.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
