import axios from 'axios';

/**
 * Call detection API after image upload and dispatch results to Simulator
 * @param {string} serverFilename - The filename returned from upload
 */
export async function callDetectFromUpload(serverFilename) {
  try {
    const res = await axios.post('http://localhost:5000/detect-from-upload', { 
      filename: serverFilename 
    });
    
    const { rects, walls, imageWidth, imageHeight, overlay } = res.data;
    
    // Dispatch event for Simulator to consume
    window.dispatchEvent(new CustomEvent('simulator:detections', { 
      detail: { rects, walls, imageWidth, imageHeight, overlay } 
    }));
    
    console.log('Detection completed:', { rects: rects.length, walls: walls.length });
    
  } catch (err) {
    console.error('Detection failed:', err);
    // Notify user but keep upload success UX intact
    window.dispatchEvent(new CustomEvent('simulator:detection-error', { 
      detail: { error: err.message } 
    }));
  }
}

/**
 * Upload file to server and return filename
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - Server filename
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post('http://localhost:5000/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.filename;
}

/**
 * Complete upload and detection workflow
 * @param {File} file - The file to upload and detect
 */
export async function uploadAndDetect(file) {
  try {
    // Upload file first
    const serverFilename = await uploadFile(file);
    
    // Then run detection
    await callDetectFromUpload(serverFilename);
    
    return serverFilename;
  } catch (error) {
    console.error('Upload and detection workflow failed:', error);
    throw error;
  }
}