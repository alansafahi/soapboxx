import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityLockdown() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Security Lockdown Active
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-6">
            All authentication has been temporarily disabled due to a critical security issue. 
            Cross-user authentication vulnerability detected and system locked down for safety.
          </p>
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-6">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Issue:</strong> Users being automatically logged in as other users<br/>
              <strong>Status:</strong> System locked until resolved<br/>
              <strong>Action:</strong> No login permitted
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="destructive"
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}