import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery } from 'lucide-react';
import { useRepairStore } from '../store/repairStore';

const DashboardStats: React.FC = () => {
  const navigate = useNavigate();
  const repairs = useRepairStore((state) => state.repairs);

  // Count repairs with type "Battery"
  const batteryCount = repairs.filter(
    (repair) => repair.type === 'Battery' && repair.status !== 'Solved'
  ).length;

  const handleBatteryClick = () => {
    // Navigate to repairs page with battery filter
    navigate('/repairs?filter=battery');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
      <div
        onClick={handleBatteryClick}
        className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Battery Repairs</p>
            <p className="text-2xl font-semibold">{batteryCount}</p>
          </div>
          <Battery className="h-8 w-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
