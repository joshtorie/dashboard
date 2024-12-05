import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Phone, Share2, Edit2, ChevronDown, ChevronUp, Printer, Image as ImageIcon } from 'lucide-react';
import { RepairCard as RepairCardType } from '../types/repair';
import { useRepairStore } from '../store/repairStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface RepairCardProps {
  repair: RepairCardType;
}

const getStatusColor = (status: RepairCardType['status']) => {
  switch (status) {
    case 'Open':
      return 'bg-yellow-100 text-yellow-800';
    case 'Hold':
      return 'bg-red-100 text-red-800';
    case 'Notified':
      return 'bg-blue-100 text-blue-800';
    case 'Solved':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function RepairCard({ repair }: RepairCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(repair.technicianNotes);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);
  const updateRepair = useRepairStore((state) => state.updateRepair);

  useEffect(() => {
    if (repair.photo_url && isExpanded) {
      getImageUrl();
    }
  }, [repair.photo_url, isExpanded]);

  const getImageUrl = async () => {
    if (!repair.photo_url) {
      console.log('No photo_url present for repair:', repair.id);
      return;
    }

    console.log('Fetching public URL for:', repair.photo_url);
    const { data } = await supabase.storage
      .from('repair-photos')
      .getPublicUrl(repair.photo_url);

    if (data?.publicUrl) {
      console.log('Retrieved public URL:', data.publicUrl);
      setImageUrl(data.publicUrl);
    } else {
      console.log('No public URL retrieved');
    }
  };

  const deleteImage = async () => {
    if (!repair.photo_url) return;

    const { error } = await supabase.storage
      .from('repair-photos')
      .remove([repair.photo_url]);

    if (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as RepairCardType['status'];
    
    if (newStatus === 'Solved' && repair.photo_url) {
      await deleteImage();
    }
    
    await updateRepair(repair.id, { 
      status: newStatus,
      photo_url: newStatus === 'Solved' ? null : repair.photo_url 
    });
  };

  const handleNotesUpdate = async () => {
    await updateRepair(repair.id, { technicianNotes: notes });
  };

  const getWhatsAppLink = () => {
    const message = encodeURIComponent('Your repair is finished! Please come pick it up');
    const phone = `972${repair.phoneNumber.replace(/\D/g, '')}`;
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Repair Ticket #${repair.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #ccc;
            }
            .section {
              margin-bottom: 20px;
            }
            .label {
              font-weight: bold;
              margin-right: 10px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Repair Ticket #${repair.id}</h1>
            <p>Created: ${format(new Date(repair.createdAt), 'PPp')}</p>
          </div>
          
          <div class="section">
            <p><span class="label">Customer:</span> ${repair.customerName}</p>
            <p><span class="label">Phone:</span> ${repair.phoneNumber}</p>
            <p><span class="label">Status:</span> ${repair.status}</p>
          </div>

          <div class="section">
            <h2>Complaint</h2>
            <p>${repair.complaint}</p>
          </div>

          <div class="section">
            <h2>Technician Notes</h2>
            <p>${repair.technicianNotes || 'No notes yet'}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      // Uncomment the next line if you want the print window to close after printing
      // printWindow.close();
    };
  };

  const minimizedContent = (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">{repair.customerName}</h3>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(repair.status)}`}>
              {repair.status}
            </span>
          </div>
          <div className="flex items-center mt-2 text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{repair.phoneNumber}</span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded self-end sm:self-center"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
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
        <div className="flex items-center space-x-4">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-green-600 hover:text-green-700"
          >
            <Share2 className="w-5 h-5" />
            <span>Send WhatsApp</span>
          </a>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </button>
        </div>
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
            <option value="Open">Open</option>
            <option value="Hold">Hold</option>
            <option value="Notified">Notified</option>
            <option value="Solved">Solved</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="font-medium block mb-2">
            Customer Complaint:
          </label>
          <p className="text-gray-600 whitespace-pre-wrap">{repair.complaint}</p>
        </div>

        {repair.photo_url && (
          <div className="mt-4">
            <button
              onClick={() => setShowImage(!showImage)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ImageIcon className="w-5 h-5" />
              <span>{showImage ? 'Hide Image' : 'Show Image'}</span>
            </button>
            {showImage && imageUrl && (
              <div className="mt-2">
                <img 
                  src={imageUrl} 
                  alt="Repair photo" 
                  className="w-full max-w-md rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        )}

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