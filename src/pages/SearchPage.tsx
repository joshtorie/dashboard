import React, { useState, useMemo } from 'react';
import { useRepairStore } from '../store/repairStore';
import RepairCard from '../components/RepairCard';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const repairs = useRepairStore((state) => state.repairs);

  const filteredRepairs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return repairs.filter(
      (repair) =>
        repair.customerName.toLowerCase().includes(term) ||
        repair.phoneNumber.includes(term) ||
        repair.id.toLowerCase().includes(term)
    );
  }, [repairs, searchTerm]);

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900">חיפוש</h1>

      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="חיפוש לפי שם לקוח, טלפון, מספר תיקון"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {searchTerm && (
        <div className="space-y-4">
          {filteredRepairs.length === 0 ? (
            <p className="text-gray-500">לא נמצאו תיקונים</p>
          ) : (
            filteredRepairs.map((repair) => (
              <RepairCard key={repair.id} repair={repair} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
