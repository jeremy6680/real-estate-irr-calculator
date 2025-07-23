import React from 'react';

interface ErrorMessageProps {
  message: string;
  severity?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  severity = 'error',
  className = '',
}) => {
  const severityClasses = {
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div
      className={`p-3 rounded-md border ${severityClasses[severity]} ${className}`}
      role="alert"
    >
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default ErrorMessage;