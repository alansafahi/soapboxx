import { AlertTriangle, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentModerationStatusProps {
  status?: 'approved' | 'pending' | 'hidden' | 'flagged' | 'removed';
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  pending: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Eye,
  },
  hidden: {
    label: 'Hidden',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: EyeOff,
  },
  flagged: {
    label: 'Flagged',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    icon: AlertTriangle,
  },
  removed: {
    label: 'Removed',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
};

export function ContentModerationStatus({ 
  status = 'approved', 
  className = '', 
  showIcon = true 
}: ContentModerationStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === 'approved') {
    return null; // Don't show anything for approved content
  }

  return (
    <Badge variant="secondary" className={`${config.color} ${className}`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

interface HiddenContentPlaceholderProps {
  contentType: string;
  reason?: string;
  onRestore?: () => void;
  isModerator?: boolean;
}

export function HiddenContentPlaceholder({ 
  contentType, 
  reason, 
  onRestore, 
  isModerator 
}: HiddenContentPlaceholderProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            This {contentType} has been hidden
          </p>
          {reason && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Reason: {reason}
            </p>
          )}
        </div>
        {isModerator && onRestore && (
          <button
            onClick={onRestore}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Restore
          </button>
        )}
      </div>
    </div>
  );
}