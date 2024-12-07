import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Wrench, Search, LayoutDashboard, Settings, Clipboard } from 'lucide-react';
import NewRepairModal from './NewRepairModal';

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

  const navItems = [
    { icon: Clipboard, path: '/repairs' }, 
    { icon: Search, path: '/search' }, 
    { icon: Settings, path: '/settings' }, 
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="flex items-center space-x-6 sm:space-x-8 mx-auto">
            <div className="group">
              <Tooltip text="תיקון חדש">
                <button
                  onClick={() => setIsNewRepairOpen(true)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                >
                  <PlusCircle className="w-6 h-6 align-middle" />
                </button>
              </Tooltip>
            </div>

            <div className="mx-2"></div> {/* Spacing */}

            {navItems.map(({ icon: Icon, path }) => {
              const isActive = location.pathname === path;
              return (
                <div key={path} className="group">
                  <Tooltip text={path === '/repairs' ? 'תיקונים פתוחים' : 
                               path === '/search' ? 'חיפוש' :
                               path === '/settings' ? 'הגדרות' : ''}>
                    <Link
                      to={path}
                      className={`p-2 rounded-lg transition-colors flex items-center
                        ${isActive 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}
                      `}
                    >
                      <Icon className="w-6 h-6 align-middle" />
                    </Link>
                  </Tooltip>
                </div>
              );
            })}

            <div className="mx-2"></div> {/* Spacing */}

            <div className="group">
              <Tooltip text="דשבורד">
                <Link
                  to="/"
                  className={`p-2 rounded-lg transition-colors flex items-center
                    ${location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}
                  `}
                >
                  <LayoutDashboard className="w-6 h-6 align-middle" />
                </Link>
              </Tooltip>
            </div>
          </nav>
        </div>
      </div>
      <NewRepairModal isOpen={isNewRepairOpen} onClose={() => setIsNewRepairOpen(false)} />
    </header>
  );
}