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

export interface Branch {
  id: number;
  conversation_id: number;
  parent_message_id: number | null;
  title: string;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  branch_id: number | null;
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

  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    parent_message_id INTEGER,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    branch_id INTEGER,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_messages_branch_id ON messages(branch_id);
  CREATE INDEX IF NOT EXISTS idx_branches_conversation_id ON branches(conversation_id);
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

  createBranch: db.prepare<[number, number | null, string], Branch>(`
    INSERT INTO branches (conversation_id, parent_message_id, title) VALUES (?, ?, ?)
    RETURNING *
  `),

  getBranch: db.prepare<[number], Branch>(`
    SELECT * FROM branches WHERE id = ?
  `),

  getBranchesByConversation: db.prepare<[number], Branch>(`
    SELECT * FROM branches WHERE conversation_id = ? ORDER BY created_at ASC
  `),

  getBranchesByParentMessage: db.prepare<[number], Branch>(`
    SELECT * FROM branches WHERE parent_message_id = ? ORDER BY created_at ASC
  `),

  updateBranchTitle: db.prepare<[string, number], Branch>(`
    UPDATE branches SET title = ? WHERE id = ?
    RETURNING *
  `),

  deleteBranch: db.prepare<[number]>(`
    DELETE FROM branches WHERE id = ?
  `),

  createMessage: db.prepare<[number, number | null, string, string], Message>(`
    INSERT INTO messages (conversation_id, branch_id, role, content) VALUES (?, ?, ?, ?)
    RETURNING *
  `),

  getMessages: db.prepare<[number], Message>(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
  `),

  getMessagesByBranch: db.prepare<[number], Message>(`
    SELECT * FROM messages WHERE branch_id = ? ORDER BY created_at ASC
  `),

  getMessagesForConversation: db.prepare<[number, number | null], Message>(`
    SELECT * FROM messages 
    WHERE conversation_id = ? AND (branch_id IS NULL OR branch_id = ?)
    ORDER BY created_at ASC
  `),

  deleteMessages: db.prepare<[number]>(`
    DELETE FROM messages WHERE conversation_id = ?
  `),
};

export default db;