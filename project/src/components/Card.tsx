import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 
      shadow-lg shadow-slate-900/20 p-6
      ${hover ? 'hover:shadow-xl hover:shadow-slate-900/30 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;