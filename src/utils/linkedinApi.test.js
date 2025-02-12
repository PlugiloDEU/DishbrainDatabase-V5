import linkedInApi from './linkedinApi';

// Simple test to verify connection
async function testConnection() {
  try {
    console.log('Testing LinkedIn API connection...');
    const profile = await linkedInApi.getProfile('patrick-blanks');
    console.log('Connection successful!');
    console.log('Profile name:', profile.firstName, profile.lastName);
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection(); 