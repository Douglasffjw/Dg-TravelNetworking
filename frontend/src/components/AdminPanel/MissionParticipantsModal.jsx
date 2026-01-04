import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    X, Users, Search, Plus, Trash2, UserPlus, AlertTriangle, Loader 
} from 'lucide-react';
import api from '../../../api/api'; 

const MissionParticipantsModal = ({ mission, onClose }) => {
    const [participants, setParticipants] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Para o dropdown de adicionar
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [addSearchTerm, setAddSearchTerm] = useState(""); // Busca no dropdown de adicionar
    const [isAdding, setIsAdding] = useState(false); // Estado visual de adicionar

    // Carrega participantes e lista geral de usuários
    useEffect(() => {
        const fetchData = async () => {
            if (!mission?.id) return;
            setLoading(true);
            try {
                // Busca paralela: Participantes atuais e Todos os usuários (para adicionar novos)
                // Ajuste as rotas conforme seu backend final
                const [partsRes, usersRes] = await Promise.all([
                    api.get(`/admin/missions/${mission.id}/participants`), 
                    api.get('/admin/users') 
                ]);
                
                // Garante que sejam arrays
                setParticipants(Array.isArray(partsRes.data) ? partsRes.data : []);
                setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                // Não bloqueia o uso se falhar apenas um, mas avisa
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [mission.id]);

    // Função para adicionar participante
    const handleAddParticipant = async (userId) => {
        try {
            await api.post(`/admin/missions/${mission.id}/participants`, { userId });
            
            // Atualiza lista localmente para feedback imediato
            const userAdded = allUsers.find(u => u.id === userId);
            if (userAdded) {
                setParticipants(prev => [...prev, {
                    userId: userAdded.id,
                    name: userAdded.nome,
                    email: userAdded.email,
                    avatar: userAdded.foto_url,
                    status: 'confirmado',
                    paymentStatus: 'pago',
                    date: new Date().toISOString()
                }]);
            }
            setIsAdding(false);
            setAddSearchTerm("");
        } catch (error) {
            const msg = error.response?.data?.error || "Erro ao adicionar participante.";
            alert(msg);
        }
    };

    // Função para remover participante
    const handleRemoveParticipant = async (userId) => {
        if (!window.confirm("Remover este usuário da missão?")) return;
        try {
            await api.delete(`/admin/missions/${mission.id}/participants/${userId}`);
            setParticipants(prev => prev.filter(p => p.userId !== userId));
        } catch (error) {
            console.error(error);
            alert("Erro ao remover participante.");
        }
    };

    // Filtros visuais
    const filteredParticipants = participants.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Usuários disponíveis para adicionar (que ainda não estão na missão)
    const availableUsers = allUsers.filter(u => 
        !participants.some(p => p.userId === u.id) &&
        (
            (u.nome && u.nome.toLowerCase().includes(addSearchTerm.toLowerCase())) || 
            (u.email && u.email.toLowerCase().includes(addSearchTerm.toLowerCase()))
        )
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh] z-10"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-[#006494] flex items-center gap-2">
                            <Users size={20} /> Participantes da Missão
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{mission.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body com Scroll */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                    
                    {/* Área de Adicionar (Toggle) */}
                    <div className="mb-6">
                        {!isAdding ? (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-[#006494] hover:text-[#006494] hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                                <UserPlus size={18} /> Adicionar Novo Participante
                            </button>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fade-in">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold text-[#006494]">Selecionar Usuário</h4>
                                    <button onClick={() => setIsAdding(false)} className="text-xs text-gray-500 hover:text-red-500 font-medium">Cancelar</button>
                                </div>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar usuário para adicionar..." 
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        value={addSearchTerm}
                                        onChange={(e) => setAddSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                    {availableUsers.length > 0 ? availableUsers.map(u => (
                                        <div key={u.id} className="flex justify-between items-center p-2 hover:bg-white rounded-lg cursor-pointer group transition-colors border border-transparent hover:border-blue-100 shadow-sm" onClick={() => handleAddParticipant(u.id)}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-[#006494]">
                                                    {u.nome?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700">{u.nome}</span>
                                                    <span className="text-[10px] text-gray-400">{u.email}</span>
                                                </div>
                                            </div>
                                            <Plus size={16} className="text-blue-600 opacity-0 group-hover:opacity-100" />
                                        </div>
                                    )) : (
                                        <p className="text-xs text-gray-400 text-center py-4 italic">Nenhum usuário encontrado ou todos já inscritos.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de Participantes */}
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                        <h3 className="font-bold text-gray-800 text-sm">Inscritos ({participants.length})</h3>
                        <div className="relative w-48">
                            <Search className="absolute left-2.5 top-2 text-gray-400 w-3.5 h-3.5" />
                            <input 
                                type="text" 
                                placeholder="Filtrar inscritos..." 
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader className="animate-spin text-[#006494]" /></div>
                    ) : filteredParticipants.length > 0 ? (
                        <div className="space-y-2">
                            {filteredParticipants.map((p) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    key={p.id || p.userId} 
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        {p.avatar ? (
                                            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#006494] font-bold">
                                                {p.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <span className="block text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mb-0.5 w-fit ml-auto">
                                                {p.status || 'Inscrito'}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {p.date ? new Date(p.date).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveParticipant(p.userId)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remover da missão"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-medium">Nenhum participante encontrado.</p>
                            <p className="text-xs mt-1">Utilize o botão acima para adicionar.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MissionParticipantsModal;