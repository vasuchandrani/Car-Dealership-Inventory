import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400 mb-2">
          Car Dealership
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Inventory Management System
        </p>
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/50">
          <p className="text-emerald-400 font-semibold mb-1">✓ Environment Configured</p>
          <p className="text-slate-500 text-xs">Vite + React + Tailwind CSS + Axios</p>
        </div>
        <p className="text-slate-300 text-xs">
          Ready for authentication and vehicle listing routes.
        </p>
      </div>
    </div>
  )
}

export default App
