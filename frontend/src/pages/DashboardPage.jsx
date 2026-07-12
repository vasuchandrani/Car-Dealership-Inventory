import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VehicleCard from '../components/VehicleCard';
import { vehicleApi } from '../api/vehicleApi';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();

  const formattedPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  const [activeFilters, setActiveFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Purchase states
  const [showConfirmPurchase, setShowConfirmPurchase] = useState(false);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showMockGateway, setShowMockGateway] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);
  const [purchaseSuccessDetails, setPurchaseSuccessDetails] = useState(null);

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(activeFilters).some(value => value !== '');
  };

  const fetchVehicles = async (pageNum, currentFilters) => {
    try {
      setLoading(true);
      setError('');
      
      let data;
      const isFiltered = Object.values(currentFilters).some(v => v !== '');
      
      if (isFiltered) {
        const queryFilters = {};
        if (currentFilters.make) queryFilters.make = currentFilters.make;
        if (currentFilters.model) queryFilters.model = currentFilters.model;
        if (currentFilters.category) queryFilters.category = currentFilters.category;
        if (currentFilters.minPrice) queryFilters.minPrice = currentFilters.minPrice;
        if (currentFilters.maxPrice) queryFilters.maxPrice = currentFilters.maxPrice;

        data = await vehicleApi.searchVehicles(queryFilters, pageNum, pageSize);
      } else {
        data = await vehicleApi.getAllVehicles(pageNum, pageSize);
      }

      if (data.success) {
        setVehicles(data.data.content || []);
        setTotalPages(data.data.totalPages || 0);
        setTotalElements(data.data.totalElements || 0);
      } else {
        setError(data.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(page, activeFilters);
  }, [page, activeFilters]);

  // Load Razorpay overlay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePurchase = async () => {
    if (purchaseQty <= 0 || purchaseQty > selectedVehicle.quantity) {
      setPaymentError(`Invalid quantity. Only ${selectedVehicle.quantity} available.`);
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError('');

      // 1. Generate Razorpay order on backend
      const totalAmount = selectedVehicle.price * purchaseQty;
      const orderResponse = await apiClient.post('/payments/order', {
        amount: totalAmount,
        currency: 'INR',
        receipt: `receipt_vehicle_${selectedVehicle.id}_${Date.now()}`
      });

      const orderData = orderResponse.data;
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to generate payment order');
      }

      const { id: orderId, keyId, amount, currency } = orderData.data;

      // 2. Decide if mock environment or real Razorpay flow
      if (keyId === 'dummy_key' || !keyId) {
        // Trigger simulated dev checkout
        setMockOrderDetails({ orderId, keyId, amount, currency });
        setShowMockGateway(true);
      } else {
        // Load real Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Razorpay payment gateway failed to load');
        }

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'CARPORT Showroom',
          description: `Booking for ${selectedVehicle.make} ${selectedVehicle.model}`,
          order_id: orderId,
          handler: async function (response) {
            await handleVerifyAndCompletePurchase(
              orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          prefill: {
            email: user?.email || '',
          },
          theme: {
            color: '#4f46e5', // indigo-600
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleVerifyAndCompletePurchase = async (orderId, paymentId, signature) => {
    try {
      setPaymentLoading(true);
      setPaymentError('');

      const purchaseResponse = await apiClient.post(`/inventory/vehicles/${selectedVehicle.id}/purchase`, {
        quantity: purchaseQty,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature
      });

      const purchaseData = purchaseResponse.data;
      if (purchaseData.success) {
        setPurchaseSuccessDetails(purchaseData.data);
        setShowConfirmPurchase(false);
        setShowMockGateway(false);
        setSelectedVehicle(null);
        // Refresh catalog list
        fetchVehicles(page, activeFilters);
      } else {
        setPaymentError(purchaseData.message || 'Verification and purchase failed');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Error executing purchase confirmation');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!mockOrderDetails) return;
    await handleVerifyAndCompletePurchase(
      mockOrderDetails.orderId,
      'pay_mock_' + Date.now(),
      'valid_sig' // Accepted by dev fallback in RazorpayServiceImpl
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setActiveFilters({ ...filters });
  };

  const handleResetFilters = () => {
    const reset = {
      make: '',
      model: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(reset);
    setPage(0);
    setActiveFilters(reset);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Showroom Collection</h1>
            <p className="text-slate-500 text-sm mt-1">
              Showing {vehicles.length} of {totalElements} premium vehicles matching your criteria
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Showroom Status:</span>
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Catalog
            </span>
          </div>
        </div>

        {/* Search & Filter Panel */}
        <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Search Catalog Filters</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Make Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="make">
                Brand / Make
              </label>
              <input
                id="make"
                name="make"
                type="text"
                value={filters.make}
                onChange={handleFilterChange}
                placeholder="e.g. Toyota"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="model">
                Model Name
              </label>
              <input
                id="model"
                name="model"
                type="text"
                value={filters.model}
                onChange={handleFilterChange}
                placeholder="e.g. Camry"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="category">
                Vehicle Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Coupe">Coupe</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Truck">Truck</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </div>

            {/* Min Price Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="minPrice">
                Min Price (INR)
              </label>
              <input
                id="minPrice"
                name="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="maxPrice">
                Max Price (INR)
              </label>
              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2 rounded-xl text-sm transition duration-200 cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl text-sm shadow-md hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-sm mb-8 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Modal Notification */}
        {purchaseSuccessDetails && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Purchase Confirmed!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Your payment was verified. An invoice has been logged for {purchaseSuccessDetails.quantity} x {purchaseSuccessDetails.vehicleMake} {purchaseSuccessDetails.vehicleModel}.
              </p>
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-left text-xs space-y-2 mb-6 font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-semibold text-slate-800">{purchaseSuccessDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold text-slate-800">{formattedPrice(purchaseSuccessDetails.purchasePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Purchased At:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(purchaseSuccessDetails.purchasedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPurchaseSuccessDetails(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition duration-200 cursor-pointer"
              >
                Return to Showroom
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Loading showroom collection..." />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-sm max-w-lg mx-auto mt-6">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Vehicles Matched</h3>
            <p className="text-slate-500 text-sm mb-6">
              {hasActiveFilters() 
                ? "Try relaxing your search filter terms or reset the criteria to see all vehicles." 
                : "The showroom catalog is currently empty."}
            </p>
            {hasActiveFilters() ? (
              <button
                onClick={handleResetFilters}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm transition duration-200 cursor-pointer"
              >
                Reset Search Filters
              </button>
            ) : (
              <button
                onClick={() => fetchVehicles(0, activeFilters)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm transition duration-200 cursor-pointer"
              >
                Reload Catalog
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onViewDetails={setSelectedVehicle}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-slate-200/80 pt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-slate-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages - 1}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Details Modal */}
      {selectedVehicle && !showConfirmPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Media side */}
            <div className="w-full md:w-1/2 aspect-video md:aspect-square bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
              {selectedVehicle.imageUrl ? (
                <img
                  src={selectedVehicle.imageUrl}
                  alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase mt-2">No Image</span>
                </div>
              )}
            </div>

            {/* Details side */}
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-indigo-50 text-indigo-600 uppercase border border-indigo-100">
                    {selectedVehicle.category}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">
                    {selectedVehicle.make} <span className="font-normal text-slate-600">{selectedVehicle.model}</span>
                  </h2>
                  <p className="text-2xl font-black text-indigo-600 mt-1">
                    {formattedPrice(selectedVehicle.price)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6 text-sm">
                  {selectedVehicle.year && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Year</span>
                      <span className="font-semibold text-slate-700">{selectedVehicle.year}</span>
                    </div>
                  )}
                  {selectedVehicle.transmission && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Transmission</span>
                      <span className="font-semibold text-slate-700">{selectedVehicle.transmission}</span>
                    </div>
                  )}
                  {selectedVehicle.fuelType && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Fuel Type</span>
                      <span className="font-semibold text-slate-700">{selectedVehicle.fuelType}</span>
                    </div>
                  )}
                  {selectedVehicle.seatingCapacity && (
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Seats</span>
                      <span className="font-semibold text-slate-700">{selectedVehicle.seatingCapacity} Seats</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-100 pb-1 col-span-2">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-semibold ${selectedVehicle.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedVehicle.quantity > 0 ? `${selectedVehicle.quantity} Available` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {selectedVehicle.description && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedVehicle.description}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  disabled={selectedVehicle.quantity === 0}
                  onClick={() => {
                    setPurchaseQty(1);
                    setPaymentError('');
                    setShowConfirmPurchase(true);
                  }}
                  className="flex-grow bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 text-center cursor-pointer disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {selectedVehicle.quantity > 0 ? 'Buy / Book Vehicle' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Purchase Modal */}
      {showConfirmPurchase && selectedVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowConfirmPurchase(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Confirm Purchase
            </h3>

            {paymentError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-600 text-xs mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{paymentError}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-800">{selectedVehicle.make} {selectedVehicle.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Unit Price:</span>
                <span className="font-semibold text-slate-700">{formattedPrice(selectedVehicle.price)}</span>
              </div>
              
              {/* Quantity Input */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <label className="text-sm text-slate-500 font-semibold" htmlFor="purchaseQty">
                  Quantity:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="purchaseQty"
                    type="number"
                    min="1"
                    max={selectedVehicle.quantity}
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(Math.max(1, Math.min(selectedVehicle.quantity, parseInt(e.target.value) || 1)))}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-semibold text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400">/ {selectedVehicle.quantity} available</span>
                </div>
              </div>

              <div className="flex justify-between text-base border-t border-slate-100 pt-3 font-bold">
                <span className="text-slate-900">Total Price:</span>
                <span className="text-indigo-600">{formattedPrice(selectedVehicle.price * purchaseQty)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmPurchase(false)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInitiatePurchase}
                disabled={paymentLoading}
                className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paymentLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Proceed to Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Payment Gateway Modal */}
      {showMockGateway && mockOrderDetails && selectedVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-dashed border-indigo-300 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-indigo-600 mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
              Simulated Razorpay Gateway
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Local environment detected. A simulated Razorpay window is active since no actual production keys are configured.
            </p>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs space-y-2 mb-6 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Receipt Order ID:</span>
                <span className="font-semibold text-slate-800">{mockOrderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold text-indigo-600 font-bold">{formattedPrice(selectedVehicle.price * purchaseQty)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMockGateway(false);
                  setPaymentError('Simulated payment cancelled by user');
                }}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer"
              >
                Fail / Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                disabled={paymentLoading}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:shadow-emerald-600/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paymentLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Authorize Success'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
