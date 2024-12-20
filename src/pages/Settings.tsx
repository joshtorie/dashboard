import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { Printer, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { autoPrintEnabled, toggleAutoPrint, showHeaderIcon, toggleHeaderIcon } = useSettingsStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">הגדרות</h1>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Printer className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium">הדפסה אוטומטית</h3>
                <p className="text-sm text-gray-500">
                  הדפס כרטיסי תיקון באופן אוטומטי בעת יצירתם
                </p>
              </div>
            </div>
            <button
              onClick={toggleAutoPrint}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                autoPrintEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoPrintEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Removed Show Header Icon toggle */}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-3">
              <Link to="/archive" className="text-blue-600 hover:text-blue-700">
                פתח תיקונים סגורים
              </Link>
            </div>
          </div>

          {/* Removed Archive Repair toggle */}
        </div>
      </div>
    </div>
  );
}
