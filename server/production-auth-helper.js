/**
 * Production Authentication Helper
 * Creates authenticated user session for production environment
 */

const bcrypt = require('bcrypt');

async function createProductionUser(email, password) {
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const userData = {
    id: email.replace('@', '_').replace('.', '_'),
    email: email,
    password: hashedPassword,
    firstName: 'Production',
    lastName: 'User',
    isEmailVerified: true,
    role: 'member',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('Production user data prepared:');
  console.log(JSON.stringify(userData, null, 2));
  
  return userData;
}

// Create user for hello@soapboxsuperapp.com
createProductionUser('hello@soapboxsuperapp.com', 'Family0022$$')
  .then(userData => {
    console.log('\n✅ User data ready for production database');
    console.log('Password hash generated successfully');
    console.log('Email verified: true');
  })
  .catch(error => {
    console.error('❌ Error creating user data:', error);
  });