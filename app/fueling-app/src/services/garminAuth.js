// Garmin Connect Authentication Service - Simplified Version
// This uses direct authentication with username/password for easy testing

const GARMIN_LOGIN_URL = 'https://connect.garmin.com/signin';
const GARMIN_API_BASE = 'https://connect.garmin.com/modern/proxy/usersummary-service/usersummary/daily';

// Simple authentication - store a flag that user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('garminAuthenticated');
}

// Direct login with username/password
export async function directLogin(username, password) {
  try {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Store credentials locally for this session
    localStorage.setItem('garminUsername', username);
    localStorage.setItem('garminPassword', password);
    localStorage.setItem('garminAuthenticated', 'true');
    
    return true;
  } catch (error) {
    console.error('Error with direct login:', error);
    throw error;
  }
}

// Get stored credentials
export function getStoredCredentials() {
  return {
    username: localStorage.getItem('garminUsername') || '',
    password: localStorage.getItem('garminPassword') || '',
  };
}

// Logout
export function logout() {
  localStorage.removeItem('garminAuthenticated');
  localStorage.removeItem('garminUsername');
  localStorage.removeItem('garminPassword');
}

