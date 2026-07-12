import React from 'react';

const VehicleCard = ({ vehicle, onViewDetails }) => {
  const { make, model, category, price, quantity, year, imageUrl, fuelType, transmission } = vehicle;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full group">
      {/* Image container */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider mt-2">No Image Uploaded</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          {quantity > 0 ? (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500 text-white shadow-sm uppercase tracking-wide">
              {quantity} In Stock
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500 text-white shadow-sm uppercase tracking-wide">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Detail contents */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand & Model */}
        <div className="mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {category}
          </span>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition duration-200">
            {make} <span className="font-normal text-slate-600">{model}</span>
          </h3>
        </div>

        {/* Details pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {year && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
              {year}
            </span>
          )}
          {transmission && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
              {transmission}
            </span>
          )}
          {fuelType && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
              {fuelType}
            </span>
          )}
        </div>

        {/* Bottom wrapper */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Price</p>
            <p className="text-xl font-black text-slate-900">{formattedPrice}</p>
          </div>
          
          <button
            onClick={() => onViewDetails(vehicle)}
            className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer shadow-sm active:scale-95"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
