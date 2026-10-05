CREATE TABLE public_progress (
 task_date TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'todo', deferred_to TEXT NOT NULL DEFAULT '',
 version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL
);
CREATE TABLE learning_entries (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
 archived INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL
);
CREATE INDEX learning_kind_updated ON learning_entries(kind,updated_at);
