import React from 'react';

const ServiceInfoAlert = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded mb-2 flex items-center animate-pulse">
      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20h.01" /></svg>
      <span>Para nombrar tu propio servicio, primero deselecciona el servicio del catálogo.</span>
    </div>
  );
};

export default ServiceInfoAlert;
