import React, { useState, useEffect } from 'react';

const DivisionModal = ({ isOpen, onClose, onSave, division, loading }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(division?.name || '');
  }, [division, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave({ name });
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-80">
        <h3 className="text-lg font-bold mb-4">{division ? 'Editar' : 'Nueva'} División</h3>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded px-2 py-1 mb-4"
          placeholder="Nombre de la división"
          disabled={loading}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded" disabled={loading}>Cancelar</button>
          <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded" disabled={loading || !name.trim()}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DivisionModal;
