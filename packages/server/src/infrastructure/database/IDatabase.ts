// Generic database interface for raw SQL execution
// This can be implemented by any database driver (SQLite, PostgreSQL, MySQL, etc.)

export interface QueryResult {
  changes: number;
  lastInsertRowid: number | bigint;
  lastID: number; // Add this for compatibility
}

export interface IDatabase {
  // Execute a query that returns multiple rows
  query<T>(sql: string, params?: any[]): T[];
  
  // Execute a query that returns a single row
  get<T>(sql: string, params?: any[]): T | undefined;
  
  // Execute a query that returns multiple rows
  all<T>(sql: string, params?: any[]): T[];
  
  // Execute a query that doesn't return rows (INSERT, UPDATE, DELETE)
  run(sql: string, params?: any[]): QueryResult;
  
  // Execute multiple statements in a transaction
  transaction<T>(fn: () => T): T;
  
  // Prepare a statement for repeated execution
  prepare(sql: string): IPreparedStatement;
  
  // Close the database connection
  close(): void;
}

export interface IPreparedStatement {
  run(...params: any[]): QueryResult;
  get<T>(...params: any[]): T | undefined;
  all<T>(...params: any[]): T[];
  finalize(): void;
}