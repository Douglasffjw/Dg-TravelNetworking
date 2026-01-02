// src/components/AdminPanel/UserModal.jsx

import React from 'react';
// Importa ícones necessários, incluindo os novos
import { X, User, Lock, Mail, Loader, Zap, TrendingUp } from 'lucide-react'; 

const UserModal = ({ user, setUser, handleSave, handleClose, isEditing, isLoading }) => {
    
    // Função genérica para atualizar os campos do usuário
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Verifica se o campo é 'points' ou 'level' e converte para Number
        // Nota: O campo 'level' é string, mas o 'points' é number. 
        // Se a opção do dropdown 'level' for numérica, ajuste aqui. Assumindo 'points' é o único numérico.
        const parsedValue = name === 'points' ? (value === '' ? '' : Number(value)) : value;

        setUser(prev => ({ 
            ...prev, 
            [name]: parsedValue
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl relative">
                <h2 className="text-2xl font-bold mb-6 text-[#394C97]">
                    {isEditing ? "Editar Usuário" : "Criar Novo Usuário"}
                </h2>

                <button onClick={handleClose} disabled={isLoading} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50">
                    <X size={24} />
                </button>

                {/* --- Formulário de Cadastro/Edição --- */}
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="space-y-4">
                        
                        {/* Nome */}
                        <div className="flex items-center gap-3 border p-3 rounded-lg focus-within:border-[#FE5900]">
                            <User size={20} className="text-gray-400" />
                            <input
                                type="text"
                                name="name"
                                placeholder="Nome Completo"
                                className="flex-1 focus:outline-none"
                                value={user.name || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 border p-3 rounded-lg focus-within:border-[#FE5900]">
                            <Mail size={20} className="text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="flex-1 focus:outline-none"
                                value={user.email || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        
                        {/* Senha (Obrigatório apenas na Criação ou se for Editado/opcional) */}
                        <div className="flex items-center gap-3 border p-3 rounded-lg focus-within:border-[#FE5900]">
                            <Lock size={20} className="text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                placeholder={isEditing ? "Deixe em branco para manter a senha atual" : "Senha (Obrigatória na criação)"}
                                className="flex-1 focus:outline-none"
                                onChange={handleChange}
                                disabled={isLoading}
                                required={!isEditing} // Senha é obrigatória apenas na criação
                            />
                        </div>

                        {/* --- CAMPOS ADMINISTRATIVOS (Apenas Edição) --- */}
                        {isEditing && (
                            <>
                                {/* Pontos */}
                                <div className="flex items-center gap-3 border p-3 rounded-lg focus-within:border-[#FE5900]">
                                    <Zap size={20} className="text-gray-400" />
                                    <input
                                        type="number"
                                        name="points"
                                        placeholder="Pontos (Ex: 1500)"
                                        className="flex-1 focus:outline-none"
                                        value={user.points || 0} // Garante que o valor inicial seja 0, não string vazia
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Nível (Dropdown) */}
                                <div className="relative flex items-center gap-3 border p-3 rounded-lg focus-within:border-[#FE5900]">
                                    <TrendingUp size={20} className="text-gray-400" />
                                    <select
                                        name="level"
                                        className="flex-1 focus:outline-none appearance-none bg-white" // Tira o fundo e o estilo default
                                        value={user.level || 'Bronze'}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value="Bronze">Nível: Bronze</option>
                                        <option value="Silver">Nível: Silver</option>
                                        <option value="Gold">Nível: Gold</option>
                                        <option value="Platinum">Nível: Platinum</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Ações do Modal */}
                    <div className="mt-8 flex justify-end gap-4 border-t pt-4">
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            type="button" // Adicionado type="button" para não submeter
                            className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" // Agora o botão submete o formulário
                            disabled={isLoading}
                            className="bg-[#394C97] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2f3f7a] shadow-md transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? <Loader size={20} className="animate-spin" /> : null}
                            {isEditing ? "Salvar Edição" : "Criar Usuário"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;