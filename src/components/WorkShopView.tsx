import React, { useEffect, useState } from 'react';
import { useRepairStore } from '../store/repairStore';

const WorkShopView: React.FC = () => {
  const { repairs } = useRepairStore(); // Assuming you have a store to fetch repairs

  // Filter repairs that are not solved
  const filteredRepairs = repairs.filter(repair => repair.status !== 'Solved');

  const calculateDuration = (createdAt: string) => {
    const createdAtDate = new Date(createdAt);
    const now = new Date();
    const duration = now.getTime() - createdAtDate.getTime();
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  return (
    <div className="workshop-view">
      {filteredRepairs.map(repair => {
        const { days, hours } = calculateDuration(repair.createdAt);
        return (
          <div key={repair.id} className="repair-card">
            <h2>{repair.customerName}</h2>
            <p>Repair Ticket ID: {repair.id}</p>
            <p className="text-sm">Status: {repair.status}</p>
            <p>Complaint: {repair.complaint}</p>
            <p>Technician Notes: {repair.technicianNotes}</p>
            <p>Active Timer: {days} days, {hours} hours</p>
          </div>
        );
      })}
    </div>
  );
};

export default WorkShopView;
