import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
      
      <div className="relative max-w-2xl w-full z-10">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Car Dealership Inventory
        </h1>
        <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
          Browse our premium collection, purchase securely using Razorpay, or administer the showroom inventory directly from the dashboard.
        </p>
        <div className="flex justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl transition duration-200 shadow-lg shadow-indigo-500/25"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl transition duration-200 shadow-lg shadow-indigo-500/25"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-3.5 px-8 rounded-xl border border-slate-800 transition duration-200"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
