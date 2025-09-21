import Database from 'better-sqlite3';
import { IDatabase, IPreparedStatement, QueryResult } from './IDatabase';
import path from 'path';
import fs from 'fs';

export class SQLiteDatabase implements IDatabase {
  private db: Database.Database;

  constructor(filename?: string) {
    const dbPath = filename || process.env.DATABASE_URL || ':memory:';
    
    // Ensure the directory exists if using a file
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new Database(dbPath);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Better performance settings
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
  }

  query<T>(sql: string, params?: any[]): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...(params || [])) as T[];
  }

  get<T>(sql: string, params?: any[]): T | undefined {
    const stmt = this.db.prepare(sql);
    return stmt.get(...(params || [])) as T | undefined;
  }

  all<T>(sql: string, params?: any[]): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...(params || [])) as T[];
  }

  run(sql: string, params?: any[]): QueryResult {
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...(params || []));
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
      lastID: Number(result.lastInsertRowid)
    };
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  prepare(sql: string): IPreparedStatement {
    const stmt = this.db.prepare(sql);
    
    return {
      run: (...params: any[]): QueryResult => {
        const result = stmt.run(...params);
        return {
          changes: result.changes,
          lastInsertRowid: result.lastInsertRowid,
          lastID: Number(result.lastInsertRowid)
        };
      },
      get: <T>(...params: any[]): T | undefined => {
        return stmt.get(...params) as T | undefined;
      },
      all: <T>(...params: any[]): T[] => {
        return stmt.all(...params) as T[];
      },
      finalize: () => {
        // better-sqlite3 doesn't require explicit finalization
        // but we keep this method for interface compatibility
      }
    };
  }

  close(): void {
    this.db.close();
  }

  // Additional helper method to execute SQL from a file (useful for migrations)
  executeFile(filePath: string): void {
    const sql = fs.readFileSync(filePath, 'utf-8');
    this.db.exec(sql);
  }
}