import React, { useState, useEffect } from 'react';
import { showErrorAlert, showSuccessAlert } from '../../helpers/sweetAlert';
import { quotesAPI } from '../../services/apiService';

const EditQuoteModal = ({ isOpen, onClose, quote, onSave }) => {
  const [formData, setFormData] = useState({
    quotedAmount: quote?.quotedAmount ? parseInt(quote.quotedAmount, 10) : '',
    description: quote?.description || '',
    notes: quote?.notes || '',
  });

  useEffect(() => {
    setFormData({
      quotedAmount: quote?.quotedAmount ? parseInt(quote.quotedAmount, 10) : '',
      description: quote?.description || '',
      notes: quote?.notes || '',
    });
  }, [quote]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedQuote = {
        ...quote,
        quotedAmount: parseFloat(formData.quotedAmount),
        description: formData.description.trim(),
        notes: formData.notes.trim(),
      };

      if (isNaN(updatedQuote.quotedAmount) || updatedQuote.quotedAmount <= 0) {
        showErrorAlert('Error', 'El monto debe ser un número positivo.');
        return;
      }

      if (!updatedQuote.description || updatedQuote.description.length < 10) {
        showErrorAlert('Error', 'La descripción debe tener al menos 10 caracteres.');
        return;
      }

      await quotesAPI.update(quote.id, updatedQuote);
      showSuccessAlert('¡Cotización actualizada!', 'Los detalles de la cotización se han guardado correctamente.');
      onSave(updatedQuote);
      onClose();
    } catch (error) {
      console.error('Error al actualizar la cotización:', error);
      showErrorAlert('Error', 'No se pudo actualizar la cotización.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Cotización</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="quotedAmount" className="block text-sm font-medium text-gray-700">
              Monto Final (CLP)
            </label>
            <input
              type="number"
              id="quotedAmount"
              name="quotedAmount"
              value={formData.quotedAmount}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 150000"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción del Proyecto
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descripción detallada del proyecto"
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notas Internas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Notas internas para el equipo"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuoteModal;