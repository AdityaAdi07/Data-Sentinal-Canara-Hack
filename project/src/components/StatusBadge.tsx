import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'warning' | 'error' | 'success';
  text: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className = '' }) => {
  const statusClasses = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${statusClasses[status]} ${className}
    `}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'active' ? 'animate-pulse' : ''}`} 
           style={{ backgroundColor: 'currentColor' }} />
      {text}
    </span>
  );
};

export default StatusBadge;