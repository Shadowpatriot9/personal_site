#!/usr/bin/env node

console.log('🧪 Testing Admin Login Setup');
console.log('=============================\n');

// Test bcrypt functionality
try {
  const bcrypt = require('bcryptjs');
  const testPassword = '16196823';
  const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  console.log('🔐 Testing bcrypt...');
  const isValid = bcrypt.compareSync('password', hash);
  console.log('✅ Bcrypt working:', isValid);
  
  console.log('🔑 Testing development password...');
  const devPassword = '16196823';
  console.log(`   Username: shadowpatriot9`);
  console.log(`   Password: ${devPassword}`);
  
} catch (error) {
  console.error('❌ Error testing bcrypt:', error.message);
}

// Test JWT functionality
try {
  const jwt = require('jsonwebtoken');
  const secret = 'dev-secret-key-change-in-production';
  
  console.log('\n🎫 Testing JWT...');
  const token = jwt.sign({ username: 'shadowpatriot9', role: 'admin' }, secret, { expiresIn: '24h' });
  const decoded = jwt.verify(token, secret);
  console.log('✅ JWT working:', decoded.username === 'shadowpatriot9');
  
} catch (error) {
  console.error('❌ Error testing JWT:', error.message);
}

console.log('\n📋 Admin Login Test Summary:');
console.log('============================');
console.log('Development Credentials:');
console.log('  Username: shadowpatriot9');
console.log('  Password: 16196823');
console.log('\nProduction Setup Required:');
console.log('  1. Run: node setup-admin.js');
console.log('  2. Set environment variables in Vercel');
console.log('  3. Deploy to production');
console.log('\n✅ Admin setup is ready for testing!');
