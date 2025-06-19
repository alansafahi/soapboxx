// Browser-specific authentication handler to ensure proper cookie management
export async function browserLogin(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      // Wait for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify authentication immediately
      const verifyResponse = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      return verifyResponse.ok;
    }
    
    return false;
  } catch (error) {
    console.error('Browser login error:', error);
    return false;
  }
}

export async function browserCheckAuth(): Promise<any> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Browser auth check error:', error);
    return null;
  }
}