import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
        <h1 className="text-6xl font-extrabold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md shadow-indigo-600/10">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
