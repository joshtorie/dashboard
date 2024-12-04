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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
      <div>
        <h3 className="font-medium">{repair.customerName}</h3>
        <p className="text-sm text-gray-500">
          {repair.id} - {format(new Date(repair.createdAt), 'PPp')}
        </p>
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 hover:bg-gray-100 rounded self-end sm:self-center"
      >
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
    </div>
  );

  const expandedContent = (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <a
          href={`tel:${repair.phoneNumber}`}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <Phone className="w-5 h-5" />
          <span>{repair.phoneNumber}</span>
        </a>
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-green-600 hover:text-green-700"
        >
          <Share2 className="w-5 h-5" />
          <span>Send WhatsApp</span>
        </a>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="status" className="font-medium min-w-[80px]">
            Status:
          </label>
          <select
            id="status"
            value={repair.status}
            onChange={handleStatusChange}
            className="w-full sm:w-auto border rounded-md p-2"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="notes" className="font-medium">
              Technician Notes:
            </label>
            <button
              onClick={() => {
                if (isEditing) {
                  handleNotesUpdate();
                }
                setIsEditing(!isEditing);
              }}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 p-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </button>
          </div>
          {isEditing ? (
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-md p-2 min-h-[100px]"
            />
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap">{notes || 'No notes yet'}</p>
          )}
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