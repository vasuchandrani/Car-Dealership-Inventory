import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Vehicles Available', value: '250+' },
    { label: 'Inspected & Certified', value: '100%' },
    { label: 'Average Delivery Time', value: '2 Days' },
    { label: 'Customer Satisfaction', value: '4.9/5' },
  ];

  const features = [
    {
      title: 'Verified Showroom Inventory',
      description: 'Every vehicle undergoes a multi-point mechanical inspection. Complete history records are standard.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Secured Razorpay Checkouts',
      description: 'Complete payments or book vehicles in seconds. Seamless conversion, auto invoices, and secure signatures.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      title: 'Cloudinary Image Vault',
      description: 'View premium quality, high-resolution images from all angles before you decide. No placeholders.',
      icon: (
        <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 w-[1000px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
          <span>🌟 Welcome to the Future of Car Showrooms</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
          Drive Your Dream with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Absolute Transparency
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Unlock access to an elite inventory of verified cars. Inspect detailed high-res photos, filter by your preferences, and complete secure purchases instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-200"
            >
              Enter Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-200"
              >
                Get Started
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl border border-slate-800 transition duration-200"
              >
                Create Showroom Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-900/40 backdrop-blur-md border border-slate-900/80 rounded-2xl p-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <p className="text-slate-500 text-xs md:text-sm font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Designed for Modern Showroom Buyers
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Experience a clean, robust, and secure interface built entirely on modern engineering principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-900/30 border border-slate-900/60 rounded-2xl p-8 hover:border-slate-800 transition duration-300 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800/80">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900/80 bg-slate-950 py-8 text-center text-slate-500 text-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} CARPORT Showroom Inventory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
