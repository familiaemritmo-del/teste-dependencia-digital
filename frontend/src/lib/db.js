import { openDB } from "idb";

const DB_NAME = "tddi_db_v1";
const STORE_TESTS = "tests";
const STORE_SETTINGS = "settings";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_TESTS)) {
        const store = db.createObjectStore(STORE_TESTS, { keyPath: "id" });
        store.createIndex("email", "email", { unique: false });
        store.createIndex("created_at", "created_at", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
    },
  });
}

export async function addTest(record) {
  const db = await getDB();
  await db.put(STORE_TESTS, record);
  return record;
}

export async function listTestsByEmail(email) {
  const db = await getDB();
  if (!email) return [];
  const tx = db.transaction(STORE_TESTS);
  const idx = tx.store.index("email");
  const results = await idx.getAll(email);
  return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function listAllTests(limit = 20) {
  const db = await getDB();
  const all = await db.getAll(STORE_TESTS);
  return all
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

export async function saveSetting(key, value) {
  const db = await getDB();
  await db.put(STORE_SETTINGS, { key, value });
}
export async function loadSetting(key) {
  const db = await getDB();
  return (await db.get(STORE_SETTINGS, key))?.value;
}

export const Enums = {
  RISK: {
    BAIXA: "BAIXA",
    MODERADA: "MODERADA",
    ALTA: "ALTA",
    MUITO_ALTA: "MUITO_ALTA",
  },
};