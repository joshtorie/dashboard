import React, { useEffect, useState } from 'react';
import { useRepairStore } from '../store/repairStore';

const WorkShopView: React.FC = () => {
  const { repairs } = useRepairStore();
  const [color, setColor] = useState('');
  const [sortOption, setSortOption] = useState(''); // State for sorting option

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
    } else if (sortOption === 'color') {
      return filteredRepairs.sort((a, b) => a.color.localeCompare(b.color)); // Assuming color is a property of repair
    }
    return filteredRepairs;
  };

  return (
    <div className="workshop-view">
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
          <div key={repair.id} className={`repair-card ${color}`}> 
            <h2>{repair.customerName}</h2>
            <p>Repair Ticket ID: {repair.id}</p>
            <p className="text-sm">Status: {repair.status}</p>
            <p>Complaint: {repair.complaint}</p>
            <p>Technician Notes: {repair.technicianNotes}</p>
            <p>Active Timer: {days} days, {hours} hours</p>
            <button onClick={() => setColor('bg-pastel-aqua')}>Pastel Aqua</button>
            <button onClick={() => setColor('bg-pastel-tan')}>Pastel Tan</button>
            <button onClick={() => setColor('bg-pastel-blond')}>Pastel Blond</button>
            <button onClick={() => setColor('bg-pastel-mauve')}>Pastel Mauve</button>
          </div>
        );
      })}
    </div>
  );
};

export default WorkShopView;
