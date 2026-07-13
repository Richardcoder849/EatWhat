import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('eatwhat.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '其他',
      ingredients TEXT NOT NULL DEFAULT '[]',
      steps TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      imageUri TEXT NOT NULL DEFAULT '',
      cookTime INTEGER NOT NULL DEFAULT 30,
      tags TEXT NOT NULL DEFAULT '[]',
      lastPickedAt INTEGER NOT NULL DEFAULT 0,
      pickCount INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(recipes)');
  const columnNames = new Set(columns.map(column => column.name));
  const migrations = [
    ['cookTime', "ALTER TABLE recipes ADD COLUMN cookTime INTEGER NOT NULL DEFAULT 30"],
    ['tags', "ALTER TABLE recipes ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'"],
    ['lastPickedAt', 'ALTER TABLE recipes ADD COLUMN lastPickedAt INTEGER NOT NULL DEFAULT 0'],
    ['pickCount', 'ALTER TABLE recipes ADD COLUMN pickCount INTEGER NOT NULL DEFAULT 0'],
  ] as const;

  for (const [column, statement] of migrations) {
    if (!columnNames.has(column)) await database.execAsync(statement);
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
