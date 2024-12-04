import React from 'react';
import { useRepairStore } from '../store/repairStore';
import RepairCard from '../components/RepairCard';

export default function Archive() {
  const repairs = useRepairStore((state) => state.repairs);
  const solvedRepairs = repairs.filter((repair) => repair.status === 'Solved');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
      
      {solvedRepairs.length === 0 ? (
        <p className="text-gray-500">No archived repairs</p>
      ) : (
        <div className="space-y-4">
          {solvedRepairs.map((repair) => (
            <RepairCard key={repair.id} repair={repair} />
          ))}
        </div>
      )}
    </div>
  );
}