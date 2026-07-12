import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/inventory/vehicles/purchases');
        if (response.data.success) {
          setPurchases(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load purchase history');
        }
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError(err.response?.data?.message || 'Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const formattedPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Overview Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition duration-500"></div>
            
            {/* User Avatar Circle */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-600/25 shrink-0 uppercase">
              {user?.name ? user.name.substring(0, 2) : user?.email?.substring(0, 2) || 'US'}
            </div>

            <div className="flex-grow text-center sm:text-left space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
                {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Valued Customer'}
              </span>
              <h1 className="text-2xl font-black text-slate-900 leading-none">
                {user?.name || 'User Profile'}
              </h1>
              <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Purchases History */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              My Purchase History
            </h2>

            {loading ? (
              <div className="bg-white border border-slate-200/85 rounded-3xl p-12 flex justify-center shadow-sm">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 text-rose-600 text-sm shadow-sm flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : purchases.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm space-y-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">No purchases found</h3>
                  <p className="text-xs text-slate-400 mt-1">Explore our vehicle catalog to make your first booking.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-black text-slate-800">
                          {purchase.vehicleMake} <span className="font-normal text-slate-600">{purchase.vehicleModel}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Purchased on {formatDate(purchase.purchasedAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          Qty: <span className="font-bold text-slate-700">{purchase.quantity}</span>
                        </span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          Unit Price: <span className="font-bold text-slate-700">{formattedPrice(purchase.purchasePrice)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 flex md:flex-col justify-between items-center md:items-end">
                      <span className="text-xs text-slate-400 uppercase font-semibold block md:hidden">Total Paid</span>
                      <div>
                        <span className="text-xs text-slate-400 uppercase font-semibold hidden md:block">Total Paid</span>
                        <p className="text-lg font-black text-indigo-600">
                          {formattedPrice(purchase.purchasePrice * purchase.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
