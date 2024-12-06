import React, { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRepairStore } from '../store/repairStore';
import { useSettingsStore } from '../store/settingsStore';
import { format } from 'date-fns';
import { supabase, supabaseUrl } from '../lib/supabase';

interface NewRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const printRepairTicket = (repair: any) => {
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
          <p><span class="label">שם:</span> ${repair.customerName}</p>
          <p><span class="label">טלפון:</span> ${repair.phoneNumber}</p>
          <p><span class="label">סטטוס:</span> ${repair.status}</p>
        </div>

        <div class="section">
          <h2>תאור פניה</h2>
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
    // Close the print window after printing
    setTimeout(() => printWindow.close(), 500);
  };
};

export default function NewRepairModal({ isOpen, onClose }: NewRepairModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    complaint: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { autoPrintEnabled } = useSettingsStore();
  const createRepair = useRepairStore((state) => state.createRepair);

  const startCamera = async () => {
    try {
      console.log('Attempting to access camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true // Fallback to any available camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        console.log('Video stream is active:', stream);
      } else {
        console.error('Video reference is null.');
      }
      setShowCamera(true);
      console.log('Camera access granted and video is playing.');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('לא ניתן לגשת למצלמה');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        console.log('Image drawn on canvas.');
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'repair-photo.jpg', { type: 'image/jpeg' });
            setImageFile(file);
            setImagePreview(URL.createObjectURL(blob));
            console.log('Captured image file:', file); // Log the captured file
          } else {
            console.error('Blob creation failed. Canvas size:', canvas.width, 'x', canvas.height);
          }
        }, 'image/jpeg', 0.8);
      } else {
        console.error('Failed to get canvas context.');
      }
      stopCamera();
    } else {
      console.error('Video reference is null.');
    }
  };

  const uploadImage = async (repairId: string) => {
    if (!imageFile) {
      console.log('No image file present');
      return null;
    }
    
    const fileName = `${repairId}-photo.jpg`;
    console.log('Attempting to upload image with filename:', fileName);
    
    try {
      const { data, error } = await supabase.storage
        .from('repair-photos')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        toast.error(`Failed to upload image: ${error.message}`);
        return null;
      }

      console.log('Image uploaded successfully, returning filename:', fileName);
      return fileName;
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast.error('Unexpected error during upload');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newRepair = await createRepair({
        ...formData,
        status: 'Open',
        technicianNotes: '',
      });

      if (imageFile) {
        console.log('Image file exists, starting upload process');
        const fileName = await uploadImage(newRepair.id);
        if (fileName) {
          console.log('Updating repair record with photo_url:', fileName);
          try {
            const { data, error } = await supabase
              .from('repairs')
              .update({ 
                photo_url: fileName,
                updatedAt: new Date().toISOString()
              })
              .eq('id', newRepair.id)
              .select('*')
              .single();

            if (error) {
              console.error('Error updating repair with photo_url:', error);
              toast.error('שגיאה בעדכון התמונה');
            } else {
              console.log('Successfully updated repair with photo_url:', data);
            }
          } catch (error) {
            console.error('Unexpected error updating repair:', error);
            toast.error('שגיאה בעדכון הרשומה');
          }
        }
      }

      toast.success('כרטיס תיקון נוצר בהצלחה');
      if (autoPrintEnabled) {
        printRepairTicket(newRepair);
      }
      onClose();
      setFormData({ customerName: '', phoneNumber: '', complaint: '' });
      setImagePreview(null);
      setImageFile(null);
    } catch (error) {
      console.error('Error creating repair:', error);
      toast.error('שגיאה ביצירת כרטיס תיקון');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">כרטיס תיקון חדש</h2>
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
              שם לקוח
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
              מספר טלפון
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
              תיאור התקלה
            </label>
            <textarea
              id="complaint"
              value={formData.complaint}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, complaint: e.target.value }))
              }
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            {!showCamera && !imagePreview && (
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center justify-center w-full p-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <Camera className="w-5 h-5 ml-2" />
                צלם תמונה
              </button>
            )}

            {showCamera && (
              <div className="space-y-2">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  playsInline
                  autoPlay
                  muted
                />
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    צלם
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    בטל
                  </button>
                </div>
              </div>
            )}

            {imagePreview && (
              <div className="space-y-2">
                <img src={imagePreview} alt="תצוגה מקדימה" className="w-full rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  הסר תמונה
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'שומר...' : 'שמור'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              בטל
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
