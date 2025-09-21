import { IDatabase } from './IDatabase';
import fs from 'fs';
import path from 'path';

export interface MigrationOptions {
  silent?: boolean;
}

export class MigrationRunner {
  constructor(private db: IDatabase) {}

  async runMigrations(migrationsPath: string, options?: MigrationOptions): Promise<void> {
    const silent = options?.silent || false;
    // Create migrations table if it doesn't exist
    this.createMigrationsTable();

    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.sql');
      
      // Check if migration has already been run
      if (await this.isMigrationRun(migrationName)) {
        if (!silent) {
          console.log(`Skipping migration: ${migrationName} (already run)`);
        }
        continue;
      }

      if (!silent) {
        console.log(`Running migration: ${migrationName}`);
      }
      
      try {
        // Read and execute migration SQL
        const filePath = path.join(migrationsPath, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        // Execute migration in a transaction
        this.db.transaction(() => {
          // Execute each statement separately (split by semicolon)
          const statements = sql.split(';').filter(stmt => stmt.trim());
          for (const statement of statements) {
            this.db.run(statement);
          }
          
          // Record migration as completed
          this.recordMigration(migrationName);
        });
        
        if (!silent) {
          console.log(`Migration completed: ${migrationName}`);
        }
      } catch (error) {
        if (!silent) {
          console.error(`Migration failed: ${migrationName}`, error);
        }
        throw error;
      }
    }
  }

  private createMigrationsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        run_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `;
    
    this.db.run(sql);
  }

  private async isMigrationRun(name: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM migrations WHERE name = ?';
    const result = this.db.get<{ count: number }>(sql, [name]);
    return (result?.count || 0) > 0;
  }

  private recordMigration(name: string): void {
    const sql = 'INSERT INTO migrations (name) VALUES (?)';
    this.db.run(sql, [name]);
  }
}