import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRepairStore } from '../store/repairStore';

interface NewRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewRepairModal({ isOpen, onClose }: NewRepairModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    complaint: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRepair = useRepairStore((state) => state.createRepair);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRepair({
        ...formData,
        status: 'Open',
        technicianNotes: '',
      });
      toast.success('Repair ticket created successfully');
      onClose();
      setFormData({ customerName: '', phoneNumber: '', complaint: '' });
    } catch (error) {
      console.error('Error creating repair:', error);
      toast.error('Failed to create repair ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">New Repair Ticket</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="customerName" className="block font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              id="customerName"
              value={formData.customerName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customerName: e.target.value }))
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="complaint" className="block font-medium text-gray-700">
              Complaint
            </label>
            <textarea
              id="complaint"
              value={formData.complaint}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, complaint: e.target.value }))
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 p-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}