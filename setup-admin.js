const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Admin Setup Script');
console.log('=====================\n');

rl.question('Enter your desired admin password: ', async (password) => {
  try {
    // Generate password hash
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Generate JWT secret
    const jwtSecret = require('crypto').randomBytes(64).toString('hex');
    
    console.log('\n✅ Setup Complete!');
    console.log('==================\n');
    console.log('Add these environment variables to your Vercel project:\n');
    console.log(`ADMIN_USERNAME=shadowpatriot9`);
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log(`JWT_SECRET=${jwtSecret}`);
    console.log(`MONGO_URI=your_mongodb_connection_string`);
    console.log('\n📝 Instructions:');
    console.log('1. Go to your Vercel dashboard');
    console.log('2. Navigate to your project settings');
    console.log('3. Go to the "Environment Variables" section');
    console.log('4. Add each variable above');
    console.log('5. Redeploy your project');
    console.log('\n🔑 Login Credentials:');
    console.log(`Username: shadowpatriot9`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  Keep your password and JWT secret secure!');
    
    rl.close();
  } catch (error) {
    console.error('Error generating password hash:', error);
    rl.close();
  }
}); 