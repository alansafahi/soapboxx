// SECURITY VULNERABILITY ELIMINATED: Auto-login page removed to prevent session recreation after logout
export default function AutoLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Auto-Login Disabled</h1>
        <p className="text-muted-foreground mb-4">
          Auto-login functionality has been disabled for security reasons.
        </p>
        <p className="text-muted-foreground">
          Please use the <a href="/login" className="text-primary underline">login page</a> to access your account.
        </p>
      </div>
    </div>
  );
}