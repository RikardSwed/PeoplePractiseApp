const DATABASE_KEY = "social-circle-database";
const LEGACY_KEYS = {
  plans: "social-circle-plans",
  people: "social-circle-people",
  activities: "social-circle-activities",
};

function emptyDatabase() {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    collections: { plans: [], people: [], activities: [] },
    sync: { provider: "local", lastSyncedAt: null },
  };
}

function safeParse(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

export class LocalStorageAdapter {
  load() {
    const saved = safeParse(localStorage.getItem(DATABASE_KEY), null);
    if (saved?.schemaVersion && saved.collections) return saved;

    const migrated = emptyDatabase();
    Object.entries(LEGACY_KEYS).forEach(([collection, key]) => {
      migrated.collections[collection] = safeParse(localStorage.getItem(key), []);
    });
    this.save(migrated);
    return migrated;
  }

  save(database) {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
    // Behåll de tidigare nycklarna under övergången så ingen befintlig data tappas.
    Object.entries(LEGACY_KEYS).forEach(([collection, key]) => {
      localStorage.setItem(key, JSON.stringify(database.collections[collection] || []));
    });
  }
}

export class SocialCircleStore {
  constructor(localAdapter = new LocalStorageAdapter()) {
    this.localAdapter = localAdapter;
    this.database = localAdapter.load();
    this.remoteAdapter = null;
    this.listeners = new Set();
  }

  get(collection, fallback = []) {
    return this.database.collections[collection] ?? fallback;
  }

  set(collection, value) {
    this.database.collections[collection] = value;
    this.database.updatedAt = new Date().toISOString();
    this.localAdapter.save(this.database);
    this.listeners.forEach((listener) => listener(this.database));
    // Framtida molnsynkning sker i bakgrunden; lokala ändringar väntar aldrig på nätet.
    if (this.remoteAdapter) this.remoteAdapter.push(this.database).catch(() => {});
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async connectRemote(remoteAdapter) {
    this.remoteAdapter = remoteAdapter;
    const remoteDatabase = await remoteAdapter.pull();
    if (remoteDatabase?.updatedAt > this.database.updatedAt) {
      this.database = remoteDatabase;
      this.localAdapter.save(this.database);
      this.listeners.forEach((listener) => listener(this.database));
    } else {
      await remoteAdapter.push(this.database);
    }
  }

  snapshot() {
    return typeof structuredClone === "function" ? structuredClone(this.database) : JSON.parse(JSON.stringify(this.database));
  }
}

export const store = new SocialCircleStore();
