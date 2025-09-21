#!/usr/bin/env ts-node

/**
 * Script to completely reset the database by deleting the SQLite file
 * Usage: pnpm run reset-db
 * 
 * WARNING: This will permanently delete all data!
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function askConfirmation(message: string): Promise<boolean> {
  const answer = await question(`${message} (type 'yes' to confirm): `);
  return answer.toLowerCase() === 'yes';
}

async function resetDatabase(): Promise<void> {
  console.log('🔥 Campus Event Hub - Database Reset Script\n');

  try {
    // Environment safety check
    const env = process.env.NODE_ENV || 'development';
    console.log(`📊 Environment: ${env}`);
    
    if (env === 'production') {
      console.log('⚠️  🚨 PRODUCTION ENVIRONMENT DETECTED 🚨');
      console.log('   This script will PERMANENTLY DELETE all production data!');
      const confirm = await askConfirmation('   Are you ABSOLUTELY SURE you want to reset the production database?');
      if (!confirm) {
        console.log('✅ Reset cancelled. Production data is safe.\n');
        return;
      }
    }

    // General confirmation
    console.log('⚠️  WARNING: This will permanently delete ALL data including:');
    console.log('   • All users (including superadmins)');
    console.log('   • All events and their data');
    console.log('   • All approval records');
    console.log('   • Everything in the database');

    const confirmed = await askConfirmation('\n🔴 Are you sure you want to proceed?');
    if (!confirmed) {
      console.log('✅ Reset cancelled. Your data is safe.\n');
      return;
    }

    console.log('\n🚀 Starting database reset...\n');

    // Get database path
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/app.db');
    console.log(`📂 Database location: ${dbPath}`);

    // Check if this is an in-memory database
    if (dbPath === ':memory:') {
      console.log('💾 In-memory database detected');
      console.log('   In-memory databases are automatically reset when the server restarts.');
      console.log('   Simply restart your server to get a fresh database.\n');
      return;
    }

    // Delete database files
    let filesDeleted = 0;
    
    // Delete main database file
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('   ✅ Database file deleted');
      filesDeleted++;
    }
    
    // Delete WAL (Write-Ahead Logging) file
    const walPath = dbPath + '-wal';
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
      console.log('   ✅ WAL file deleted');
      filesDeleted++;
    }
    
    // Delete shared memory file
    const shmPath = dbPath + '-shm';
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
      console.log('   ✅ Shared memory file deleted');
      filesDeleted++;
    }

    if (filesDeleted === 0) {
      console.log('ℹ️  No database files found to delete.');
      console.log('   The database will be created fresh when you start the server.\n');
    } else {
      console.log(`\n🎉 Database reset completed! (${filesDeleted} file${filesDeleted > 1 ? 's' : ''} deleted)\n`);
    }
    
    console.log('🌐 Next Steps:');
    console.log('   1. Start the server: pnpm dev');
    console.log('      The database will be automatically created with a fresh schema.');
    console.log('   2. Create a superadmin user: pnpm run init-superadmin');
    console.log('   3. Begin using the application with fresh data\n');

    console.log('💡 Tips:');
    console.log('   • The database and all tables will be created automatically on first run');
    console.log('   • All migrations will be applied when the server starts');
    console.log('   • You\'ll need to create new users after reset\n');

  } catch (error) {
    console.error('❌ Error during database reset:');
    
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      
      // Specific error handling for common issues
      if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
        console.log('\n💡 Permission Error:');
        console.log('   The database file might be in use or you lack permissions.');
        console.log('   Try:');
        console.log('   1. Stop all running servers (pnpm dev)');
        console.log('   2. Close any database viewers');
        console.log('   3. Run with elevated permissions if needed');
      } else if (error.message.includes('EBUSY')) {
        console.log('\n💡 File In Use:');
        console.log('   The database file is being used by another process.');
        console.log('   Make sure to stop the server before running this script.');
      }
    } else {
      console.error(`   ${error}`);
    }
    
    process.exit(1);
  } finally {
    // Clean up
    rl.close();
  }
}

// Handle process interruption gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Process interrupted by user');
  rl.close();
  console.log('✅ Reset cancelled. Your data is safe.');
  process.exit(0);
});

// Run the script
resetDatabase()
  .then(() => {
    console.log('✅ Script completed successfully.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });