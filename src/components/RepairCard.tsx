import React, { useState } from 'react';
import { format } from 'date-fns';
import { Phone, Share2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { RepairCard as RepairCardType } from '../types/repair';
import { useRepairStore } from '../store/repairStore';

interface RepairCardProps {
  repair: RepairCardType;
}

export default function RepairCard({ repair }: RepairCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(repair.technicianNotes);
  const updateRepair = useRepairStore((state) => state.updateRepair);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateRepair(repair.id, { status: e.target.value as RepairCardType['status'] });
  };

  const handleNotesUpdate = async () => {
    await updateRepair(repair.id, { technicianNotes: notes });
  };

  const getWhatsAppLink = () => {
    const message = encodeURIComponent('Your repair is finished! Please come pick it up');
    const phone = `972${repair.phoneNumber.replace(/\D/g, '')}`;
    return `https://wa.me/${phone}?text=${message}`;
  };

  const minimizedContent = (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">{repair.customerName}</h3>
        <p className="text-sm text-gray-500">
          {repair.id} - {format(new Date(repair.createdAt), 'PPp')}
        </p>
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>
    </div>
  );

  const expandedContent = (
    <div className="mt-4 space-y-4">
      <div className="flex items-center space-x-2">
        <a
          href={`tel:${repair.phoneNumber}`}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Phone className="w-4 h-4 mr-1" />
          {repair.phoneNumber}
        </a>
      </div>

      <div>
        <h4 className="font-medium">Customer Complaint</h4>
        <p className="text-gray-700">{repair.complaint}</p>
      </div>

      <div>
        <h4 className="font-medium">Technician Notes</h4>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              handleNotesUpdate();
              setIsEditing(false);
            }}
            className="w-full p-2 border rounded"
            rows={3}
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="text-gray-700 cursor-pointer"
          >
            {repair.technicianNotes || 'Click to add notes...'}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <select
          value={repair.status}
          onChange={handleStatusChange}
          className="border rounded p-1"
        >
          <option value="Open">Open</option>
          <option value="Hold">Hold</option>
          <option value="Notified">Notified</option>
          <option value="Solved">Solved</option>
        </select>

        <div className="flex space-x-2">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-green-600 hover:bg-green-50 rounded"
          >
            <Share2 className="w-5 h-5" />
          </a>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {minimizedContent}
      {isExpanded && expandedContent}
    </div>
  );
}