import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRepairStore } from '../store/repairStore';
import { differenceInHours } from 'date-fns';

const WorkShopView: React.FC = () => {
  const { repairs, updateRepairColor } = useRepairStore();
  const [sortOption, setSortOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
  }, [location.search]);

  const filteredAndSortedRepairs = useMemo(() => {
    let result = repairs.filter((repair) => {
      const matchesSearch = repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.phoneNumber.includes(searchTerm) ||
        repair.complaint.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    if (sortOption === 'oldest') {
      return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    if (sortOption === 'timeOpen') {
      result.sort((a, b) => {
        const timeA = differenceInHours(new Date(), new Date(a.createdAt));
        const timeB = differenceInHours(new Date(), new Date(b.createdAt));
        return timeB - timeA;
      });
    }
    return result;
  }, [repairs, searchTerm, sortOption]);

  const calculateDuration = (createdAt: string) => {
    const createdAtDate = new Date(createdAt);
    const now = new Date();
    const duration = now.getTime() - createdAtDate.getTime();
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  return (
    <div className="workshop-view grid grid-cols-5 gap-4"> {/* 5 columns layout */}
      <div className="filter-options col-span-1"> {/* Adjusted to take less space */}
        <label>Sort by:</label>
        <select onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Select</option>
          <option value="oldest">Oldest Card</option>
          <option value="timeOpen">Time Open</option>
          <option value="color">Background Color</option>
          <option value="status">Status</option>
        </select>
        <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search" />
      </div>
      {filteredAndSortedRepairs.map(repair => {
        const { days, hours } = calculateDuration(repair.createdAt);
        return (
          <div key={repair.id} className={`repair-card ${repair.backgroundColor} border p-4 rounded shadow-md overflow-hidden`}> 
            <div className="bg-gray-100 border rounded p-2 mb-3 text-center"> 
              <p className="text-sm font-medium text-gray-700">Time Open</p>
              <p className="text-lg font-bold text-gray-900">{days}d {hours}h</p>
            </div>
            <div className="flex justify-between items-center">
              <h2 className="font-bold">{repair.customerName}</h2>
              <p className="text-sm"># {repair.id}</p> 
            </div>
            <div className="border p-2 my-2"> 
              <p>Issue: {repair.complaint}</p>
            </div>
            <div className="border p-2 my-2"> 
              <p>Notes: {repair.technicianNotes}</p>
            </div>
            <div className="flex items-center">
              <select onChange={(e) => updateRepairColor(repair.id, e.target.value)} className="mt-2 mr-2"> 
                <option value="bg-white">Free</option>
                <option value="bg-pastel-aqua">Dani</option>
                <option value="bg-pastel-tan">Raveh</option>
                <option value="bg-pastel-blond">Dori</option>
                <option value="bg-pastel-mauve">Lev</option>
              </select>
              <div className="border p-1">{repair.status}</div> 
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkShopView;
