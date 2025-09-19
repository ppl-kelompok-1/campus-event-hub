#!/usr/bin/env ts-node
"use strict";
/**
 * Script to create initial SUPERADMIN user
 * Usage: pnpm run init-superadmin
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Container_1 = require("../src/infrastructure/Container");
const User_1 = require("../src/models/User");
// Load environment variables
dotenv_1.default.config();
const SUPERADMIN_EMAIL = 'superadmin@campus-event-hub.local';
const SUPERADMIN_PASSWORD = 'SuperAdmin123!';
const SUPERADMIN_NAME = 'System Administrator';
function createSuperAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Campus Event Hub - SUPERADMIN Initialization Script\n');
        try {
            // Get services from container
            const userRepository = Container_1.container.getUserRepository();
            const authService = Container_1.container.getAuthService();
            console.log('📋 Checking for existing SUPERADMIN users...');
            // Check if any SUPERADMIN users already exist
            const existingSuperAdmins = yield userRepository.findByRole(User_1.UserRole.SUPERADMIN);
            if (existingSuperAdmins.length > 0) {
                console.log('⚠️  SUPERADMIN user already exists!');
                console.log(`   Found ${existingSuperAdmins.length} SUPERADMIN user(s):`);
                existingSuperAdmins.forEach((admin, index) => {
                    console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - Created: ${admin.createdAt}`);
                });
                console.log('\n✅ No action needed. SUPERADMIN user(s) already configured.\n');
                return;
            }
            console.log('✨ No SUPERADMIN found. Creating initial SUPERADMIN user...');
            // Check if email is already in use (though it shouldn't be)
            const existingUser = yield userRepository.findByEmail(SUPERADMIN_EMAIL);
            if (existingUser) {
                console.log(`❌ Error: Email ${SUPERADMIN_EMAIL} is already in use by a ${existingUser.role} user.`);
                console.log('   Please manually resolve this conflict in the database.\n');
                return;
            }
            // Hash the password
            const hashedPassword = yield authService.hashPassword(SUPERADMIN_PASSWORD);
            // Create the SUPERADMIN user
            const superAdmin = yield userRepository.create({
                name: SUPERADMIN_NAME,
                email: SUPERADMIN_EMAIL,
                password: hashedPassword,
                role: User_1.UserRole.SUPERADMIN
            });
            console.log('🎉 SUPERADMIN user created successfully!\n');
            console.log('📝 Login Credentials:');
            console.log(`   Email:    ${SUPERADMIN_EMAIL}`);
            console.log(`   Password: ${SUPERADMIN_PASSWORD}`);
            console.log(`   Role:     ${User_1.UserRole.SUPERADMIN}`);
            console.log(`   User ID:  ${superAdmin.id}`);
            console.log(`   Created:  ${superAdmin.createdAt}\n`);
            console.log('🔐 SECURITY NOTICE:');
            console.log('   1. Please change the default password immediately after first login');
            console.log('   2. Use a strong, unique password for production environments');
            console.log('   3. Consider enabling two-factor authentication if implemented');
            console.log('   4. This script should only be run once for initial setup\n');
            console.log('🌐 Next Steps:');
            console.log('   1. Start the server: pnpm dev');
            console.log('   2. Login at: POST /api/v1/auth/login');
            console.log('   3. Update profile: PUT /api/v1/auth/profile');
            console.log('   4. Begin user management through the API\n');
        }
        catch (error) {
            console.error('❌ Error creating SUPERADMIN user:');
            if (error instanceof Error) {
                console.error(`   ${error.message}`);
                if (process.env.NODE_ENV === 'development') {
                    console.error(`   Stack trace: ${error.stack}`);
                }
            }
            else {
                console.error(`   ${error}`);
            }
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Ensure the database is properly initialized');
            console.log('   2. Check DATABASE_PATH in .env file');
            console.log('   3. Verify all dependencies are installed');
            console.log('   4. Check database permissions');
            console.log('   5. Review migration files in src/infrastructure/database/migrations/\n');
            process.exit(1);
        }
        finally {
            // Close database connection
            yield Container_1.container.close();
            console.log('📂 Database connection closed.');
        }
    });
}
// Run the script
createSuperAdmin()
    .then(() => {
    console.log('✅ Script completed successfully.\n');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=create-superadmin.js.map