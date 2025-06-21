/**
 * User-friendly error message utilities
 * Converts technical error messages into welcoming, helpful messages
 */

export interface UserFriendlyError {
  title: string;
  description: string;
  actionable?: string;
}

export function getUserFriendlyError(error: any, context: 'login' | 'registration' | 'general' = 'general'): UserFriendlyError {
  const message = error?.message || '';
  
  // Authentication specific errors
  if (context === 'login') {
    if (message.includes('User already exists') || message.includes('already exists')) {
      return {
        title: 'Account already exists',
        description: 'An account with this email address already exists. Please try signing in instead.',
        actionable: 'Click "Sign in" below to access your existing account.'
      };
    }
    
    if (message.includes('Invalid email or password') || message.includes('Invalid credentials')) {
      return {
        title: 'Sign-in failed',
        description: 'The email or password you entered is incorrect.',
        actionable: 'Please check your credentials and try again, or use "Forgot your password?" if needed.'
      };
    }
    
    if (message.includes('User not found') || message.includes('No user found')) {
      return {
        title: 'Account not found',
        description: 'We couldn\'t find an account with this email address.',
        actionable: 'Please check the email address or create a new account.'
      };
    }
    
    if (message.includes('Please verify') || message.includes('verification') || message.includes('unverified')) {
      return {
        title: 'Email verification required',
        description: 'Please check your email and verify your account before signing in.',
        actionable: 'Look for a verification email in your inbox and spam folder.'
      };
    }
    
    if (message.includes('Unauthorized') || message.includes('401')) {
      return {
        title: 'Authentication required',
        description: 'Your session has expired. Please sign in again.',
        actionable: 'Click the sign-in button to continue.'
      };
    }
  }
  
  if (context === 'registration') {
    if (message.includes('validation') || message.includes('required')) {
      return {
        title: 'Please complete all fields',
        description: 'Some required information is missing or invalid.',
        actionable: 'Please fill in all fields with valid information and try again.'
      };
    }
    
    if (message.includes('email')) {
      return {
        title: 'Invalid email address',
        description: 'Please enter a valid email address.',
        actionable: 'Check your email format and try again.'
      };
    }
    
    if (message.includes('password')) {
      return {
        title: 'Password requirements not met',
        description: 'Your password doesn\'t meet our security requirements.',
        actionable: 'Please choose a password with at least 8 characters.'
      };
    }
  }
  
  // Network and server errors
  if (message.includes('Network') || message.includes('fetch')) {
    return {
      title: 'Connection problem',
      description: 'We\'re having trouble connecting to our servers.',
      actionable: 'Please check your internet connection and try again.'
    };
  }
  
  if (message.includes('500') || message.includes('Internal Server Error')) {
    return {
      title: 'Service temporarily unavailable',
      description: 'We\'re experiencing technical difficulties.',
      actionable: 'Please try again in a few moments. If the problem continues, contact support.'
    };
  }
  
  if (message.includes('404') || message.includes('Not Found')) {
    return {
      title: 'Page not found',
      description: 'The page you\'re looking for doesn\'t exist.',
      actionable: 'Please check the URL or return to the home page.'
    };
  }
  
  if (message.includes('403') || message.includes('Forbidden')) {
    return {
      title: 'Access restricted',
      description: 'You don\'t have permission to access this feature.',
      actionable: 'Please contact your administrator if you believe this is an error.'
    };
  }
  
  // Generic fallback
  return {
    title: context === 'login' ? 'Sign-in failed' : context === 'registration' ? 'Registration failed' : 'Something went wrong',
    description: 'We encountered an unexpected problem.',
    actionable: 'Please try again. If the problem continues, contact support for assistance.'
  };
}

export function formatErrorForToast(error: any, context: 'login' | 'registration' | 'general' = 'general') {
  const friendlyError = getUserFriendlyError(error, context);
  
  return {
    title: friendlyError.title,
    description: friendlyError.actionable ? 
      `${friendlyError.description} ${friendlyError.actionable}` : 
      friendlyError.description,
    variant: "destructive" as const
  };
}