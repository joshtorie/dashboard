import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import OpenRepairs from './pages/OpenRepairs';
import Archive from './pages/Archive';
import SearchPage from './pages/SearchPage';
import { useRepairStore } from './store/repairStore';

function App() {
  const fetchRepairs = useRepairStore((state) => state.fetchRepairs);
  const loading = useRepairStore((state) => state.loading);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/repairs" element={<OpenRepairs />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;