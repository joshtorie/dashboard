import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepairStore } from '../store/repairStore';
import { RepairStatus } from '../types/repair';
import { differenceInHours } from 'date-fns';
import { AlertCircle, Clock } from 'lucide-react';
import shallow from 'zustand/shallow';

export default function Dashboard() {
  const navigate = useNavigate();
  const repairs = useRepairStore(useCallback(state => state.repairs, shallow));
  const fetchRepairs = useRepairStore(useCallback(state => state.fetchRepairs, []));

  useEffect(() => {
    console.log('Dashboard mounted');
    fetchRepairs();
    return () => {
      console.log('Dashboard unmounted');
    };
  }, [fetchRepairs]);

  const handleStatusCardClick = (status: RepairStatus) => {
    navigate('/repairs');
  };

  const overdueRepairs = repairs.filter(
    (repair) =>
      repair.status === 'Open' &&
      differenceInHours(new Date(), new Date(repair.createdAt)) >= 72
  );

  const statusCards = [
    { status: 'פתוח', englishStatus: 'Open' as RepairStatus, color: 'bg-yellow-100 text-yellow-800' },
    { status: 'תקוע', englishStatus: 'Hold' as RepairStatus, color: 'bg-red-100 text-red-800' },
    { status: 'ממתין לאיסוף', englishStatus: 'Notified' as RepairStatus, color: 'bg-blue-100 text-blue-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center">
          <img src="https://github.com/joshtorie/dashboard/raw/main/logo.png" alt="Logo" className="h-10 w-auto ml-2" />
          <h1 className="text-2xl font-bold text-gray-900">מעבדת תיקונים</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map((card) => (
          <div
            key={card.englishStatus}
            className={`${card.color} rounded-lg p-4 cursor-pointer`}
            onClick={() => handleStatusCardClick(card.englishStatus)}
          >
            <h3 className="text-lg font-semibold">{card.status}</h3>
            <p className="text-2xl font-bold mt-2">
              {repairs.filter((repair) => repair.status === card.englishStatus).length}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {repairs.map((repair) => (
          <div key={repair.id}>
            <p className="font-medium">{repair.customerName}</p>
            <p className="text-sm text-gray-500">{repair.id}</p>
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
