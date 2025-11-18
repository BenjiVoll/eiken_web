import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { quotesAPI } from '../../services/apiService';
import { showToast, showErrorAlert } from '../../helpers/sweetAlert';

const QuotePricingModal = ({ isOpen, onClose, quote, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (quote) {
      reset({
        description: quote.description,
        quotedAmount: quote.quotedAmount || '',
        notes: quote.notes || ''
      });
    }
  }, [quote, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const updatedData = {
        ...data,
        quotedAmount: parseFloat(data.quotedAmount),
        status: 'En revisión' // Siempre se establece o confirma el estado 'En revisión'
      };
      await quotesAPI.update(quote.id, updatedData);
      onSave(); // Función para refrescar la lista de cotizaciones
      showToast('Propuesta guardada y enviada al cliente');
      onClose();
    } catch (error) {
      showErrorAlert('Error', 'Error al guardar la propuesta');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Preparar/Editar Propuesta #{quote?.id}</h2>
        <p className="mb-6 text-gray-600">Define el precio y ajusta la descripción que verá el cliente.</p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="quotedAmount" className="block text-sm font-medium text-gray-700">Monto Final (CLP)</label>
            <input
              id="quotedAmount"
              type="number"
              {...register('quotedAmount', { 
                required: 'El monto es obligatorio',
                valueAsNumber: true,
                min: { value: 1, message: 'El monto debe ser positivo' }
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 150000"
            />
            {errors.quotedAmount && <p className="text-red-500 text-xs mt-1">{errors.quotedAmount.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción del Proyecto (Editable)</label>
            <textarea
              id="description"
              {...register('description')}
              rows="5"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas Internas (No visible para el cliente)</label>
            <textarea
              id="notes"
              {...register('notes')}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Añade notas para el equipo."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-eiken-red-500 text-white rounded-md hover:bg-eiken-red-600 font-semibold">
              Guardar y Enviar Propuesta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotePricingModal;
