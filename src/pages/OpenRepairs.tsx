import React, { useEffect } from 'react';
import RepairCard from '../components/RepairCard';
import { useRepairStore } from '../store/repairStore';

export default function OpenRepairs() {
  const repairs = useRepairStore((state) => state.repairs);
  const statusFilter = useRepairStore((state) => state.statusFilter);
  const setStatusFilter = useRepairStore((state) => state.setStatusFilter);

  // Clear status filter when component unmounts
  useEffect(() => {
    return () => {
      setStatusFilter(null);
    };
  }, [setStatusFilter]);

  const filteredRepairs = statusFilter
    ? repairs.filter(repair => repair.status === statusFilter)
    : repairs;

  return (
    <div className="space-y-4">
      {statusFilter && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {statusFilter === 'Open' && 'תיקונים פתוחים'}
            {statusFilter === 'Hold' && 'תיקונים בהמתנה'}
            {statusFilter === 'Notified' && 'תיקונים ממתינים לאיסוף'}
          </h2>
          <button
            onClick={() => setStatusFilter(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            הצג הכל
          </button>
        </div>
      )}
      
      {filteredRepairs.map((repair) => (
        <RepairCard key={repair.id} repair={repair} />
      ))}

      {filteredRepairs.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          לא נמצאו תיקונים
        </div>
      )}
    </div>
  );
}
