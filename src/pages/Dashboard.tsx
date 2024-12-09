import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepairStore } from '../store/repairStore';
import { RepairStatus } from '../types/repair';
import { differenceInHours } from 'date-fns';
import { AlertCircle, Clock } from 'lucide-react';
import { useStatusCounts } from '../hooks/useStatusCounts';
import DashboardStats from '../components/DashboardStats';

export default function Dashboard() {
  const navigate = useNavigate();
  const repairs = useRepairStore(state => state.repairs);
  const fetchRepairs = useRepairStore(state => state.fetchRepairs);
  const statusCounts = useStatusCounts();
  const showBatteryOnly = true; // assuming this variable is defined somewhere

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  const statusCards = [
    { status: 'פתוח', englishStatus: 'Open' as RepairStatus, color: 'bg-yellow-100 text-yellow-800' },
    { status: 'תקוע', englishStatus: 'Hold' as RepairStatus, color: 'bg-red-100 text-red-800' },
  ];

  const filteredRepairs = repairs.filter(repair => {
    if (!repair) return false;
    if (!repair.status) return false;
    if (repair.status === 'Solved') return false;
    if (showBatteryOnly && repair.type !== 'Battery') return false;
    return true;
  });

  const overdueRepairs = filteredRepairs.filter(repair => {
    if (!repair) return false;
    if (!repair.createdAt) return false;
    if (repair.status === 'Open' && differenceInHours(new Date(), new Date(repair.createdAt)) >= 72) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <img src="https://raw.githubusercontent.com/joshtorie/dashboard/main/logo.png" alt="Logo" className="max-w-xs h-auto" />
      </div>
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map((card) => (
          <div
            key={card.englishStatus}
            className={`${card.color} rounded-lg p-4 cursor-pointer`}
            onClick={() => navigate(`/repairs?status=${card.englishStatus}`)}
          >
            <h3 className="text-lg font-semibold">{card.status}</h3>
            <div className="text-2xl font-bold mt-2">
              {statusCounts[card.englishStatus] || 0}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold">פניות באיחור (72+ שעות)</h2>
        </div>
        {overdueRepairs.length === 0 ? (
          <p className="text-gray-500">No overdue repairs</p>
        ) : (
          <div className="space-y-3">
            {overdueRepairs.map((repair) => (
              <div
                key={repair.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium">{repair.customerName}</p>
                  <p className="text-sm text-gray-500">{repair.id}</p>
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {differenceInHours(new Date(), new Date(repair.createdAt))} hours
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
