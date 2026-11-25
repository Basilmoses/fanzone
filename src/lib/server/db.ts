export function database(platform: App.Platform | undefined): FanZoneD1Database {
  const db = platform?.env?.DB;
  if (!db) throw new Error("The FanZone D1 database binding is not configured.");
  return db;
}
