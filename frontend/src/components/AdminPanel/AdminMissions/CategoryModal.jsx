// src/components/AdminPanel/AdminMissions/CategoryModal.jsx

import React from 'react';
import { X, Loader } from 'lucide-react';

const CategoryModal = ({ category, setCategory, onSave, onClose, isEditing, isLoading }) => {

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setCategory(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category.nome) {
            alert('O nome da categoria é obrigatório.');
            return;
        }
        onSave(category);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl relative">
                <h2 className="text-2xl font-bold mb-4 text-[#394C97]">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h2>

                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50">
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="nome"
                        placeholder="Nome da Categoria"
                        className="w-full border p-3 rounded-lg"
                        value={category.nome || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                    />

                    <textarea
                        name="descricao"
                        placeholder="Descrição (opcional)"
                        rows={3}
                        className="w-full border p-3 rounded-lg"
                        value={category.descricao || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="icone"
                            placeholder="Ícone (classe ou nome)"
                            className="w-full border p-3 rounded-lg"
                            value={category.icone || ''}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <input
                            type="color"
                            name="cor"
                            className="w-full p-1 rounded-lg"
                            value={category.cor || '#000000'}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <input
                        type="number"
                        name="ordem"
                        placeholder="Ordem (ex: 0)"
                        className="w-full border p-3 rounded-lg"
                        value={category.ordem || 0}
                        onChange={handleChange}
                        disabled={isLoading}
                    />

                    <div className="flex justify-end gap-3 pt-3 border-t mt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="bg-[#394C97] text-white px-4 py-2 rounded-lg flex items-center gap-2">
                            {isLoading ? <Loader size={16} className="animate-spin" /> : null}
                            {isEditing ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
