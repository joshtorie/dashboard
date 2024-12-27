import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepairStore } from '../store/repairStore';

const DashboardStats: React.FC = () => {
  const navigate = useNavigate();
  const repairs = useRepairStore((state) => state.repairs);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
    </div>
  );
};

export default DashboardStats;
