import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import UploadScreen from './components/UploadScreen';
import { CSV_DATA } from './constants';

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<string | null>(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      {!csvData ? (
        <UploadScreen 
          onDataLoaded={setCsvData} 
          sampleData={CSV_DATA} 
        />
      ) : (
        <Dashboard 
          csvData={csvData} 
          onReset={() => setCsvData(null)} 
        />
      )}
    </div>
  );
};

export default App;