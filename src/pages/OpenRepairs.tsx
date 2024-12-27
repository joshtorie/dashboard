import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RepairCard from '../components/RepairCard';
import { useRepairStore } from '../store/repairStore';
import { RepairStatusType } from '../types/repair';

export default function OpenRepairs() {
  const location = useLocation();
  const repairs = useRepairStore((state) => state.repairs);
  const [filter, setFilter] = useState<'Open' | 'Hold' | 'Notified' | 'Battery' | 'All'>('All');

  // Read query parameters to set the filter
  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    if (status && ['Open', 'Hold', 'Notified', 'Battery'].includes(status)) {
      setFilter(status);
    }
  }, [location.search]);

  // First filter out any solved repairs, then apply the status filter
  const filteredRepairs = repairs
    .filter((repair) => repair && repair.status !== 'Solved')
    .filter((repair) => {
      if (!repair || !repair.status) return false;
      if (filter === 'All') return true;
      return repair.status === filter || (filter === 'Battery' && repair.type === 'Battery');
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">תיקונים פתוחים</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border rounded-md p-2"
        >
          <option value="All">הכל</option>
          <option value="Open">פתוח</option>
          <option value="Hold">בהמתנה</option>
          <option value="Notified">ממתין לאיסוף</option>
          <option value="Battery">סוללה</option>
        </select>
      </div>
      {filteredRepairs.length > 0 ? (
        filteredRepairs.map((repair) => (
          <RepairCard key={repair.id} repair={repair} />
        ))
      ) : (
        <div className="text-center text-gray-500">
          לא נמצאו תיקונים
        </div>
      )}
    </div>
  );
}
