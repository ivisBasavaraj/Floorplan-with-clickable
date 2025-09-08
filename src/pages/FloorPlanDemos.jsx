import React from 'react';
import { Link } from 'react-router-dom';

const FloorPlanDemos = () => {
  const demos = [
    {
      title: 'Full Leaflet Integration',
      route: '/map-demo',
      description: 'Complete OpenStreetMap integration with Leaflet.js and custom canvas layer',
      features: ['Real map tiles', 'Professional mapping', 'Georeferencing', 'Full pan/zoom'],
      status: 'May require --legacy-peer-deps',
      color: '#28a745'
    },
    {
      title: 'Simple Canvas Map',
      route: '/simple-map',
      description: 'Pure React implementation with no external dependencies',
      features: ['No dependencies', 'Canvas rendering', 'Click interactions', 'Grid background'],
      status: 'Ready to use',
      color: '#007bff'
    },
    {
      title: 'Interactive Canvas Map',
      route: '/interactive-map',
      description: 'Interactive pan/zoom functionality with custom canvas implementation',
      features: ['Pan & zoom', 'Mouse controls', 'Zoom buttons', 'Interactive booths'],
      status: 'Recommended',
      color: '#17a2b8'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '3rem', 
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Floor Plan Map Demos
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Explore different implementations of React-based floor plan mapping systems similar to ExpoFP
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {demos.map((demo, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '15px' 
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: demo.color,
                  marginRight: '10px'
                }}></div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem',
                  color: '#333'
                }}>
                  {demo.title}
                </h2>
              </div>
              
              <p style={{ 
                color: '#666', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {demo.description}
              </p>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#333',
                  fontSize: '1rem'
                }}>
                  Features:
                </h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px',
                  color: '#666'
                }}>
                  {demo.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <span style={{
                  background: demo.color,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {demo.status}
                </span>
              </div>

              <Link 
                to={demo.route}
                style={{
                  display: 'inline-block',
                  background: demo.color,
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'background 0.3s ease',
                  width: '100%',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              >
                View Demo →
              </Link>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '15px',
            fontSize: '1.5rem'
          }}>
            Getting Started
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            Each implementation demonstrates different approaches to building interactive floor plans with React.
            Choose the one that best fits your project requirements and constraints.
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '25px',
              color: 'white',
              fontSize: '0.9rem'
            }}>
              📚 Full Documentation Available
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '25px',
              color: 'white',
              fontSize: '0.9rem'
            }}>
              🎨 Customizable Styling
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '25px',
              color: 'white',
              fontSize: '0.9rem'
            }}>
              📱 Mobile Responsive
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanDemos;