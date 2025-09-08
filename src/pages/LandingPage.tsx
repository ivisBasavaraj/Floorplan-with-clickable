import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '../components/icons/FontAwesomeIcon';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon="fas fa-th-large" size={24} className="text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">FloorPlan Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Login
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Advanced Floor Plan Management with 3D Visualization
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Design, manage, and visualize event spaces with our powerful 3D floor plan solution. Perfect for event planners, exhibitors, and venue managers.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-center"
                >
                  Start Free Trial
                </Link>
                <a 
                  href="#features" 
                  className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-6 py-3 rounded-md font-medium text-center flex items-center justify-center"
                >
                  Learn More <FontAwesomeIcon icon="fas fa-chevron-right" size={16} className="ml-1" />
                </a>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="bg-white p-2 rounded-lg shadow-xl hero-image-overlay">
                <img 
                  src="https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="3D Floor Plan Visualization" 
                  className="rounded-md w-full h-auto"
                />
                <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
                  3D View
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Event Planning</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive toolset helps you design, manage, and visualize event spaces with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow feature-card">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon="fas fa-cube" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3D Visualization</h3>
              <p className="text-gray-600">
                Switch between 2D and 3D views to get a realistic perspective of your event space layout.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow feature-card">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon="fas fa-building" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booth Management</h3>
              <p className="text-gray-600">
                Easily create, edit, and manage booth spaces with customizable properties and exhibitor information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow feature-card">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon="fas fa-users" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Exhibitor Management</h3>
              <p className="text-gray-600">
                Track exhibitor details, booth assignments, and contact information in one centralized system.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow feature-card">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon="fas fa-layer-group" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Layer Editing</h3>
              <p className="text-gray-600">
                Work with multiple layers to organize complex floor plans and manage different elements separately.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow feature-card">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon="fas fa-eye" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Viewer</h3>
              <p className="text-gray-600">
                Share interactive floor plans with stakeholders, allowing them to explore and navigate the space.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow feature-card">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon="fas fa-bolt" size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Changes to floor plans are updated in real-time, ensuring all stakeholders have the latest information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Visualization Highlight Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Advanced 3D Visualization</h2>
              <p className="mt-4 text-lg text-gray-600">
                Our powerful 3D visualization tools help you create immersive event experiences:
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Switch between 2D and 3D views with a single click</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Realistic rendering of booth structures and furniture</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Interactive navigation through the event space</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Customizable viewing angles and perspectives</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Zoom and pan controls for detailed exploration</p>
                </li>
              </ul>
              <div className="mt-8">
                <Link 
                  to="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium inline-block"
                >
                  Try 3D Visualization
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-3 rounded-lg shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1558442074-3c19857bc1dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="3D Floor Plan Example" 
                  className="rounded-md w-full h-auto"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-blue-600 bg-opacity-90 text-white px-4 py-3 rounded-full shadow-lg">
                    <FontAwesomeIcon icon="fas fa-box" size={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Trusted by Event Professionals</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers are saying about FloorPlan Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-lg testimonial-card">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">JM</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">John Mathews</h4>
                  <p className="text-gray-600 text-sm">Event Director, TechExpo</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The 3D visualization feature has completely transformed how we plan and present our events to stakeholders. It's intuitive and incredibly powerful."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-lg testimonial-card">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">SP</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sarah Parker</h4>
                  <p className="text-gray-600 text-sm">Venue Manager, Grand Convention Center</p>
                </div>
              </div>
              <p className="text-gray-600">
                "We've increased our booking rate by 30% since we started using FloorPlan Pro to showcase our venue spaces to potential clients."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-lg testimonial-card">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">RK</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Raj Kumar</h4>
                  <p className="text-gray-600 text-sm">Exhibition Coordinator, IMTMA</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Managing large-scale exhibitions is now much easier with FloorPlan Pro. The ability to switch between 2D and 3D views helps us optimize space utilization."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to transform your event planning?</h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of event professionals who use FloorPlan Pro to create stunning 3D visualizations.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-md font-medium cta-button-pulse"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/login" 
              className="bg-blue-500 hover:bg-blue-400 text-white border border-blue-400 px-6 py-3 rounded-md font-medium"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon="fas fa-th-large" size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">FloorPlan Pro</h3>
              </div>
              <p className="mt-4 text-gray-400">
                Advanced floor plan management with powerful 3D visualization tools.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Reviews</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2024 FloorPlan Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;