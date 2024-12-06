import React from 'react';
import { useRepairStore } from '../store/repairStore';
import RepairCard from '../components/RepairCard';

export default function OpenRepairs() {
  const repairs = useRepairStore((state) => state.repairs);
  const loading = useRepairStore((state) => state.loading);
  const error = useRepairStore((state) => state.error);
  const openRepairs = repairs.filter((repair) => repair.status !== 'Solved');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading repairs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">פניות פתוחות</h1>
      
      {openRepairs.length === 0 ? (
        <p className="text-gray-500">No open repairs</p>
      ) : (
        <div className="space-y-4">
          {openRepairs.map((repair) => (
            <RepairCard key={repair.id} repair={repair} />
          ))}
        </div>
      )}
    </div>
  );
}
