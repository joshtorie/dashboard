import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Wrench, Archive, Search, LayoutDashboard, Menu, X } from 'lucide-react';
import NewRepairModal from './NewRepairModal';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => (
  <div className="group relative">
    {children}
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
    </div>
  </div>
);

export default function Header() {
  const [isNewRepairOpen, setIsNewRepairOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wrench, label: 'Open Repairs', path: '/repairs' },
    { icon: Archive, label: 'Archive', path: '/archive' },
    { icon: Search, label: 'Search', path: '/search' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Tooltip text="New Repair">
              <button
                onClick={() => setIsNewRepairOpen(true)}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </Tooltip>

            {navItems.map((item) => (
              <Tooltip key={item.path} text={item.label}>
                <Link
                  to={item.path}
                  className={`p-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                </Link>
              </Tooltip>
            ))}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Tooltip text="New Repair">
              <button
                onClick={() => {
                  setIsNewRepairOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </Tooltip>

            {navItems.map((item) => (
              <Tooltip key={item.path} text={item.label}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                </Link>
              </Tooltip>
            ))}
          </nav>
        )}
      </div>

      <NewRepairModal
        isOpen={isNewRepairOpen}
        onClose={() => setIsNewRepairOpen(false)}
      />
    </header>
  );
}