'use client';

import React, { useState } from 'react';
import { JotformViewer } from '../../components/JotformViewer';
import { JotformSubmitter } from '../../components/JotformSubmitter';

export default function JotformDemoPage() {
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Jotform Integration Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Form Viewer</h2>
          <JotformViewer onSelectForm={(formId) => setSelectedFormId(formId)} />
        </div>
        
        {selectedFormId && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Form Submission</h2>
            <JotformSubmitter formId={selectedFormId} />
          </div>
        )}
      </div>
    </div>
  );
} 