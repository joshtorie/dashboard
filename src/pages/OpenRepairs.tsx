import React, { useState } from 'react';
import RepairCard from '../components/RepairCard';
import { useRepairStore } from '../store/repairStore';

export default function OpenRepairs() {
  const repairs = useRepairStore((state) => state.repairs);
  const [filter, setFilter] = useState<'Open' | 'Hold' | 'Notified' | 'All'>('All');

  const filteredRepairs = repairs.filter((repair) => {
    if (filter === 'All') return true;
    return repair.status === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">תיקונים פתוחים</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'Open' | 'Hold' | 'Notified' | 'All')}
          className="border rounded-md p-2"
        >
          <option value="All">הכל</option>
          <option value="Open">פתוח</option>
          <option value="Hold">בהמתנה</option>
          <option value="Notified">ממתין לאיסוף</option>
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
