import { useState, useEffect } from 'react';
import { RepairStatus } from '../types/repair';
import { useRepairStore } from '../store/repairStore';

export const useStatusCounts = () => {
  const [counts, setCounts] = useState<Record<RepairStatus, number>>({
    Open: 0,
    Hold: 0,
    Notified: 0,
    Completed: 0,
  });

  const repairs = useRepairStore(state => state.repairs);

  useEffect(() => {
    const newCounts = repairs.reduce((acc, repair) => {
      acc[repair.status] = (acc[repair.status] || 0) + 1;
      return acc;
    }, {} as Record<RepairStatus, number>);

    setCounts(prev => ({
      ...prev,
      ...newCounts
    }));
  }, [repairs]);

  return counts;
};
