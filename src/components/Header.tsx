import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Wrench, Search, LayoutDashboard, Settings } from 'lucide-react';
import NewRepairModal from './NewRepairModal';
import { useSettingsStore } from '../store/settingsStore';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => (
  <div className="relative inline-flex items-center justify-center">
    {children}
    <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center group-hover:opacity-100 opacity-0 transition-opacity duration-300">
      <div className="w-2 h-2 bg-gray-800 rotate-45 translate-y-[-4px]" />
      <div className="relative px-3 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap">
        {text}
      </div>
    </div>
  </div>
);

export default function Header() {
  const [isNewRepairOpen, setIsNewRepairOpen] = React.useState(false);
  const location = useLocation();
  const showHeaderIcon = useSettingsStore((state) => state.showHeaderIcon);

  const navItems = [
    { icon: LayoutDashboard, label: 'לוח בקרה', path: '/' },
    { icon: Wrench, label: 'תיקונים פתוחים', path: '/repairs' },
    { icon: Search, label: 'חיפוש', path: '/search' },
    { icon: Settings, label: 'הגדרות', path: '/settings' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="flex items-center space-x-4 sm:space-x-6 mx-auto">
            <div className="group">
              <Tooltip text="תיקון חדש">
                <button
                  onClick={() => setIsNewRepairOpen(true)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </Tooltip>
            </div>

            {navItems.map((item) => (
              <Link key={item.label} to={item.path} className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-800">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <NewRepairModal
        isOpen={isNewRepairOpen}
        onClose={() => setIsNewRepairOpen(false)}
      />
    </header>
  );
}