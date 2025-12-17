#!/usr/bin/env ts-node

/**
 * Script to create initial users for all roles
 * Usage: pnpm run init-superadmin
 */

import dotenv from 'dotenv';
import { container } from '../src/infrastructure/Container';
import { UserRole, UserCategory } from '../src/models/User';

// Load environment variables
dotenv.config();

// Dummy account configurations
const DUMMY_ACCOUNTS = {
  [UserRole.SUPERADMIN]: {
    email: 'superadmin@campus-event-hub.local',
    password: 'SuperAdmin123!',
    name: 'System Administrator'
  },
  [UserRole.ADMIN]: {
    email: 'admin@campus-event-hub.local',
    password: 'Admin123!',
    name: 'Admin User'
  },
  [UserRole.APPROVER]: {
    email: 'approver@campus-event-hub.local',
    password: 'Approver123!',
    name: 'Event Approver'
  },
  [UserRole.USER]: {
    email: 'user@campus-event-hub.local',
    password: 'User123!',
    name: 'Regular User'
  }
};

// Additional users to create
const ADDITIONAL_USERS = [
  {
    email: 'user1@campus-event-hub.local',
    password: 'User123!',
    name: 'Regular User 1',
    role: UserRole.USER
  },
  {
    email: 'user2@campus-event-hub.local',
    password: 'User123!',
    name: 'Regular User 2',
    role: UserRole.USER
  },
  {
    email: 'user3@campus-event-hub.local',
    password: 'User123!',
    name: 'Regular User 3',
    role: UserRole.USER
  }
];

async function createDummyUsers(): Promise<void> {
  console.log('🚀 Campus Event Hub - User Initialization Script\n');

  try {
    // Get services from container
    const userRepository = container.getUserRepository();
    const authService = container.getAuthService();

    console.log('📋 Checking for existing users by role...\n');

    const createdUsers: Array<{role: UserRole, user: any, isNew: boolean}> = [];
    
    // Process each role in priority order
    const roles = [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.APPROVER, UserRole.USER];
    
    for (const role of roles) {
      const config = DUMMY_ACCOUNTS[role];
      console.log(`🔍 Checking ${role.toUpperCase()} role...`);
      
      // Check if any users exist for this role
      const existingUsers = await userRepository.findByRole(role);
      
      if (existingUsers.length > 0) {
        console.log(`   ✅ Found ${existingUsers.length} existing ${role} user(s)`);
        existingUsers.forEach((user, index) => {
          console.log(`      ${index + 1}. ${user.name} (${user.email})`);
        });
        createdUsers.push({role, user: existingUsers[0], isNew: false});
      } else {
        // Check if email is already in use by a different role
        const existingUser = await userRepository.findByEmail(config.email);
        if (existingUser) {
          console.log(`   ⚠️  Email ${config.email} already in use by ${existingUser.role} user`);
          console.log(`      Skipping ${role} dummy account creation`);
          continue;
        }

        console.log(`   ✨ Creating dummy ${role} user...`);
        
        // Hash the password
        const hashedPassword = await authService.hashPassword(config.password);

        // Create the user
        const newUser = await userRepository.create({
          name: config.name,
          email: config.email,
          password: hashedPassword,
          role: role,
          category: UserCategory.STAFF
        });

        console.log(`   🎉 ${role.toUpperCase()} user created successfully!`);
        createdUsers.push({role, user: newUser, isNew: true});
      }
      console.log('');
    }

    // Create additional users
    console.log('👥 Creating additional regular users...\n');
    
    for (const userConfig of ADDITIONAL_USERS) {
      console.log(`🔍 Checking ${userConfig.name}...`);
      
      // Check if email is already in use
      const existingUser = await userRepository.findByEmail(userConfig.email);
      if (existingUser) {
        console.log(`   ✅ User already exists: ${existingUser.name} (${existingUser.email})`);
        createdUsers.push({role: userConfig.role, user: existingUser, isNew: false});
      } else {
        console.log(`   ✨ Creating ${userConfig.name}...`);
        
        // Hash the password
        const hashedPassword = await authService.hashPassword(userConfig.password);

        // Create the user
        const newUser = await userRepository.create({
          name: userConfig.name,
          email: userConfig.email,
          password: hashedPassword,
          role: userConfig.role,
          category: UserCategory.MAHASISWA
        });

        console.log(`   🎉 ${userConfig.name} created successfully!`);
        createdUsers.push({role: userConfig.role, user: newUser, isNew: true});
      }
      console.log('');
    }

    // Display summary
    console.log('📝 LOGIN CREDENTIALS SUMMARY');
    console.log('=' .repeat(60));
    
    createdUsers.forEach(({role, user, isNew}) => {
      const config = DUMMY_ACCOUNTS[role];
      const additionalUser = ADDITIONAL_USERS.find(u => u.email === user.email);
      const password = config ? config.password : additionalUser?.password || 'User123!';
      const status = isNew ? '🆕 CREATED' : '✅ EXISTS';
      
      console.log(`\n${status} - ${role.toUpperCase()}`);
      console.log(`   Name:     ${user.name}`);
      console.log(`   Email:    ${user.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   User ID:  ${user.id}`);
      console.log(`   Created:  ${user.createdAt}`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('\n🔐 SECURITY NOTICE:');
    console.log('   1. These are DUMMY accounts for development only');
    console.log('   2. Change ALL passwords immediately in production');
    console.log('   3. Use strong, unique passwords for production environments');
    console.log('   4. Consider enabling two-factor authentication if implemented');
    console.log('   5. This script should only be run for initial development setup\n');

    console.log('🌐 Next Steps:');
    console.log('   1. Start the server: pnpm dev');
    console.log('   2. Login at: POST /api/v1/auth/login');
    console.log('   3. Test different role permissions with each account');
    console.log('   4. Update profiles: PUT /api/v1/auth/profile\n');

  } catch (error) {
    console.error('❌ Error creating dummy users:');
    
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (process.env.NODE_ENV === 'development') {
        console.error(`   Stack trace: ${error.stack}`);
      }
    } else {
      console.error(`   ${error}`);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure the database is properly initialized');
    console.log('   2. Check DATABASE_PATH in .env file');
    console.log('   3. Verify all dependencies are installed');
    console.log('   4. Check database permissions');
    console.log('   5. Review migration files in src/infrastructure/database/migrations/\n');
    
    process.exit(1);
  } finally {
    // Close database connection
    await container.close();
    console.log('📂 Database connection closed.');
  }
}

// Run the script
createDummyUsers()
  .then(() => {
    console.log('✅ Script completed successfully.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });