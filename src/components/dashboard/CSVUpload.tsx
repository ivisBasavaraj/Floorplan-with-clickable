import React, { useRef } from 'react';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';

interface BoothData {
  boothNo: string;
  boothName: string;
  owner: string;
  size: string;
  otherDetails: string;
}

interface CSVUploadProps {
  onDataParsed: (data: Record<string, BoothData>) => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onDataParsed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const boothData: Record<string, BoothData> = {};
          
          results.data.forEach((row: any) => {
            const boothNo = row['Boot No'] || row.BoothNo || row.boothNo || row['Booth No'];
            const boothName = row['Exhibitor Name'] || row.BoothName || row.boothName || row['Booth Name'];
            const owner = row['Exhibitor Name'] || row.Owner || row.owner;
            const size = row.Size || row.size || '';
            const website = row.Website || row.website || '';
            const description = row.Description || row.description || '';
            const images = row['Images Link'] || row.images || '';
            const otherDetails = `${description}${website ? ' | Website: ' + website : ''}${images ? ' | Images: ' + images : ''}`;

            if (boothNo) {
              boothData[boothNo] = {
                boothNo,
                boothName: boothName || '',
                owner: owner || '',
                size: size || '',
                otherDetails
              };
            }
          });

          console.log('Parsed CSV data:', boothData);
          onDataParsed(boothData);
          alert(`Successfully loaded ${Object.keys(boothData).length} booth records`);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file');
        }
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        alert('Error reading CSV file');
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <FontAwesomeIcon icon="fas fa-file-csv" className="text-green-600 mr-2" size={20} />
        <h3 className="text-lg font-semibold">Upload Booth Data</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV file with booth details (BoothNo, BoothName, Owner, Size, OtherDetails)
      </p>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
      >
        <FontAwesomeIcon icon="fas fa-upload" size={16} className="mr-2" />
        Upload CSV
      </button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv"
        className="hidden"
      />
    </div>
  );
};