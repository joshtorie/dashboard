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

const statusTranslations = {
  'Open': 'פתוח',
  'Hold': 'בהמתנה',
  'Notified': 'נשלחה הודעה',
  'Solved': 'טופל'
};

export default function RepairCard({ repair }: RepairCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [complaint, setComplaint] = useState(repair.complaint);
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
    await updateRepair(repair.id, { 
      complaint: complaint,
      technicianNotes: notes 
    });
  };

  const getWhatsAppLink = () => {
    const message = encodeURIComponent('התיקון שלך מוכן! אנא בוא/י לאסוף אותו');
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
            <h1>פניה #${repair.id}</h1>
            <p>Created: ${format(new Date(repair.createdAt), 'PP')}</p>
          </div>
          
          <div class="section">
            <p><span class="label">שם:</span> ${repair.customerName}</p>
            <p><span class="label">םלפון:</span> ${repair.phoneNumber}</p>
            <p><span class="label">סטטוס:</span> ${repair.status}</p>
          </div>

          <div class="section">
            <h2>תיעור</h2>
            <p>${repair.complaint}</p>
          </div>

          <div class="section">
            <h2>הערות</h2>
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

  return (
    <div className="bg-white shadow rounded-lg p-6 dir-rtl" dir="rtl">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="font-medium text-gray-900">#{repair.id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
              {statusTranslations[repair.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {format(new Date(repair.createdAt), 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תלונה</label>
            {isEditing ? (
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{complaint}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות טכנאי</label>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{notes}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
            <select
              value={repair.status}
              onChange={handleStatusChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {Object.entries(statusTranslations).map(([status, translation]) => (
                <option key={status} value={status}>{translation}</option>
              ))}
            </select>
          </div>

          {repair.photo_url && (
            <div>
              <button
                onClick={() => setShowImage(!showImage)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ImageIcon className="h-4 w-4 ml-2" />
                <span>{showImage ? 'הסתר תמונה' : 'הצג תמונה'}</span>
              </button>
              {showImage && imageUrl && (
                <img src={imageUrl} alt="תמונת תיקון" className="mt-2 max-w-full h-auto rounded-lg" />
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 space-x-reverse">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    handleNotesUpdate();
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  שמור
                </button>
                <button
                  onClick={() => {
                    setComplaint(repair.complaint);
                    setNotes(repair.technicianNotes);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  בטל
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <Edit2 className="h-4 w-4 ml-2" />
                ערוך
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
