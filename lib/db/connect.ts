import mongoose from "mongoose";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var contractorOpsMongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

if (!global.contractorOpsMongoose) {
  global.contractorOpsMongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!env.mongodbUri) {
    console.warn("MONGODB_URI not configured. Database-backed pages will show empty states.");
    return null;
  }

  if (global.contractorOpsMongoose?.conn) {
    return global.contractorOpsMongoose.conn;
  }

  if (!global.contractorOpsMongoose?.promise) {
    global.contractorOpsMongoose!.promise = mongoose.connect(env.mongodbUri, {
      bufferCommands: false,
      maxPoolSize: 10
    });
  }

  global.contractorOpsMongoose!.conn = await global.contractorOpsMongoose!.promise;
  return global.contractorOpsMongoose!.conn;
}
