import axios from 'axios';

/**
 * Call detection API after image upload and dispatch results to Simulator
 * @param {string} serverFilename - The filename returned from upload
 * @param {object} options - Detection options including backend choice
 */
export async function callDetectFromUpload(serverFilename, options = {}) {
  try {
    const requestData = { 
      filename: serverFilename,
      backend: options.backend || 'opencv',  // Default to opencv for better color detection
      ...options
    };
    
    console.log('Starting enhanced detection for:', serverFilename);
    const res = await axios.post('http://localhost:5000/detect-from-upload', requestData);
    
    const { 
      rects, 
      walls, 
      imageWidth, 
      imageHeight, 
      overlay, 
      detection_summary 
    } = res.data;
    
    console.log('Enhanced detection completed:', {
      structures: rects.length,
      walls: walls.length,
      summary: detection_summary
    });
    
    // Log detection quality metrics
    if (detection_summary) {
      console.log('Detection quality:', {
        total: detection_summary.total_structures,
        colored: detection_summary.colored_structures,
        edge_based: detection_summary.edge_structures,
        avg_confidence: detection_summary.average_confidence
      });
    }
    
    // Dispatch event for Simulator to consume
    window.dispatchEvent(new CustomEvent('simulator:detections', { 
      detail: { 
        rects, 
        walls, 
        imageWidth, 
        imageHeight, 
        overlay,
        detection_summary
      } 
    }));
    
    // Dispatch enhanced detection event for area floor plans
    window.dispatchEvent(new CustomEvent('area-plan:detection-complete', {
      detail: {
        filename: serverFilename,
        structures: rects,
        walls: walls,
        imageSize: { width: imageWidth, height: imageHeight },
        overlay: overlay,
        summary: detection_summary
      }
    }));
    
  } catch (err) {
    console.error('Detection failed:', err);
    // Notify user but keep upload success UX intact
    window.dispatchEvent(new CustomEvent('simulator:detection-error', { 
      detail: { error: err.message } 
    }));
    
    window.dispatchEvent(new CustomEvent('area-plan:detection-error', {
      detail: { error: err.message, filename: serverFilename }
    }));
  }
}

/**
 * Upload file to server and return filename
 * @param {File} file - The file to upload
 * @param {object} options - Upload options
 * @returns {Promise<string>} - Server filename
 */
export async function uploadFile(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add any additional form data
  if (options.name) formData.append('name', options.name);
  if (options.description) formData.append('description', options.description);
  
  const response = await axios.post('http://localhost:5000/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (options.onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        options.onProgress(percentCompleted);
      }
    }
  });
  
  return response.data.filename;
}

/**
 * Complete upload and detection workflow with enhanced options
 * @param {File} file - The file to upload and detect
 * @param {object} options - Options for upload and detection
 */
export async function uploadAndDetect(file, options = {}) {
  try {
    console.log('Starting enhanced upload and detection workflow');
    
    // Upload file first
    const serverFilename = await uploadFile(file, {
      name: options.name,
      description: options.description,
      onProgress: options.onUploadProgress
    });
    
    console.log('File uploaded successfully:', serverFilename);
    
    // Then run detection
    await callDetectFromUpload(serverFilename, {
      backend: options.backend || 'opencv',
      ...options.detectionOptions
    });
    
    return serverFilename;
  } catch (error) {
    console.error('Upload and detection workflow failed:', error);
    throw error;
  }
}

/**
 * Enhanced detection specifically for area floor plans
 * @param {File} file - The area floor plan file
 * @param {object} options - Detection options
 */
export async function uploadAndDetectAreaPlan(file, options = {}) {
  try {
    console.log('Starting area floor plan upload and detection');
    
    const serverFilename = await uploadAndDetect(file, {
      ...options,
      backend: 'opencv',  // Use OpenCV for better color detection
      name: options.name || `Area Plan ${new Date().toLocaleDateString()}`,
      description: options.description || 'Area floor plan with automatic hall detection'
    });
    
    // Dispatch specific event for area plan processing
    window.dispatchEvent(new CustomEvent('area-plan:upload-complete', {
      detail: {
        filename: serverFilename,
        originalFile: file,
        options: options
      }
    }));
    
    return serverFilename;
  } catch (error) {
    console.error('Area plan upload and detection failed:', error);
    throw error;
  }
}