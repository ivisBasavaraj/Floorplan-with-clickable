import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '../components/icons/FontAwesomeIcon';

export const ExhibitionDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Exhibition Floor Plan Demos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our professional exhibition floor plan interfaces inspired by industry-leading platforms
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Professional Exhibition Demo */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-64 bg-gradient-to-br from-purple-500 to-blue-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <FontAwesomeIcon icon="fas fa-map" size={64} className="mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">Professional Exhibition</h3>
                  <p className="text-lg opacity-90">Modern UI inspired by demo.expofp.com</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Exhibition Floor Plan
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A modern, professional interface featuring interactive booth selection, 
                exhibitor directory, advanced search and filtering, and responsive design 
                optimized for trade shows and exhibitions.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  Interactive booth selection with detailed modals
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  Exhibitor directory with search and filtering
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  Zoom controls and responsive design
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  Professional gradient styling and animations
                </div>
              </div>
              <Link
                to="/exhibition"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                <FontAwesomeIcon icon="fas fa-external-link-alt" className="mr-2" />
                View Demo
              </Link>
            </div>
          </div>

          {/* Enhanced User Viewer */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="h-64 bg-gradient-to-br from-green-500 to-teal-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <FontAwesomeIcon icon="fas fa-building" size={64} className="mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">Enhanced Viewer</h3>
                  <p className="text-lg opacity-90">Full-featured floor plan viewer</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Enhanced User Floor Plan Viewer
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A comprehensive floor plan viewer with 2D/3D modes, map integration, 
                company listings, sponsor headers, and advanced booth management 
                capabilities for professional exhibitions.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  2D/3D view modes with map integration
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  Company directory with CSV data support
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  Sponsor header and branding integration
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <FontAwesomeIcon icon="fas fa-check" className="text-green-500 mr-3" />
                  Authentication and user management
                </div>
              </div>
              <Link
                to="/floor-plans"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
              >
                <FontAwesomeIcon icon="fas fa-external-link-alt" className="mr-2" />
                View Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Demos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Additional Floor Plan Demos
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/simple-map"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="text-center">
                <FontAwesomeIcon icon="fas fa-map-marked-alt" size={32} className="text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Simple Map</h3>
                <p className="text-sm text-gray-600">Basic floor plan with minimal dependencies</p>
              </div>
            </Link>

            <Link
              to="/interactive-map"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="text-center">
                <FontAwesomeIcon icon="fas fa-mouse-pointer" size={32} className="text-purple-500 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Interactive Map</h3>
                <p className="text-sm text-gray-600">Pan and zoom functionality</p>
              </div>
            </Link>

            <Link
              to="/map-demo"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="text-center">
                <FontAwesomeIcon icon="fas fa-layer-group" size={32} className="text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Map Demo</h3>
                <p className="text-sm text-gray-600">Advanced mapping features</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200"
          >
            <FontAwesomeIcon icon="fas fa-home" className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};