import { useState, useEffect } from 'react';
import { RepairStatusType } from '../types/repair';
import { useRepairStore } from '../store/repairStore';

export const useStatusCounts = () => {
  const [counts, setCounts] = useState<Record<RepairStatusType, number>>({
    Open: 0,
    Hold: 0,
    Notified: 0,
    Completed: 0,
  });

  const repairs = useRepairStore(state => state.repairs);

  useEffect(() => {
    const newCounts = repairs.reduce((acc, repair) => {
      if (repair.status && Object.values(RepairStatusType).includes(repair.status)) {
        acc[repair.status] = (acc[repair.status] || 0) + 1;
      }
      return acc;
    }, {} as Record<RepairStatusType, number>);

    // Reset counts if there are no repairs
    if (repairs.length === 0 || Object.keys(newCounts).length === 0) {
      setCounts({
        Open: 0,
        Hold: 0,
        Notified: 0,
        Completed: 0,
      });
      return;
    }

    setCounts(prev => ({
      ...prev,
      ...newCounts
    }));
  }, [repairs]);

  return counts;
};
