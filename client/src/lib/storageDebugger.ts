/**
 * Storage Debugging Tool
 * Helps diagnose localStorage and sessionStorage issues for authentication
 */

export function debugStorage() {
  console.log('=== STORAGE DEBUG REPORT ===');
  
  // Check localStorage
  console.log('localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      console.log(`  ${key}: ${value?.substring(0, 100)}${value && value.length > 100 ? '...' : ''}`);
    }
  }
  
  // Check sessionStorage
  console.log('sessionStorage items:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key);
      console.log(`  ${key}: ${value?.substring(0, 100)}${value && value.length > 100 ? '...' : ''}`);
    }
  }
  
  // Check specific Supabase keys
  console.log('Supabase-style keys:');
  console.log(`  supabase.auth.token: ${localStorage.getItem('supabase.auth.token') ? 'EXISTS' : 'MISSING'}`);
  console.log(`  sb-project-auth-token: ${localStorage.getItem('sb-project-auth-token') ? 'EXISTS' : 'MISSING'}`);
  
  // Check our custom keys
  console.log('Custom authentication keys:');
  console.log(`  auth_state: ${localStorage.getItem('auth_state') ? 'EXISTS' : 'MISSING'}`);
  console.log(`  logout_flag: ${localStorage.getItem('logout_flag') ? 'EXISTS' : 'MISSING'}`);
  console.log(`  session_verified: ${sessionStorage.getItem('session_verified') ? 'EXISTS' : 'MISSING'}`);
  console.log(`  session_heartbeat: ${sessionStorage.getItem('session_heartbeat') ? 'EXISTS' : 'MISSING'}`);
  
  console.log('=== END STORAGE DEBUG ===');
}

export function clearAllAuthStorage() {
  console.log('🧹 Clearing all authentication storage...');
  
  // Clear localStorage auth keys
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('sb-project-auth-token');
  localStorage.removeItem('auth_state');
  localStorage.removeItem('logout_flag');
  
  // Clear sessionStorage auth keys
  sessionStorage.removeItem('session_verified');
  sessionStorage.removeItem('session_heartbeat');
  
  console.log('✅ All authentication storage cleared');
}

export function simulateSupabaseAuth(user: any) {
  console.log('🔄 Simulating Supabase-style authentication storage...');
  
  const supabaseSession = {
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: user
  };
  
  // Store in Supabase-style format
  localStorage.setItem('supabase.auth.token', JSON.stringify(supabaseSession));
  
  console.log('✅ Supabase-style session created');
  debugStorage();
}