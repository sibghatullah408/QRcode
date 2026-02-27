import Database from 'better-sqlite3'

export function createDb({ filePath }) {
  const db = new Database(filePath)

  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_no TEXT NOT NULL,
      floor_no TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      nationality TEXT NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
    );
  `)

  db.exec('PRAGMA foreign_keys = ON;')

  return db
}
