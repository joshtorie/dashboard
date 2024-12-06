import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import OpenRepairs from './pages/OpenRepairs';
import Archive from './pages/Archive';
import SearchPage from './pages/SearchPage';
import Settings from './pages/Settings';
import { useRepairStore } from './store/repairStore';

function App() {
  const fetchRepairs = useRepairStore((state) => state.fetchRepairs);
  const loading = useRepairStore((state) => state.loading);
  const error = useRepairStore((state) => state.error);

  useEffect(() => {
    console.log('App mounted');
    const initializeApp = async () => {
      try {
        console.log('Fetching repairs...');
        await fetchRepairs();
      } catch (err) {
        console.error('Failed to fetch repairs:', err);
      }
    };
    initializeApp();
    return () => {
      console.log('App unmounted');
    };
  }, [fetchRepairs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Application</h2>
          <p>{error}</p>
        </div>
    </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/repairs" element={<OpenRepairs />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;