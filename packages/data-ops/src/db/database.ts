import { verification } from "@/drizzle-out/auth-schema";
import { drizzle } from "drizzle-orm/d1";

let db: ReturnType<typeof drizzle>;

export function initDatabase(bindingDb: D1Database) {
  db = drizzle(bindingDb);
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  try {
    const tableInfo = db.select().from(verification).limit(1).all();
    console.log("Verification table accessible:", true, tableInfo);
} catch (error) {
    console.log("Verification table error:", error);
}
  return db;
}
