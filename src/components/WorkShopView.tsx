import React, { useEffect, useState } from 'react';
import { useRepairStore } from '../store/repairStore';

const WorkShopView: React.FC = () => {
  const { repairs } = useRepairStore();
  const [color, setColor] = useState('');
  const [sortOption, setSortOption] = useState('');

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

  // Sort repairs based on selected option
  const sortedRepairs = () => {
    if (sortOption === 'oldest') {
      return filteredRepairs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return filteredRepairs;
  };

  return (
    <div className="workshop-view grid grid-cols-5 gap-4"> 
      <div className="filter-options">
        <label>Sort by:</label>
        <select onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Select</option>
          <option value="oldest">Oldest Card</option>
          <option value="color">Background Color</option>
          <option value="status">Status</option>
        </select>
      </div>
      {sortedRepairs().map(repair => {
        const { days, hours } = calculateDuration(repair.createdAt);
        return (
          <div key={repair.id} className={`repair-card ${color} border p-4 rounded shadow-md`}> 
            <h2>{repair.customerName}</h2>
            <p>Repair Ticket ID: {repair.id}</p>
            <p className="text-sm">Status: {repair.status}</p>
            <p>Complaint: {repair.complaint}</p>
            <p>Technician Notes: {repair.technicianNotes}</p>
            <p>Active Timer: {days} days, {hours} hours</p>
            <label>Background Color:</label>
            <select onChange={(e) => setColor(e.target.value)}>
              <option value="">Select Color</option>
              <option value="bg-pastel-aqua">Pastel Aqua</option>
              <option value="bg-pastel-tan">Pastel Tan</option>
              <option value="bg-pastel-blond">Pastel Blond</option>
              <option value="bg-pastel-mauve">Pastel Mauve</option>
            </select>
          </div>
        );
      })}
    </div>
  );
};

export default WorkShopView;
