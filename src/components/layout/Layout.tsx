import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainMenu } from '../navigation/MainMenu';

export const Layout: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header with navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">IMTMA Flooring</h1>
            </div>
            <MainMenu />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};