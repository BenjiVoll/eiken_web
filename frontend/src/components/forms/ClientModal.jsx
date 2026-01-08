import React, { useState, useEffect } from 'react';
import { X, Save, User, Building2, Phone, Mail, Hash, Briefcase } from 'lucide-react';

const ClientModal = ({ isOpen, onClose, onSave, client, loading }) => {
    const initialState = {
        name: '',
        email: '',
        phone: '',
        rut: '',
        clientType: 'individual',
        company: '',
        isActive: true
    };

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (client) {
                setFormData({
                    name: client.name || client.nombreEmpresaOPersona || '',
                    email: client.email || '',
                    phone: client.phone || client.telefono || '',
                    rut: client.rut || '',
                    clientType: client.clientType || 'individual',
                    company: client.company || '',
                    isActive: client.isActive !== undefined ? client.isActive : true
                });
            } else {
                setFormData(initialState);
            }
            setErrors({});
        }
    }, [isOpen, client]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error específico
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const setClientType = (type) => {
        setFormData(prev => ({ ...prev, clientType: type }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';

        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                                {client ? <User className="h-5 w-5 text-blue-500" /> : <User className="h-5 w-5 text-blue-500" />}
                                {client ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form id="client-form" onSubmit={handleSubmit} className="space-y-4">

                            {/* Selector Tipo de Cliente */}
                            <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                                <button
                                    type="button"
                                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${formData.clientType === 'individual'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setClientType('individual')}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Particular
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${formData.clientType === 'company'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setClientType('company')}
                                >
                                    <Building2 className="h-4 w-4 mr-2" />
                                    Empresa
                                </button>
                            </div>

                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.clientType === 'company' ? 'Razón Social / Nombre Empresa' : 'Nombre Completo'}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {formData.clientType === 'company' ? <Building2 className="h-4 w-4 text-gray-400" /> : <User className="h-4 w-4 text-gray-400" />}
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder={formData.clientType === 'company' ? "Ej. Transportes Bio-Bío SpA" : "Ej. Juan Pérez"}
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            {/* RUT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RUT (Opcional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="rut"
                                        value={formData.rut}
                                        onChange={handleChange}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Ej. 76.123.456-K"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="+56 9 ..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Nombre Empresa (Para particulares que representan una empresa u organización) */}
                            {formData.clientType === 'individual' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Organización (Opcional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ej. Club de Autos Chile"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Interruptor Activo (Solo en Edición) */}
                            {client && (
                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                        Cliente Activo
                                    </label>
                                </div>
                            )}

                        </form>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="submit"
                            form="client-form"
                            disabled={loading}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white border-b-2 border-white rounded-full"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientModal;
