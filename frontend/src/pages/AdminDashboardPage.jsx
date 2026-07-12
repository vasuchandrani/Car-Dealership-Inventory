import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
          >
            Logout
          </button>
        </header>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">Welcome Admin, {user?.email}</h2>
          <p className="text-slate-400">Role: {user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
