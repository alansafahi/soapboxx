import React from 'react';
import { Badge } from './ui/badge';

interface FieldLengthValidatorProps {
  value: string;
  maxLength: number;
  fieldName: string;
  showWarning?: boolean;
}

const FieldLengthValidator: React.FC<FieldLengthValidatorProps> = ({
  value,
  maxLength,
  fieldName,
  showWarning = true
}) => {
  const currentLength = value.length;
  const percentUsed = (currentLength / maxLength) * 100;
  
  const getVariant = () => {
    if (percentUsed >= 95) return "destructive";
    if (percentUsed >= 80) return "secondary";
    return "outline";
  };

  const getColor = () => {
    if (percentUsed >= 95) return "text-red-600";
    if (percentUsed >= 80) return "text-yellow-600";
    return "text-gray-500";
  };

  if (!showWarning && percentUsed < 80) return null;

  return (
    <div className="flex items-center justify-between mt-1">
      <span className={`text-xs ${getColor()}`}>
        {currentLength}/{maxLength} characters
      </span>
      {percentUsed >= 95 && (
        <Badge variant={getVariant()} className="text-xs">
          {fieldName} limit exceeded!
        </Badge>
      )}
      {percentUsed >= 80 && percentUsed < 95 && (
        <Badge variant={getVariant()} className="text-xs">
          Almost full
        </Badge>
      )}
    </div>
  );
};

export default FieldLengthValidator;