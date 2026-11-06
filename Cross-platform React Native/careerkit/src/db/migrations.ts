/**
 * Versioned database migrations.
 *
 * How it works:
 * - SQLite stores a number called `user_version` inside the database file (starts at 0).
 * - Each migration below has a `version`. On app start, `client.ts` runs every migration
 *   whose version is higher than the stored `user_version`, then saves the new version.
 * - RULE: never edit a migration that has already shipped. To change the schema later,
 *   ADD a new migration (version 2, 3, ...) with ALTER TABLE / CREATE TABLE statements.
 */

export type Migration = {
  version: number;
  description: string;
  sql: string;
};

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial schema: all CareerKit tables',
    sql: `
      -- Profile (single row, id = 1)
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        full_name TEXT NOT NULL DEFAULT '',
        headline TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        summary TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        photo_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS education (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school TEXT NOT NULL,
        degree TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        honors TEXT,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'job',
        location TEXT,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT,
        tech_used TEXT,
        link TEXT,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'technical',
        level TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        issuer TEXT,
        issue_date TEXT,
        expiry_date TEXT,
        credential_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Document Locker: files attached to any record (polymorphic, so no foreign key)
      CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_type TEXT NOT NULL,
        owner_id INTEGER NOT NULL,
        file_uri TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT,
        size_bytes INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_attachments_owner ON attachments (owner_type, owner_id);

      CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        template TEXT NOT NULL DEFAULT 'ats_simple',
        target_role TEXT,
        pdf_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resume_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'private',
        reference_no TEXT,
        issue_date TEXT,
        expiry_date TEXT,
        status_override TEXT,
        notes TEXT,
        reminder_days_before INTEGER NOT NULL DEFAULT 14,
        notification_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        date_applied TEXT NOT NULL,
        channel TEXT,
        status TEXT NOT NULL DEFAULT 'applied',
        resume_id INTEGER REFERENCES resumes(id) ON DELETE SET NULL,
        salary_offer TEXT,
        next_step_date TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- OJT setup (single row, id = 1)
      CREATE TABLE IF NOT EXISTS ojt_info (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        company TEXT,
        supervisor TEXT,
        required_hours REAL NOT NULL DEFAULT 486,
        start_date TEXT,
        target_end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ojt_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date TEXT NOT NULL,
        time_in TEXT NOT NULL,
        time_out TEXT NOT NULL,
        break_minutes INTEGER NOT NULL DEFAULT 60,
        hours REAL NOT NULL,
        tasks TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ojt_requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        is_done INTEGER NOT NULL DEFAULT 0,
        due_date TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- App settings (key-value)
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `,
  },
];
