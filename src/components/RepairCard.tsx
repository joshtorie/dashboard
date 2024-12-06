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

  const minimizedContent = (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 space-x-reverse">
            <h3 className="text-lg font-semibold">{repair.customerName}</h3>
            <span className="text-gray-600">#{repair.id}</span>
            <span className="text-gray-600">{format(new Date(repair.createdAt), 'PP')}</span>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(repair.status)}`}>
              {statusTranslations[repair.status]}
            </span>
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
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow" dir="rtl">
      <div className="mt-4">
        <a href={`tel:${repair.phoneNumber}`} className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700">
          <Phone className="w-5 h-5" />
          <span>{repair.phoneNumber}</span>
        </a>
      </div>

      <div className="mt-4">
        <label className="font-medium block mb-2">תלונת לקוח:</label>
        {isEditing ? (
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full border rounded-md p-2 min-h-[100px]"
          />
        ) : (
          <p className="text-gray-600 whitespace-pre-wrap">{complaint}</p>
        )}
        {isEditing && (
          <button onClick={handleNotesUpdate} className="mt-2 bg-blue-600 text-white rounded-md px-4 py-2">שמור</button>
        )}
      </div>

      <div className="mt-4">
        <label className="font-medium block mb-2">הערות טכנאי:</label>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-md p-2 min-h-[100px]"
          />
        ) : (
          <p className="text-gray-600 whitespace-pre-wrap">{notes}</p>
        )}
        {isEditing && (
          <button onClick={handleNotesUpdate} className="mt-2 bg-blue-600 text-white rounded-md px-4 py-2">שמור</button>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-4 space-x-reverse">
          <label htmlFor="status" className="font-medium min-w-[80px]">סטטוס:</label>
          <select
            id="status"
            value={repair.status}
            onChange={handleStatusChange}
            className="w-full sm:w-auto border border-gray-300 rounded-md p-2 bg-white shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(statusTranslations).map(([status, translation]) => (
              <option key={status} value={status}>{translation}</option>
            ))}
          </select>
        </div>
      </div>

      {showImage && imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="תמונת תיקון" className="w-full max-w-md rounded-lg shadow-sm" />
        </div>
      )}

      <div className="flex items-center justify-between mt-4 space-x-4 space-x-reverse">
        <button onClick={() => setShowImage(!showImage)} className="text-blue-600 hover:text-blue-700 w-full">
          <ImageIcon className="w-5 h-5 mx-auto" />
        </button>
        <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:text-blue-700 w-full">
          <Edit2 className="w-5 h-5 mx-auto" />
        </button>
        <button onClick={handlePrint} className="text-blue-600 hover:text-blue-700 w-full">
          <Printer className="w-5 h-5 mx-auto" />
        </button>
        <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 w-full">
          <Share2 className="w-5 h-5 mx-auto" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4" dir="rtl">
      {minimizedContent}
      {isExpanded && expandedContent}
    </div>
  );
}
