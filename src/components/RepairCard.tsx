import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Phone, Share2, Edit2, ChevronDown, ChevronUp, Printer } from 'lucide-react';
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
  'Hold': 'תקוע',
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
    let mounted = true;
    
    const fetchImageUrl = async () => {
      if (!repair.photo_url || !isExpanded) {
        console.log('Skipping image fetch:', { photo_url: repair.photo_url, isExpanded });
        return;
      }
      
      console.log('Fetching image URL for:', repair.photo_url);
      try {
        // Get public URL
        const { data } = await supabase.storage
          .from('repair-photos')
          .getPublicUrl(repair.photo_url);

        console.log('Supabase public URL response:', data);

        if (mounted && data?.publicUrl) {
          console.log('Setting image URL:', data.publicUrl);
          setImageUrl(data.publicUrl);
        } else {
          console.log('Not setting image URL:', { mounted, publicUrl: data?.publicUrl });
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    };

    fetchImageUrl();
    return () => {
      mounted = false;
    };
  }, [repair.photo_url, isExpanded]);

  const handleImageError = async () => {
    console.error('Image failed to load, attempting to refresh URL');
    try {
      // Verify the file exists
      const { data: fileData, error: fileError } = await supabase.storage
        .from('repair-photos')
        .list('', {
          search: repair.photo_url
        });

      if (fileError || !fileData || fileData.length === 0) {
        console.error('File not found in storage:', repair.photo_url);
        return;
      }

      // Get a fresh public URL
      const { data } = await supabase.storage
        .from('repair-photos')
        .getPublicUrl(repair.photo_url);

      if (data?.publicUrl) {
        console.log('Refreshed image URL:', data.publicUrl);
        setImageUrl(data.publicUrl);
      }
    } catch (error) {
      console.error('Error refreshing image URL:', error);
    }
  };

  const handleNotesUpdate = async () => {
    try {
      await updateRepair(repair.id, {
        complaint,
        technicianNotes: notes
      });
      setIsEditing(false);
      toast.success('עודכן בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון');
    }
  };

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as RepairCardType['status'];
    try {
      await updateRepair(repair.id, { status: newStatus });
      toast.success('הסטטוס עודכן בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const handleShareClick = async () => {
    try {
      await navigator.share({
        title: `תיקון ${repair.id}`,
        text: `פרטי תיקון:\nשם: ${repair.customerName}\nטלפון: ${repair.phoneNumber}\nתלונה: ${repair.complaint}`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePrint = () => {
    const printContent = `
      תיקון מספר: ${repair.id}
      שם לקוח: ${repair.customerName}
      טלפון: ${repair.phoneNumber}
      תלונה: ${repair.complaint}
      הערות טכנאי: ${repair.technicianNotes}
      סטטוס: ${statusTranslations[repair.status]}
      תאריך: ${format(new Date(repair.createdAt), "dd/MM/yyyy HH:mm")}
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>הדפסת תיקון</title>');
    printWindow.document.write('<style>body { font-family: Arial; direction: rtl; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<pre>' + printContent + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className={`bg-white rounded-lg transition-all duration-200 ${
      isExpanded 
        ? 'shadow-lg ring-1 ring-gray-200 border border-gray-100' 
        : 'shadow-sm'
    } overflow-hidden`}>
      <div className={`p-4 ${isExpanded ? 'bg-white' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-800 font-bold">{repair.customerName}</p>
            <p className="text-gray-500">{repair.id}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {format(new Date(repair.createdAt), "EEEE, d MMMM, HH:mm")}
          </div>
          <div className={`px-2 py-1 rounded-full text-sm ${getStatusColor(repair.status)}`}>
            {statusTranslations[repair.status]}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <a
                href={`tel:${repair.phoneNumber}`}
                className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700"
              >
                <Phone className="w-5 h-5" />
                <span>{repair.phoneNumber}</span>
              </a>
            </div>

            <div>
              <label className="font-medium block mb-2">תלונת לקוח:</label>
              {isEditing ? (
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full border rounded-md p-2 min-h-[100px]"
                />
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap border rounded-md p-3">
                  {complaint}
                </p>
              )}
            </div>

            <div>
              <label className="font-medium block mb-2">הערות טכנאי:</label>
              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-md p-2 min-h-[100px]"
                />
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap border rounded-md p-3">
                  {notes}
                </p>
              )}
            </div>

            {isEditing && (
              <button
                onClick={handleNotesUpdate}
                className="w-full bg-blue-600 text-white rounded-md px-4 py-2"
              >
                שמור
              </button>
            )}

            <div>
              <label className="font-medium block mb-2">סטטוס:</label>
              <select
                value={repair.status}
                onChange={handleStatusChange}
                className="w-full border rounded-md p-2"
              >
                {Object.entries(statusTranslations).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {repair.photo_url && imageUrl && (
              <div>
                <label className="font-medium block mb-2">תמונה:</label>
                <img
                  src={imageUrl}
                  alt="תמונת תיקון"
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => setShowImage(true)}
                  onError={handleImageError}
                />
              </div>
            )}

            {showImage && imageUrl && (
              <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                onClick={() => setShowImage(false)}
              >
                <img
                  src={imageUrl}
                  alt="תמונת תיקון מוגדלת"
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            )}

            <div className="flex justify-around border-t pt-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleShareClick}
                className="text-blue-600 hover:text-blue-700"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="text-blue-600 hover:text-blue-700"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
