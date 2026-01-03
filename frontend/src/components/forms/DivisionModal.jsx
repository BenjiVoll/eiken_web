import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Save } from 'lucide-react';

const DivisionModal = ({ isOpen, onClose, onSave, division, loading }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(division?.name || '');
  }, [division, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({ name });
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  {division ? 'Editar División' : 'Nueva División'}
                </h3>
                <p className="mt-1 text-green-100 text-sm opacity-90">
                  Gestiona las áreas operativas de la empresa.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la División *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FolderKanban className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all"
                  placeholder="Ej: Diseño Gráfico"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading || !name.trim()}
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DivisionModal;
