import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VehicleCard from '../components/VehicleCard';
import { vehicleApi } from '../api/vehicleApi';

const DashboardPage = () => {
  const { user } = useAuth();
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

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(activeFilters).some(value => value !== '');
  };

  const fetchVehicles = async (pageNum, currentFilters) => {
    try {
      setLoading(true);
      setError('');
      
      let data;
      // If we have active filters, call search; otherwise, call get all
      const isFiltered = Object.values(currentFilters).some(v => v !== '');
      
      if (isFiltered) {
        // Prepare clean filters mapping (omit empty strings)
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

  const formattedPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
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

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm font-semibold">Loading showroom collection...</p>
          </div>
        ) : vehicles.length === 0 ? (
          /* Empty state */
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
      {selectedVehicle && (
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
                  className="flex-grow bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 text-center cursor-pointer disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {selectedVehicle.quantity > 0 ? 'Buy / Book Vehicle' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
