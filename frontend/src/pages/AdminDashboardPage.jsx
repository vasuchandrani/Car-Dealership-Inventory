import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { vehicleApi } from '../api/vehicleApi';
import apiClient from '../api/apiClient';

const AdminDashboardPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Modal control states
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [restockQty, setRestockQty] = useState(5);

  // Form states
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    category: 'Sedan',
    price: '',
    quantity: '',
    year: '',
    color: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    engineCapacity: '',
    seatingCapacity: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchVehicles = async (pageNum) => {
    try {
      setLoading(true);
      setError('');
      const data = await vehicleApi.getAllVehicles(pageNum, pageSize);
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
    fetchVehicles(page);
  }, [page]);

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // Open modal for Add
  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormError('');
    setFormData({
      make: '',
      model: '',
      category: 'Sedan',
      price: '',
      quantity: '',
      year: '',
      color: '',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      engineCapacity: '',
      seatingCapacity: '5',
      description: '',
    });
    setSelectedFile(null);
    setShowFormModal(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (vehicle) => {
    setModalMode('edit');
    setEditingVehicleId(vehicle.id);
    setFormError('');
    setFormData({
      make: vehicle.make || '',
      model: vehicle.model || '',
      category: vehicle.category || 'Sedan',
      price: vehicle.price || '',
      quantity: vehicle.quantity || '',
      year: vehicle.year || '',
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || 'Petrol',
      transmission: vehicle.transmission || 'Automatic',
      engineCapacity: vehicle.engineCapacity || '',
      seatingCapacity: vehicle.seatingCapacity || '5',
      description: vehicle.description || '',
    });
    setSelectedFile(null);
    setShowFormModal(true);
  };

  // Open modal for Restock
  const handleOpenRestockModal = (vehicle) => {
    setRestockVehicle(vehicle);
    setRestockQty(5);
    setShowRestockModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.make || !formData.model || !formData.price || !formData.quantity) {
      setFormError('Make, Model, Price, and Quantity are required.');
      return;
    }

    if (parseFloat(formData.price) < 0 || parseInt(formData.quantity) < 0) {
      setFormError('Price and Quantity cannot be negative.');
      return;
    }

    try {
      setActionLoading(true);

      const requestPayload = {
        make: formData.make,
        model: formData.model,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        year: formData.year ? parseInt(formData.year) : null,
        color: formData.color || null,
        fuelType: formData.fuelType || null,
        transmission: formData.transmission || null,
        engineCapacity: formData.engineCapacity || null,
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : null,
        description: formData.description || null,
      };

      const multipartFormData = new FormData();
      multipartFormData.append(
        'vehicle',
        new Blob([JSON.stringify(requestPayload)], { type: 'application/json' })
      );
      if (selectedFile) {
        multipartFormData.append('image', selectedFile);
      }

      let data;
      if (modalMode === 'add') {
        data = await vehicleApi.createVehicle(multipartFormData);
      } else {
        data = await vehicleApi.updateVehicle(editingVehicleId, multipartFormData);
      }

      if (data.success) {
        setShowFormModal(false);
        fetchVehicles(page);
      } else {
        setFormError(data.message || 'Operation failed');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error processing request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVehicle = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const data = await vehicleApi.deleteVehicle(id);
      if (data.success) {
        fetchVehicles(page);
      } else {
        alert(data.message || 'Delete operation failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error connecting to the server');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (restockQty <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiClient.post(`/inventory/vehicles/${restockVehicle.id}/restock`, {
        quantity: parseInt(restockQty),
      });

      const data = response.data;
      if (data.success) {
        setShowRestockModal(false);
        fetchVehicles(page);
      } else {
        alert(data.message || 'Restocking operation failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing restock connection');
    } finally {
      setActionLoading(false);
    }
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
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Catalog Controller</h1>
            <p className="text-slate-500 text-sm mt-1">
              Add new records, edit properties, soft-delete entries, or adjust catalog restocks
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="self-start bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add New Vehicle
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-sm mb-8 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Catalog Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm font-semibold">Loading showroom listings...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-sm max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Vehicles Found</h3>
            <p className="text-slate-500 text-sm mb-6">Start populating your showroom inventory catalog.</p>
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm transition duration-200 cursor-pointer"
            >
              Add First Vehicle
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Vehicle Details</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6 text-center">In Stock</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/40 transition duration-150">
                      {/* Image Preview */}
                      <td className="py-4 px-6">
                        <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shrink-0">
                          {vehicle.imageUrl ? (
                            <img
                              src={vehicle.imageUrl}
                              alt={vehicle.make}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Text details */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                          {vehicle.year && <span>{vehicle.year}</span>}
                          {vehicle.fuelType && <span>• {vehicle.fuelType}</span>}
                          {vehicle.transmission && <span>• {vehicle.transmission}</span>}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                          {vehicle.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {formattedPrice(vehicle.price)}
                      </td>

                      {/* Stock availability */}
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {vehicle.quantity}
                      </td>

                      {/* Table Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenRestockModal(vehicle)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 transition duration-150 cursor-pointer"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(vehicle)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 transition duration-150 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200 transition duration-150 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
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
          </div>
        )}
      </main>

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            {/* Close */}
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-3">
              {modalMode === 'add' ? 'Add New Vehicle Record' : 'Edit Vehicle Record'}
            </h3>

            {formError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-600 text-xs mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Make */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-make">
                    Brand / Make *
                  </label>
                  <input
                    id="modal-make"
                    name="make"
                    type="text"
                    value={formData.make}
                    onChange={handleInputChange}
                    placeholder="e.g. Toyota"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    required
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-model">
                    Model Name *
                  </label>
                  <input
                    id="modal-model"
                    name="model"
                    type="text"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g. Camry"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-category">
                    Category *
                  </label>
                  <select
                    id="modal-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Truck">Truck</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-year">
                    Manufacturing Year
                  </label>
                  <input
                    id="modal-year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g. 2024"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-price">
                    Unit Price (INR) *
                  </label>
                  <input
                    id="modal-price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 2500000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-quantity">
                    In Stock Quantity *
                  </label>
                  <input
                    id="modal-quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    required
                  />
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-transmission">
                    Transmission
                  </label>
                  <select
                    id="modal-transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-fuelType">
                    Fuel Type
                  </label>
                  <select
                    id="modal-fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Seating */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-seatingCapacity">
                    Seating Capacity
                  </label>
                  <input
                    id="modal-seatingCapacity"
                    name="seatingCapacity"
                    type="number"
                    value={formData.seatingCapacity}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-color">
                    Body Color
                  </label>
                  <input
                    id="modal-color"
                    name="color"
                    type="text"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g. Metallic Black"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                {/* Engine Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-engineCapacity">
                    Engine Capacity (e.g. 2.0L, 150kW)
                  </label>
                  <input
                    id="modal-engineCapacity"
                    name="engineCapacity"
                    type="text"
                    value={formData.engineCapacity}
                    onChange={handleInputChange}
                    placeholder="e.g. 2.5L"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-image">
                    Upload Vehicle Image File
                  </label>
                  <input
                    id="modal-image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 cursor-pointer focus:outline-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 file:cursor-pointer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="modal-description">
                  Vehicle Description
                </label>
                <textarea
                  id="modal-description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide technical specifications or sales arguments..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                ></textarea>
              </div>

              {/* Submit panel */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : modalMode === 'add' ? (
                    'Save Vehicle'
                  ) : (
                    'Update Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Qty Modal */}
      {showRestockModal && restockVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Close */}
            <button
              onClick={() => setShowRestockModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Restock Inventory
            </h3>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-bold text-slate-800">{restockVehicle.make} {restockVehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Stock:</span>
                  <span className="font-semibold text-slate-700">{restockVehicle.quantity} units</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="restockQty">
                  Quantity to Add:
                </label>
                <input
                  id="restockQty"
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-sm shadow-md hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Confirm Restock'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
