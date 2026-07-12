import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-4 py-12 flex-grow">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, check out our collections below.</p>
        </header>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome, {user?.email}</h2>
          <p className="text-slate-500">Role: <span className="font-semibold text-indigo-600">{user?.role}</span></p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
