import React, { useEffect, useState } from 'react';
import { useRepairStore } from '../store/repairStore';

const WorkShopView: React.FC = () => {
  const { repairs } = useRepairStore();
  const [color, setColor] = useState('bg-white'); // Default background color
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
    <div className="workshop-view grid grid-cols-5 gap-4"> {/* 5 columns layout */}
      <div className="filter-options col-span-1"> {/* Adjusted to take less space */}
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
          <div key={repair.id} className={`repair-card ${color} border p-4 rounded shadow-md`}> {/* Card styling */}
            <p className="border-b pb-2">{days} days, {hours} hours</p> {/* Time open with thin border */}
            <h2 className="font-bold">{repair.customerName}</h2>
            <p className="text-sm float-right">ID: {repair.id}</p>
            <p>Complaint: {repair.complaint}</p>
            <p>Technician Notes: {repair.technicianNotes}</p>
            <select onChange={(e) => setColor(e.target.value)} className="mt-2">
              <option value="bg-white">Select Color</option>
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
