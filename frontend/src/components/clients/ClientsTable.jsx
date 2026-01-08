import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, User, Globe, Edit, Trash2, Archive, RotateCcw } from 'lucide-react';

const ClientsTable = ({ clients, onEdit, onDelete, isManager }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contacto
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo / Origen
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                {client.clientType === 'company' ? (
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <User className="h-5 w-5 text-blue-600" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {client.nombreEmpresaOPersona || client.name}
                                            </div>
                                            {client.company && client.company !== client.name && (
                                                <div className="text-sm text-gray-500">{client.company}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col space-y-1">
                                        {client.email && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Mail className="h-3 w-3 mr-2" />
                                                {client.email}
                                            </div>
                                        )}
                                        {client.telefono && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Phone className="h-3 w-3 mr-2" />
                                                {client.telefono || client.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${client.clientType === 'company' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {client.clientType === 'company' ? 'Empresa' : 'Particular'}
                                        </span>
                                        <span className="text-xs text-gray-400 capitalize flex items-center mt-1">
                                            <Globe className="h-3 w-3 mr-1" />
                                            {client.source || 'manual'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {client.isActive ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Activo
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button
                                            onClick={() => onEdit(client)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        {(isManager || !client.isActive) && ( // Solo el manager puede eliminar
                                            <button
                                                onClick={() => onDelete(client.id)}
                                                className={`${client.isActive ? 'text-red-600 hover:text-red-900' : 'text-gray-400 cursor-not-allowed'}`}
                                                title={client.isActive ? "Archivar/Eliminar" : "Ya está inactivo"}
                                                disabled={!client.isActive}
                                            >
                                                {client.isActive ? (
                                                    <Trash2 className="h-5 w-5" />
                                                ) : (
                                                    <Archive className="h-5 w-5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {clients.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No se encontraron clientes.
                </div>
            )}
        </div>
    );
};

export default ClientsTable;
