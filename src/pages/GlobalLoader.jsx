// src/components/GlobalLoader.jsx

import React from 'react';
import { Loader2 } from 'lucide-react';

const GlobalLoader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black bg-opacity-60 flex items-center justify-center"
      role="alert" 
      aria-live="assertive"
    >
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin h-16 w-16 text-white" />
        <p className="mt-4 text-white font-semibold text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;