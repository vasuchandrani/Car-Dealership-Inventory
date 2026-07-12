import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
      {message && <p className="text-slate-500 text-sm font-semibold">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
