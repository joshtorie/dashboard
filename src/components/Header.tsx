import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Wrench, Archive, Search, LayoutDashboard, Menu, X } from 'lucide-react';
import NewRepairModal from './NewRepairModal';

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
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setIsNewRepairOpen(true)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              <span>New Repair</span>
            </button>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 ${
                  location.pathname === item.path
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <button
              onClick={() => {
                setIsNewRepairOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 w-full p-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>New Repair</span>
            </button>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-1 w-full p-2 ${
                  location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
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