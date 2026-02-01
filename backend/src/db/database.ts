import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/chat.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT 'New Chat',
    model TEXT NOT NULL DEFAULT 'openai/gpt-3.5-turbo',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
`);

export const dbQueries = {
  createConversation: db.prepare<[], Conversation>(`
    INSERT INTO conversations (title, model) VALUES ('New Chat', 'openai/gpt-3.5-turbo')
    RETURNING *
  `),

  getConversation: db.prepare<[number], Conversation>(`
    SELECT * FROM conversations WHERE id = ?
  `),

  listConversations: db.prepare<[], Conversation>(`
    SELECT * FROM conversations ORDER BY updated_at DESC
  `),

  updateConversationTitle: db.prepare<[string, number], Conversation>(`
    UPDATE conversations SET title = ? WHERE id = ?
    RETURNING *
  `),

  updateConversationModel: db.prepare<[string, number], Conversation>(`
    UPDATE conversations SET model = ?, updated_at = datetime('now') WHERE id = ?
    RETURNING *
  `),

  deleteConversation: db.prepare<[number]>(`
    DELETE FROM conversations WHERE id = ?
  `),

  createMessage: db.prepare<[number, string, string], Message>(`
    INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)
    RETURNING *
  `),

  getMessages: db.prepare<[number], Message>(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
  `),

  deleteMessages: db.prepare<[number]>(`
    DELETE FROM messages WHERE conversation_id = ?
  `),
};

export default db;