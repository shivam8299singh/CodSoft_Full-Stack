import React from 'react';

const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className={`${sizes[size] || sizes.md} animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600`} />
      {text && <p className="text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
