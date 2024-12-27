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
    <div className="w-[1600px] mx-auto p-4"> 
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
            <select 
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select</option>
              <option value="oldest">Oldest Card</option>
              <option value="timeOpen">Time Open</option>
              <option value="color">Background Color</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4"> 
        {filteredAndSortedRepairs.map(repair => {
          const { days, hours } = calculateDuration(repair.createdAt);
          return (
            <div 
              key={repair.id} 
              className={`${repair.backgroundColor} border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200`}
            > 
              <div className="bg-gray-100 p-3 border-b"> 
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Time Open</p>
                  <p className="text-lg font-bold text-gray-900">{days}d {hours}h</p>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold truncate">{repair.customerName}</h2>
                  <p className="text-sm text-gray-600">#{repair.id}</p> 
                </div>
                
                <div className="bg-white/50 rounded p-2 min-h-[60px]"> 
                  <p className="text-sm line-clamp-2">Issue: {repair.complaint}</p>
                </div>
                
                <div className="bg-white/50 rounded p-2 min-h-[60px]"> 
                  <p className="text-sm line-clamp-2">Notes: {repair.technicianNotes || 'No notes'}</p>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <select 
                    onChange={(e) => updateRepairColor(repair.id, e.target.value)} 
                    className="flex-1 border rounded p-1.5 text-sm bg-white"
                    value={repair.backgroundColor || 'bg-white'}
                  > 
                    <option value="bg-white">Free</option>
                    <option value="bg-pastel-aqua">Dani</option>
                    <option value="bg-pastel-tan">Raveh</option>
                    <option value="bg-pastel-blond">Dori</option>
                    <option value="bg-pastel-mauve">Lev</option>
                  </select>
                  <div className="px-2 py-1 bg-white rounded border text-sm">
                    {repair.status}
                  </div> 
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkShopView;
