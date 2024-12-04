import React from 'react';
import { useRepairStore } from '../store/repairStore';
import { RepairStatus } from '../types/repair';
import { differenceInHours } from 'date-fns';
import { AlertCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const repairs = useRepairStore((state) => state.repairs);

  const getStatusCount = (status: RepairStatus) =>
    repairs.filter((repair) => repair.status === status).length;

  const overdueRepairs = repairs.filter(
    (repair) =>
      repair.status === 'Open' &&
      differenceInHours(new Date(), new Date(repair.createdAt)) >= 72
  );

  const statusCards = [
    { status: 'Open', color: 'bg-yellow-100 text-yellow-800' },
    { status: 'Hold', color: 'bg-red-100 text-red-800' },
    { status: 'Notified', color: 'bg-blue-100 text-blue-800' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map(({ status, color }) => (
          <div
            key={status}
            className={`${color} rounded-lg p-6 shadow-sm`}
          >
            <h2 className="text-lg font-semibold">{status}</h2>
            <p className="text-3xl font-bold mt-2">{getStatusCount(status as RepairStatus)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold">Overdue Repairs (72+ hours)</h2>
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
                <div className="flex items-center text-red-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {differenceInHours(new Date(), new Date(repair.createdAt))}h
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